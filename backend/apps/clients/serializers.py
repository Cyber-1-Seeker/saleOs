from rest_framework import serializers
from .models import Client, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'direction', 'text', 'created_at')
        read_only_fields = ('id', 'created_at')


class ClientSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    budget = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = (
            'id', 'name', 'nickname', 'channel', 'contact',
            'interest', 'budget_min', 'budget_max', 'budget',
            'status', 'notes', 'messages', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_budget(self, obj):
        if obj.budget_min and obj.budget_max:
            return f'${obj.budget_min:,.0f} – ${obj.budget_max:,.0f}'
        if obj.budget_max:
            return f'~${obj.budget_max:,.0f}'
        return None


class ClientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view"""
    class Meta:
        model = Client
        fields = ('id', 'name', 'nickname', 'channel', 'contact', 'interest',
                  'budget_min', 'budget_max', 'status', 'created_at', 'updated_at')
