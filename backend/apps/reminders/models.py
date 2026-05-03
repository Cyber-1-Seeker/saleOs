from django.db import models
from apps.users.models import User
from apps.clients.models import Client


class Reminder(models.Model):
    PRIORITY_CHOICES = [('low', 'Низкий'), ('medium', 'Средний'), ('high', 'Высокий')]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    title = models.CharField(max_length=300)
    notes = models.TextField(blank=True)
    due_date = models.DateTimeField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reminders'
        ordering = ['is_done', 'due_date']
        verbose_name = 'Напоминание'
        verbose_name_plural = 'Напоминания'

    def __str__(self):
        return self.title
