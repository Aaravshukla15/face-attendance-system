from django.db import models
from employees.models import Employee


class Attendance(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    date = models.DateField()

    check_in = models.DateTimeField(
        null=True,
        blank=True,
    )

    check_out = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-date", "-check_in"]
        unique_together = ["employee", "date"]

    def __str__(self):
        return f"{self.employee.employee_id} - {self.date}"