from rest_framework import serializers
from .models import Project, Bid, Milestone
from apps.profiles.serializers import EngineerProfileListSerializer, ClientProfileSerializer


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Milestone
        fields = ['id', 'title', 'description', 'amount', 'due_date', 'is_released', 'released_at']
        read_only_fields = ['is_released', 'released_at']


class BidSerializer(serializers.ModelSerializer):
    engineer = EngineerProfileListSerializer(read_only=True)

    class Meta:
        model  = Bid
        fields = ['id', 'engineer', 'amount', 'cover_letter', 'timeline', 'status', 'submitted_at']
        read_only_fields = ['status', 'submitted_at']


class BidCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Bid
        fields = ['amount', 'cover_letter', 'timeline']


class ProjectListSerializer(serializers.ModelSerializer):
    bid_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = ['id', 'title', 'budget_min', 'budget_max', 'deadline',
                  'location', 'skills_req', 'status', 'bid_count', 'created_at']

    def get_bid_count(self, obj):
        return obj.bids.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    client     = ClientProfileSerializer(read_only=True)
    bids       = BidSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model  = Project
        fields = '__all__'


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Project
        fields = ['title', 'description', 'skills_req', 'budget_min',
                  'budget_max', 'deadline', 'location']
