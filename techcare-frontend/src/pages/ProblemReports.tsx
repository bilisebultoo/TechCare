
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock3,
  Eye,
  FileWarning,
  RefreshCw,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./ProblemReports.css";

type ReportStatus = "PENDING" | "REVIEWED" | "CONVERTED";
type FilterStatus = "ALL" | ReportStatus;
type Priority = "LOW" | "MEDIUM" | "HIGH";

type Customer = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type ProblemReport = {
  _id: string;
  customerId?: Customer | string | null;
  customer?: Customer | string | null;
  deviceType?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  problem?: string;
  description?: string;
  status?: ReportStatus;
  priority?: Priority;
  createdAt?: string;
};

const API_URL = "/api";

function getCustomer(report: ProblemReport): Customer {
  const value = report.customer ?? report.customerId;

  if (value && typeof value === "object") {
    return value;
  }

  return {};
}

function getStatus(status?: string): ReportStatus {
  if (status === "REVIEWED" || status === "CONVERTED") {
    return status;
  }

  return "PENDING";
}

function getPriority(priority?: string): Priority {
  if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
    return priority;
  }

  return "MEDIUM";
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getShortId(id: string) {
  return id.slice(-6).toUpperCase();
}

export default function ProblemReports() {
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/problem-reports`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Your session may have expired. Please log in again."
            : `Unable to load reports (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : data.problemReports ?? data.reports ?? data.data ?? [];

      if (!Array.isArray(items)) {
        throw new Error("The server returned an unexpected report format.");
      }

      setReports(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter(
        (report) => getStatus(report.status) === "PENDING"
      ).length,
      reviewed: reports.filter(
        (report) => getStatus(report.status) === "REVIEWED"
      ).length,
      converted: reports.filter(
        (report) => getStatus(report.status) === "CONVERTED"
      ).length,
    }),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reports.filter((report) => {
      const status = getStatus(report.status);
      const customer = getCustomer(report);

      const matchesFilter = filter === "ALL" || status === filter;

      const searchableText = [
        report._id,
        customer.name,
        customer.email,
        report.deviceType,
        report.brand,
        report.model,
        report.problem,
        report.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!term || searchableText.includes(term));
    });
  }, [reports, filter, search]);

  return (
    <div className="admin-layout problem-reports-page">
      <Sidebar />

      <main className="admin-main problem-reports-main">
        <header className="pr-topbar">
          <div>
            <span className="pr-eyebrow">WORKSPACE / REPORTS</span>
            <h1>Problem Reports</h1>
            <p>Review customer hardware issues before creating official tickets.</p>
          </div>

          <div className="pr-topbar-actions">
            <div className="pr-admin-avatar">A</div>
            <div className="pr-admin-identity">
              <strong>Administrator</strong>
              <span>Admin account</span>
            </div>
          </div>
        </header>

        <section className="pr-content">
          <div className="pr-page-heading">
            <div className="pr-heading-icon">
              <ClipboardList size={23} />
            </div>

            <div className="pr-heading-copy">
              <h2>Customer Problem Reports</h2>
              <p>Check the reported issue, device details, and customer information.</p>
            </div>

            <button
              type="button"
              className="pr-refresh-button"
              onClick={() => void fetchReports()}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "pr-spinning" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="pr-error" role="alert">
              <AlertCircle size={19} />
              <div>
                <strong>Could not load problem reports</strong>
                <p>{error}</p>
              </div>
              <button type="button" onClick={() => void fetchReports()}>
                Try again
              </button>
            </div>
          )}

          <div className="pr-stats-grid">
            <article className="pr-stat-card">
              <div className="pr-stat-icon pr-blue">
                <ClipboardList size={22} />
              </div>
              <div className="pr-stat-info">
                <span>Total reports</span>
                <strong>{counts.total}</strong>
                <small>All submitted reports</small>
              </div>
            </article>

            <article className="pr-stat-card">
              <div className="pr-stat-icon pr-orange">
                <Clock3 size={22} />
              </div>
              <div className="pr-stat-info">
                <span>Pending review</span>
                <strong>{counts.pending}</strong>
                <small>Waiting for admin review</small>
              </div>
            </article>

            <article className="pr-stat-card">
              <div className="pr-stat-icon pr-purple">
                <Eye size={22} />
              </div>
              <div className="pr-stat-info">
                <span>Reviewed</span>
                <strong>{counts.reviewed}</strong>
                <small>Reports already reviewed</small>
              </div>
            </article>

            <article className="pr-stat-card">
              <div className="pr-stat-icon pr-green">
                <Ticket size={22} />
              </div>
              <div className="pr-stat-info">
                <span>Converted to tickets</span>
                <strong>{counts.converted}</strong>
                <small>Official tickets created</small>
              </div>
            </article>
          </div>

          <section className="pr-reports-panel">
            <div className="pr-panel-heading">
              <div>
                <h2>All submitted reports</h2>
                <p>Search reports or filter them by review status.</p>
              </div>
              <span className="pr-result-count">
                {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "report" : "reports"}
              </span>
            </div>

            <div className="pr-toolbar">
              <div className="pr-search-box">
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, device, or problem..."
                  aria-label="Search problem reports"
                />
              </div>

              <div className="pr-filter-group" aria-label="Filter reports by status">
                {(
                  [
                    ["ALL", "All reports"],
                    ["PENDING", "Pending"],
                    ["REVIEWED", "Reviewed"],
                    ["CONVERTED", "Converted"],
                  ] as [FilterStatus, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`pr-filter-button ${
                      filter === value ? "active" : ""
                    }`}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                    {value === "PENDING" && counts.pending > 0 && (
                      <span>{counts.pending}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pr-table-wrap">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Problem reported</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && reports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="pr-table-message">
                        <RefreshCw size={21} className="pr-spinning" />
                        <span>Loading problem reports...</span>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="pr-empty-state">
                          <div className="pr-empty-icon">
                            <FileWarning size={28} />
                          </div>
                          <h3>No problem reports found</h3>
                          <p>
                            {search || filter !== "ALL"
                              ? "Try changing your search or selected filter."
                              : "Customer reports will appear here when submitted."}
                          </p>
                          {(search || filter !== "ALL") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setFilter("ALL");
                              }}
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
                      const customer = getCustomer(report);
                      const status = getStatus(report.status);
                      const priority = getPriority(report.priority);
                      const deviceName = [
                        report.brand,
                        report.model,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <tr key={report._id}>
                          <td>
                            <div className="pr-report-cell">
                              <div className="pr-row-icon">
                                <ClipboardList size={18} />
                              </div>
                              <div>
                                <strong>PR-{getShortId(report._id)}</strong>
                                <span>Problem report</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="pr-customer-cell">
                              <div className="pr-customer-avatar">
                                {(customer.name || "C").charAt(0).toUpperCase()}
                              </div>
                              <div className="pr-customer-details">
                                <strong>{customer.name || "Unknown customer"}</strong>
                                <span>{customer.email || "No email provided"}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="pr-device-cell">
                              <strong>{report.deviceType || "Device not specified"}</strong>
                              <span>{deviceName || "Brand/model not provided"}</span>
                              {report.serialNumber && (
                                <small>SN: {report.serialNumber}</small>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="pr-problem-cell">
                              <strong>{report.problem || "Problem not specified"}</strong>
                              {report.description && (
                                <span title={report.description}>
                                  {report.description}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className={`pr-priority pr-priority-${priority.toLowerCase()}`}>
                              <span />
                              {priority.charAt(0) + priority.slice(1).toLowerCase()}
                            </span>
                          </td>

                          <td>
                            <span className={`pr-status pr-status-${status.toLowerCase()}`}>
                              <span />
                              {status === "PENDING"
                                ? "Pending"
                                : status === "REVIEWED"
                                  ? "Reviewed"
                                  : "Converted"}
                            </span>
                          </td>

                          <td>
                            <span className="pr-date">
                              {formatDate(report.createdAt)}
                            </span>
                          </td>

                          <td>
                            <Link
                              to={`/admin/problem-reports/${report._id}`}
                              className="pr-review-button"
                            >
                              Review <ArrowRight size={15} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <footer className="pr-table-footer">
              <span>
                Showing <strong>{filteredReports.length}</strong> of{" "}
                <strong>{reports.length}</strong> reports
              </span>
              <span className="pr-secure-note">
                <Users size={15} /> TechCare admin workspace
              </span>
            </footer>
          </section>
        </section>
      </main>
    </div>
  );
}