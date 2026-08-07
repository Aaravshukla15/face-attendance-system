import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export default function RecordAttendance() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

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
  };

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Face Attendance</h1>

          <p className="text-gray-500 mt-2">
            Record your attendance using face recognition.
          </p>
        </div>

        {/* Main Card */}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {!cameraOpen ? (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Camera size={42} className="text-blue-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                Ready to record attendance?
              </h2>

              <p className="text-gray-500 mt-2 mb-6">
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

              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-square object-cover"
                />

                {/* Face guide */}

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-64 border-4 border-white/80 rounded-[50%]" />
                </div>
              </div>

              {/* Status */}

              <div className="text-center mt-5">
                <h2 className="text-lg font-bold text-gray-800">
                  Position your face inside the frame
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Face recognition will start automatically.
                </p>
              </div>

              {/* Close Camera */}

              <button
                onClick={stopCamera}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer */}

        <p className="text-center text-gray-400 text-sm mt-6">
          Attendance is recorded automatically after successful recognition.
        </p>
      </div>
    </div>
  );
}
