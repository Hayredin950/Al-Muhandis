// Suppress unhandled media play() rejections globally before React mounts.
// Browsers throw AbortError / NotSupportedError when audio.play() is interrupted
// or no source is available; these are expected and handled inside the player.
window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason;
  const msg = String(reason?.message ?? reason ?? "");
  if (
    reason?.name === "AbortError" ||
    reason?.name === "NotSupportedError" ||
    reason?.name === "NotAllowedError" ||
    msg.includes("no supported source") ||
    msg.includes("interrupted by a call") ||
    msg.includes("interrupted by a new load") ||
    msg.includes("The play() request was interrupted") ||
    msg.includes("Failed to load because no supported source")
  ) {
    e.preventDefault();
  }
});

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
