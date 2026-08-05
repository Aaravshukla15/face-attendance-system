from rest_framework import serializers
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_id",
            "name",
            "department",
            "designation",
            "email",
            "phone",
            "photo",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_phone(self, value):
        if value:
            if not value.isdigit():
                raise serializers.ValidationError(
                    "Phone number should contain only digits."
                )

            if len(value) != 10:
                raise serializers.ValidationError(
                    "Phone number must be exactly 10 digits."
                )

        return value

    def validate_email(self, value):
        if value:
            value = value.lower()

        return value