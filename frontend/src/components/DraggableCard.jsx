// src/components/DraggableCard.jsx
import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

export default function DraggableCard({ id='card', children, className='' }) {
  const key = `nexora-card-pos-${id}`;
  const [pos, setPos] = useState({x:0,y:0});

  useEffect(()=> {
    try {
      const s = localStorage.getItem(key);
      if (s) setPos(JSON.parse(s));
    } catch {}
  }, []);

  function onStop(_, data) {
    const p = { x: data.x, y: data.y };
    setPos(p);
    try { localStorage.setItem(key, JSON.stringify(p)); } catch {}
  }

  return (
    <Draggable defaultPosition={pos} onStop={onStop}>
      <div className={`draggable-card ${className}`}>{children}</div>
    </Draggable>
  );
}

