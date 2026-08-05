from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "employee_id",
        "name",
        "department",
        "designation",
        "is_active",
    )

    search_fields = (
        "employee_id",
        "name",
        "department",
    )

    list_filter = (
        "department",
        "is_active",
    )
    
    # [{'username': 'companyadmin', 'email': 'company@gmail.com', password: admin@12}]