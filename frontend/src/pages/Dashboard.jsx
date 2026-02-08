import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RegisterOnChain from "./RegisterOnChain";
import styles from "./Dashboard.module.css";
import { API } from "../config/api.js";
import { hasContract } from "../config/contract";
import { getContractReadOnly, getWalletAddress } from "../utils/blockchain";

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const location = useLocation();
  const [myBatches, setMyBatches] = useState([]);
  const [myBatchesLoading, setMyBatchesLoading] = useState(false);
  const showWelcome = location.state?.welcomeFarmer === true;

  const isOwner = user?.role === "admin" || user?.role === "owner";
  const isFarmer = user?.role === "farmer";

  const fetchMyBatches = useCallback(async () => {
    if (!isFarmer) return;
    setMyBatchesLoading(true);
    try {
      if (hasContract()) {
        const contract = await getContractReadOnly();
        const wallet = await getWalletAddress() || user?.walletAddress;
        if (contract && wallet) {
          const list = await contract.getMyBatches(wallet);
          const mapped = (list || []).map((b) => ({
            batchId: String(b.batchId ?? b[0]),
            cropName: b.cropName ?? b[1],
            quantityKg: b.quantity != null ? Number(b.quantity) : null,
            status: b.status ?? b[6],
            createdAt: b.createdAt != null ? Number(b.createdAt) * 1000 : null,
          }));
          setMyBatches(mapped);
          setMyBatchesLoading(false);
          return;
        }
      }
      const token = getToken();
      if (!token) { setMyBatches([]); return; }
      const r = await fetch(`${API}/batches/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = r.ok ? await r.json() : { batches: [] };
      setMyBatches(data.batches || []);
    } catch {
      setMyBatches([]);
    } finally {
      setMyBatchesLoading(false);
    }
  }, [isFarmer, getToken, user?.walletAddress]);

  useEffect(() => {
    fetchMyBatches();
  }, [fetchMyBatches]);

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <p className={styles.welcome}>
        Welcome, <strong>{user?.name || user?.email}</strong> ({isOwner ? "Owner" : user?.role})
      </p>

      {showWelcome && isFarmer && (
        <div className={styles.welcomeBanner}>
          <strong>Welcome!</strong> Create your first crop batch.
          <Link to="/batches/create" className={styles.welcomeLink}>Create batch →</Link>
        </div>
      )}

      {isOwner && (
        <div className={styles.nextStep}>
          <h2 className={styles.nextStepTitle}>Next step</h2>
          <p className={styles.nextStepDesc}>Manage users, roles, KYC and verification status.</p>
          <Link to="/admin/users" className={styles.nextStepButton}>Go to Owner / Users</Link>
        </div>
      )}

      {!user?.registeredOnChain && user?.role !== "inspector" && !isOwner && (
        <>
          <div className={styles.alert}>
            Register your wallet on the blockchain to create on-chain batches. You can still create batches with the form below (saved in database).
          </div>
          <RegisterOnChain />
        </>
      )}

      {isFarmer && (
        <section className={styles.myBatches}>
          <h2 className={styles.sectionTitle}>My Batches</h2>
          {myBatchesLoading ? (
            <p className={styles.muted}>Loading…</p>
          ) : myBatches.length === 0 ? (
            <div className={styles.emptySection}>
              <p className={styles.emptyText}>No batches yet. Create your first crop.</p>
              <Link to="/batches/create" className={styles.emptyLink}>Create batch</Link>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Crop Name</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myBatches.map((b) => (
                    <tr key={b._id || b.batchId}>
                      <td>
                        <Link to={`/batches/${encodeURIComponent(b.batchId)}`} className={styles.batchLink}>
                          {b.batchId}
                        </Link>
                      </td>
                      <td>{b.cropName || "—"}</td>
                      <td>{b.quantityKg != null ? `${b.quantityKg} kg` : "—"}</td>
                      <td><span className={styles.statusBadge}>{b.status || "Created"}</span></td>
                      <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <div className={styles.cards}>
        {isOwner && (
          <Link to="/admin/users" className={styles.card}>
            <span className={styles.cardTitle}>Owner / Users</span>
            <span className={styles.cardDesc}>Manage users, roles, KYC and verification</span>
          </Link>
        )}
        <Link to="/batches" className={styles.card}>
          <span className={styles.cardTitle}>Batches</span>
          <span className={styles.cardDesc}>View all crop batches (read-only)</span>
        </Link>
        {isFarmer && (
          <Link to="/batches/create" className={styles.card}>
            <span className={styles.cardTitle}>Create Batch</span>
            <span className={styles.cardDesc}>Create a new crop batch {hasContract() ? "on-chain" : "(saved in database)"}</span>
          </Link>
        )}
        <Link to="/batches" className={styles.card}>
          <span className={styles.cardTitle}>Verify Origin</span>
          <span className={styles.cardDesc}>View batches and verify crop origin via QR</span>
        </Link>
      </div>
    </div>
  );
}
