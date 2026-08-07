from rest_framework import generics, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import Employee
from .serializers import EmployeeSerializer
from .face_utils import generate_face_encoding, recognize_employee

from rest_framework.views import APIView
from rest_framework.response import Response


class EmployeeListCreateAPIView(generics.ListCreateAPIView):
    queryset = Employee.objects.all().order_by("employee_id")
    serializer_class = EmployeeSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

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

    def perform_create(self, serializer):
        employee = serializer.save()

        try:
            if employee.photo:
                encoding = generate_face_encoding(
                    employee.photo.path
                )

                if encoding is not None:
                    employee.face_encoding = encoding
                    employee.save(
                        update_fields=["face_encoding"]
                    )

        except Exception as error:
            print(
                f"Face encoding generation failed: {error}"
            )


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


class FaceRecognitionAPIView(APIView):

    def post(self, request):
        image = request.FILES.get("image")

        if not image:
            return Response(
                {"error": "No image provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Temporarily save the captured image
            file_path = default_storage.save(
                f"temp/attendance_{image.name}",
                ContentFile(image.read()),
            )

            full_path = default_storage.path(file_path)

            # Recognize employee
            employee = recognize_employee(full_path)

            # Delete temporary image
            default_storage.delete(file_path)

            if employee is None:
                return Response(
                    {
                        "matched": False,
                        "message": "Face not recognized.",
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "matched": True,
                    "message": "Employee recognized successfully.",
                    "employee": {
                        "id": employee.id,
                        "employee_id": employee.employee_id,
                        "name": employee.name,
                        "department": employee.department,
                        "designation": employee.designation,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as error:
            print(
                "Face recognition error:",
                error
            )

            return Response(
                {
                    "matched": False,
                    "error": "Face recognition failed.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )