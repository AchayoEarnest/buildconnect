import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(milestone, success_url, cancel_url):
    """Create a Stripe Checkout session with escrow-style payment."""
    commission = settings.PLATFORM_COMMISSION_PERCENT / 100
    amount_cents = int(milestone.amount * 100)
    fee_cents    = int(amount_cents * commission)

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {'name': f'Milestone: {milestone.title}'},
                'unit_amount': amount_cents,
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'milestone_id': milestone.id,
            'platform_fee': fee_cents,
        },
        payment_intent_data={
            'application_fee_amount': fee_cents,
            'capture_method': 'automatic',
        },
    )
    return session


def release_escrow(payment_intent_id):
    """Capture a previously authorized payment intent (escrow release)."""
    return stripe.PaymentIntent.capture(payment_intent_id)


def refund_payment(payment_intent_id):
    return stripe.Refund.create(payment_intent=payment_intent_id)
