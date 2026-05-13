from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ['id', 'client_name', 'rating', 'comment', 'is_approved', 'created_at']

    def get_client_name(self, obj):
        return obj.client.user.full_name


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Review
        fields = ['rating', 'comment']
