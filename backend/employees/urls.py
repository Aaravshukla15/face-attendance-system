from django.urls import path

from .views import (
    EmployeeListCreateAPIView,
    EmployeeRetrieveUpdateDeleteAPIView,
    EmployeeToggleStatusAPIView,
    FaceRecognitionAPIView,
)


urlpatterns = [
    # Employee list + create
    path(
        "",
        EmployeeListCreateAPIView.as_view(),
        name="employee-list-create",
    ),

    # Employee detail + update + delete
    path(
        "<int:pk>/",
        EmployeeRetrieveUpdateDeleteAPIView.as_view(),
        name="employee-detail",
    ),

    # Toggle employee active/inactive status
    path(
        "<int:pk>/toggle-status/",
        EmployeeToggleStatusAPIView.as_view(),
        name="employee-toggle-status",
    ),

    # Face recognition
    path(
        "recognize/",
        FaceRecognitionAPIView.as_view(),
        name="face-recognition",
    ),
]