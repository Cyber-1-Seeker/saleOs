from django.db import models
from apps.users.models import User
from apps.clients.models import Client


class CatalogItem(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='catalog_items')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='catalog_items', null=True, blank=True)
    name = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    margin = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'catalog_items'
        ordering = ['-created_at']
        verbose_name = 'Позиция каталога'
        verbose_name_plural = 'Каталог'

    def __str__(self):
        return self.name


class CatalogMedia(models.Model):
    MEDIA_TYPE_CHOICES = [('image', 'Изображение'), ('video', 'Видео'), ('doc', 'Документ')]

    item = models.ForeignKey(CatalogItem, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    file = models.FileField(upload_to='catalog/')
    caption = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'catalog_media'
        ordering = ['created_at']
