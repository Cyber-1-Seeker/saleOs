from rest_framework import serializers
from .models import MessageTemplate


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        fields = ('id', 'title', 'body', 'category', 'emoji', 'use_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'use_count', 'created_at', 'updated_at')
