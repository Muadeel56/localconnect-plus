from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rooms', views.ChatRoomViewSet, basename='chatroom')
router.register(r'messages', views.MessageViewSet, basename='message')
router.register(r'participants', views.ChatParticipantViewSet, basename='chatparticipant')
router.register(r'notifications', views.ChatNotificationViewSet, basename='chatnotification')

urlpatterns = [
    path('', include(router.urls)),
] 