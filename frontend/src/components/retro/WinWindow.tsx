import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface WinWindowProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  status?: ReactNode;
  className?: string;
}

function WinWindow({ title, eyebrow, children, status, className = "" }: WinWindowProps) {
  return (
    <section className={`win-window ${className}`}>
      <div className="win-titlebar">
        <span className="win-title">{title}</span>
        <div className="win-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <nav className="win-menubar" aria-label={`${title} menu`}>
        <Link to="/desktop">File</Link>
        <Link to="/overview">View</Link>
        <Link to="/report">Report</Link>
        <a href="#window-help">Help</a>
      </nav>
      {eyebrow && <div className="win-toolbar">{eyebrow}</div>}
      <div className="win-body">{children}</div>
      {status && <footer className="win-statusbar">{status}</footer>}
    </section>
  );
}

export default WinWindow;
