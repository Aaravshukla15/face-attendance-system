from django.urls import path

from .views import (
    AttendanceListCreateAPIView,
    AttendanceRetrieveUpdateDestroyAPIView,
    TodayAttendanceAPIView,
)


urlpatterns = [
    path(
        "",
        AttendanceListCreateAPIView.as_view(),
        name="attendance-list-create",
    ),
    
    path(
        "today/",
        TodayAttendanceAPIView.as_view(),
        name="attendance-today",
    ),

    path(
        "<int:pk>/",
        AttendanceRetrieveUpdateDestroyAPIView.as_view(),
        name="attendance-detail",
    ),
]