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

// State variables for temporal smoothing and stabilization (module scope)
let expressionHistory = [];
const SMOOTHING_WINDOW_SIZE = 15;
let lastStableExpression = "Neutral 😐";

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

        // Extract blendshapes for logic
        const smileLeft = getScore("mouthSmileLeft");
        const smileRight = getScore("mouthSmileRight");
        const smileAvg = (smileLeft + smileRight) / 2;

        const cheekSquintLeft = getScore("cheekSquintLeft");
        const cheekSquintRight = getScore("cheekSquintRight");
        const cheekSquintAvg = (cheekSquintLeft + cheekSquintRight) / 2;

        const eyeSquintLeft = getScore("eyeSquintLeft");
        const eyeSquintRight = getScore("eyeSquintRight");
        const eyeSquintAvg = (eyeSquintLeft + eyeSquintRight) / 2;

        const jawOpen = getScore("jawOpen");

        const frownLeft = getScore("mouthFrownLeft");
        const frownRight = getScore("mouthFrownRight");
        const frownAvg = (frownLeft + frownRight) / 2;

        const browInnerUp = getScore("browInnerUp");

        const browDownLeft = getScore("browDownLeft");
        const browDownRight = getScore("browDownRight");
        const browDownAvg = (browDownLeft + browDownRight) / 2;

        const mouthShrugLower = getScore("mouthShrugLower");

        const eyeWideLeft = getScore("eyeWideLeft");
        const eyeWideRight = getScore("eyeWideRight");
        const eyeWideAvg = (eyeWideLeft + eyeWideRight) / 2;

        const browOuterUpLeft = getScore("browOuterUpLeft");
        const browOuterUpRight = getScore("browOuterUpRight");
        const browUpAvg = (browInnerUp + browOuterUpLeft + browOuterUpRight) / 3;

        // Set scores in UI meters
        setScores({
          smile: Math.round(smileAvg * 100),
          jawOpen: Math.round(jawOpen * 100),
          frown: Math.round(frownAvg * 100),
          browUp: Math.round(browUpAvg * 100),
          angry: Math.round(browDownAvg * 100)
        });

        // 1. Classification & Confidence Scoring
        let rawExpression = "Neutral 😐";
        let confidence = 0.5; // Baseline confidence for neutral

        if (smileAvg > 0.38 && frownAvg < 0.15) {
          rawExpression = "Happy 😊";
          confidence = smileAvg * 0.7 + cheekSquintAvg * 0.15 + eyeSquintAvg * 0.15;
        } else if (jawOpen > 0.3 && eyeWideAvg > 0.15) {
          rawExpression = "Surprised 😲";
          confidence = jawOpen * 0.5 + eyeWideAvg * 0.3 + browUpAvg * 0.2;
        } else if (frownAvg > 0.12 && browInnerUp > 0.08 && smileAvg < 0.2) {
          rawExpression = "Sad 😢";
          confidence = frownAvg * 0.4 + browInnerUp * 0.3 + mouthShrugLower * 0.3;
        }

        // 2. Real-time logging telemetry
        console.log(
          `[FaceLandmarker] Smile: ${smileAvg.toFixed(2)} | Frown: ${frownAvg.toFixed(2)} | ` +
          `Jaw: ${jawOpen.toFixed(2)} | EyeWide: ${eyeWideAvg.toFixed(2)} | ` +
          `BrowUp: ${browUpAvg.toFixed(2)} | BrowDown: ${browDownAvg.toFixed(2)} | ` +
          `Raw: ${rawExpression} (${confidence.toFixed(2)}) | ` +
          `Stable: ${lastStableExpression}`
        );

        // 3. Temporal Smoothing Buffer
        expressionHistory.push({ expression: rawExpression, confidence });
        if (expressionHistory.length > SMOOTHING_WINDOW_SIZE) {
          expressionHistory.shift();
        }

        // Count frequencies in buffer
        const frequencies = {};
        expressionHistory.forEach((item) => {
          frequencies[item.expression] = (frequencies[item.expression] || 0) + 1;
        });

        // Find majority expression
        let majorityExpression = lastStableExpression;
        let maxCount = 0;
        Object.keys(frequencies).forEach((expr) => {
          if (frequencies[expr] > maxCount) {
            maxCount = frequencies[expr];
            majorityExpression = expr;
          }
        });

        // Only switch if the majority class takes at least 50% of the buffer
        if (maxCount >= Math.ceil(SMOOTHING_WINDOW_SIZE / 2)) {
          lastStableExpression = majorityExpression;
        }

        setExpression(lastStableExpression);
      } else {
        setFaceDetected(false);
        setExpression("No face detected");
        expressionHistory = []; // Reset history when face is lost
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  }
};

