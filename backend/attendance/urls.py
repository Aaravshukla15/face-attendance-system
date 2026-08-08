from django.urls import path

from .views import (
    AttendanceListCreateAPIView,
    AttendanceRetrieveUpdateDestroyAPIView,
    MonthlyAttendanceReportAPIView,
    TodayAttendanceAPIView,
    RecordAttendanceAPIView,
    DailyAttendanceReportAPIView,
    MonthlyAttendanceReportAPIView,
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
        "reports/daily/",
        DailyAttendanceReportAPIView.as_view(),
        name="attendance-report-daily",
    ),
    
    path(
        "reports/monthly/",
        MonthlyAttendanceReportAPIView.as_view(),
        name="attendance-report-monthly",
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