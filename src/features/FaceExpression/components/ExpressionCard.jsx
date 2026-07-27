import React from "react";

export default function ExpressionCard({ expression }) {
  return (
    <div className="w-full my-5 p-4 bg-slate-800/80 rounded-xl text-center border border-slate-700">
      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
        Detected Expression
      </span>
      <span className="text-3xl font-extrabold text-indigo-300">
        {expression}
      </span>
    </div>
  );
}
