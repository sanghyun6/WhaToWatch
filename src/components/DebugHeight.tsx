"use client";

import { useEffect } from "react";

export function DebugHeight() {
  useEffect(() => {
    const log = () => {
      console.log(
        "document.body.scrollHeight:",
        document.body.scrollHeight,
        "window.innerHeight:",
        window.innerHeight
      );
    };
    log();
    window.addEventListener("resize", log);
    return () => window.removeEventListener("resize", log);
  }, []);
  return null;
}
