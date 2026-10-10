import { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "../utils/auth";
import { AlertCircle, BarChart3, CheckCircle2, Clock3, RefreshCw, Ticket } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./AdminReports.css";

type SupportTicket = {
  _id: string;
  status?: string;
  priority?: string;
};

const API_URL = "/api";

function getStatus(ticket: SupportTicket) {
  return (ticket.status || "OPEN").toUpperCase().replaceAll("_", " ");
}

async function fetchTickets(): Promise<SupportTicket[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/tickets`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Unable to load ticket reports (HTTP ${response.status}).`);
  }

  const data = await response.json();
  const items = Array.isArray(data)
    ? data
    : data.tickets ?? data.data ?? [];

  if (!Array.isArray(items)) {
    throw new Error("The server returned an unexpected ticket format.");
  }

  return items;
}

function getErrorMessage(err: unknown) {
  return err instanceof Error
    ? err.message
    : "Something went wrong while loading ticket reports.";
}

function AdminReports() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void fetchTickets()
      .then((items) => {
        if (active) setTickets(items);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleRefresh() {
    setLoading(true);
    setError("");
    void fetchTickets()
      .then(setTickets)
      .catch((err: unknown) => {
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  const metrics = useMemo(() => {
    const statuses = ["OPEN", "IN PROGRESS", "RESOLVED", "CLOSED"];
    const counts = statuses.map((status) => ({
      status,
      count: tickets.filter((ticket) => getStatus(ticket) === status).length,
    }));

    return {
      counts,
      open: counts[0].count,
      inProgress: counts[1].count,
      resolved: counts[2].count + counts[3].count,
      highPriority: tickets.filter(
        (ticket) => (ticket.priority || "").toUpperCase() === "HIGH"
      ).length,
    };
  }, [tickets]);

  return (
    <div className="admin-layout admin-reports-page">
      <Sidebar />
      <main className="admin-reports-main">
        <header className="ar-header">
          <div>
            <span className="ar-eyebrow">WORKSPACE / REPORTS</span>
            <h1>Ticket Reports</h1>
            <p>Review support ticket volume, status, and priority.</p>
          </div>
          <button
            type="button"
            className="ar-refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="ar-error" role="alert">
            <AlertCircle size={19} />
            <div>
              <strong>Could not load ticket reports</strong>
              <p>{error}</p>
              <small>Check that your backend is running and its tickets route is correct.</small>
            </div>
          </div>
        )}

        <section className="ar-stats" aria-label="Ticket summary">
          <article className="ar-stat-card">
            <div className="ar-stat-icon blue"><Ticket size={21} /></div>
            <div><span>Total tickets</span><strong>{tickets.length}</strong></div>
          </article>
          <article className="ar-stat-card">
            <div className="ar-stat-icon orange"><Clock3 size={21} /></div>
            <div><span>Open tickets</span><strong>{metrics.open}</strong></div>
          </article>
          <article className="ar-stat-card">
            <div className="ar-stat-icon purple"><BarChart3 size={21} /></div>
            <div><span>In progress</span><strong>{metrics.inProgress}</strong></div>
          </article>
          <article className="ar-stat-card">
            <div className="ar-stat-icon green"><CheckCircle2 size={21} /></div>
            <div><span>Resolved / closed</span><strong>{metrics.resolved}</strong></div>
          </article>
        </section>

        <section className="ar-panel">
          <div className="ar-panel-heading">
            <div>
              <h2>Tickets by status</h2>
              <p>Current distribution across all support tickets.</p>
            </div>
            <span>{tickets.length} total</span>
          </div>
          {loading && tickets.length === 0 ? (
            <p className="ar-empty">Loading ticket data...</p>
          ) : tickets.length === 0 ? (
            <p className="ar-empty">
              {error ? "Ticket report data is unavailable." : "No tickets are available to report yet."}
            </p>
          ) : (
            <div className="ar-breakdown">
              {metrics.counts.map(({ status, count }) => {
                const percentage = Math.round((count / tickets.length) * 100);
                return (
                  <div className="ar-breakdown-row" key={status}>
                    <div className="ar-breakdown-label">
                      <strong>{status}</strong>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div
                      className="ar-track"
                      role="progressbar"
                      aria-label={`${status} tickets`}
                      aria-valuenow={count}
                      aria-valuemin={0}
                      aria-valuemax={tickets.length}
                    >
                      <span style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="ar-priority">
            <span>High-priority tickets</span>
            <strong>{metrics.highPriority}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminReports;
