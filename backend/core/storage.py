import os
import cloudinary
import cloudinary.uploader
from django.conf import settings


def upload_file(file, folder='uploads', resource_type='auto'):
    """Upload a file to Cloudinary and return the secure URL."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )
    result = cloudinary.uploader.upload(
        file,
        folder=f'buildconnect/{folder}',
        resource_type=resource_type,
    )
    return result.get('secure_url', '')


def delete_file(public_id):
    cloudinary.uploader.destroy(public_id)
