import React from "react";

export default function BlinkDot({ active = false }) {
  return (
    <span className={`blink-dot ${active ? "on" : ""}`} aria-hidden="true" />
  );
}
