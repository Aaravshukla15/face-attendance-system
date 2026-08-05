from django.urls import path
from .views import (
    EmployeeListCreateAPIView,
    EmployeeRetrieveUpdateDeleteAPIView,
)

urlpatterns = [
    path("", EmployeeListCreateAPIView.as_view(), name="employee-list-create"),
    path(
        "<int:pk>/",
        EmployeeRetrieveUpdateDeleteAPIView.as_view(),
        name="employee-detail",
    ),
]