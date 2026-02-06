from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminOrderViewSet,
    AdminUserViewSet,
    CartViewSet,
    CurrentUserView,
    BecomeSellerView,
    FavoriteViewSet,
    ImageViewSet,
    JwtLoginView,
    JwtRefreshView,
    OrderViewSet,
    ProductViewSet,
    ProfileView,
    RegisterView,
    ReviewViewSet,
    SellerOrderViewSet,
    SellerProductViewSet,
    SellerAnalyticsView,
)

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"reviews", ReviewViewSet, basename="review")
router.register(r"images", ImageViewSet, basename="image")
router.register(r"favorites", FavoriteViewSet, basename="favorite")
router.register(r"sellers/products", SellerProductViewSet, basename="seller-products")
router.register(r"sellers/orders", SellerOrderViewSet, basename="seller-orders")
router.register(r"users", AdminUserViewSet, basename="admin-users")
router.register(r"admin/orders", AdminOrderViewSet, basename="admin-orders")

auth_patterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", JwtLoginView.as_view(), name="login"),
    path("become-seller/", BecomeSellerView.as_view(), name="become_seller"),
    path("refresh/", JwtRefreshView.as_view(), name="token_refresh"),
    path("user/", CurrentUserView.as_view(), name="current_user"),
]

urlpatterns = [
    path("auth/", include((auth_patterns, "auth"), namespace="auth")),
    path("users/profile/", ProfileView.as_view(), name="user-profile"),
    path("sellers/analytics/", SellerAnalyticsView.as_view(), name="seller-analytics"),
    path("", include(router.urls)),
]

