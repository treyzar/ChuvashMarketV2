from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        CUSTOMER = "customer", "Покупатель"
        SELLER = "seller", "Продавец"
        ADMIN = "admin", "Администратор"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.CUSTOMER,
        verbose_name="роль",
    )

    def is_seller(self) -> bool:
        return self.role == self.Roles.SELLER

    def is_customer(self) -> bool:
        return self.role == self.Roles.CUSTOMER

    def __str__(self) -> str:
        return f"{self.username} ({self.get_role_display()})"


class Profile(models.Model):
    class Types(models.TextChoices):
        CUSTOMER = "customer", "Покупатель"
        SELLER = "seller", "Продавец"

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile", verbose_name="пользователь"
    )
    phone = models.CharField(max_length=32, blank=True, verbose_name="телефон")
    address = models.TextField(blank=True, verbose_name="адрес")
    type = models.CharField(
        max_length=20,
        choices=Types.choices,
        default=Types.CUSTOMER,
        verbose_name="тип",
    )

    def __str__(self) -> str:
        return f"Профиль {self.user}"


class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="название")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="slug")
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        verbose_name="родительская категория",
    )

    class Meta:
        verbose_name = "категория"
        verbose_name_plural = "категории"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="название")
    description = models.TextField(blank=True, verbose_name="описание")
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="цена"
    )
    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.PROTECT,
        verbose_name="категория",
    )
    seller = models.ForeignKey(
        User,
        related_name="products",
        on_delete=models.CASCADE,
        verbose_name="продавец",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="обновлено")
    is_published = models.BooleanField(default=True, verbose_name="опубликован")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "товар"
        verbose_name_plural = "товары"

    def __str__(self) -> str:
        return self.name


class Image(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE,
        verbose_name="товар",
    )
    image = models.ImageField(upload_to="products/", verbose_name="изображение")

    class Meta:
        verbose_name = "изображение товара"
        verbose_name_plural = "изображения товаров"

    def __str__(self) -> str:
        return f"Изображение {self.product}"


class Cart(models.Model):
    user = models.ForeignKey(
        User,
        related_name="carts",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="пользователь",
    )
    session_key = models.CharField(
        max_length=40, blank=True, db_index=True, verbose_name="ключ сессии"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="обновлено")

    class Meta:
        verbose_name = "корзина"
        verbose_name_plural = "корзины"

    def __str__(self) -> str:
        if self.user:
            return f"Корзина пользователя {self.user}"
        return f"Сессионная корзина {self.session_key}"

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        related_name="items",
        on_delete=models.CASCADE,
        verbose_name="корзина",
    )
    product = models.ForeignKey(
        Product,
        related_name="cart_items",
        on_delete=models.CASCADE,
        verbose_name="товар",
    )
    quantity = models.PositiveIntegerField(
        default=1, validators=[MinValueValidator(1)], verbose_name="количество"
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="цена на момент добавления"
    )

    class Meta:
        verbose_name = "позиция корзины"
        verbose_name_plural = "позиции корзины"
        unique_together = ("cart", "product")

    @property
    def subtotal(self):
        return self.quantity * self.price


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Новый"
        PAID = "paid", "Оплачен"
        SHIPPED = "shipped", "Отправлен"
        COMPLETED = "completed", "Завершен"
        CANCELED = "canceled", "Отменен"

    buyer = models.ForeignKey(
        User,
        related_name="orders",
        on_delete=models.PROTECT,
        verbose_name="покупатель",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name="статус"
    )
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name="общая стоимость"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="обновлено")
    contact_name = models.CharField(max_length=255, verbose_name="контактное имя")
    contact_phone = models.CharField(max_length=32, verbose_name="телефон")
    delivery_method = models.CharField(max_length=128, verbose_name="способ доставки")
    delivery_address = models.TextField(verbose_name="адрес доставки")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "заказ"
        verbose_name_plural = "заказы"

    def __str__(self) -> str:
        return f"Заказ #{self.pk}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name="items",
        on_delete=models.CASCADE,
        verbose_name="заказ",
    )
    product = models.ForeignKey(
        Product,
        related_name="order_items",
        on_delete=models.PROTECT,
        verbose_name="товар",
    )
    seller = models.ForeignKey(
        User,
        related_name="sold_items",
        on_delete=models.PROTECT,
        verbose_name="продавец",
    )
    quantity = models.PositiveIntegerField(
        default=1, validators=[MinValueValidator(1)], verbose_name="количество"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="цена")

    class Meta:
        verbose_name = "позиция заказа"
        verbose_name_plural = "позиции заказа"

    @property
    def subtotal(self):
        return self.quantity * self.price


class Review(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="reviews",
        on_delete=models.CASCADE,
        verbose_name="товар",
    )
    user = models.ForeignKey(
        User,
        related_name="reviews",
        on_delete=models.CASCADE,
        verbose_name="пользователь",
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="оценка",
    )
    comment = models.TextField(blank=True, verbose_name="комментарий")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="создано")

    class Meta:
        verbose_name = "отзыв"
        verbose_name_plural = "отзывы"
        unique_together = ("product", "user")

