/* ──────────────────────────────────────────────────────────────────
   3. src/components/Logistics/TrackOrderCard.jsx
   ────────────────────────────────────────────────────────────────── */
import React from "react";

const LABELS = {
  Received: "Order has been received",
  Processing: "Order processing",
  RiderOnWay: "Rider is on his way",
  InTransit: "Order in transit",
  Delivered: "Order delivered successfully",
};

export default function TrackOrderCard({ timeline }) {
  const steps = Array.isArray(timeline) ? timeline : [];
  const safeSteps = steps.filter(
    (s) => s && typeof s === "object" && typeof s.status === "string"
  );

  const firstNonDelivered = safeSteps.findIndex(
    (s) => s.status !== "Delivered"
  );
  const currentIdx =
    firstNonDelivered === -1
      ? Math.max(0, safeSteps.length - 1)
      : firstNonDelivered;

  const renderStatus = (step, idx) => {
    const label = LABELS[step?.status] || step?.status || "—";
    let state = "upcoming";
    if (idx < currentIdx) state = "complete";
    else if (idx === currentIdx) state = "current";

    const color =
      state === "upcoming"
        ? "bg-gray-300 border-gray-300"
        : "bg-green-500 border-green-500";

    return (
      <li key={idx} className="mb-8 ml-6 last:mb-0">
        <span
          className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 ${color}`}
        />
        <div className="flex flex-col">
          <span
            className={`font-semibold ${
              state === "upcoming" ? "text-gray-500" : "text-gray-800"
            }`}
          >
            {label}
          </span>
          <time className="text-sm text-gray-500 mt-1">
            {/* {new Date(step.time).toLocaleTimeString()} */}
            {step?.time ? new Date(step.time).toLocaleTimeString() : "—"}
          </time>
        </div>
      </li>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Order Tracking</h3>
      <ul className="relative border-l border-gray-200">
        {safeSteps.map(renderStatus)}
      </ul>
    </div>
  );
}
