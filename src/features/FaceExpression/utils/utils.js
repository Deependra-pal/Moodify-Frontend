import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const initFaceLandmarker = async ({
  landmarkerRef,
  videoRef,
  setStatus,
  setExpression,
  onReady
}) => {
  try {
    setStatus("Loading MediaPipe Vision WASM...");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );

    setStatus("Loading Face Landmarker Model...");
    landmarkerRef.current = await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      }
    );

    setStatus("Accessing Camera...");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setStatus("Ready! Click button to detect expression");
        if (onReady) onReady();
      };
    }
  } catch (err) {
    console.error("Error initializing Face Landmarker:", err);
    setStatus("Error: Could not access camera or load model.");
    setExpression("Error ⚠️");
  }
};

export const detectExpression = ({
  landmarkerRef,
  videoRef,
  lastVideoTimeRef,
  setScores,
  setExpression,
  setFaceDetected
}) => {
  const video = videoRef.current;
  const landmarker = landmarkerRef.current;

  if (
    landmarker &&
    video &&
    video.readyState >= 2 &&
    video.currentTime !== lastVideoTimeRef.current
  ) {
    lastVideoTimeRef.current = video.currentTime;
    const startTimeMs = performance.now();

    try {
      const results = landmarker.detectForVideo(video, startTimeMs);

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        setFaceDetected(true);
        const blendshapes = results.faceBlendshapes[0].categories;

        const getScore = (name) =>
          blendshapes.find((b) => b.categoryName === name)?.score || 0;

        const smileLeft = getScore("mouthSmileLeft");
        const smileRight = getScore("mouthSmileRight");
        const smileAvg = (smileLeft + smileRight) / 2;

        const jawOpen = getScore("jawOpen");

        const frownLeft = getScore("mouthFrownLeft");
        const frownRight = getScore("mouthFrownRight");
        const frownAvg = (frownLeft + frownRight) / 2;

        const browUp = getScore("browInnerUp");

        setScores({
          smile: Math.round(smileAvg * 100),
          jawOpen: Math.round(jawOpen * 100),
          frown: Math.round(frownAvg * 100),
          browUp: Math.round(browUp * 100)
        });

        // Expression logic
        let currentExpression = "Neutral 😐";

        if (jawOpen > 0.45) {
          currentExpression = "Surprised 😲";
        } else if (smileAvg > 0.35) {
          currentExpression = "Happy 😊";
        } else if (frownAvg > 0.01 && smileAvg < 0.01) {
          currentExpression = "Sad 😢";
        } else {
          currentExpression = "Neutral 😐";
        }
        setExpression(currentExpression);
      } else {
        setFaceDetected(false);
        setExpression("No face detected");
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  }
};