import face_recognition
import numpy as np


def generate_face_encoding(image_path):
    """
    Generate a face encoding from an employee image.

    Returns:
        bytes: Face encoding suitable for Django BinaryField
        None: If no face is detected
    """

    image = face_recognition.load_image_file(image_path)

    face_locations = face_recognition.face_locations(image)

    if not face_locations:
        return None

    # Use the first detected face
    encodings = face_recognition.face_encodings(
        image,
        face_locations
    )

    if not encodings:
        return None

    # Convert numpy array to bytes for Django BinaryField
    return encodings[0].tobytes()


def recognize_employee(image_path):
    """
    Recognize an employee from a captured image.

    Returns:
        Employee object if a matching employee is found.
        None if no matching employee is found.
    """

    from .models import Employee

    # Load captured image
    image = face_recognition.load_image_file(image_path)

    # Detect faces in captured image
    face_locations = face_recognition.face_locations(image)

    if not face_locations:
        return None

    # Generate encoding for the first detected face
    encodings = face_recognition.face_encodings(
        image,
        face_locations
    )

    if not encodings:
        return None

    live_encoding = encodings[0]

    # Get active employees who have stored face encodings
    employees = Employee.objects.filter(
        is_active=True,
        face_encoding__isnull=False,
    )

    for employee in employees:

        try:
            # Convert stored bytes back into numpy array
            stored_encoding = np.frombuffer(
                employee.face_encoding,
                dtype=np.float64,
            )

            # Safety check
            if stored_encoding.shape != (128,):
                continue

            # Compare live face with stored face
            match = face_recognition.compare_faces(
                [stored_encoding],
                live_encoding,
                tolerance=0.5,
            )[0]

            if match:
                return employee

        except Exception as error:
            print(
                f"Face recognition failed for "
                f"{employee.employee_id}: {error}"
            )

    return None