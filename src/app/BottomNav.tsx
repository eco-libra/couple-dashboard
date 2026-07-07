import { NavLink } from "react-router-dom";
import { useT } from "../shared/i18n";

const TABS = [
  { to: "/", icon: "🏠", key: "navHome" },
  { to: "/moment", icon: "📸", key: "navMoment" },
  { to: "/map", icon: "🌍", key: "navMap" },
  { to: "/memories", icon: "🖼", key: "navMemories" },
  { to: "/more", icon: "⚙️", key: "navMore" },
] as const;

export function BottomNav() {
  const t = useT();
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}
          className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon" aria-hidden>{tab.icon}</span>
          {t[tab.key]}
        </NavLink>
      ))}
    </nav>
  );
}
