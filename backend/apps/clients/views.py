from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Client, Message
from .serializers import ClientSerializer, ClientListSerializer, MessageSerializer


class ClientViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        qs = Client.objects.filter(owner=self.request.user)
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(nickname__icontains=search) |
                Q(interest__icontains=search) |
                Q(contact__icontains=search)
            )
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        client = self.get_object()
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(client=client)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Client.objects.filter(owner=request.user)
        return Response({
            'total': qs.count(),
            'new': qs.filter(status='new').count(),
            'active': qs.filter(status='active').count(),
            'hot': qs.filter(status='hot').count(),
            'paid': qs.filter(status='paid').count(),
            'lost': qs.filter(status='lost').count(),
        })
