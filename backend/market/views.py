from django.contrib.auth import get_user_model
from django.db import models, transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Cart, CartItem, Image, Order, OrderItem, Product, Profile, Review
from .permissions import IsAdmin, IsOwnerOrReadOnly, IsSeller
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    ImageSerializer,
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



class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_published=True).select_related("seller")
    serializer_class = ProductSerializer
    filterset_fields = ["seller", "is_published"]
    ordering_fields = ["price", "created_at"]
    # Регистронезависимый поиск по имени и описанию (icontains)
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [permissions.IsAuthenticated(), IsSeller()]
        if self.action in {"list", "retrieve"}:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Для продавцов при редактировании/удалении/просмотре показываем все их товары (включая неопубликованные)
        if self.action in {"update", "partial_update", "destroy"} and self.request.user.is_authenticated:
            if self.request.user.role == User.Roles.SELLER:
                return Product.objects.filter(seller=self.request.user).select_related("seller")
        
        # Для retrieve (детальный просмотр) показываем опубликованные товары всем
        # Продавцы могут видеть свои неопубликованные через SellerProductViewSet
        if self.action == "retrieve":
            return Product.objects.filter(is_published=True).select_related("seller")
        
        # Для списка товаров показываем только опубликованные
        return qs


class ImageViewSet(viewsets.ModelViewSet):
    """
    Управление изображениями товаров: /api/images/

    - GET /api/images/?product_id=1 — список изображений товара
    - POST /api/images/ { "product": 1, "image": <файл> } — добавить изображение

    В этом проекте изображения — это файловое поле ImageField, путь хранится
    в виде относительного значения "products/filename.jpg", а полный URL
    фронтенд получает через поле image_url сериализатора.
    """

    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Image.objects.all().select_related("product")
        product_id = self.request.query_params.get("product_id")
        if product_id:
            qs = qs.filter(product_id=product_id)
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

    @action(detail=False, methods=["get"], url_path="my")
    def my_orders(self, request, *args, **kwargs):
        """
        Явный alias для списка заказов текущего пользователя: /api/orders/my/
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["put"], url_path="status")
    def update_status(self, request, *args, **kwargs):
        """
        Обновление статуса заказа.
        Покупатель может, например, отменить заказ или подтвердить получение.
        """
        order = self.get_object()
        new_status = request.data.get("status")

        if new_status not in Order.Status.values:
            return Response(
                {"detail": "Недопустимый статус заказа."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Для простоты разрешаем покупателю менять только свои заказы
        if order.buyer != request.user:
            return Response(
                {"detail": "Вы не можете изменять этот заказ."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order.status = new_status
        order.save(update_fields=["status"])
        serializer = self.get_serializer(order)
        return Response(serializer.data)

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
        return Product.objects.filter(seller=self.request.user).select_related("seller")

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class SellerOrderViewSet(viewsets.ModelViewSet):
    """Заказы на товары продавца: /api/sellers/orders/"""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller]
    http_method_names = ['get', 'head', 'options', 'patch']

    def get_queryset(self):
        return (
            Order.objects.filter(items__seller=self.request.user)
            .distinct()
            .prefetch_related("items__product")
        )

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        """
        Обновление статуса заказа продавцом.
        PATCH /api/sellers/orders/{id}/status/
        Body: { "status": "shipped" }
        """
        order = self.get_object()
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"detail": "Поле 'status' обязательно."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status not in Order.Status.values:
            return Response(
                {"detail": "Недопустимый статус заказа."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Проверяем, что продавец имеет товары в этом заказе
        if not order.items.filter(seller=request.user).exists():
            return Response(
                {"detail": "У вас нет прав на изменение этого заказа."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order.status = new_status
        order.save(update_fields=["status"])
        serializer = self.get_serializer(order)
        return Response(serializer.data)


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


class SellerAnalyticsView(generics.GenericAPIView):
    """Метрики и аналитика для продавца: /api/sellers/analytics/"""

    permission_classes = [permissions.IsAuthenticated, IsSeller]

    def get(self, request, *args, **kwargs):
        seller = request.user

        # Базовые метрики
        products_qs = Product.objects.filter(seller=seller)
        products_count = products_qs.count()
        published_count = products_qs.filter(is_published=True).count()
        draft_count = products_count - published_count

        # Заказы, содержащие товары этого продавца
        orders_qs = (
            Order.objects.filter(items__seller=seller)
            .distinct()
            .prefetch_related("items__product")
        )
        orders_count = orders_qs.count()
        pending_orders = orders_qs.filter(status=Order.Status.PENDING).count()

        # Общая выручка и продажи по товарам
        from django.db.models import Sum, F, FloatField, ExpressionWrapper, Count
        from django.db.models.functions import TruncDate
        from datetime import timedelta
        from django.utils import timezone

        revenue_expr = ExpressionWrapper(F("price") * F("quantity"), output_field=FloatField())

        total_revenue = (
            OrderItem.objects.filter(seller=seller)
            .aggregate(total=Sum(revenue_expr))
            .get("total")
            or 0
        )

        # Топ товаров по продажам
        top_products_qs = (
            OrderItem.objects.filter(seller=seller)
            .values("product__id", "product__name")
            .annotate(qty=Sum("quantity"), revenue=Sum(revenue_expr))
            .order_by("-revenue")[:10]
        )
        top_products = [
            {"id": p["product__id"], "name": p["product__name"], "quantity": p["qty"], "revenue": p["revenue"]}
            for p in top_products_qs
        ]

        # Данные по дням за последние 30 дней
        today = timezone.now().date()
        since = today - timedelta(days=29)

        daily = (
            OrderItem.objects.filter(seller=seller, order__created_at__date__gte=since)
            .annotate(date=TruncDate("order__created_at"))
            .values("date")
            .annotate(revenue=Sum(revenue_expr), orders=Count("order", distinct=True))
            .order_by("date")
        )

        sales_last_30 = [
            {"date": d["date"].isoformat(), "revenue": d.get("revenue") or 0, "orders": d.get("orders") or 0}
            for d in daily
        ]

        # Отзывы и рейтинги
        reviews_qs = Review.objects.filter(product__seller=seller)
        reviews_count = reviews_qs.count()
        avg_rating = reviews_qs.aggregate(avg=models.Avg("rating")).get("avg") or 0

        # Уникальные покупатели
        unique_buyers = (
            Order.objects.filter(items__seller=seller)
            .distinct()
            .values("buyer")
            .count()
        )

        # Статус заказов
        order_statuses = {
            "completed": orders_qs.filter(status=Order.Status.COMPLETED).count(),
            "shipped": orders_qs.filter(status=Order.Status.SHIPPED).count(),
            "paid": orders_qs.filter(status=Order.Status.PAID).count(),
            "pending": pending_orders,
            "canceled": orders_qs.filter(status=Order.Status.CANCELED).count(),
        }

        # Продажи по статусу (доход)
        revenue_by_status = {}
        for status, label in Order.Status.choices:
            status_revenue = (
                OrderItem.objects.filter(seller=seller, order__status=status)
                .aggregate(total=Sum(revenue_expr))
                .get("total") or 0
            )
            revenue_by_status[status] = float(status_revenue)

        # Категории товаров (количество товаров по статусу публикации)
        published_by_status = [
            {"status": "Опубликованы", "count": published_count},
            {"status": "Черновики", "count": draft_count},
        ]

        # Средняя цена товара
        avg_product_price = (
            products_qs.aggregate(avg=models.Avg("price")).get("avg") or 0
        )

        # Минимальная и максимальная цена
        min_product_price = (
            products_qs.aggregate(min=models.Min("price")).get("min") or 0
        )
        max_product_price = (
            products_qs.aggregate(max=models.Max("price")).get("max") or 0
        )

        # Общая единиц товара (во всех заказах)
        total_units_sold = (
            OrderItem.objects.filter(seller=seller)
            .aggregate(total=Sum("quantity"))
            .get("total") or 0
        )

        # Средний размер заказа (в единицах)
        avg_order_size = total_units_sold / max(1, orders_count) if orders_count > 0 else 0

        # Категория: товары с наихудшим рейтингом
        worst_products = (
            Review.objects.filter(product__seller=seller)
            .values("product__id", "product__name")
            .annotate(avg_rating=models.Avg("rating"))
            .order_by("avg_rating")[:5]
        )
        worst_products_list = [
            {"id": p["product__id"], "name": p["product__name"], "rating": float(p["avg_rating"] or 0)}
            for p in worst_products
        ]

        # Категория: товары с лучшим рейтингом
        best_products = (
            Review.objects.filter(product__seller=seller)
            .values("product__id", "product__name")
            .annotate(avg_rating=models.Avg("rating"))
            .order_by("-avg_rating")[:5]
        )
        best_products_list = [
            {"id": p["product__id"], "name": p["product__name"], "rating": float(p["avg_rating"] or 0)}
            for p in best_products
        ]

        # Распределение цен (ценовые диапазоны)
        price_ranges = {
            "бюджет": products_qs.filter(price__lt=1000).count(),
            "средний": products_qs.filter(price__gte=1000, price__lt=5000).count(),
            "премиум": products_qs.filter(price__gte=5000, price__lt=20000).count(),
            "люкс": products_qs.filter(price__gte=20000).count(),
        }

        data = {
            # Основные метрики
            "products_count": products_count,
            "published_count": published_count,
            "draft_count": draft_count,
            "orders_count": orders_count,
            "pending_orders": pending_orders,
            "total_revenue": float(total_revenue),
            "unique_buyers": unique_buyers,
            "reviews_count": reviews_count,
            "avg_rating": float(avg_rating),

            # Детальные данные
            "total_units_sold": total_units_sold,
            "avg_order_size": float(avg_order_size),
            "avg_product_price": float(avg_product_price),
            "min_product_price": float(min_product_price),
            "max_product_price": float(max_product_price),

            # Графики
            "top_products": top_products,
            "sales_last_30": sales_last_30,
            "order_statuses": order_statuses,
            "revenue_by_status": revenue_by_status,
            "published_by_status": published_by_status,
            "worst_products": worst_products_list,
            "best_products": best_products_list,
            "price_ranges": price_ranges,
        }

        return Response(data)

