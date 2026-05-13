from django.urls import path
from .views import CreateCheckoutView, ReleaseMilestoneView, StripeWebhookView

urlpatterns = [
    path('payments/checkout/', CreateCheckoutView.as_view()),
    path('payments/release/<int:milestone_id>/', ReleaseMilestoneView.as_view()),
    path('webhooks/stripe/', StripeWebhookView.as_view()),
]
