from django.db import models
from apps.users.models import User


class MessageTemplate(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'Общее'),
        ('greeting', 'Приветствие'),
        ('payment', 'Оплата'),
        ('delivery', 'Доставка'),
        ('followup', 'Дожим'),
        ('other', 'Другое'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_templates')
    title = models.CharField(max_length=200)
    body = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    emoji = models.CharField(max_length=10, default='💬')
    use_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'message_templates'
        ordering = ['-use_count', '-created_at']
        verbose_name = 'Шаблон'
        verbose_name_plural = 'Шаблоны'

    def __str__(self):
        return self.title
