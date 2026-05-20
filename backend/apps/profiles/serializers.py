from rest_framework import serializers
from .models import EngineerProfile, Skill, Certification, PortfolioProject, PortfolioMedia, ClientProfile, SavedEngineer


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Skill
        fields = ['id', 'name']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Certification
        fields = ['id', 'name', 'issuer', 'issued_on', 'expires', 'document']


class PortfolioMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PortfolioMedia
        fields = ['id', 'media_type', 'url', 'caption', 'order']


class PortfolioProjectSerializer(serializers.ModelSerializer):
    media = PortfolioMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = PortfolioProject
        fields = ['id', 'title', 'description', 'location', 'client_name',
                  'value', 'completed', 'cover_image', 'media', 'created_at']


class EngineerProfileListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    skills    = SkillSerializer(many=True, read_only=True)

    class Meta:
        model  = EngineerProfile
        fields = ['id', 'slug', 'full_name', 'title', 'specialization', 'avatar',
                  'location_city', 'location_country', 'years_exp', 'hourly_rate',
                  'availability', 'avg_rating', 'review_count', 'is_verified', 'skills']

    def get_full_name(self, obj):
        return obj.user.full_name


class EngineerProfileDetailSerializer(serializers.ModelSerializer):
    full_name      = serializers.SerializerMethodField()
    email          = serializers.SerializerMethodField()
    # FIX: added user_id so ContactButton can pass the correct UUID to StartConversationView
    user_id        = serializers.UUIDField(source='user.id', read_only=True)
    skills         = SkillSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    portfolio      = PortfolioProjectSerializer(many=True, read_only=True)

    class Meta:
        model  = EngineerProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.full_name

    def get_email(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user.email
        return None


class ClientProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = ClientProfile
        fields = ['id', 'full_name', 'company_name', 'industry', 'location', 'website', 'avatar']

    def get_full_name(self, obj):
        return obj.user.full_name
