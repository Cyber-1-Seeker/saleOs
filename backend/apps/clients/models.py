from django.db import models
from apps.users.models import User


class Client(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('active', 'В работе'),
        ('hot', 'Горячий'),
        ('cold', 'Холодный'),
        ('paid', 'Оплатил'),
        ('lost', 'Слился'),
    ]
    CHANNEL_CHOICES = [
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
        ('instagram', 'Instagram'),
        ('phone', 'Телефон'),
        ('other', 'Другое'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=200)
    nickname = models.CharField(max_length=100, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='telegram')
    contact = models.CharField(max_length=200, blank=True)
    interest = models.CharField(max_length=500, blank=True)
    budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        ordering = ['-updated_at']
        verbose_name = 'Клиент'
        verbose_name_plural = 'Клиенты'

    def __str__(self):
        return self.name


class Message(models.Model):
    DIRECTION_CHOICES = [('in', 'Входящее'), ('out', 'Исходящее')]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='messages')
    direction = models.CharField(max_length=3, choices=DIRECTION_CHOICES, default='in')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
