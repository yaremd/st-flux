"use client";

import { useEffect, useRef, useState } from "react";

const PLAYBACK_RATE = 0.6;   // 60% speed — noticeably slower
const FADE_BEFORE_END = 2.0; // seconds from end to start crossfade

const videoStyle = (opacity: number): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  pointerEvents: "none",
  filter: "blur(12px)",
  transform: "scale(1.08)",
  opacity,
  transition: `opacity ${FADE_BEFORE_END}s ease-in-out`,
  willChange: "opacity",
});

export default function BgVideo() {
  const ref1 = useRef<HTMLVideoElement>(null);
  const ref2 = useRef<HTMLVideoElement>(null);
  const [primary, setPrimary] = useState<1 | 2>(1);
  const crossfading = useRef(false);

  // Set playback rates once videos are ready
  useEffect(() => {
    [ref1, ref2].forEach(r => {
      if (r.current) r.current.playbackRate = PLAYBACK_RATE;
    });
  }, []);

  useEffect(() => {
    const active  = primary === 1 ? ref1.current : ref2.current;
    const standby = primary === 1 ? ref2.current : ref1.current;
    if (!active || !standby) return;

    const onTimeUpdate = () => {
      if (!active.duration || crossfading.current) return;
      const timeLeft = active.duration - active.currentTime;

      if (timeLeft <= FADE_BEFORE_END) {
        crossfading.current = true;

        // Start standby from beginning
        standby.currentTime = 0;
        standby.playbackRate = PLAYBACK_RATE;
        standby.play();

        // Swap which video is "primary" — CSS transition handles the fade
        setPrimary(p => (p === 1 ? 2 : 1));

        // Reset the old active video after crossfade finishes
        const resetDelay = (FADE_BEFORE_END + 0.5) * 1000;
        setTimeout(() => {
          active.pause();
          active.currentTime = 0;
          crossfading.current = false;
        }, resetDelay);
      }
    };

    active.addEventListener("timeupdate", onTimeUpdate);
    return () => active.removeEventListener("timeupdate", onTimeUpdate);
  }, [primary]);

  return (
    <>
      <video
        ref={ref1}
        autoPlay
        muted
        playsInline
        preload="auto"
        style={videoStyle(primary === 1 ? 0.65 : 0)}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      <video
        ref={ref2}
        muted
        playsInline
        preload="auto"
        style={videoStyle(primary === 2 ? 0.65 : 0)}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
