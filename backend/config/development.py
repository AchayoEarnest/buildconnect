from .base import *

DEBUG = True
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
INTERNAL_IPS = ['127.0.0.1']

# Use local file storage in development
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
