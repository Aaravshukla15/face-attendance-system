from django.urls import path
from .views import (
    EmployeeListCreateAPIView,
    EmployeeRetrieveUpdateDeleteAPIView,
    EmployeeToggleStatusAPIView,
)


urlpatterns = [
    path("", EmployeeListCreateAPIView.as_view(), name="employee-list-create"),

    path(
        "<int:pk>/",
        EmployeeRetrieveUpdateDeleteAPIView.as_view(),
        name="employee-detail",
    ),

    path(
        "<int:pk>/toggle-status/",
        EmployeeToggleStatusAPIView.as_view(),
        name="employee-toggle-status",
    ),
]