import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState(null);
  const [viewerMode, setViewerMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (user.role === "viewer") {
          const { data } = await api.get("/dashboard/recent-activity?limit=20");
          if (!cancelled) {
            setOverview({ recentActivity: data.data });
            setViewerMode(true);
          }
        } else {
          const { data } = await api.get("/dashboard/overview");
          if (!cancelled) {
            setOverview(data.data);
            setViewerMode(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.error?.message || "Could not load dashboard.");
          setOverview(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return (
    <Layout>
      <h2>Dashboard Overview</h2>
      {(authLoading || loading) && <p>Loading...</p>}
      {error && !loading && <p className="error">{error}</p>}
      {viewerMode && overview && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <p>
              <strong>Viewer access:</strong> Totals and charts are available to Analyst and Admin roles.
              Below is recent activity you are allowed to see.
            </p>
          </div>
          <div className="card">
            <h3>Recent Activity</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentActivity.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.category}</td>
                    <td>{item.type}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!viewerMode && overview && (
        <>
          <div className="grid">
            <SummaryCard label="Total Income" value={overview.summary.totalIncome} />
            <SummaryCard label="Total Expenses" value={overview.summary.totalExpenses} />
            <SummaryCard label="Net Balance" value={overview.summary.netBalance} />
            <SummaryCard label="Records" value={overview.summary.recordCount} />
          </div>

          <div className="card">
            <h3>Recent Activity</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentActivity.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.category}</td>
                    <td>{item.type}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
