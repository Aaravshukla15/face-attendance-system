from django.db import models


class Employee(models.Model):
    employee_id = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=10, blank=True)
    photo = models.ImageField(upload_to="employees/")

    face_encoding = models.BinaryField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.employee_id:
            last_employee = Employee.objects.order_by("-id").first()

            if last_employee:
                last_id = int(last_employee.employee_id.replace("EMP", ""))
                self.employee_id = f"EMP{last_id + 1:03d}"
            else:
                self.employee_id = "EMP001"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee_id} - {self.name}"