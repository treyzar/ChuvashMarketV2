from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Cart, CartItem, Favorite, Image, Order, OrderItem, Product, Profile, Review

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role"]
        read_only_fields = ["id", "role"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "phone", "address", "type"]

    def validate_phone(self, value: str) -> str:
        """
        Номер телефона в профиле приводим к формату +7XXXXXXXXXX и проверяем длину.
        Поле остаётся опциональным.
        """
        if not value:
            return value

        digits = "".join(ch for ch in value if ch.isdigit())
        if not digits:
            raise serializers.ValidationError("Укажите корректный номер телефона.")

        if digits[0] == "8":
            digits = "7" + digits[1:]
        if digits[0] != "7":
            digits = "7" + digits

        digits = digits[:11]
        if len(digits) != 11:
            raise serializers.ValidationError("Номер телефона должен содержать 11 цифр.")

        return f"+{digits}"



class ImageSerializer(serializers.ModelSerializer):
    """
    Сериализатор изображений товаров.

    - image: относительный путь в БД, например "products/image.png"
    - image_url: полный URL для фронтенда, например "/media/products/image.png"
    """

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ["id", "product", "image", "image_url"]

    def get_image_url(self, obj) -> str:
        """
        Строим URL вручную и подчищаем возможные хвосты (\n, пробелы) в имени файла.
        Это защищает от путей вида "products/image.png\\n", которые дают %0A в URL.
        """
        request = self.context.get("request")
        name = (obj.image.name or "").strip()
        if not name:
            return ""

        # Если в БД руками записали "media/products/...", убираем префикс "media/"
        cleaned = name.lstrip("/")
        if cleaned.startswith("media/"):
            cleaned = cleaned[len("media/") :]

        # "/media/products/image.png"
        url = f"{settings.MEDIA_URL.rstrip('/')}/{cleaned}"

        if request is not None:
            return request.build_absolute_uri(url)
        return url


class ProductSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "seller",
            "created_at",
            "updated_at",
            "is_published",
            "images",
        ]
        read_only_fields = ["seller", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and not validated_data.get("seller"):
            validated_data["seller"] = request.user
        return super().create(validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_published=True),
        write_only=True,
        source="product",
    )
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "price", "subtotal"]
        read_only_fields = ["id", "price", "subtotal"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "total_price"]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "seller", "quantity", "price", "subtotal", "product_image"]
        read_only_fields = ["id", "seller", "price", "subtotal", "product_image"]

    def get_product_image(self, obj) -> str:
        """
        Превью‑картинка товара в заказе — первая картинка продукта.
        """
        first_image = obj.product.images.first()
        if not first_image:
            return ""

        request = self.context.get("request")
        name = (first_image.image.name or "").strip()
        if not name:
            return ""

        cleaned = name.lstrip("/")
        if cleaned.startswith("media/"):
            cleaned = cleaned[len("media/") :]

        url = f"{settings.MEDIA_URL.rstrip('/')}/{cleaned}"

        if request is not None:
            return request.build_absolute_uri(url)
        return url


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "buyer",
            "status",
            "total_price",
            "created_at",
            "updated_at",
            "contact_name",
            "contact_phone",
            "delivery_method",
            "delivery_address",
            "items",
        ]
        read_only_fields = [
            "id",
            "buyer",
            "status",
            "total_price",
            "created_at",
            "updated_at",
        ]

    def validate_contact_phone(self, value: str) -> str:
        """
        Валидация и нормализация контактного телефона для заказа.
        Приводим к формату +7XXXXXXXXXX.
        """
        if not value:
            raise serializers.ValidationError("Укажите номер телефона.")

        digits = "".join(ch for ch in value if ch.isdigit())
        if not digits:
            raise serializers.ValidationError("Укажите корректный номер телефона.")

        if digits[0] == "8":
            digits = "7" + digits[1:]
        if digits[0] != "7":
            digits = "7" + digits

        digits = digits[:11]

        if len(digits) != 11:
            raise serializers.ValidationError("Номер телефона должен содержать 11 цифр.")

        return f"+{digits}"


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "product", "user", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and not validated_data.get("user"):
            validated_data["user"] = request.user
        return super().create(validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role")
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(
            user=user,
            type=Profile.Types.SELLER if user.role == User.Roles.SELLER else Profile.Types.CUSTOMER,
        )
        return user


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_published=True),
        write_only=True,
        source="product",
    )

    class Meta:
        model = Favorite
        fields = ["id", "product", "product_id", "created_at"]
        read_only_fields = ["id", "created_at"]

