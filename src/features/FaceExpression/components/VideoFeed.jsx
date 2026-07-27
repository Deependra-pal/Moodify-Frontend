import React from "react";

export default function VideoFeed({ videoRef, faceDetected }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-slate-700">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />

      {/* Live Overlay Badge */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 text-white">
        <span
          className={`w-2 h-2 rounded-full ${
            faceDetected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}
        ></span>
        {faceDetected ? "Face Tracked" : "Searching Face..."}
      </div>
    </div>
  );
}
