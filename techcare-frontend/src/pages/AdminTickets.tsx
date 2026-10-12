
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import { RefreshCw, Search, Ticket, Clock3, CheckCircle2, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./AdminTickets.css";

type SupportTicket = {
  _id: string;
  title?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  customer?: { name?: string; email?: string } | string;
  createdAt?: string;
};
type ProblemReport = {
  _id: string;
  problem?: string;
  description?: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  status?: string;
  customer?: { name?: string; email?: string } | string;
  customerId?: { name?: string; email?: string } | string;
  createdAt?: string;
};

const API_URL = "/api";

function AdminTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [problemReports, setProblemReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  async function fetchTickets() {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Unable to load tickets (HTTP ${response.status}).`);
      }

      const data = await response.json();
      const items = Array.isArray(data)
        ? data
        : data.tickets ?? data.data ?? [];

      if (!Array.isArray(items)) {
        throw new Error("The server returned an unexpected ticket format.");
      }

      setTickets(items);

      const reportToken = getAuthToken();
      const reportResponse = await fetch(`${API_URL}/problem-reports`, {
        headers: reportToken ? { Authorization: "Bearer " + reportToken } : {},
      });
      const reportData = await reportResponse.json();
      if (!reportResponse.ok) {
        throw new Error(reportData.message || `Unable to load problem reports (HTTP ${reportResponse.status}).`);
      }
      const reports = Array.isArray(reportData)
        ? reportData
        : reportData.problemReports ?? reportData.reports ?? reportData.data ?? [];
      if (!Array.isArray(reports)) {
        throw new Error("The server returned an unexpected problem report format.");
      }
      setProblemReports(reports.filter((report: ProblemReport) => report.status !== "CONVERTED"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading tickets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchTickets();
  }, []);

  const getStatus = (ticket: SupportTicket) =>
    (ticket.status || "OPEN").toUpperCase().replaceAll("_", " ");

  const getCustomerName = (ticket: SupportTicket) =>
    typeof ticket.customer === "object" && ticket.customer
      ? ticket.customer.name || "Unknown customer"
      : typeof ticket.customer === "string"
        ? ticket.customer
        : "Unknown customer";

  const filteredTickets = tickets.filter((ticket) => {
    const status = getStatus(ticket);
    const title = ticket.title || ticket.subject || "";
    const matchesFilter = filter === "ALL" || status === filter;

    const matchesSearch = [
      title,
      ticket._id,
      `TK-${ticket._id.slice(-6)}`,
      getCustomerName(ticket),
      ticket.description || "",
      status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    return matchesFilter && matchesSearch;
  });
  const filteredReports = problemReports.filter((report) => {
    const customer = report.customer ?? report.customerId;
    const customerName = customer && typeof customer === "object"
      ? customer.name || ""
      : typeof customer === "string" ? customer : "";
    return [
      report._id,
      report.problem || "",
      report.description || "",
      report.deviceType || "",
      report.brand || "",
      report.model || "",
      customerName,
    ].join(" ").toLowerCase().includes(search.trim().toLowerCase());
  });

  const openCount = tickets.filter((t) => getStatus(t) === "OPEN").length;
  const progressCount = tickets.filter((t) =>
    ["IN PROGRESS", "IN_PROGRESS"].includes(getStatus(t))
  ).length;
  const resolvedCount = tickets.filter((t) =>
    ["RESOLVED", "CLOSED"].includes(getStatus(t))
  ).length;

  return (
    <div className="admin-layout admin-tickets-page">
      <Sidebar />

      <main className="admin-tickets-main">
        <header className="at-header">
          <div>
            <span className="at-eyebrow">WORKSPACE / TICKETS</span>
            <h1>Support Tickets</h1>
            <p>View and manage customer hardware support tickets.</p>
          </div>

          <button
            type="button"
            className="at-refresh"
            onClick={() => void fetchTickets()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="at-error" role="alert">
            <AlertCircle size={19} />
            <div>
              <strong>Could not load tickets</strong>
              <p>{error}</p>
              <small>Check that your backend is running and its tickets route is correct.</small>
            </div>
          </div>
        )}

        <section className="at-stats">
          <article className="at-stat-card">
            <div className="at-stat-icon blue"><Ticket size={22} /></div>
            <div><span>Total tickets</span><strong>{tickets.length}</strong></div>
          </article>

          <article className="at-stat-card">
            <div className="at-stat-icon orange"><Clock3 size={22} /></div>
            <div><span>Open tickets</span><strong>{openCount}</strong></div>
          </article>

          <article className="at-stat-card">
            <div className="at-stat-icon purple"><RefreshCw size={22} /></div>
            <div><span>In progress</span><strong>{progressCount}</strong></div>
          </article>

          <article className="at-stat-card">
            <div className="at-stat-icon green"><CheckCircle2 size={22} /></div>
            <div><span>Resolved / closed</span><strong>{resolvedCount}</strong></div>
          </article>
        </section>

        <section className="at-panel">
          <div className="at-panel-header">
            <div>
              <h2>All tickets</h2>
              <p>Search tickets and filter them by status.</p>
            </div>
            <span className="at-count">{filteredTickets.length} tickets</span>
          </div>

          <div className="at-toolbar">
            <div className="at-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search ticket, customer, or issue..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter tickets by status"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="at-table-wrap">
            <table className="at-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date created</th>
                </tr>
              </thead>
              <tbody>
                {loading && tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="at-empty">
                      Loading tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="at-empty">
                      <Ticket size={30} />
                      <strong>No tickets found</strong>
                      <span>
                        {error
                          ? "Tickets could not be loaded. Check the error above."
                          : "Tickets will appear here when they are available."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const status = getStatus(ticket);
                    const priority = (ticket.priority || "MEDIUM").toUpperCase();

                    return (
                      <tr key={ticket._id}>
                        <td>
                          <strong>TK-{ticket._id.slice(-6).toUpperCase()}</strong>
                        </td>
                        <td>{getCustomerName(ticket)}</td>
                        <td>
                          <strong>{ticket.title || ticket.subject || "Untitled ticket"}</strong>
                          {ticket.description && (
                            <span className="at-description">{ticket.description}</span>
                          )}
                        </td>
                        <td>
                          <span className={`at-priority ${priority.toLowerCase()}`}>
                            {priority}
                          </span>
                        </td>
                        <td>
                          <span className={`at-status ${status.toLowerCase().replaceAll(" ", "-")}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="at-panel">
          <div className="at-panel-header">
            <div>
              <h2>Incoming problem reports</h2>
              <p>Submitted customer problems that are awaiting review and ticket assignment.</p>
            </div>
            <span className="at-count">{filteredReports.length} reports</span>
          </div>

          <div className="at-table-wrap">
            <table className="at-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Customer</th>
                  <th>Problem</th>
                  <th>Device</th>
                  <th>Status</th>
                  <th>Date submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && problemReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="at-empty">Loading problem reports...</td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="at-empty">No incoming problem reports.</td>
                  </tr>
                ) : filteredReports.map((report) => {
                  const customer = report.customer ?? report.customerId;
                  const customerName = customer && typeof customer === "object"
                    ? customer.name || "Unknown customer"
                    : typeof customer === "string" ? customer : "Unknown customer";
                  const device = [report.brand, report.model, report.deviceType]
                    .filter(Boolean)
                    .join(" ") || "Device not specified";
                  const status = (report.status || "PENDING").toUpperCase();
                  return (
                    <tr key={report._id}>
                      <td><strong>PR-{report._id.slice(-6).toUpperCase()}</strong></td>
                      <td>{customerName}</td>
                      <td>
                        <strong>{report.problem || "Untitled report"}</strong>
                        {report.description && <span className="at-description">{report.description}</span>}
                      </td>
                      <td>{device}</td>
                      <td>
                        <span className={`at-status ${status.toLowerCase()}`}>{status}</span>
                      </td>
                      <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <Link to={`/admin/problem-reports/${report._id}`}>Review</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminTickets;