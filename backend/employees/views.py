from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeListCreateAPIView(generics.ListCreateAPIView):
    queryset = Employee.objects.all().order_by("employee_id")
    serializer_class = EmployeeSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "employee_id",
        "name",
        "department",
        "designation",
    ]
    filterset_fields = [
        "name",
        "department",
        "designation",
        "is_active",
    ]
    ordering_fields = [
        "employee_id",
        "name",
        "created_at",
    ]
    
class EmployeeRetrieveUpdateDeleteAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer 