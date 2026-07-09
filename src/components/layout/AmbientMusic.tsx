"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";

const TRACK_URL = "/audio/ambient.mp3";
const TARGET_VOLUME = 0.22;
const FADE_MS = 2500;
const STORAGE_KEY = "ans-ambient-music";

/**
 * Soft looping background music with a floating toggle.
 *
 * The audio file is NOT fetched at page load — the <audio> element is created
 * lazily on first play, so it has zero impact on load performance. Browsers
 * block unmuted autoplay until the user interacts with the page, so we attempt
 * playback immediately and fall back to starting on the first tap/click/scroll,
 * unless the visitor previously switched music off (remembered in localStorage).
 */
export default function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const fadeTo = (target: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const start = audio.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min((t - t0) / FADE_MS, 1);
      audio.volume = start + (target - start) * k;
      if (k < 1) fadeRef.current = requestAnimationFrame(step);
      else if (target === 0) audio.pause();
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  const play = async (): Promise<boolean> => {
    if (!audioRef.current) {
      const audio = new Audio(TRACK_URL);
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
    }
    try {
      await audioRef.current.play();
      fadeTo(TARGET_VOLUME);
      setPlaying(true);
      return true;
    } catch {
      // Autoplay blocked by the browser — caller may retry on user gesture.
      return false;
    }
  };

  const stop = () => {
    fadeTo(0);
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) {
      stop();
      localStorage.setItem(STORAGE_KEY, "off");
    } else {
      play();
      localStorage.setItem(STORAGE_KEY, "on");
    }
  };

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "off") return;

    let disposed = false;
    const onFirstGesture = () => {
      if (!disposed && localStorage.getItem(STORAGE_KEY) !== "off") play();
    };

    // Try right away (succeeds when the browser already trusts this site),
    // otherwise wait for the first interaction anywhere on the page.
    play().then((ok) => {
      if (ok || disposed) return;
      window.addEventListener("pointerdown", onFirstGesture, { once: true });
      window.addEventListener("keydown", onFirstGesture, { once: true });
    });

    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-24 left-5 lg:bottom-8 lg:left-8 z-50 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg"
      style={{
        background: playing
          ? "linear-gradient(135deg, #B76E79, #C9A96E)"
          : "rgba(28,28,28,0.55)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 3.2, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label={playing ? "Turn off background music" : "Turn on background music"}
      title={
        playing
          ? "Music on — click to mute · “Dreamy Flashback” by Kevin MacLeod (incompetech.com), CC BY 4.0"
          : "Play calming background music"
      }
    >
      {playing ? (
        <span className="relative flex items-center justify-center">
          <Music size={17} />
          <span
            className="absolute -inset-2 rounded-full animate-ping opacity-20"
            style={{ background: "#B76E79" }}
          />
        </span>
      ) : (
        <VolumeX size={17} />
      )}
    </motion.button>
  );
}
