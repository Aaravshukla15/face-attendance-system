from django.utils import timezone

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import Attendance
from .serializers import AttendanceSerializer
from employees.models import Employee


class AttendanceListCreateAPIView(generics.ListCreateAPIView):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer

    # Filtering, searching and ordering
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = {
        "date": ["exact", "gte", "lte"],
        "employee__employee_id": ["exact"],
        "employee__department": ["exact"],
    }

    search_fields = [
        "employee__employee_id",
        "employee__name",
        "employee__department",
        "employee__designation",
    ]

    ordering_fields = [
        "date",
        "check_in",
        "check_out",
        "employee__employee_id",
        "employee__name",
    ]

    ordering = ["-date", "-check_in"]


class AttendanceRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer


class TodayAttendanceAPIView(generics.ListAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        today = timezone.localdate()

        return Attendance.objects.select_related(
            "employee"
        ).filter(
            date=today
        )


class RecordAttendanceAPIView(APIView):

    def post(self, request):
        employee_id = request.data.get("employee_id")

        if not employee_id:
            return Response(
                {
                    "success": False,
                    "message": "Employee ID is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            employee = Employee.objects.get(
                employee_id=employee_id,
                is_active=True,
            )

        except Employee.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Active employee not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        today = timezone.localdate()
        current_time = timezone.now()

        attendance = Attendance.objects.filter(
            employee=employee,
            date=today,
        ).first()

        # --------------------------------
        # FIRST SCAN → CHECK IN
        # --------------------------------

        if attendance is None:

            attendance = Attendance.objects.create(
                employee=employee,
                date=today,
                check_in=current_time,
            )

            return Response(
                {
                    "success": True,
                    "action": "check_in",
                    "message": "Attendance checked in successfully.",
                    "employee": {
                        "id": employee.id,
                        "employee_id": employee.employee_id,
                        "name": employee.name,
                        "department": employee.department,
                        "designation": employee.designation,
                    },
                    "attendance": {
                        "date": attendance.date,
                        "check_in": attendance.check_in,
                        "check_out": attendance.check_out,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        # --------------------------------
        # SECOND SCAN → CHECK OUT
        # --------------------------------

        if attendance.check_out is None:

            attendance.check_out = current_time

            attendance.save(
                update_fields=["check_out", "updated_at"]
            )

            return Response(
                {
                    "success": True,
                    "action": "check_out",
                    "message": "Attendance checked out successfully.",
                    "employee": {
                        "id": employee.id,
                        "employee_id": employee.employee_id,
                        "name": employee.name,
                        "department": employee.department,
                        "designation": employee.designation,
                    },
                    "attendance": {
                        "date": attendance.date,
                        "check_in": attendance.check_in,
                        "check_out": attendance.check_out,
                    },
                },
                status=status.HTTP_200_OK,
            )

        # --------------------------------
        # THIRD SCAN → ALREADY COMPLETED
        # --------------------------------

        return Response(
            {
                "success": False,
                "action": "already_completed",
                "message": "Attendance already completed for today.",
                "employee": {
                    "id": employee.id,
                    "employee_id": employee.employee_id,
                    "name": employee.name,
                    "department": employee.department,
                    "designation": employee.designation,
                },
                "attendance": {
                    "date": attendance.date,
                    "check_in": attendance.check_in,
                    "check_out": attendance.check_out,
                },
            },
            status=status.HTTP_200_OK,
        )