from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CatalogItemViewSet

router = DefaultRouter()
router.register(r'', CatalogItemViewSet, basename='catalog')
urlpatterns = [path('', include(router.urls))]
