"use client";

import { useSyncExternalStore } from "react";

// One shared clock keeps every visible order age in sync without creating a
// timer per card.
const TICK_MS = 30_000;
let current = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      for (const notify of listeners) notify();
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => 0;

export const useNow = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
