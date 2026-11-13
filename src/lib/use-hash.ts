"use client";
import { useSyncExternalStore } from "react";

const subscribe = (listener: () => void) => {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
};
export const useHashToken = () => useSyncExternalStore(subscribe,
  () => new URLSearchParams(window.location.hash.slice(1)).get("token") || "",
  () => "");
export const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);
