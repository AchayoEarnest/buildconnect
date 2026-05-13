import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .stripe_service import create_checkout_session, release_escrow
from apps.projects.models import Milestone
from core.permissions import IsClient


class CreateCheckoutView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request):
        milestone_id = request.data.get('milestone_id')
        milestone    = get_object_or_404(Milestone, id=milestone_id)
        commission   = settings.PLATFORM_COMMISSION_PERCENT / 100
        fee          = milestone.amount * commission

        session = create_checkout_session(
            milestone=milestone,
            success_url=f"{settings.FRONTEND_URL}/payments/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payments/cancel",
        )

        Payment.objects.update_or_create(
            milestone=milestone,
            defaults={
                'stripe_session': session.id,
                'amount': milestone.amount,
                'platform_fee': fee,
                'net_amount': milestone.amount - fee,
                'status': 'pending',
            }
        )
        return Response({'checkout_url': session.url})


class ReleaseMilestoneView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request, milestone_id):
        milestone = get_object_or_404(Milestone, id=milestone_id)
        payment   = get_object_or_404(Payment, milestone=milestone, status='held')
        release_escrow(payment.stripe_intent)
        payment.status = 'released'
        payment.save()
        milestone.is_released = True
        from django.utils import timezone
        milestone.released_at = timezone.now()
        milestone.save()
        return Response({'detail': 'Milestone payment released.'})


class StripeWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        payload   = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            session     = event['data']['object']
            milestone_id = session['metadata']['milestone_id']
            Payment.objects.filter(
                milestone_id=milestone_id, stripe_session=session['id']
            ).update(status='held', stripe_intent=session.get('payment_intent', ''))

        return Response({'received': True})
