from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MessageTemplate
from .serializers import TemplateSerializer

DEFAULT_TEMPLATES = [
    {'title': 'Первое приветствие', 'emoji': '👋', 'category': 'greeting',
     'body': 'Здравствуйте! Меня зовут [имя], я занимаюсь подбором автомобилей. Чем могу помочь?'},
    {'title': 'Варианты авто', 'emoji': '🚗', 'category': 'general',
     'body': 'По вашему запросу подобрал несколько вариантов. Все в наличии, документы чистые. Вот что есть:\n\n[список вариантов]'},
    {'title': 'Оплата и условия', 'emoji': '💳', 'category': 'payment',
     'body': 'Принимаем: перевод на карту, наличные, крипто.\nАванс 30%, остаток при получении.\nДоговор подпишем — всё официально.'},
    {'title': 'Доставка', 'emoji': '🚛', 'category': 'delivery',
     'body': 'Доставка занимает 14–21 день. Отслеживание в реальном времени. Страховка включена. Все документы подготовим.'},
    {'title': 'Follow-up мягкий', 'emoji': '🔁', 'category': 'followup',
     'body': 'Добрый день! Хотел уточнить — вы ещё рассматриваете варианты? Если есть вопросы — я на связи 😊'},
    {'title': 'Follow-up дожим', 'emoji': '🔥', 'category': 'followup',
     'body': 'Этот вариант смотрят ещё двое. Если интересно — лучше зафиксировать сейчас. Аванс удержит цену.'},
]


class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateSerializer

    def get_queryset(self):
        qs = MessageTemplate.objects.filter(owner=self.request.user)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        template = self.get_object()
        template.use_count += 1
        template.save()
        return Response({'use_count': template.use_count})

    @action(detail=False, methods=['post'])
    def init_defaults(self, request):
        if not MessageTemplate.objects.filter(owner=request.user).exists():
            for t in DEFAULT_TEMPLATES:
                MessageTemplate.objects.create(owner=request.user, **t)
        templates = MessageTemplate.objects.filter(owner=request.user)
        return Response(TemplateSerializer(templates, many=True).data)
