from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import CatalogItem, CatalogMedia
from .serializers import CatalogItemSerializer, CatalogItemListSerializer, CatalogMediaSerializer


class CatalogItemViewSet(viewsets.ModelViewSet):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        qs = CatalogItem.objects.filter(owner=self.request.user).select_related('client')
        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return CatalogItemListSerializer
        return CatalogItemSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def upload_media(self, request, pk=None):
        item = self.get_object()
        files = request.FILES.getlist('files')
        media_type = request.data.get('media_type', 'image')
        created = []
        for f in files:
            m = CatalogMedia.objects.create(item=item, file=f, media_type=media_type)
            created.append(CatalogMediaSerializer(m).data)
        return Response(created, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='media/(?P<media_id>[^/.]+)')
    def delete_media(self, request, pk=None, media_id=None):
        item = self.get_object()
        try:
            media = item.media.get(id=media_id)
            media.file.delete()
            media.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CatalogMedia.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
