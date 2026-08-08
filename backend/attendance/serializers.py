from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="employee.name",
        read_only=True,
    )

    employee_id = serializers.CharField(
        source="employee.employee_id",
        read_only=True,
    )

    employee_department = serializers.CharField(
        source="employee.department",
        read_only=True,
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_id",
            "employee_name",
            "employee_department",
            "date",
            "check_in",
            "check_out",
            "created_at",
            "updated_at",
        ]