import { Link } from "react-router-dom";

interface DesktopIconProps {
  to: string;
  label: string;
  code: string;
  disabled?: boolean;
}

function DesktopIcon({ to, label, code, disabled = false }: DesktopIconProps) {
  if (disabled) {
    return (
      <button className="desktop-icon disabled" type="button" disabled title="Run analysis first">
        <span className="pixel-icon">{code}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link className="desktop-icon" to={to}>
      <span className="pixel-icon">{code}</span>
      <span>{label}</span>
    </Link>
  );
}

export default DesktopIcon;
