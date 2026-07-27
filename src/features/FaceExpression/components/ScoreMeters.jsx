import React from "react";

export default function ScoreMeters({ scores }) {
  const items = [
    { label: "Smile", value: scores.smile },
    { label: "Surprise / Jaw", value: scores.jawOpen },
    { label: "Frown", value: scores.frown },
    { label: "Brow Raised", value: scores.browUp },
    { label: "Angry / Brow Down", value: scores.angry || 0 }
  ];

  return (
    <div className="w-full grid grid-cols-2 gap-3 text-xs">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50"
        >
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">{item.label}</span>
            <span className="font-mono text-indigo-400">{item.value}%</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-100"
              style={{ width: `${item.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
