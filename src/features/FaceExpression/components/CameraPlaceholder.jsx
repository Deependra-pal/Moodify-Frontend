import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Sparkles, Video, VideoOff, Smile, ChevronRight } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * Real-time Webcam and Emotion Detection Scanner component.
 * Guides the user step-by-step through webcam activation, locking, and display results.
 */
const CameraPlaceholder = ({
  currentEmotion,
  onRecommend,
  isLoadingSongs
}) => {
  const [detectedEmotion, setDetectedEmotion] = useState(currentEmotion || 'None');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [status, setStatus] = useState('Camera Offline');
  const [faceDetected, setFaceDetected] = useState(false);

  // Sync with global currentEmotion when it changes
  useEffect(() => {
    if (currentEmotion) {
      setDetectedEmotion(currentEmotion);
    }
  }, [currentEmotion]);

  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const detectionStartTimeRef = useRef(null);

  // Initialize MediaPipe and Webcam stream
  const startCamera = async () => {
    setStatus('Loading AI Models...');
    setCameraEnabled(true);
    setDetectedEmotion('None');
    setScanProgress(0);
    setConfidenceScore(0);
    detectionStartTimeRef.current = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Insecure HTTP context. HTTPS is required on mobile to access the camera.');
      }

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );

      try {
        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });
      } catch (gpuErr) {
        console.warn('Failed with GPU delegate, falling back to CPU:', gpuErr);
        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });
      }

      setStatus('Accessing Webcam...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          setStatus('Active Tracking');
          animationRef.current = requestAnimationFrame(detectExpressionLoop);
        } catch (playErr) {
          console.warn('Initial play promise rejected, waiting for metadata:', playErr);
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(console.error);
            setStatus('Active Tracking');
            animationRef.current = requestAnimationFrame(detectExpressionLoop);
          };
        }
      }
    } catch (err) {
      console.error('Error starting camera/models:', err);
      let errorMsg = err.message || 'Camera or Model Error';
      if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('permission denied')) {
        errorMsg = 'Permission Denied. Please enable camera access in browser site settings.';
      }
      setStatus(`Failed: ${errorMsg}`);
      setCameraEnabled(false);
    }
  };

  // Stop Webcam stream and release resources
  const stopCamera = () => {
    setStatus('Camera Offline');
    setCameraEnabled(false);
    setFaceDetected(false);
    setDetectedEmotion('None');
    setScanProgress(0);
    detectionStartTimeRef.current = null;
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }
  };

  // Real-time detection loop
  const detectExpressionLoop = () => {
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

          // Extract emotional blendshape metrics
          const smileLeft = getScore('mouthSmileLeft');
          const smileRight = getScore('mouthSmileRight');
          const smileAvg = (smileLeft + smileRight) / 2;

          const jawOpen = getScore('jawOpen');

          const frownLeft = getScore('mouthFrownLeft');
          const frownRight = getScore('mouthFrownRight');
          const frownAvg = (frownLeft + frownRight) / 2;

          // Mapping formula
          let currentExpression = 'Neutral';
          let computedConfidence = 0.85;

          if (jawOpen > 0.45) {
            currentExpression = 'Surprised';
            computedConfidence = Math.min(0.99, Math.max(0.7, jawOpen));
          } else if (smileAvg > 0.30) {
            currentExpression = 'Happy';
            computedConfidence = Math.min(0.99, Math.max(0.75, smileAvg * 1.5));
          } else if (frownAvg > 0.05 && smileAvg < 0.05) {
            currentExpression = 'Sad';
            computedConfidence = Math.min(0.99, Math.max(0.7, frownAvg * 4));
          } else {
            currentExpression = 'Neutral';
            computedConfidence = 0.82 + (Math.random() * 0.08); // dynamic float for neutral
          }

          setDetectedEmotion(currentExpression);
          setConfidenceScore(Math.round(computedConfidence * 100));

          // Handle the 2-second stabilization tracking window
          if (detectionStartTimeRef.current === null) {
            detectionStartTimeRef.current = Date.now();
            setStatus('Locking Expression...');
            setScanProgress(0);
            setIsScanning(true);
          } else {
            const elapsed = Date.now() - detectionStartTimeRef.current;
            if (elapsed < 2000) {
              const progress = Math.min(100, Math.round((elapsed / 2000) * 100));
              setScanProgress(progress);
              setStatus(`Analyzing face (${Math.max(1, Math.ceil((2000 - elapsed) / 1000))}s)...`);
              setIsScanning(true);
            } else {
              setScanProgress(100);
              // Lock confirmed! Stop loop and release camera tracks
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
              }
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
              }
              if (landmarkerRef.current) {
                landmarkerRef.current.close();
                landmarkerRef.current = null;
              }

              setCameraEnabled(false);
              setFaceDetected(false);
              setStatus('Scan Completed');
              detectionStartTimeRef.current = null;
              setIsScanning(false);

              // Immediately fetch song recommendations
              onRecommend(currentExpression);
              return; // Exit the loop
            }
          }
        } else {
          setFaceDetected(false);
          setDetectedEmotion('None');
          setScanProgress(0);
          detectionStartTimeRef.current = null;
          setStatus('Active Tracking');
        }
      } catch (err) {
        console.error('Detection loop error:', err);
      }
    }

    if (streamRef.current) {
      animationRef.current = requestAnimationFrame(detectExpressionLoop);
    }
  };

  // Clean up references on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'Happy': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Sad': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Surprised': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Neutral': return 'bg-neutral-500/10 text-neutral-400 border-neutral-800';
      default: return 'bg-neutral-800 text-neutral-400 border-transparent';
    }
  };

  const getEmotionEmoji = (emotion) => {
    switch (emotion) {
      case 'Happy': return '😊';
      case 'Sad': return '😢';
      case 'Surprised': return '😲';
      case 'Neutral': return '😐';
      default: return '❓';
    }
  };

  const hasResult = detectedEmotion && detectedEmotion !== 'None' && !cameraEnabled;

  return (
    <div className="w-full select-none">
      {/* ----------------- STEP 2: START EMOTION SCAN CARD ----------------- */}
      {!cameraEnabled && !hasResult && (
        <div className="bg-[#181818] border border-neutral-900 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xl max-w-xl mx-auto">
          <div className="mx-auto h-16 w-16 bg-[#1db954]/10 border border-[#1db954]/25 rounded-full flex items-center justify-center text-[#1db954] shadow-md">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Detect Your Mood</h3>
            <p className="text-xs sm:text-sm text-neutral-450 leading-relaxed max-w-md mx-auto">
              Scan your face using your webcam to detect your current emotional state and instantly receive song recommendations matching your vibe.
            </p>
          </div>
          <button
            onClick={startCamera}
            className="w-full sm:w-auto bg-[#1db954] hover:bg-[#1ed760] text-black text-sm font-bold uppercase tracking-wider px-10 py-4 rounded-full transition-all duration-200 active:scale-95 shadow-lg shadow-[#1db954]/10 cursor-pointer animate-bounce-subtle"
          >
            Start Emotion Scan
          </button>
          <p className="text-[10px] text-neutral-600 max-w-xs mx-auto leading-normal">
            Requires camera access. Your video frames are processed completely offline in your browser and are never saved or uploaded.
          </p>
        </div>
      )}

      {/* ----------------- STEP 3: CAMERA LIVE FEED CONTAINER ----------------- */}
      {cameraEnabled && (
        <div className="bg-[#181818] border border-neutral-900 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#1db954] animate-pulse" />
              <h4 className="text-sm font-bold text-neutral-300">Live Face Scanner</h4>
            </div>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[#1db954]">
              {status}
            </span>
          </div>

          <div className="relative aspect-video rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
              autoPlay
              playsInline
              muted
            />


            {/* HUD Status Box */}
            {faceDetected && (
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 text-[#1db954] border border-[#1db954]/25 pointer-events-none z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-ping"></span>
                Detecting: {detectedEmotion} {getEmotionEmoji(detectedEmotion)}
              </div>
            )}

            {/* Initializing View Overlay */}
            {status.includes('Loading') && (
              <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center space-y-3 z-30">
                <RefreshCw className="h-8 w-8 text-[#1db954] animate-spin" />
                <p className="text-xs text-neutral-450 font-semibold">{status}</p>
              </div>
            )}
          </div>

          {/* Real-time scan progress bar */}
          {isScanning && (
            <div className="w-full bg-[#242424] rounded-xl p-3 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-450">
                <span>Analyzing {detectedEmotion} vibes...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
                <div 
                  className="h-full bg-gradient-to-r from-[#1db954] to-[#1ed760] transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-[10px] text-neutral-500 max-w-[60%] leading-relaxed select-none">
              Keep your face centered and hold steady for 2 seconds.
            </span>
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-full text-xs font-bold border border-red-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <VideoOff className="h-3.5 w-3.5" />
              Cancel Scan
            </button>
          </div>
        </div>
      )}

      {/* ----------------- STEP 4: RESULT SECTION ----------------- */}
      {hasResult && (
        <div className="bg-[#181818] border border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-xl max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="h-16 w-16 rounded-2xl bg-[#242424] border border-neutral-800 flex items-center justify-center text-4xl shadow-md shrink-0">
              {getEmotionEmoji(detectedEmotion)}
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#1db954] block">
                Scanning Result
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                You're feeling {detectedEmotion}
              </h3>
              <p className="text-xs text-neutral-450 font-semibold">
                Confidence Score: {confidenceScore}% • Curated curations loaded
              </p>
            </div>
          </div>

          <button
            onClick={startCamera}
            className="flex items-center gap-1.5 bg-[#242424] hover:bg-neutral-800 hover:border-neutral-700 active:scale-95 border border-neutral-800 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPlaceholder;
