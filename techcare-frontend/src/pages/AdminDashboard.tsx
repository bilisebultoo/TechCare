
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/auth";
import {
  LayoutDashboard,
  Users,
  Headset,
  ClipboardList,
  Ticket,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  CircleAlert,
  ChevronRight,
  Plus,
} from "lucide-react";
import "./AdminDashboard.css";

type CustomerInfo = { _id?: string; name?: string } | string | null;
type DashboardTicket = {
  _id: string;
  title: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  priority?: string;
  status: string;
  customer?: CustomerInfo;
  customerId?: CustomerInfo;
};
type DashboardReport = {
  _id: string;
  problem: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  status: string;
  customer?: CustomerInfo;
  customerId?: CustomerInfo;
};
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "AGENT" | "CUSTOMER";
  isActive: boolean;
  createdAt: string;
};

function getCustomer(value?: CustomerInfo): { id?: string; name: string } {
  if (value && typeof value === "object") {
    return { id: value._id, name: value.name || "Customer" };
  }
  return { name: typeof value === "string" ? value : "Customer" };
}

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [problemReports, setProblemReports] = useState<DashboardReport[]>([]);
  const [accounts, setAccounts] = useState<ManagedUser[]>([]);
  const [activeAgentCount, setActiveAgentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setDashboardError("");
      try {
        const token = getAuthToken();
        const headers: HeadersInit = token ? { Authorization: "Bearer " + token } : {};
        const [ticketResponse, reportResponse, agentResponse] = await Promise.all([
          fetch("/api/tickets", { headers }),
          fetch("/api/problem-reports", { headers }),
          fetch("/api/auth/agents", { headers }),
        ]);
        const [ticketData, reportData, agentData] = await Promise.all([
          ticketResponse.json(),
          reportResponse.json(),
          agentResponse.json(),
        ]);
        if (!ticketResponse.ok) {
          throw new Error(ticketData.message || `Unable to load tickets (HTTP ${ticketResponse.status}).`);
        }
        if (!reportResponse.ok) {
          throw new Error(reportData.message || `Unable to load problem reports (HTTP ${reportResponse.status}).`);
        }
        if (!agentResponse.ok) {
          throw new Error(agentData.message || `Unable to load active agents (HTTP ${agentResponse.status}).`);
        }
        if (!Array.isArray(ticketData.tickets) || !Array.isArray(reportData.problemReports) || !Array.isArray(agentData.agents)) {
          throw new Error("The server returned unexpected dashboard data.");
        }
        if (active) {
          setTickets(ticketData.tickets);
          setProblemReports(reportData.problemReports);
          setActiveAgentCount(agentData.agents.length);
        }

        try {
          const accountResponse = await fetch("/api/auth/users", { headers });
          const accountData = await accountResponse.json();
          if (!accountResponse.ok) {
            throw new Error(accountData.message || `Unable to load accounts (HTTP ${accountResponse.status}).`);
          }
          if (!Array.isArray(accountData.users)) {
            throw new Error("The server returned unexpected account data.");
          }
          if (active) setAccounts(accountData.users);
        } catch (error) {
          if (active) {
            setDashboardError(error instanceof Error ? error.message : "Unable to load accounts.");
          }
        }
      } catch (error) {
        if (active) {
          setDashboardError(error instanceof Error ? error.message : "Unable to load dashboard data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const visibleTickets = tickets.filter((ticket) =>
    `${ticket.title} ${getCustomer(ticket.customer ?? ticket.customerId).name} ${ticket._id} TK-${ticket._id.slice(-6)}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const recentTickets = visibleTickets.slice(0, 4);
  const pendingReports = problemReports.filter((report) => report.status === "PENDING");
  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const resolvedTickets = tickets.filter((ticket) =>
    ticket.status === "RESOLVED" || ticket.status === "CLOSED"
  ).length;
  const customerAccountCount = accounts.filter((account) => account.role === "CUSTOMER").length;
  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/login";
  };

  return (
    <div className="tc-admin">
      {sidebarOpen && (
        <button
          className="tc-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`tc-sidebar ${sidebarOpen ? "tc-sidebar-open" : ""}`}>
        <Link to="/admin/dashboard" className="tc-brand">
          <div className="tc-brand-icon">T</div>
          <div className="tc-brand-text">
            <strong>TechCare</strong>
            <span>HARDWARE SUPPORT</span>
          </div>
          <button
            type="button"
            className="tc-mobile-close"
            aria-label="Close menu"
            onClick={(event) => {
              event.preventDefault();
              setSidebarOpen(false);
            }}
          >
            <X size={19} />
          </button>
        </Link>

        <div className="tc-menu-label">WORKSPACE</div>

        <nav className="tc-navigation">
          <Link
            to="/admin/dashboard"
            className="tc-nav-link tc-nav-active"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/customers"
            className="tc-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={19} />
            <span>Customers</span>
          </Link>
          <Link
            to="/admin/agents"
            className="tc-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Headset size={19} />
            <span>Support Agents</span>
          </Link>
          <Link
            to="/admin/problem-reports"
            className="tc-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <ClipboardList size={19} />
            <span>Problem Reports</span>
            {pendingReports.length > 0 && (
              <span className="tc-nav-count">{pendingReports.length}</span>
            )}
          </Link>
          <Link
            to="/admin/tickets"
            className="tc-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Ticket size={19} />
            <span>Tickets</span>
          </Link>
        </nav>

        <div className="tc-menu-label tc-management-label">MANAGEMENT</div>

        <nav className="tc-navigation">
          <Link to="/admin/reports" className="tc-nav-link">
            <ChartNoAxesCombined size={19} />
            <span>Reports</span>
          </Link>
          <Link to="/admin/settings" className="tc-nav-link">
            <Settings size={19} />
            <span>Settings</span>
          </Link>
          <Link to="/admin/accounts" className="tc-nav-link" onClick={() => setSidebarOpen(false)}>
            <Users size={19} />
            <span>Account Management</span>
          </Link>
        </nav>

        <div className="tc-sidebar-spacer" />

        <div className="tc-support-card">
          <div className="tc-support-icon">
            <Headset size={20} />
          </div>
          <strong>Need a hand?</strong>
          <p>Keep your support team running smoothly.</p>
          <span>TechCare Admin Panel</span>
        </div>

        <button type="button" className="tc-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>

        <div className="tc-sidebar-footer">
          <span className="tc-online-dot" />
          System workspace
          <span className="tc-version">v1.0</span>
        </div>
      </aside>

      <main className="tc-main">
        <header className="tc-topbar">
          <div className="tc-topbar-left">
            <button
              type="button"
              className="tc-menu-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="tc-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={15} />
              <strong>Dashboard</strong>
            </div>
          </div>

          <div className="tc-topbar-actions">
            <label className="tc-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search tickets..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search recent tickets"
              />
              <kbd>⌕</kbd>
            </label>

            <button
              type="button"
              className="tc-notification"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="tc-profile">
              <div className="tc-profile-avatar">A</div>
              <div className="tc-profile-info">
                <strong>Administrator</strong>
                <span>System Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="tc-dashboard-content">
          <section className="tc-welcome-row">
            <div>
              <div className="tc-eyebrow">
                <span className="tc-eyebrow-dot" />
                ADMINISTRATOR OVERVIEW
              </div>
              <h1>Good to see you again!</h1>
              <p>
                Here's an overview of your TechCare support workspace.
              </p>
            </div>

            <Link to="/admin/problem-reports" className="tc-primary-button">
              <Plus size={18} />
              Review reports
            </Link>
          </section>

          <section className="tc-stats-grid">
            <article className="tc-stat-card">
              <div className="tc-stat-top">
                <div className="tc-stat-icon tc-stat-blue">
                  <Users size={21} />
                </div>
                <span className="tc-stat-tag">CUSTOMERS</span>
              </div>
              <div className="tc-stat-number">{loading ? "—" : customerAccountCount}</div>
              <div className="tc-stat-bottom">
                <span>Registered customer accounts</span>
                <div className="tc-stat-indicator">
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div className="tc-stat-progress">
                <span className="tc-progress-blue" />
              </div>
            </article>

            <article className="tc-stat-card">
              <div className="tc-stat-top">
                <div className="tc-stat-icon tc-stat-purple">
                  <Headset size={21} />
                </div>
                <span className="tc-stat-tag">TEAM</span>
              </div>
              <div className="tc-stat-number">{loading ? "—" : activeAgentCount}</div>
              <div className="tc-stat-bottom">
                <span>Active support agents</span>
                <div className="tc-stat-indicator">
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div className="tc-stat-progress">
                <span className="tc-progress-purple" />
              </div>
            </article>

            <article className="tc-stat-card">
              <div className="tc-stat-top">
                <div className="tc-stat-icon tc-stat-orange">
                  <Ticket size={21} />
                </div>
                <span className="tc-stat-tag">NEEDS ATTENTION</span>
              </div>
              <div className="tc-stat-number">{loading ? "—" : openTickets}</div>
              <div className="tc-stat-bottom">
                <span>Open support tickets</span>
                <div className="tc-stat-indicator">
                  <CircleAlert size={15} />
                </div>
              </div>
              <div className="tc-stat-progress">
                <span className="tc-progress-orange" />
              </div>
            </article>

            <article className="tc-stat-card">
              <div className="tc-stat-top">
                <div className="tc-stat-icon tc-stat-green">
                  <CheckCircle2 size={21} />
                </div>
                <span className="tc-stat-tag">COMPLETED</span>
              </div>
              <div className="tc-stat-number">{loading ? "—" : resolvedTickets}</div>
              <div className="tc-stat-bottom">
                <span>Resolved tickets</span>
                <div className="tc-stat-indicator">
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div className="tc-stat-progress">
                <span className="tc-progress-green" />
              </div>
            </article>
          </section>

          <section className="tc-content-grid">
            <article className="tc-panel tc-tickets-panel">
              {dashboardError && (
                <p role="alert" style={{ padding: "16px 20px", color: "#b42318" }}>
                  {dashboardError}
                </p>
              )}
              <div className="tc-panel-header">
                <div>
                  <div className="tc-panel-title-row">
                    <h2>Recent tickets</h2>
                    <span className="tc-panel-count">{tickets.length}</span>
                  </div>
                  <p>Track the latest hardware support requests.</p>
                </div>
                <Link to="/admin/tickets" className="tc-text-link">
                  View all <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="tc-table-wrap">
                <table className="tc-ticket-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Customer</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket) => {
                      const customer = getCustomer(ticket.customer ?? ticket.customerId);
                      const device = [ticket.brand, ticket.model, ticket.deviceType]
                        .filter(Boolean)
                        .join(" ") || "Device not specified";
                      const status = ticket.status.replaceAll("_", " ");
                      return (
                      <tr key={ticket._id}>
                        <td>
                          <div className="tc-ticket-title">
                            <span className="tc-ticket-id">TK-{ticket._id.slice(-6).toUpperCase()}</span>
                            <strong>{ticket.title}</strong>
                            <span className="tc-ticket-device">
                              {device}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="tc-customer-cell">
                            <span className="tc-customer-avatar">
                              {customer.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{customer.name}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`tc-priority tc-priority-${(ticket.priority || "MEDIUM").toLowerCase()}`}
                          >
                            <span />
                            {ticket.priority || "MEDIUM"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`tc-status tc-status-${status.toLowerCase().replaceAll(" ", "-")}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <Link
                            to="/admin/tickets"
                            className="tc-row-action"
                            aria-label={`View ticket ${ticket._id}`}
                          >
                            <ChevronRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    );})}
                    {!loading && recentTickets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="tc-empty">
                          {dashboardError ? "Ticket data is unavailable." : "No tickets have been created yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="tc-panel-footer">
                <span>
                  Showing {recentTickets.length} of {tickets.length} tickets
                </span>
                <Link to="/admin/tickets" className="tc-footer-link">
                  Go to ticket management <ChevronRight size={15} />
                </Link>
              </div>
            </article>

            <article className="tc-panel tc-reports-panel">
              <div className="tc-panel-header">
                <div>
                  <div className="tc-panel-title-row">
                    <h2>Problem reports</h2>
                    <span className="tc-pending-badge">{pendingReports.length} pending</span>
                  </div>
                  <p>Reports waiting for admin review.</p>
                </div>
                <div className="tc-reports-header-icon">
                  <ClipboardList size={19} />
                </div>
              </div>

              <div className="tc-reports-list">
                {problemReports.slice(0, 3).map((report, index) => {
                  const customer = getCustomer(report.customer ?? report.customerId);
                  const device = [report.brand, report.model, report.deviceType]
                    .filter(Boolean)
                    .join(" ") || "Device not specified";
                  return (
                    <div className="tc-report-item" key={report._id}>
                      <div className={`tc-report-device tc-device-${["blue", "orange", "purple"][index % 3]}`}>
                        <ClipboardList size={21} />
                      </div>
                      <div className="tc-report-info">
                        <strong>{report.problem}</strong>
                        <span>{customer.name}</span>
                        <small>{device}</small>
                      </div>
                      <Link
                        to={`/admin/problem-reports/${report._id}`}
                        className="tc-report-action"
                        aria-label={`Review ${report.problem}`}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  );
                })}
                {!loading && problemReports.length === 0 && !dashboardError && (
                  <p className="tc-empty">No customer reports have been submitted yet.</p>
                )}
              </div>

              <Link to="/admin/problem-reports" className="tc-review-all">
                Review all problem reports
                <ArrowUpRight size={17} />
              </Link>
            </article>
          </section>

          <section className="tc-bottom-banner">
            <div className="tc-bottom-banner-icon">
              <Clock3 size={22} />
            </div>
            <div>
              <strong>Keep your support queue moving</strong>
              <p>
                Review pending customer reports and turn approved problems
                into support tickets.
              </p>
            </div>
            <Link to="/admin/problem-reports">
              Open reports <ChevronRight size={17} />
            </Link>
          </section>

          <footer className="tc-dashboard-footer">
            <span>© {new Date().getFullYear()} TechCare Support System</span>
            <span>
              <span className="tc-online-dot" /> All systems operational
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;