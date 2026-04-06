import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Finance</h2>
        <nav>
          <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">
            Dashboard
          </Link>
          <Link className={location.pathname === "/records" ? "active" : ""} to="/records">
            Records
          </Link>
          {user?.role === "admin" && (
            <Link className={location.pathname === "/users" ? "active" : ""} to="/users">
              Users
            </Link>
          )}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>{user?.name}</strong> <span className="badge">{user?.role}</span>
          </div>
          <button onClick={logout}>Logout</button>
        </header>
        {children}
      </main>
    </div>
  );
}
