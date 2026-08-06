from rest_framework import generics, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee
from .serializers import EmployeeSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

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
    
class EmployeeToggleStatusAPIView(APIView):

    def patch(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)

            employee.is_active = not employee.is_active
            employee.save()

            return Response(
                {
                    "message": "Employee status updated successfully.",
                    "is_active": employee.is_active,
                },
                status=status.HTTP_200_OK,
            )

        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND,
            )