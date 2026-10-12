import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import { AlertCircle, ClipboardList, RefreshCw } from "lucide-react";
import "./CustomerTickets.css";

type ReportStatus = "PENDING" | "REVIEWED" | "CONVERTED";

type ProblemReport = {
  _id: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  problem?: string;
  description?: string;
  status?: ReportStatus;
  createdAt?: string;
  ticketId?: string;
};

type StatusFilter = "ALL" | ReportStatus;

function statusLabel(status?: string) {
  if (status === "REVIEWED" || status === "CONVERTED") return status;
  return "PENDING";
}

function CustomerTickets() {
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = getAuthToken();

    void fetch("/api/problem-reports/my", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `Unable to load your requests (HTTP ${response.status}).`
          );
        }
        const items = Array.isArray(data)
          ? data
          : data.problemReports ?? data.reports ?? data.data ?? [];
        if (!Array.isArray(items)) {
          throw new Error("The server returned an unexpected report format.");
        }
        return items as ProblemReport[];
      })
      .then((items) => {
        if (active) setReports(items);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof TypeError
              ? "Cannot reach the TechCare server. Make sure the frontend and backend are running, then try again."
              : err instanceof Error
              ? err.message
              : "Something went wrong while loading your requests."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          filter === "ALL" ||
          (filter === "REVIEWED"
            ? report.status === "REVIEWED" || report.status === "CONVERTED"
            : statusLabel(report.status) === filter)
      ),
    [filter, reports]
  );

  return (
    <div className="tickets-page">
      <header className="tickets-header">
        <Link to="/customer/dashboard" className="tickets-logo">
          <div className="tickets-logo-icon">TC</div>
          <div>
            <strong>TechCare</strong>
            <span>Hardware Support</span>
          </div>
        </Link>
        <Link to="/customer/dashboard" className="tickets-back">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="tickets-main">
        <div className="tickets-title">
          <p>TECHCARE SUPPORT</p>
          <h1>My Support Requests</h1>
          <span>View your submitted hardware reports and their review status.</span>
        </div>

        <div className="tickets-filters" aria-label="Filter requests by status">
          {(
            [
              ["ALL", "All"],
              ["PENDING", "Pending"],
              ["REVIEWED", "Reviewed"],
              ["CONVERTED", "Converted"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`ticket-filter ${filter === value ? "active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="customer-requests-filter-hint">
          Requests assigned to an agent are marked Converted and are also included
          under Reviewed.
        </p>

        {error && (
          <div className="customer-requests-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="customer-requests-state">
            <RefreshCw size={22} className="customer-requests-spin" />
            Loading your support requests...
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="tickets-card">
            <div className="tickets-empty">
              <div className="tickets-empty-icon">
                <ClipboardList size={26} />
              </div>
              <h2>{error ? "Requests are unavailable" : "No support requests yet"}</h2>
              <p>
                {error
                  ? "Please check your connection and sign-in, then try again."
                  : filter === "ALL"
                    ? "Report a hardware problem and your submitted request will appear here."
                    : "There are no requests with this status."}
              </p>
              {!error && (
                <Link to="/customer/report-problem" className="tickets-report-btn">
                  Report a Problem →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="customer-requests-list">
            {visibleReports.map((report) => {
              const status = statusLabel(report.status);
              const device = [report.brand, report.model]
                .filter(Boolean)
                .join(" ");

              return (
                <article className="customer-request-card" key={report._id}>
                  <div className="customer-request-icon">
                    <ClipboardList size={20} />
                  </div>
                  <div className="customer-request-content">
                    <div className="customer-request-heading">
                      <div>
                        <span className="customer-request-id">
                          REPORT #{report._id.slice(-6).toUpperCase()}
                        </span>
                        <h2>{report.problem || "Hardware problem report"}</h2>
                      </div>
                      <span className={`customer-request-status ${status.toLowerCase()}`}>
                        {status === "PENDING" ? "Pending review" : status.toLowerCase()}
                      </span>
                    </div>
                    <p>
                      {[report.deviceType, device].filter(Boolean).join(" · ") ||
                        "Device not specified"}
                    </p>
                    {report.description && (
                      <p className="customer-request-description">{report.description}</p>
                    )}
                    <small>
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </small>
                    {report.ticketId && (
                      <Link
                        to={`/customer/tickets/${report.ticketId}`}
                        className="customer-request-conversation-link"
                      >
                        Open Conversation with Agent →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerTickets;
