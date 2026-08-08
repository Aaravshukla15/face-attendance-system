from django.utils import timezone
from django.http import HttpResponse

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from openpyxl import Workbook

from .models import Attendance
from .serializers import AttendanceSerializer
from employees.models import Employee


# ============================================================
# ATTENDANCE LIST / CREATE
# ============================================================

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


# ============================================================
# ATTENDANCE DETAIL
# ============================================================

class AttendanceRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer


# ============================================================
# TODAY'S ATTENDANCE
# ============================================================

class TodayAttendanceAPIView(generics.ListAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        today = timezone.localdate()

        return Attendance.objects.select_related(
            "employee"
        ).filter(
            date=today
        )


# ============================================================
# RECORD ATTENDANCE
# ============================================================

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


# ============================================================
# DAILY ATTENDANCE EXCEL REPORT
# ============================================================

class DailyAttendanceReportAPIView(APIView):

    def get(self, request):
        report_date = request.query_params.get("date")

        # --------------------------------
        # Validate Date
        # --------------------------------

        if not report_date:
            return Response(
                {
                    "success": False,
                    "message": "Date is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Get Attendance Records
        # --------------------------------

        attendance_records = (
            Attendance.objects
            .select_related("employee")
            .filter(date=report_date)
            .order_by("employee__employee_id")
        )

        # --------------------------------
        # Create Excel Workbook
        # --------------------------------

        workbook = Workbook()

        worksheet = workbook.active
        worksheet.title = "Daily Attendance"

        # --------------------------------
        # Excel Header
        # --------------------------------

        worksheet.append(
            [
                "Date",
                "Employee ID",
                "Employee Name",
                "Department",
                "Designation",
                "Check In",
                "Check Out",
                "Status",
            ]
        )

        # --------------------------------
        # Add Attendance Data
        # --------------------------------

        for record in attendance_records:

            if record.check_out:
                attendance_status = "Completed"

            elif record.check_in:
                attendance_status = "Checked In"

            else:
                attendance_status = "Pending"

            # Excel does not support timezone-aware
            # datetime objects, so convert them to
            # timezone-naive datetime objects.

            check_in = (
                timezone.make_naive(record.check_in)
                if record.check_in
                else None
            )

            check_out = (
                timezone.make_naive(record.check_out)
                if record.check_out
                else None
            )

            worksheet.append(
                [
                    record.date,
                    record.employee.employee_id,
                    record.employee.name,
                    record.employee.department,
                    record.employee.designation,
                    check_in,
                    check_out,
                    attendance_status,
                ]
            )

        # --------------------------------
        # Column Widths
        # --------------------------------

        column_widths = {
            "A": 15,
            "B": 18,
            "C": 25,
            "D": 20,
            "E": 22,
            "F": 22,
            "G": 22,
            "H": 18,
        }

        for column, width in column_widths.items():
            worksheet.column_dimensions[column].width = width

        # --------------------------------
        # Freeze Header Row
        # --------------------------------

        worksheet.freeze_panes = "A2"

        # --------------------------------
        # Excel Response
        # --------------------------------

        response = HttpResponse(
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            f'attachment; filename="attendance_{report_date}.xlsx"'
        )

        workbook.save(response)

        return response
    
    # ============================================================
# MONTHLY ATTENDANCE EXCEL REPORT
# ============================================================

class MonthlyAttendanceReportAPIView(APIView):

    def get(self, request):
        month = request.query_params.get("month")
        employee_id = request.query_params.get("employee")

        # --------------------------------
        # Validate Month
        # --------------------------------

        if not month:
            return Response(
                {
                    "success": False,
                    "message": "Month is required. Use YYYY-MM format.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            year, month_number = map(int, month.split("-"))

            if month_number < 1 or month_number > 12:
                raise ValueError

        except (ValueError, TypeError):
            return Response(
                {
                    "success": False,
                    "message": "Invalid month format. Use YYYY-MM.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Calculate Month Range
        # --------------------------------

        from datetime import date
        from calendar import monthrange

        start_date = date(year, month_number, 1)

        last_day = monthrange(
            year,
            month_number,
        )[1]

        end_date = date(
            year,
            month_number,
            last_day,
        )

        # --------------------------------
        # Get Attendance Records
        # --------------------------------

        attendance_records = (
            Attendance.objects
            .select_related("employee")
            .filter(
                date__gte=start_date,
                date__lte=end_date,
            )
            .order_by(
                "date",
                "employee__employee_id",
            )
        )

        # --------------------------------
        # Filter Employee
        # --------------------------------

        if employee_id:
            attendance_records = attendance_records.filter(
                employee__employee_id=employee_id
            )

        # --------------------------------
        # Create Excel Workbook
        # --------------------------------

        workbook = Workbook()

        worksheet = workbook.active
        worksheet.title = "Monthly Attendance"

        # --------------------------------
        # Excel Header
        # --------------------------------

        worksheet.append(
            [
                "Date",
                "Employee ID",
                "Employee Name",
                "Department",
                "Designation",
                "Check In",
                "Check Out",
                "Status",
            ]
        )

        # --------------------------------
        # Add Attendance Data
        # --------------------------------

        for record in attendance_records:

            if record.check_out:
                attendance_status = "Completed"

            elif record.check_in:
                attendance_status = "Checked In"

            else:
                attendance_status = "Pending"

            check_in = (
                timezone.make_naive(record.check_in)
                if record.check_in
                else None
            )

            check_out = (
                timezone.make_naive(record.check_out)
                if record.check_out
                else None
            )

            worksheet.append(
                [
                    record.date,
                    record.employee.employee_id,
                    record.employee.name,
                    record.employee.department,
                    record.employee.designation,
                    check_in,
                    check_out,
                    attendance_status,
                ]
            )

        # --------------------------------
        # Column Widths
        # --------------------------------

        column_widths = {
            "A": 15,
            "B": 18,
            "C": 25,
            "D": 20,
            "E": 22,
            "F": 22,
            "G": 22,
            "H": 18,
        }

        for column, width in column_widths.items():
            worksheet.column_dimensions[column].width = width

        # --------------------------------
        # Freeze Header
        # --------------------------------

        worksheet.freeze_panes = "A2"

        # --------------------------------
        # Excel Response
        # --------------------------------

        response = HttpResponse(
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        filename = f"attendance_{month}"

        if employee_id:
            filename += f"_{employee_id}"

        filename += ".xlsx"

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}"'
        )

        workbook.save(response)

        return response