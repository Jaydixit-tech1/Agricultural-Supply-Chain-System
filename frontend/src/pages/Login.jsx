import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Animated3DBackground from "../components/Animated3DBackground";
import styles from "./Auth.module.css";

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const unauthMessage = location.state?.message === "Unauthorized access" ? "Unauthorized access" : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Animated3DBackground />
      <div className={styles.card}>
        <h1 className={styles.title}>AgriChain</h1>
        <p className={styles.subtitle}>Agricultural Supply Chain</p>
        <form onSubmit={handleSubmit} className={styles.form} autoComplete="on">
          {unauthMessage && <div className={styles.error}>{unauthMessage}</div>}
          {error && <div className={styles.error}>{error}</div>}
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
            autoComplete="email"
          />
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className={styles.footer}>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
