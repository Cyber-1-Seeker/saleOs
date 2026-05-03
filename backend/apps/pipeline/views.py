from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Stage, Deal
from .serializers import StageSerializer, DealSerializer

DEFAULT_STAGES = [
    {'name': 'Новый лид', 'color': '#5A7EC0', 'order': 0},
    {'name': 'Прогрев', 'color': '#C8854A', 'order': 1},
    {'name': 'Обсуждение', 'color': '#D4A83A', 'order': 2},
    {'name': 'Закрытие', 'color': '#9B6FE0', 'order': 3},
    {'name': 'Оплата', 'color': '#5C9E7A', 'order': 4},
]


class StageViewSet(viewsets.ModelViewSet):
    serializer_class = StageSerializer

    def get_queryset(self):
        return Stage.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['post'])
    def init_defaults(self, request):
        if not Stage.objects.filter(owner=request.user).exists():
            for s in DEFAULT_STAGES:
                Stage.objects.create(owner=request.user, **s)
        stages = Stage.objects.filter(owner=request.user)
        return Response(StageSerializer(stages, many=True).data)


class DealViewSet(viewsets.ModelViewSet):
    serializer_class = DealSerializer

    def get_queryset(self):
        qs = Deal.objects.filter(owner=self.request.user).select_related('client', 'stage')
        stage_id = self.request.query_params.get('stage')
        if stage_id:
            qs = qs.filter(stage_id=stage_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        deal = self.get_object()
        stage_id = request.data.get('stage')
        order = request.data.get('order', 0)
        if stage_id:
            deal.stage_id = stage_id
        deal.order = order
        deal.save()
        return Response(DealSerializer(deal).data)
