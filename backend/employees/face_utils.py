import face_recognition


def generate_face_encoding(image_path):
    """
    Generate a face encoding from an employee image.

    Returns:
        bytes: Face encoding suitable for BinaryField
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