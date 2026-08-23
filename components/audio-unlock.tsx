"use client";

import { useEffect } from "react";
import { primeAudio } from "@/lib/voice/elevenlabs-client";

/**
 * Unlocks patient audio on the first real user gesture anywhere in the app,
 * so an encounter opened by any path (launch sheet, warmup, assignment, prep,
 * redo) can speak its opener the moment the screen mounts. primeAudio() is
 * idempotent, so listening for every gesture is just a cheap guard.
 */
export function AudioUnlock() {
  useEffect(() => {
    const unlock = () => primeAudio();
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, []);
  return null;
}
