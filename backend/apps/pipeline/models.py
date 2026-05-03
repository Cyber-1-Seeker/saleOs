from django.db import models
from apps.users.models import User
from apps.clients.models import Client


class Stage(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stages')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, default='#C8854A')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'pipeline_stages'
        ordering = ['order']

    def __str__(self):
        return self.name


class Deal(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deals')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='deals', null=True, blank=True)
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, related_name='deals')
    title = models.CharField(max_length=300)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deals'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
