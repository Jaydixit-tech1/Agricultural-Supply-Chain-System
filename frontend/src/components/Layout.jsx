import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Animated3DBackground from "./Animated3DBackground";
import styles from "./Layout.module.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.layout}>
      <Animated3DBackground />
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>AgriChain</Link>
        <nav className={styles.nav}>
          <Link to="/">Dashboard</Link>
          <Link to="/batches">Batches</Link>
          {user?.role === "farmer" && <Link to="/batches/create">Create crop</Link>}
          {(user?.role === "admin" || user?.role === "owner") && <Link to="/admin/users">Owner / Users</Link>}
        </nav>
        <div className={styles.user}>
          <span className={styles.role}>{user?.role === "admin" ? "Owner" : user?.role}</span>
          <span className={styles.wallet}>{user?.walletAddress?.slice(0, 6)}…{user?.walletAddress?.slice(-4)}</span>
          <button type="button" onClick={handleLogout} className={styles.logout}>Logout</button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.pageEnter}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
