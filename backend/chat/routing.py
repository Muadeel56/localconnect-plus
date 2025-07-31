from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>[^/]+)/?$', consumers.ChatConsumer.as_asgi()),  # Made trailing slash optional
    re_path(r'ws/notifications/?$', consumers.NotificationConsumer.as_asgi()),  # Made trailing slash optional
] 