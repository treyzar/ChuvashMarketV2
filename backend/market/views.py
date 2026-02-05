from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Cart, CartItem, Category, Order, OrderItem, Product, Profile, Review
from .permissions import IsAdmin, IsOwnerOrReadOnly, IsSeller
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CategorySerializer,
    OrderSerializer,
    ProductSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ReviewSerializer,
    UserSerializer,
)

User = get_user_model()


def _get_or_create_cart(request) -> Cart:
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    cart, _ = Cart.objects.get_or_create(user=None, session_key=session_key)
    return cart


class RegisterView(generics.CreateAPIView):
    """Регистрация пользователя (покупатель или продавец)."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    """Информация о текущем пользователе."""

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ProfileView(generics.RetrieveUpdateAPIView):
    """Личный профиль текущего пользователя."""

    serializer_class = ProfileSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class BecomeSellerView(generics.GenericAPIView):
    """Позволяет обычному пользователю запросить или сразу стать продавцом."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        # При этом примере мы сразу изменяем роль на продавца.
        # В реальной системе можно сохранять заявку на рассмотрение.
        user.role = User.Roles.SELLER
        user.save(update_fields=["role"])

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.type = Profile.Types.SELLER
        profile.save(update_fields=["type"])

        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_published=True).select_related("category", "seller")
    serializer_class = ProductSerializer
    filterset_fields = ["category", "seller", "is_published"]
    ordering_fields = ["price", "created_at"]
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [permissions.IsAuthenticated(), IsSeller()]
        if self.action in {"list", "retrieve"}:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in {"update", "partial_update", "destroy", "list"} and self.request.user.is_authenticated:
            if self.request.user.role == User.Roles.SELLER:
                # продавец видит только свои товары при управлении
                if self.action != "list":
                    return Product.objects.filter(seller=self.request.user)
        return qs


class CartViewSet(viewsets.ModelViewSet):
    """
    Управление корзиной текущего пользователя/сессии.

    - GET /api/cart/ — получить текущую корзину
    - POST /api/cart/ — добавить товар (product_id, quantity)
    - PATCH /api/cart/{item_id}/ — изменить количество
    - DELETE /api/cart/{item_id}/ — удалить позицию
    """

    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        cart = _get_or_create_cart(self.request)
        return CartItem.objects.filter(cart=cart).select_related("product", "product__seller")

    def list(self, request, *args, **kwargs):
        cart = _get_or_create_cart(request)
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        cart = _get_or_create_cart(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity, "price": product.price},
        )
        if not created:
            item.quantity += quantity
            item.price = product.price
            item.save()

        output = CartSerializer(cart, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        cart = _get_or_create_cart(request)
        instance = get_object_or_404(self.get_queryset(), pk=kwargs.get("pk"), cart=cart)
        quantity = request.data.get("quantity")
        if quantity is not None:
            instance.quantity = int(quantity)
            if instance.quantity <= 0:
                instance.delete()
            else:
                instance.save()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        cart = _get_or_create_cart(request)
        instance = get_object_or_404(self.get_queryset(), pk=kwargs.get("pk"), cart=cart)
        instance.delete()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    """
    Заказы покупателя.

    - GET /api/orders/ — список заказов текущего пользователя
    - POST /api/orders/ — создать заказ из текущей корзины
    """

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).prefetch_related("items__product")

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cart = _get_or_create_cart(request)
        if not cart.items.exists():
            return Response({"detail": "Корзина пуста."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = Order.objects.create(
            buyer=request.user,
            contact_name=serializer.validated_data["contact_name"],
            contact_phone=serializer.validated_data["contact_phone"],
            delivery_method=serializer.validated_data["delivery_method"],
            delivery_address=serializer.validated_data["delivery_address"],
        )

        total = 0
        for item in cart.items.select_related("product", "product__seller"):
            OrderItem.objects.create(
                order=order,
                product=item.product,
                seller=item.product.seller,
                quantity=item.quantity,
                price=item.price,
            )
            total += item.subtotal

        order.total_price = total
        order.save(update_fields=["total_price"])

        cart.items.all().delete()

        output = self.get_serializer(order)
        return Response(output.data, status=status.HTTP_201_CREATED)


class SellerProductViewSet(viewsets.ModelViewSet):
    """Управление товарами продавца: /api/sellers/products/"""

    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user).select_related("category", "seller")

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class SellerOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Заказы на товары продавца: /api/sellers/orders/"""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller]

    def get_queryset(self):
        return (
            Order.objects.filter(items__seller=self.request.user)
            .distinct()
            .prefetch_related("items__product")
        )


class AdminUserViewSet(viewsets.ModelViewSet):
    """Управление пользователями администратором: /api/users/"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Просмотр всех заказов администратором: /api/admin/orders/"""

    queryset = Order.objects.all().prefetch_related("items__product")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class ReviewViewSet(viewsets.ModelViewSet):
    """Отзывы на товары."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Review.objects.all().select_related("product", "user")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JwtLoginView(TokenObtainPairView):
    """Получение JWT токена с данными пользователя: /api/auth/login/"""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Добавляем данные пользователя в ответ
        if response.status_code == 200 and "access" in response.data:
            try:
                user = User.objects.get(username=request.data.get("username"))
                user_serializer = UserSerializer(user)
                response.data["user"] = user_serializer.data
            except User.DoesNotExist:
                pass
        return response


class JwtRefreshView(TokenRefreshView):
    """Обновление JWT токена: /api/auth/refresh/"""

