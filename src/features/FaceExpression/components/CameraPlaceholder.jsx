import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Sparkles, Video, VideoOff } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * Real-time Webcam and Emotion Detection Scanner component.
 * Integrates MediaPipe FaceLandmarker to detect expressions (Happy, Sad, Surprised, Neutral)
 * on a live mirrored camera feed inside the Spotify-inspired template.
 */
const CameraPlaceholder = ({
  currentEmotion,
  onRecommend,
  isLoadingSongs
}) => {
  const [detectedEmotion, setDetectedEmotion] = useState(currentEmotion || 'None');
  const [isScanning, setIsScanning] = useState(false);
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
    detectionStartTimeRef.current = null;
    try {
      // 1. Load Fileset Resolver
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );

      // 2. Create Face Landmarker instance
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

      setStatus('Accessing Webcam...');
      // 3. Prompt user for camera feed
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStatus('Active Tracking');
          // Start the detection loop
          animationRef.current = requestAnimationFrame(detectExpressionLoop);
        };
      }
    } catch (err) {
      console.error('Error starting camera/models:', err);
      setStatus('Failed: Camera or Model Error');
      setCameraEnabled(false);
    }
  };

  // Stop Webcam stream and release resources
  const stopCamera = () => {
    setStatus('Camera Offline');
    setCameraEnabled(false);
    setFaceDetected(false);
    setDetectedEmotion('None');
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

          if (jawOpen > 0.45) {
            currentExpression = 'Surprised';
          } else if (smileAvg > 0.30) {
            currentExpression = 'Happy';
          } else if (frownAvg > 0.05 && smileAvg < 0.05) {
            currentExpression = 'Sad';
          } else {
            currentExpression = 'Neutral';
          }

          setDetectedEmotion(currentExpression);

          // Handle the 2-second stabilization tracking window
          if (detectionStartTimeRef.current === null) {
            detectionStartTimeRef.current = Date.now();
            setStatus('Locking Expression (2s)...');
            setIsScanning(true);
          } else {
            const elapsed = Date.now() - detectionStartTimeRef.current;
            if (elapsed < 2000) {
              const secondsLeft = Math.ceil((2000 - elapsed) / 1000);
              setStatus(`Analyzing face (${secondsLeft}s)...`);
              setIsScanning(true);
            } else {
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

  return (
    <div className="bg-[#181818] border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-neutral-200 flex items-center gap-2">
          <Camera className="h-5 w-5 text-[#1db954]" />
          Emotion Detection Scanner
        </h2>
        {/* Connection status badge */}
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
          {status}
        </span>
      </div>

      {/* Live Video Feed / Preview View */}
      <div className="relative aspect-video rounded-xl bg-neutral-950 border border-neutral-800/80 overflow-hidden flex flex-col items-center justify-center text-center p-4">
        {cameraEnabled && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />
        )}

        {/* Decorative Grid Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Live Face Tracking HUD Overlay */}
        {cameraEnabled && faceDetected && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-2 text-[#1db954] border border-[#1db954]/20 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-ping"></span>
            Face Locked
          </div>
        )}

        {/* Offline Cover overlay */}
        {!cameraEnabled && (
          <div className="space-y-4 z-10">
            <div className="h-12 w-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
              <Camera className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-300">Camera Feed Offline</p>
              <p className="text-xs text-neutral-500 max-w-xs px-4 mx-auto">
                Turn on the camera to capture video frames and track facial expressions in real time.
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {cameraEnabled && status.includes('Loading') && (
          <div className="space-y-3 z-10 absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-[#1db954] animate-spin" />
            <p className="text-xs text-neutral-400">{status}</p>
          </div>
        )}
      </div>

      {/* Control Actions / Status Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#242424] rounded-xl p-4 border border-neutral-800">
        <div className="space-y-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold block select-none">
            Live Expression
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getEmotionColor(detectedEmotion)} transition-all duration-300`}>
            <span>{getEmotionEmoji(detectedEmotion)}</span>
            <span>{detectedEmotion}</span>
          </span>
        </div>

        {/* Enable / Disable Camera Toggle */}
        <button
          onClick={cameraEnabled ? stopCamera : startCamera}
          className={`flex items-center gap-2 font-bold text-xs px-5 py-3 rounded-full shadow-lg active:scale-95 transition-all duration-200 cursor-pointer ${cameraEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-[#1db954] hover:bg-[#1ed760] text-black'
            }`}
        >
          {cameraEnabled ? (
            <>
              <VideoOff className="h-4 w-4" />
              Stop Camera
            </>
          ) : (
            <>
              <Video className="h-4 w-4" />
              {detectedEmotion && detectedEmotion !== 'None' ? 'Detect Again' : 'Start Camera'}
            </>
          )}
        </button>
      </div>

      {/* Recommendations Trigger */}
      <div>
        <button
          onClick={() => onRecommend(detectedEmotion)}
          disabled={detectedEmotion === 'None' || isLoadingSongs || isScanning}
          className={`w-full py-3 rounded-full text-xs font-bold transition-all duration-200 ${detectedEmotion === 'None'
              ? 'bg-neutral-800 border border-neutral-700/50 text-neutral-500 cursor-not-allowed'
              : 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-lg active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-55'
            }`}
        >
          {isLoadingSongs ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-black" />
              Fetching recommendations...
            </span>
          ) : (
            detectedEmotion === 'None' ? 'Recommend Songs (Start Camera & Face Scan)' : `Recommend Songs for ${detectedEmotion}`
          )}
        </button>
      </div>
    </div>
  );
};

export default CameraPlaceholder;
