from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer

    def get_queryset(self):
        qs = Reminder.objects.filter(owner=self.request.user).select_related('client')
        filter_type = self.request.query_params.get('filter')
        now = timezone.now()

        if filter_type == 'today':
            qs = qs.filter(due_date__date=now.date(), is_done=False)
        elif filter_type == 'overdue':
            qs = qs.filter(due_date__lt=now, is_done=False)
        elif filter_type == 'upcoming':
            qs = qs.filter(due_date__gt=now, is_done=False)
        elif filter_type == 'done':
            qs = qs.filter(is_done=True)

        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        reminder = self.get_object()
        reminder.is_done = True
        reminder.save()
        return Response(ReminderSerializer(reminder).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        qs = Reminder.objects.filter(owner=request.user)
        return Response({
            'total': qs.filter(is_done=False).count(),
            'overdue': qs.filter(due_date__lt=now, is_done=False).count(),
            'today': qs.filter(due_date__date=now.date(), is_done=False).count(),
            'upcoming': qs.filter(due_date__gt=now, is_done=False).count(),
        })
