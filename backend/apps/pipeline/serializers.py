from rest_framework import serializers
from .models import Stage, Deal


class StageSerializer(serializers.ModelSerializer):
    deals_count = serializers.IntegerField(source='deals.count', read_only=True)

    class Meta:
        model = Stage
        fields = ('id', 'name', 'color', 'order', 'deals_count')
        read_only_fields = ('id',)


class DealSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True)

    class Meta:
        model = Deal
        fields = ('id', 'client', 'client_name', 'stage', 'stage_name',
                  'title', 'amount', 'notes', 'order', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
