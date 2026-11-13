"use client";

import dynamic from "next/dynamic";

const ViewerLazy = dynamic(() => import("./three/Viewer"), {
  ssr: false,
  loading: () => <div className="viewer-loading mono">טוען מודל תלת־ממדי…</div>,
});

export default ViewerLazy;
