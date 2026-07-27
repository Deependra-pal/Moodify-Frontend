import React from "react";
import VideoFeed from "./VideoFeed";
import ExpressionCard from "./ExpressionCard";
import ScoreMeters from "./ScoreMeters";

export default function FaceExpressionUI({
  status,
  videoRef,
  faceDetected,
  expression,
  scores
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-lg mx-auto bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <h1 className="text-2xl font-bold mb-2 text-indigo-400">
        Face Expression Detector
      </h1>
      <p className="text-sm text-slate-400 mb-4">{status}</p>

      <VideoFeed videoRef={videoRef} faceDetected={faceDetected} />
      <ExpressionCard expression={expression} />
      <ScoreMeters scores={scores} />
    </div>
  );
}
