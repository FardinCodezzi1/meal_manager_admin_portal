"use client";

import React from "react";
import { cn } from "@/lib/cn.util";

interface ScenicDriveCardProps {
  destinations?: string[];
  className?: string;
}

export function ScenicDriveCard({ destinations, className }: ScenicDriveCardProps) {
  // Use user-provided tour destinations or default to Location 1, 2, 3, 4
  const locList =
    destinations && destinations.length > 0
      ? destinations
      : ["Location 1", "Location 2", "Location 3", "Location 4"];

  const loc1 = locList[0] || "Location 1";
  const loc2 = locList[1 % locList.length] || "Location 2";

  return (
    <div
      className={cn(
        "relative w-full h-[120px] sm:h-[126px] rounded-sm border border-border bg-card overflow-hidden select-none transition-colors",
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        viewBox="0 0 1200 120"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Headlight beam gradient (projects forward to the right) */}
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#fef08a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          {/* Sun Glow */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Moon Glow */}
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </radialGradient>

          {/* Streetlamp pool of light */}
          <radialGradient id="lampCone" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>

          <style>
            {`
              /* ================= FORWARD MOTION (EVERYTHING MOVES TO THE LEFT) ================= */
              @keyframes roadDashScroll {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: 40px; }
              }
              @keyframes skylinePan {
                from { transform: translateX(0); }
                to { transform: translateX(-1200px); }
              }
              @keyframes midgroundPan {
                from { transform: translateX(0); }
                to { transform: translateX(-2000px); }
              }
              @keyframes wheelRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes carBob {
                0% { transform: translateY(0px) rotate(0deg); }
                40% { transform: translateY(-0.9px) rotate(-0.25deg); }
                75% { transform: translateY(0.6px) rotate(0.15deg); }
                100% { transform: translateY(0px) rotate(0deg); }
              }
              @keyframes exhaustPuff {
                0% { transform: translate(0, 0) scale(0.6); opacity: 0.7; }
                100% { transform: translate(-28px, -4px) scale(1.6); opacity: 0; }
              }
              @keyframes cloudDrift {
                from { transform: translateX(0); }
                to { transform: translateX(-1200px); }
              }

              /* ================= DYNAMIC 24H WEATHER / DAY-NIGHT CYCLE (36s loop) ================= */
              @keyframes skyDayNight {
                0%, 32% { opacity: 0; }       /* Daytime */
                40%, 48% { opacity: 0.55; }   /* Sunset / Dusk */
                52%, 82% { opacity: 1; }       /* Midnight Starry Night */
                88%, 96% { opacity: 0.4; }     /* Sunrise / Dawn */
                100% { opacity: 0; }          /* Back to Day */
              }
              @keyframes sunCycle {
                0% { transform: translate(960px, 22px); opacity: 1; }
                30% { transform: translate(1020px, 28px); opacity: 1; }
                44% { transform: translate(1080px, 75px); opacity: 0.3; }
                48%, 90% { transform: translate(1100px, 130px); opacity: 0; }
                94% { transform: translate(880px, 60px); opacity: 0.5; }
                100% { transform: translate(960px, 22px); opacity: 1; }
              }
              @keyframes moonCycle {
                0%, 38% { transform: translate(1040px, 120px); opacity: 0; }
                46% { transform: translate(1050px, 55px); opacity: 0.4; }
                54%, 82% { transform: translate(1040px, 22px); opacity: 1; }
                90% { transform: translate(1030px, 80px); opacity: 0.3; }
                96%, 100% { transform: translate(1030px, 120px); opacity: 0; }
              }
              @keyframes nightLights {
                0%, 36% { opacity: 0.05; }
                44%, 84% { opacity: 1; }
                92%, 100% { opacity: 0.05; }
              }
              @keyframes starsVisibility {
                0%, 40% { opacity: 0; }
                50%, 82% { opacity: 1; }
                92%, 100% { opacity: 0; }
              }
              @keyframes starTwinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
              }

              .anim-sky-night { animation: skyDayNight 36s ease-in-out infinite; }
              .anim-sun { animation: sunCycle 36s ease-in-out infinite; }
              .anim-moon { animation: moonCycle 36s ease-in-out infinite; }
              .anim-night-lights { animation: nightLights 36s ease-in-out infinite; }
              .anim-stars-layer { animation: starsVisibility 36s ease-in-out infinite; }
              .anim-road-dash { animation: roadDashScroll 0.65s linear infinite; }
              .anim-skyline { animation: skylinePan 28s linear infinite; }
              .anim-midground { animation: midgroundPan 15s linear infinite; }
              .anim-wheel {
                animation: wheelRotate 0.35s linear infinite;
                transform-origin: center;
                transform-box: fill-box;
              }
              .anim-car-chassis { animation: carBob 0.32s ease-in-out infinite; }
              .anim-smoke-1 { animation: exhaustPuff 0.7s ease-out infinite; }
              .anim-smoke-2 { animation: exhaustPuff 0.7s ease-out infinite 0.35s; }
              .anim-clouds { animation: cloudDrift 45s linear infinite; }
              .anim-star-1 { animation: starTwinkle 2s ease-in-out infinite; }
              .anim-star-2 { animation: starTwinkle 2.8s ease-in-out infinite 0.7s; }
              .anim-star-3 { animation: starTwinkle 1.8s ease-in-out infinite 1.2s; }
            `}
          </style>
        </defs>

        {/* 1. SKY LAYERS */}
        {/* Layer A: Day sky */}
        <rect x="0" y="0" width="1200" height="96" className="fill-sky-200 dark:fill-sky-950/60 transition-colors" />

        {/* Layer B: Night & Sunset sky overlay */}
        <rect x="0" y="0" width="1200" height="96" fill="#090d16" className="anim-sky-night" />

        {/* The Golden Sun */}
        <g className="anim-sun">
          <circle cx="0" cy="0" r="14" fill="url(#sunGlow)" />
          <circle cx="0" cy="0" r="7" fill="#facc15" />
        </g>

        {/* The Night Moon */}
        <g className="anim-moon">
          <circle cx="0" cy="0" r="13" fill="url(#moonGlow)" />
          <circle cx="0" cy="0" r="6.5" fill="#e2e8f0" />
          <circle cx="-1.5" cy="-1.5" r="1.3" fill="#cbd5e1" />
          <circle cx="2" cy="1.3" r="1.1" fill="#cbd5e1" />
        </g>

        {/* Stars Field */}
        <g className="anim-stars-layer fill-white">
          <circle cx="80" cy="15" r="1" className="anim-star-1" />
          <circle cx="180" cy="24" r="0.9" className="anim-star-2" />
          <circle cx="310" cy="14" r="1.1" className="anim-star-3" />
          <circle cx="450" cy="22" r="0.9" className="anim-star-1" />
          <circle cx="590" cy="16" r="1.2" className="anim-star-2" />
          <circle cx="720" cy="25" r="0.8" className="anim-star-3" />
          <circle cx="850" cy="18" r="1" className="anim-star-1" />
          <circle cx="1010" cy="22" r="1.1" className="anim-star-2" />
          <circle cx="1140" cy="14" r="0.9" className="anim-star-3" />
        </g>

        {/* Clouds */}
        <g className="anim-clouds fill-white/60 dark:fill-white/10">
          <path d="M140,24 Q154,16 168,24 Q180,18 192,24 Q202,30 192,34 L150,34 Q136,31 140,24 Z" />
          <path d="M480,20 Q492,14 506,20 Q516,16 528,20 Q536,25 528,28 L488,28 Q476,25 480,20 Z" />
          <path d="M820,26 Q834,18 848,26 Q860,20 872,26 Q882,32 872,36 L830,36 Q816,33 820,26 Z" />
          <path d="M1340,24 Q1354,16 1368,24 Q1380,18 1392,24 Q1402,30 1392,34 L1350,34 Q1336,31 1340,24 Z" />
          <path d="M1680,20 Q1692,14 1706,20 Q1716,16 1728,20 Q1736,25 1728,28 L1688,28 Q1676,25 1680,20 Z" />
        </g>

        {/* 2. PARALLAX SKYLINE (Distant background) */}
        <g className="anim-skyline fill-muted/50 dark:fill-muted/20 transition-colors">
          <g>
            <rect x="40" y="52" width="35" height="44" rx="1" />
            <rect x="80" y="38" width="42" height="58" rx="1" />
            <rect x="130" y="58" width="30" height="38" rx="1" />
            <rect x="165" y="46" width="44" height="50" rx="1" />

            <rect x="250" y="54" width="36" height="42" rx="1" />
            <rect x="290" y="34" width="48" height="62" rx="1" />
            <polygon points="314,22 315,34 313,34" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
            <rect x="345" y="48" width="32" height="48" rx="1" />

            <rect x="440" y="42" width="40" height="54" rx="1" />
            <rect x="490" y="30" width="46" height="66" rx="1" />
            <rect x="545" y="56" width="34" height="40" rx="1" />

            <rect x="650" y="40" width="42" height="56" rx="1" />
            <rect x="700" y="52" width="48" height="44" rx="1" />
            <rect x="760" y="32" width="44" height="64" rx="1" />

            <rect x="870" y="48" width="36" height="48" rx="1" />
            <rect x="915" y="36" width="48" height="60" rx="1" />
            <rect x="970" y="54" width="32" height="42" rx="1" />

            <rect x="1060" y="44" width="38" height="52" rx="1" />
            <rect x="1110" y="34" width="44" height="62" rx="1" />
          </g>

          {/* Loop Segment 2 */}
          <g transform="translate(1200, 0)">
            <rect x="40" y="52" width="35" height="44" rx="1" />
            <rect x="80" y="38" width="42" height="58" rx="1" />
            <rect x="130" y="58" width="30" height="38" rx="1" />
            <rect x="165" y="46" width="44" height="50" rx="1" />

            <rect x="250" y="54" width="36" height="42" rx="1" />
            <rect x="290" y="34" width="48" height="62" rx="1" />
            <polygon points="314,22 315,34 313,34" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
            <rect x="345" y="48" width="32" height="48" rx="1" />

            <rect x="440" y="42" width="40" height="54" rx="1" />
            <rect x="490" y="30" width="46" height="66" rx="1" />
            <rect x="545" y="56" width="34" height="40" rx="1" />

            <rect x="650" y="40" width="42" height="56" rx="1" />
            <rect x="700" y="52" width="48" height="44" rx="1" />
            <rect x="760" y="32" width="44" height="64" rx="1" />

            <rect x="870" y="48" width="36" height="48" rx="1" />
            <rect x="915" y="36" width="48" height="60" rx="1" />
            <rect x="970" y="54" width="32" height="42" rx="1" />

            <rect x="1060" y="44" width="38" height="52" rx="1" />
            <rect x="1110" y="34" width="44" height="62" rx="1" />
          </g>
        </g>

        {/* 3. PARALLAX MIDGROUND (2000px loop with only 2 signboards spaced far apart!) */}
        <g className="anim-midground">
          {/* Segment A (0 to 2000) */}
          <g>
            {/* Tree 1 */}
            <g transform="translate(80, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-24 -8,-12 -3,-12 -9,-5 9,-5 3,-12 8,-12" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            {/* Street Lamp 1 */}
            <g transform="translate(220, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>

            {/* Tree 2: Oak */}
            <g transform="translate(340, 96)">
              <rect x="-1.5" y="-9" width="3" height="9" className="fill-amber-800/80" />
              <circle cx="0" cy="-18" r="10" className="fill-emerald-600 dark:fill-emerald-700" />
              <circle cx="-5" cy="-21" r="7" className="fill-emerald-500 dark:fill-emerald-600" />
            </g>

            {/* HIGHWAY DESTINATION SIGNBOARD 1 (Appears periodically) */}
            <g transform="translate(480, 96)">
              <line x1="-25" y1="0" x2="-25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <line x1="25" y1="0" x2="25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <rect
                x="-38"
                y="-32"
                width="76"
                height="18"
                rx="2"
                className="fill-emerald-800 dark:fill-emerald-950 stroke-emerald-400 dark:stroke-emerald-500"
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="-19.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
              >
                📍 {loc1.length > 13 ? loc1.slice(0, 12) + "…" : loc1}
              </text>
            </g>

            {/* Long open road stretch: trees & lamps */}
            <g transform="translate(680, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-22 -7,-11 -2,-11 -8,-4 8,-4 2,-11 7,-11" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(850, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>

            <g transform="translate(1050, 96)">
              <rect x="-1.5" y="-9" width="3" height="9" className="fill-amber-800/80" />
              <circle cx="0" cy="-17" r="9" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(1220, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-24 -8,-12 -3,-12 -9,-5 9,-5 3,-12 8,-12" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(1360, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>

            {/* HIGHWAY DESTINATION SIGNBOARD 2 (Spaced far apart from Signboard 1) */}
            <g transform="translate(1520, 96)">
              <line x1="-25" y1="0" x2="-25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <line x1="25" y1="0" x2="25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <rect
                x="-38"
                y="-32"
                width="76"
                height="18"
                rx="2"
                className="fill-sky-800 dark:fill-sky-950 stroke-sky-400 dark:stroke-sky-500"
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="-19.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
              >
                📍 {loc2.length > 13 ? loc2.slice(0, 12) + "…" : loc2}
              </text>
            </g>

            <g transform="translate(1720, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-22 -7,-11 -2,-11 -8,-4 8,-4 2,-11 7,-11" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(1880, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>
          </g>

          {/* Segment B (2000 to 4000 for seamless infinite wrap) */}
          <g transform="translate(2000, 0)">
            <g transform="translate(80, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-24 -8,-12 -3,-12 -9,-5 9,-5 3,-12 8,-12" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(220, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>

            <g transform="translate(340, 96)">
              <rect x="-1.5" y="-9" width="3" height="9" className="fill-amber-800/80" />
              <circle cx="0" cy="-18" r="10" className="fill-emerald-600 dark:fill-emerald-700" />
              <circle cx="-5" cy="-21" r="7" className="fill-emerald-500 dark:fill-emerald-600" />
            </g>

            <g transform="translate(480, 96)">
              <line x1="-25" y1="0" x2="-25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <line x1="25" y1="0" x2="25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <rect
                x="-38"
                y="-32"
                width="76"
                height="18"
                rx="2"
                className="fill-emerald-800 dark:fill-emerald-950 stroke-emerald-400 dark:stroke-emerald-500"
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="-19.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
              >
                📍 {loc1.length > 13 ? loc1.slice(0, 12) + "…" : loc1}
              </text>
            </g>

            <g transform="translate(680, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-22 -7,-11 -2,-11 -8,-4 8,-4 2,-11 7,-11" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(850, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>

            <g transform="translate(1050, 96)">
              <rect x="-1.5" y="-9" width="3" height="9" className="fill-amber-800/80" />
              <circle cx="0" cy="-17" r="9" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(1220, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-24 -8,-12 -3,-12 -9,-5 9,-5 3,-12 8,-12" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(1360, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>

            <g transform="translate(1520, 96)">
              <line x1="-25" y1="0" x2="-25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <line x1="25" y1="0" x2="25" y2="-28" stroke="#94a3b8" strokeWidth="1.6" />
              <rect
                x="-38"
                y="-32"
                width="76"
                height="18"
                rx="2"
                className="fill-sky-800 dark:fill-sky-950 stroke-sky-400 dark:stroke-sky-500"
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="-19.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
              >
                📍 {loc2.length > 13 ? loc2.slice(0, 12) + "…" : loc2}
              </text>
            </g>

            <g transform="translate(1720, 96)">
              <rect x="-1" y="-8" width="2" height="8" className="fill-amber-800/80" />
              <polygon points="0,-22 -7,-11 -2,-11 -8,-4 8,-4 2,-11 7,-11" className="fill-emerald-600 dark:fill-emerald-700" />
            </g>

            <g transform="translate(1880, 96)">
              <line x1="0" y1="0" x2="0" y2="-34" stroke="currentColor" strokeWidth="2" className="text-border" />
              <path d="M0,-34 Q5,-38 10,-34 L12,-30" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-border" />
              <polygon points="9,-30 16,-30 14,-28 10,-28" className="fill-amber-400" />
              <polygon points="12,-28 0,0 24,0" fill="url(#lampCone)" className="anim-night-lights" />
            </g>
          </g>
        </g>

        {/* 4. THE ROAD / ASPHALT GROUND */}
        <g>
          <rect x="0" y="96" width="1200" height="24" className="fill-slate-800 dark:fill-zinc-950 transition-colors" />
          <line x1="0" y1="96" x2="1200" y2="96" stroke="currentColor" strokeWidth="1.5" className="text-border" />

          {/* Road center dash line (SCROLLS TO THE LEFT) */}
          <line
            x1="0"
            y1="108"
            x2="1200"
            y2="108"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="24 16"
            className="anim-road-dash opacity-90"
          />
        </g>

        {/* 5. THE HERO CAR (FACING FORWARD TO THE RIGHT) */}
        <g transform="translate(160, 2)">
          {/* Headlight beam (projects forward to the right from front hood) */}
          <polygon
            points="138,81 310,66 330,102 138,88"
            fill="url(#beamGrad)"
            className="anim-night-lights"
          />

          {/* Exhaust smoke particles emitting from rear bumper (on the left) */}
          <circle cx="8" cy="88" r="2.2" className="anim-smoke-1 fill-slate-400/50" />
          <circle cx="11" cy="88" r="1.8" className="anim-smoke-2 fill-slate-400/50" />

          {/* Car chassis with vibration bobbing */}
          <g className="anim-car-chassis">
            {/* Main car body shell (Properly proportioned sports cruiser facing RIGHT) */}
            <path
              d="M16,92 L14,79 Q14,77 19,77 L42,77 L56,64 L90,64 Q98,64 103,71 L112,77 L138,79 Q142,80 142,86 L140,92 Z"
              className="fill-primary"
            />

            {/* Cabin Glass / Windows */}
            <path
              d="M58,66 L88,66 Q94,66 99,72 L106,76 L46,76 Z"
              className="fill-slate-900/90 dark:fill-slate-950"
            />
            {/* Front windshield tint (slanted forward to the right) */}
            <polygon points="74,67 88,67 104,75 74,75" className="fill-sky-300/40" />
            {/* Rear window tint (on the left) */}
            <polygon points="59,67 71,67 71,75 48,75" className="fill-sky-300/30" />

            {/* Rear Tail Light (Red Glow on the left back) */}
            <rect x="13" y="78" width="3.5" height="4.5" rx="1" fill="#f43f5e" />

            {/* Front Headlight (Amber Glow on the right front tip) */}
            <polygon points="138,80 142,81 141,86 137,85" fill="#facc15" />

            {/* Wheel Wells cutouts */}
            <path d="M26,94 A10,10 0 0,1 46,94 Z" className="fill-slate-800 dark:fill-zinc-950" />
            <path d="M106,94 A10,10 0 0,1 126,94 Z" className="fill-slate-800 dark:fill-zinc-950" />
          </g>

          {/* Rear Wheel (On the left, rolling clockwise) */}
          <g transform="translate(36, 94)">
            <circle cx="0" cy="0" r="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="4.5" fill="#71717a" />
            <g className="anim-wheel">
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#f4f4f5" strokeWidth="1.2" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#f4f4f5" strokeWidth="1.2" />
            </g>
            <circle cx="0" cy="0" r="1.4" className="fill-primary" />
          </g>

          {/* Front Wheel (On the right, rolling clockwise) */}
          <g transform="translate(116, 94)">
            <circle cx="0" cy="0" r="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="4.5" fill="#71717a" />
            <g className="anim-wheel">
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#f4f4f5" strokeWidth="1.2" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#f4f4f5" strokeWidth="1.2" />
            </g>
            <circle cx="0" cy="0" r="1.4" className="fill-primary" />
          </g>
        </g>
      </svg>
    </div>
  );
}
