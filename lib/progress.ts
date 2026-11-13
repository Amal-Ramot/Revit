"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "revit-academy-progress-v1";
const EVT = "revit-progress";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useProgress() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    setDone(read());
    const on = () => setDone(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  const toggle = useCallback((slug: string, value?: boolean) => {
    const cur = read();
    const has = cur.includes(slug);
    const want = value ?? !has;
    const next = want ? (has ? cur : [...cur, slug]) : cur.filter((s) => s !== slug);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(EVT));
  }, []);
  return { done, toggle };
}
