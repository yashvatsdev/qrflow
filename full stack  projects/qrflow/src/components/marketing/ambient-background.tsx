"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const modules = [
  [96, 120],
  [128, 152],
  [160, 120],
  [288, 344],
  [320, 376],
  [352, 344],
  [736, 88],
  [768, 120],
  [800, 88],
  [1056, 472],
  [1088, 504],
  [1120, 472],
  [480, 632],
  [512, 664],
  [544, 632],
];

export function AmbientBackground() {
  const surface = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const update = () => {
      if (surface.current)
        surface.current.dataset.hidden = String(document.hidden);
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <>
      <div
        ref={surface}
        className="lp-ambient"
        data-paused={paused}
        aria-hidden="true"
      >
        <div className="lp-ambient-glow lp-ambient-glow-blue" />
        <div className="lp-ambient-glow lp-ambient-glow-cyan" />
        <svg
          className="lp-ambient-grid"
          viewBox="0 0 1280 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <pattern
              id="lp-ambient-grid-pattern"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M32 0H0V32"
                stroke="#3b82f6"
                strokeOpacity=".13"
                strokeWidth=".6"
              />
            </pattern>
          </defs>
          <rect
            width="1280"
            height="800"
            fill="url(#lp-ambient-grid-pattern)"
          />
          <g className="lp-ambient-modules">
            {modules.map(([x, y], i) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="11"
                height="11"
                rx="1"
                fill={i % 3 === 0 ? "#06b6d4" : "#3b82f6"}
                opacity={i % 3 === 0 ? ".25" : ".12"}
              />
            ))}
          </g>
          <g stroke="#06b6d4" strokeWidth="1" strokeLinecap="round">
            <path
              className="lp-ambient-signal"
              d="M0 248H384V408H768V312H1280"
            />
            <path
              className="lp-ambient-signal lp-ambient-signal-two"
              d="M160 0V184H608V568H1024V800"
            />
            <path
              className="lp-ambient-signal lp-ambient-signal-three"
              d="M1280 664H896V504H448V600H0"
            />
          </g>
          <g stroke="#3b82f6" strokeWidth="1.5" opacity=".18">
            <path d="M84 184V152h32M180 152h32v32M212 248v32h-32M116 280H84v-32" />
            <path d="M1036 344v-24h24M1108 320h24v24M1132 392v24h-24M1060 416h-24v-24" />
          </g>
        </svg>
      </div>
      <button
        className="lp-motion-toggle"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={
          paused ? "Resume background animation" : "Pause background animation"
        }
        title={
          paused ? "Resume background animation" : "Pause background animation"
        }
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
        <span>{paused ? "Resume motion" : "Pause motion"}</span>
      </button>
    </>
  );
}
