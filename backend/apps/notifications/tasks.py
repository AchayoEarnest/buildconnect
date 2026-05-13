from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@shared_task
def send_notification(recipient_id, notif_type, title, body, link=''):
    from .models import Notification
    from apps.users.models import User
    user = User.objects.get(id=recipient_id)
    notif = Notification.objects.create(
        recipient=user, notif_type=notif_type,
        title=title, body=body, link=link
    )
    # Push via WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{recipient_id}',
        {
            'type': 'notification_message',
            'data': {
                'id': notif.id, 'type': notif_type,
                'title': title, 'body': body, 'link': link,
            }
        }
    )
    return notif.id


@shared_task
def send_email_notification(to_email, subject, html_content):
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    from django.conf import settings
    if not settings.SENDGRID_API_KEY:
        return
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
    )
    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sg.send(message)
