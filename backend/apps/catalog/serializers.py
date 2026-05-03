from rest_framework import serializers
from .models import CatalogItem, CatalogMedia


class CatalogMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogMedia
        fields = ('id', 'media_type', 'file', 'caption', 'created_at')
        read_only_fields = ('id', 'created_at')


class CatalogItemSerializer(serializers.ModelSerializer):
    media = CatalogMediaSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = CatalogItem
        fields = ('id', 'client', 'client_name', 'name', 'description',
                  'price', 'margin', 'notes', 'media', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class CatalogItemListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    media_count = serializers.IntegerField(source='media.count', read_only=True)

    class Meta:
        model = CatalogItem
        fields = ('id', 'client', 'client_name', 'name', 'price', 'margin', 'media_count', 'created_at')
