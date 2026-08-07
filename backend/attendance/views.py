from django.utils import timezone
from rest_framework import generics
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceListCreateAPIView(generics.ListCreateAPIView):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer


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