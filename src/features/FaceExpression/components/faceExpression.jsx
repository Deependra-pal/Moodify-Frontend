import { useEffect, useRef, useState } from "react";
import FaceExpressionUI from "./FaceExpressionUI";
import { initFaceLandmarker, detectExpression } from "../utils/utils";

export default function FaceExpression() {
    const videoRef = useRef(null);
    const landmarkerRef = useRef(null);
    const animationRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);

    const [expression, setExpression] = useState("Click button or wait...");
    const [status, setStatus] = useState("Loading AI Model...");
    const [faceDetected, setFaceDetected] = useState(false);
    const [scores, setScores] = useState({
        smile: 0,
        jawOpen: 0,
        frown: 0,
        browUp: 0
    });

    const runDetection = () => {
        detectExpression({
            landmarkerRef,
            videoRef,
            lastVideoTimeRef,
            setScores,
            setExpression,
            setFaceDetected
        });
    };

    useEffect(() => {
        let isActive = true;

        const detect = () => {
            if (!isActive) return;
            runDetection();
            animationRef.current = requestAnimationFrame(detect);
        };

        initFaceLandmarker({
            landmarkerRef,
            videoRef,
            setStatus,
            setExpression,
            onReady: () => {
                if (isActive) {
                    detect();
                }
            }
        });

        return () => {
            isActive = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);

    const handleDetectClick = () => {
        runDetection();
    };

    return (
        <FaceExpressionUI
            status={status}
            videoRef={videoRef}
            faceDetected={faceDetected}
            expression={expression}
            scores={scores}
            onDetectClick={handleDetectClick}
        />
    );
}
