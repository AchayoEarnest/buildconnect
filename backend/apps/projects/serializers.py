from rest_framework import serializers
from .models import Project, Bid, Milestone
from apps.profiles.serializers import EngineerProfileListSerializer, ClientProfileSerializer


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Milestone
        fields = ['id', 'title', 'description', 'amount', 'due_date', 'is_released', 'released_at']
        read_only_fields = ['is_released', 'released_at']


# FIX: Nested write serializer for milestones on project create
class MilestoneCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Milestone
        fields = ['title', 'description', 'amount', 'due_date']


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


# FIX: Added — /bids/my/ needs project info nested in each bid
class BidWithProjectSerializer(serializers.ModelSerializer):
    engineer = EngineerProfileListSerializer(read_only=True)
    project  = serializers.SerializerMethodField()

    class Meta:
        model  = Bid
        fields = ['id', 'engineer', 'project', 'amount', 'cover_letter', 'timeline', 'status', 'submitted_at']
        read_only_fields = ['status', 'submitted_at']

    def get_project(self, obj):
        return ProjectListSerializer(obj.project).data


class ProjectListSerializer(serializers.ModelSerializer):
    bid_count   = serializers.SerializerMethodField()
    client      = ClientProfileSerializer(read_only=True)

    class Meta:
        model  = Project
        fields = ['id', 'client', 'title', 'description', 'budget_min', 'budget_max',
                  'deadline', 'location', 'skills_req', 'status', 'bid_count', 'created_at']

    def get_bid_count(self, obj):
        return obj.bids.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    client     = ClientProfileSerializer(read_only=True)
    bids       = BidSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model  = Project
        fields = '__all__'


# FIX: now includes milestones with nested write support
class ProjectCreateSerializer(serializers.ModelSerializer):
    milestones = MilestoneCreateSerializer(many=True, required=False)

    class Meta:
        model  = Project
        fields = ['title', 'description', 'skills_req', 'budget_min',
                  'budget_max', 'deadline', 'location', 'milestones']

    def create(self, validated_data):
        milestones_data = validated_data.pop('milestones', [])
        project = Project.objects.create(**validated_data)
        for ms in milestones_data:
            Milestone.objects.create(project=project, **ms)
        return project
