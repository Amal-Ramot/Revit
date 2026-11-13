"use client";

import { useMemo, useState } from "react";
import { allShortcuts } from "@/lib/lessons";

const groups = ["הכל", ...Array.from(new Set(allShortcuts.map((s) => s.group)))];

export default function ShortcutsBoard() {
  const [q, setQ] = useState("");
  const [g, setG] = useState("הכל");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return allShortcuts.filter(
      (s) => (g === "הכל" || s.group === g) && (!t || s.key.toLowerCase().includes(t) || s.action.includes(t)),
    );
  }, [q, g]);
  return (
    <>
      <input className="search" placeholder="חיפוש: קיר, WA, הזזה…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="filters">
        {groups.map((x) => (
          <button key={x} className={g === x ? "on" : ""} onClick={() => setG(x)}>
            {x}
          </button>
        ))}
      </div>
      <div className="big-sc">
        {list.map((s) => (
          <div key={s.key} className="item">
            <span className="kbd">{s.key}</span>
            <span>
              {s.action}
              <small>{s.group}</small>
            </span>
          </div>
        ))}
        {list.length === 0 && <p style={{ color: "var(--muted)" }}>לא נמצאו קיצורים.</p>}
      </div>
    </>
  );
}
