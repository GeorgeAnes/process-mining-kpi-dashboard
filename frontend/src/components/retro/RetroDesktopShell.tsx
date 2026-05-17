import type { ReactNode } from "react";
import Taskbar from "./Taskbar";

function RetroDesktopShell({ children }: { children: ReactNode }) {
  return (
    <div className="retro-os">
      <main className="retro-desktop">{children}</main>
      <Taskbar />
    </div>
  );
}

export default RetroDesktopShell;
