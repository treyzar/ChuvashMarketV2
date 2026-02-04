from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import Cart, CartItem, Category, Image, Order, OrderItem, Product, Profile, Review

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "email")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "phone")
    search_fields = ("user__username", "phone")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "parent")
    prepopulated_fields = {"slug": ("name",)}


class ImageInline(admin.TabularInline):
    model = Image
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "seller", "category", "price", "is_published", "created_at")
    list_filter = ("is_published", "category")
    search_fields = ("name", "seller__username")
    inlines = [ImageInline]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_key", "created_at", "updated_at")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "buyer", "status", "total_price", "created_at")
    list_filter = ("status",)
    search_fields = ("buyer__username",)
    inlines = [OrderItemInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("product__name", "user__username")

