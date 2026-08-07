import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X } from "lucide-react";

export default function RecordAttendance() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [recognizing, setRecognizing] = useState(false);
  const [recognitionMessage, setRecognitionMessage] = useState("");

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.play().catch((error) => {
        console.error("Video playback error:", error);
      });
    }
  }, [cameraOpen]);

  const startCamera = async () => {
    try {
      setCameraError("");
      setRecognitionMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraOpen(true);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setRecognizing(false);
    setRecognitionMessage("");
  };

  const handleBack = () => {
    stopCamera();
    navigate("/");
  };

  const recognizeFace = async () => {
    if (!videoRef.current) return;

    try {
      setRecognizing(true);
      setRecognitionMessage("");

      // --------------------------------
      // STEP 1: CAPTURE CAMERA FRAME
      // --------------------------------

      const canvas = document.createElement("canvas");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create canvas context.");
      }

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // --------------------------------
      // STEP 2: CONVERT FRAME TO IMAGE
      // --------------------------------

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Unable to capture camera image.");
      }

      // --------------------------------
      // STEP 3: FACE RECOGNITION
      // --------------------------------

      const formData = new FormData();

      formData.append("image", blob, "face.jpg");

      const recognitionResponse = await fetch(
        "http://127.0.0.1:8000/api/employees/recognize/",
        {
          method: "POST",
          body: formData,
        },
      );

      const recognitionData = await recognitionResponse.json();

      console.log("Face recognition response:", recognitionData);

      if (!recognitionResponse.ok) {
        throw new Error(recognitionData.error || "Face recognition failed.");
      }

      // --------------------------------
      // FACE NOT RECOGNIZED
      // --------------------------------

      if (!recognitionData.matched) {
        setRecognitionMessage(
          recognitionData.message || "Face not recognized. Please try again.",
        );

        return;
      }

      // --------------------------------
      // STEP 4: EMPLOYEE RECOGNIZED
      // --------------------------------

      const employee = recognitionData.employee;

      console.log("Recognized employee:", employee);

      setRecognitionMessage(
        `Face recognized: ${employee.name} (${employee.employee_id})`,
      );

      // --------------------------------
      // STEP 5: RECORD ATTENDANCE
      // --------------------------------

      const attendanceResponse = await fetch(
        "http://127.0.0.1:8000/api/attendance/record/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: employee.employee_id,
          }),
        },
      );

      const attendanceData = await attendanceResponse.json();

      console.log("Attendance response:", attendanceData);

      if (!attendanceResponse.ok) {
        throw new Error(
          attendanceData.message || "Unable to record attendance.",
        );
      }

      // --------------------------------
      // CHECK-IN SUCCESS
      // --------------------------------

      if (attendanceData.action === "check_in") {
        setRecognitionMessage(
          `Welcome ${employee.name}! Check-in recorded successfully.`,
        );

        return;
      }

      // --------------------------------
      // CHECK-OUT SUCCESS
      // --------------------------------

      if (attendanceData.action === "check_out") {
        setRecognitionMessage(
          `Goodbye ${employee.name}! Check-out recorded successfully.`,
        );

        return;
      }

      // --------------------------------
      // ATTENDANCE ALREADY COMPLETED
      // --------------------------------

      if (attendanceData.action === "already_completed") {
        setRecognitionMessage(
          `${employee.name}, your attendance is already completed for today.`,
        );

        return;
      }

      // --------------------------------
      // FALLBACK
      // --------------------------------

      setRecognitionMessage(
        attendanceData.message || "Attendance processed successfully.",
      );
    } catch (error) {
      console.error("Attendance recognition error:", error);

      setRecognitionMessage(
        error.message || "Unable to process attendance. Please try again.",
      );
    } finally {
      setRecognizing(false);
    }
  };

  // Stop camera when leaving the page
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back to Home */}

        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition mb-6 sm:mb-8"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />

          <span>Back to Home</span>
        </button>

        {/* Header */}

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Face Attendance
          </h1>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Record your attendance using face recognition.
          </p>
        </div>

        {/* Main Card */}

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          {!cameraOpen ? (
            <div className="text-center">
              {/* Camera Icon */}

              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-5 sm:mb-6">
                <Camera
                  size={36}
                  className="text-blue-600 sm:w-[42px] sm:h-[42px]"
                />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Ready to record attendance?
              </h2>

              <p className="text-gray-500 mt-2 mb-6 text-sm sm:text-base">
                Tap the button below to open the camera.
              </p>

              <button
                onClick={startCamera}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Record Attendance
              </button>

              {cameraError && (
                <p className="text-red-600 text-sm mt-4">{cameraError}</p>
              )}
            </div>
          ) : (
            <div>
              {/* Camera */}

              <div className="w-full max-w-[420px] mx-auto">
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-square object-cover"
                  />

                  {/* Face Guide */}

                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-52 sm:w-48 sm:h-56 border-4 border-white/80 rounded-[50%]" />
                  </div>

                  {/* Recognition Overlay */}

                  {recognizing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-xl px-5 py-4 text-center shadow-lg mx-4">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />

                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                          Recognizing face...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}

              <div className="text-center mt-5">
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  Position your face inside the frame
                </h2>

                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Make sure your face is clearly visible before scanning.
                </p>
              </div>

              {/* Recognition / Attendance Message */}

              {recognitionMessage && (
                <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3 text-center text-sm">
                  {recognitionMessage}
                </div>
              )}

              {/* Scan Face */}

              <button
                onClick={recognizeFace}
                disabled={recognizing}
                className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition ${
                  recognizing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {recognizing ? "Recognizing..." : "Scan Face"}
              </button>

              {/* Close Camera */}

              <button
                onClick={stopCamera}
                disabled={recognizing}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
                  recognizing
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-800 text-white"
                }`}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer */}

        <p className="text-center text-gray-400 text-xs sm:text-sm mt-5 sm:mt-6 px-2">
          Attendance is recorded automatically after successful recognition.
        </p>
      </div>
    </div>
  );
}
