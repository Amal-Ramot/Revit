import type { Diagram } from "@/lib/lessons";

function UiMock() {
  return (
    <div className="ui-mock" style={{ position: "relative" }}>
      <span className="callout" style={{ top: 2, left: 6 }}>Quick Access</span>
      <div className="ui-tabs" style={{ paddingTop: 20 }}>
        {["File", "Architecture", "Structure", "Insert", "Annotate", "View", "Manage"].map((t, i) => (
          <span key={t} className={i === 1 ? "on" : ""}>{t}</span>
        ))}
      </div>
      <div className="ui-ribbon" style={{ position: "relative" }}>
        <span className="callout" style={{ top: -8, left: "45%" }}>Ribbon</span>
        {["Wall", "Door", "Window", "Comp.", "Roof", "Floor", "Stair", "Room"].map((t) => (
          <i key={t}>▦<br />{t}</i>
        ))}
      </div>
      <div className="ui-body">
        <div className="ui-side" style={{ position: "relative" }}>
          <span className="callout" style={{ bottom: 6, left: 6 }}>Properties</span>
          <b>Properties</b>
          <div style={{ background: "#1d2f52" }}>Basic Wall ▾</div>
          <div>Base: Level 1</div>
          <div>Top: Level 2</div>
          <div>Height: 3200</div>
        </div>
        <div className="ui-canvas">
          <span className="callout" style={{ bottom: 8, left: 8 }}>Drawing Area</span>
          <div className="plan" />
          <div className="cube">FRONT</div>
          <span className="callout" style={{ top: 46, right: 4 }}>ViewCube</span>
        </div>
        <div className="ui-side" style={{ position: "relative" }}>
          <span className="callout" style={{ bottom: 6, right: 6 }}>Project Browser</span>
          <b>Project Browser</b>
          <div>▾ Views</div>
          <div>&nbsp; ▾ Floor Plans</div>
          <div style={{ color: "#38bdf8" }}>&nbsp;&nbsp;&nbsp; Level 1</div>
          <div>&nbsp;&nbsp;&nbsp; Level 2</div>
          <div>&nbsp; ▸ Elevations</div>
          <div>&nbsp; ▸ 3D Views</div>
          <div>▸ Schedules</div>
          <div>▸ Sheets</div>
        </div>
      </div>
      <div className="ui-status" style={{ position: "relative" }}>
        <span>1 : 100</span><span>▣ ◐ ☀</span><span>Visual Style: Shaded</span>
        <span className="callout" style={{ top: -9, left: 120 }}>View Control Bar</span>
      </div>
    </div>
  );
}

function Levels() {
  const lv = [
    { y: 18, name: "Roof", el: "+6.40" },
    { y: 50, name: "Level 2", el: "+3.20" },
    { y: 82, name: "Level 1", el: "±0.00" },
  ];
  return (
    <svg viewBox="0 0 400 200" style={{ display: "block", width: "100%", background: "#0b1427" }}>
      <rect x="110" y="36" width="160" height="128" fill="#1d2f52" stroke="#334f80" />
      <rect x="110" y="36" width="110" height="64" fill="#263b63" stroke="#334f80" />
      {lv.map((l) => (
        <g key={l.name}>
          <line x1="40" x2="330" y1={(l.y / 100) * 200} y2={(l.y / 100) * 200} stroke="#a78bfa" strokeDasharray="8 4" strokeWidth="1.5" />
          <path d={`M330 ${(l.y / 100) * 200} l10 -8 l10 8 l-10 8 z`} fill="#a78bfa" />
          <text x="356" y={(l.y / 100) * 200 - 4} fill="#e2e8f0" fontSize="11" fontFamily="monospace">{l.name}</text>
          <text x="356" y={(l.y / 100) * 200 + 10} fill="#a78bfa" fontSize="10" fontFamily="monospace">{l.el}</text>
        </g>
      ))}
      {[110, 220, 270].map((x, i) => (
        <g key={x}>
          <line x1={x} x2={x} y1="20" y2="180" stroke="#f472b6" strokeDasharray="10 3 2 3" strokeWidth="1" />
          <circle cx={x} cy="12" r="9" fill="#0b1427" stroke="#f472b6" />
          <text x={x} y="16" textAnchor="middle" fill="#f472b6" fontSize="10" fontFamily="monospace">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

function WallLayers() {
  const layers = [
    { n: "Brick 100", w: 22, c: "#c4733f" },
    { n: "Air 20", w: 5, c: "#1e293b" },
    { n: "Insulation 50", w: 11, c: "#fde68a" },
    { n: "Block 200 · Core", w: 40, c: "#94a3b8" },
    { n: "Plaster 15", w: 6, c: "#f1f5f9" },
  ];
  return (
    <div>
      <div className="layers">
        {layers.map((l) => (
          <div key={l.n} style={{ flex: l.w, background: l.c, color: l.c === "#1e293b" ? "#94a3b8" : undefined }}>{l.n}</div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 18px 14px", color: "#94a3b8" }}>
        <span>◀ EXTERIOR</span><span className="mono">Total 385 mm</span><span>INTERIOR ▶</span>
      </div>
    </div>
  );
}

function Family() {
  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
      {[
        { t: "Category", h: "Furniture", c: "#64748b" },
        { t: "Family", h: "Table-Dining.rfa", c: "#ec4899" },
        { t: "Type", h: "1800 × 900", c: "#a78bfa" },
      ].map((b, i) => (
        <div key={b.t} style={{ padding: 12, borderRadius: 10, border: `1px solid ${b.c}`, background: "#111c33", position: "relative" }}>
          <div style={{ color: b.c, fontWeight: 800 }}>{b.t}</div>
          <div style={{ color: "#e2e8f0" }}>{b.h}</div>
          {i < 2 && <span style={{ position: "absolute", right: -12, top: "40%", color: "#475569" }}>▶</span>}
        </div>
      ))}
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
        {["Instance #1 · Living", "Instance #2 · Terrace", "Instance #3 · Kitchen"].map((x) => (
          <span key={x} style={{ padding: "6px 10px", borderRadius: 8, background: "#1d2f52", color: "#cbd5e1" }}>{x}</span>
        ))}
      </div>
    </div>
  );
}

function Schedule() {
  const rows = [
    ["W1", "Fixed 2400", 4, "2400", "1500", "900"],
    ["W2", "Casement 1600", 3, "1600", "1300", "1000"],
    ["W3", "Casement 1500", 1, "1500", "1500", "900"],
    ["S1", "Slider 3000", 2, "3000", "2600", "0"],
    ["S2", "Slider 3600", 1, "3600", "2600", "0"],
  ];
  return (
    <table className="sched">
      <thead>
        <tr><td className="title" colSpan={6}>&lt;Window Schedule&gt;</td></tr>
        <tr><th>Mark</th><th>Type</th><th>Count</th><th>Width</th><th>Height</th><th>Sill</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0] as string}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
        ))}
        <tr><td colSpan={2} style={{ fontWeight: 800 }}>Grand total</td><td style={{ fontWeight: 800 }}>11</td><td colSpan={3} /></tr>
      </tbody>
    </table>
  );
}

function Sheet() {
  return (
    <div className="sheet">
      <div className="vp" style={{ left: "4%", top: "6%", width: "44%", height: "52%" }}>A-101 · Level 1 Plan 1:100</div>
      <div className="vp" style={{ left: "52%", top: "6%", width: "22%", height: "52%" }}>3D View</div>
      <div className="vp" style={{ left: "4%", top: "64%", width: "34%", height: "30%" }}>Section 1</div>
      <div className="vp" style={{ left: "41%", top: "64%", width: "33%", height: "30%" }}>Window Schedule</div>
      <div className="tb">
        <b>REVIT ACADEMY</b>
        <span>Project: Modern House</span>
        <span>Client: Nir Maimon</span>
        <span>Scale: 1:100</span>
        <span style={{ marginTop: "auto", fontSize: 18, fontWeight: 900 }}>A-101</span>
      </div>
    </div>
  );
}

export default function DiagramView({ type }: { type: Diagram }) {
  return (
    <div className="diagram">
      {type === "ui" && <UiMock />}
      {type === "levels" && <Levels />}
      {type === "wallLayers" && <WallLayers />}
      {type === "family" && <Family />}
      {type === "schedule" && <Schedule />}
      {type === "sheet" && <Sheet />}
    </div>
  );
}
