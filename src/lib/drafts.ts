import { useSyncExternalStore } from "react";
import type { Draft } from "./schema";

const KEY = "email-campaign-studio:drafts";
const EMPTY: Draft[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedDrafts: Draft[] = EMPTY;

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Draft[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedDrafts = raw ? (JSON.parse(raw) as Draft[]) : EMPTY;
    } catch {
      cachedDrafts = EMPTY;
    }
  }
  return cachedDrafts;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useDrafts(): Draft[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** Trả về false nếu không ghi được (đầy bộ nhớ, chế độ riêng tư...). */
export function saveDrafts(drafts: Draft[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}
