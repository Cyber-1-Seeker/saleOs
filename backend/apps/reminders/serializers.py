from rest_framework import serializers
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Reminder
        fields = ('id', 'client', 'client_name', 'title', 'notes',
                  'due_date', 'priority', 'is_done', 'is_overdue', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_is_overdue(self, obj):
        from django.utils import timezone
        return not obj.is_done and obj.due_date < timezone.now()
