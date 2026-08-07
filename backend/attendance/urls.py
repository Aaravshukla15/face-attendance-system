from django.urls import path

from .views import (
    AttendanceListCreateAPIView,
    AttendanceRetrieveUpdateDestroyAPIView,
    TodayAttendanceAPIView,
    RecordAttendanceAPIView,
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
        "record/",
        RecordAttendanceAPIView.as_view(),
        name="attendance-record",
    ),

    path(
        "<int:pk>/",
        AttendanceRetrieveUpdateDestroyAPIView.as_view(),
        name="attendance-detail",
    ),
]