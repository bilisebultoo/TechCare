import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/auth";
import { AlertCircle, ClipboardList, RefreshCw } from "lucide-react";
import "./CustomerTickets.css";

type ProblemReport = {
  _id: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  problem?: string;
  status?: "PENDING" | "REVIEWED" | "CONVERTED";
  createdAt?: string;
  ticketId?: string;
};

function CustomerDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    let active = true;
    const token = getAuthToken();

    void fetch("/api/problem-reports/my", {
      headers: token ? { Authorization: "Bearer " + token } : {},
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `Unable to load your reports (HTTP ${response.status}).`
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
          setReportsError(
            err instanceof TypeError
              ? "Cannot reach the TechCare server. Make sure the backend is running, then try again."
              : err instanceof Error
              ? err.message
              : "Something went wrong while loading your reports."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingReports(false);
      });

    return () => {
      active = false;
    };
  }, []);

const handleLogout = () => {
  clearAuthToken();
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");

  navigate("/login");
};
  const pendingReports = reports.filter(
    (report) => !report.status || report.status === "PENDING"
  ).length;
  const reviewedReports = reports.filter(
    (report) => report.status === "REVIEWED"
  ).length;
  const convertedReports = reports.filter(
    (report) => report.status === "CONVERTED"
  ).length;

  return (
    <div className="customer-dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="customer-sidebar">

        {/* LOGO */}
        <Link to="/" className="dashboard-logo">

          <div className="dashboard-logo-icon">
            TC
          </div>

          <div>
            <strong>TechCare</strong>
            <span>Hardware Support</span>
          </div>

        </Link>


        {/* NAVIGATION */}
        <nav className="dashboard-nav">

          <p className="nav-title">
            MAIN MENU
          </p>

          <Link
            to="/customer/dashboard"
            className="dashboard-nav-link active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/customer/tickets"
            className="dashboard-nav-link"
          >
            <span>▣</span>
            My Tickets
          </Link>

          <Link
            to="/customer/report-problem"
            className="dashboard-nav-link"
          >
            <span>＋</span>
            Report Problem
          </Link>


          <p className="nav-title second-title">
            ACCOUNT
          </p>

          <Link
            to="/customer/profile"
            className="dashboard-nav-link"
          >
            <span>◯</span>
            My Profile
          </Link>

        </nav>


        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

          <div className="support-box">

            <div className="support-icon">
              ?
            </div>

            <div>
              <strong>Need help?</strong>
              <p>Our support team is here.</p>
            </div>

          </div>


          <button
  type="button"
  className="logout-link"
  onClick={handleLogout}
>
  <span>↪</span>
  Logout
</button>

        </div>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="customer-main">

        {/* TOP BAR */}
        <header className="customer-topbar">

          <div>
            <p className="page-label">
              CUSTOMER PORTAL
            </p>

            <h2>
              Dashboard
            </h2>
          </div>


          <div className="customer-user">

            <div className="notification">
              ♢
            </div>

            <div className="user-avatar">
              C
            </div>

            <div className="user-info">
              <strong>Customer</strong>
              <span>Customer Account</span>
            </div>

          </div>

        </header>


        {/* =========================
            WELCOME SECTION
        ========================= */}
        <section className="dashboard-welcome">

          <div className="welcome-content">

            <p className="welcome-small">
              WELCOME BACK 👋
            </p>

            <h1>
              How can we help you today?
            </h1>

            <p>
              Report a hardware problem, check your support
              tickets, or communicate with our support team.
            </p>

            <Link
              to="/customer/report-problem"
              className="report-problem-btn"
            >
              <span>＋</span>
              Report a Problem
            </Link>

          </div>


          <div className="welcome-decoration">

            <div className="decoration-circle circle-one"></div>
            <div className="decoration-circle circle-two"></div>
            <div className="decoration-circle circle-three"></div>

            <div className="laptop-icon">
              💻
            </div>

          </div>

        </section>


        {/* =========================
            STATISTICS
        ========================= */}
        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon blue">
              ◫
            </div>

            <div>
              <span>Pending Review</span>
              <strong>{loadingReports ? "—" : pendingReports}</strong>
            </div>

            <small>
              Awaiting review
            </small>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              ◷
            </div>

            <div>
              <span>Reviewed</span>
              <strong>{loadingReports ? "—" : reviewedReports}</strong>
            </div>

            <small>
              Reviewed by support
            </small>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Converted</span>
              <strong>{loadingReports ? "—" : convertedReports}</strong>
            </div>

            <small>
              Moved to a support ticket
            </small>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              #
            </div>

            <div>
              <span>Total Reports</span>
              <strong>{loadingReports ? "—" : reports.length}</strong>
            </div>

            <small>
              All your reports
            </small>

          </div>

        </section>


        {/* =========================
            LOWER CONTENT
        ========================= */}
        <section className="dashboard-grid">

          {/* RECENT TICKETS */}
          <div className="dashboard-card tickets-card">

            <div className="card-header">

              <div>
                <h3>Recent Problem Reports</h3>

                <p>
                  Track your submitted hardware problems
                </p>
              </div>

              <Link to="/customer/tickets">
                View All
              </Link>

            </div>


            {reportsError ? (
              <div className="customer-requests-error" role="alert">
                <AlertCircle size={18} />
                <span>{reportsError}</span>
              </div>
            ) : loadingReports ? (
              <div className="customer-requests-state">
                <RefreshCw size={22} className="customer-requests-spin" />
                Loading your problem reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="empty-tickets">
                <div className="empty-icon">✓</div>
                <h4>No problem reports yet</h4>
                <p>You haven't submitted any hardware problem reports yet.</p>
                <Link to="/customer/report-problem" className="empty-action">
                  Report Your First Problem →
                </Link>
              </div>
            ) : (
              <div className="customer-requests-list">
                {reports.slice(0, 3).map((report) => {
                  const status = report.status ?? "PENDING";
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
                        {report.createdAt && (
                          <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                        )}
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

          </div>


          {/* QUICK ACTIONS */}
          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h3>Quick Actions</h3>

                <p>
                  Frequently used options
                </p>
              </div>

            </div>


            <div className="quick-actions">

              <Link
                to="/customer/report-problem"
                className="quick-action"
              >

                <div className="quick-icon blue">
                  +
                </div>

                <div>
                  <strong>Report a Problem</strong>

                  <span>
                    Submit a new hardware issue
                  </span>
                </div>

                <b>→</b>

              </Link>


              <Link
                to="/customer/tickets"
                className="quick-action"
              >

                <div className="quick-icon purple">
                  ▣
                </div>

                <div>
                  <strong>View My Tickets</strong>

                  <span>
                    Check your support requests
                  </span>
                </div>

                <b>→</b>

              </Link>


              <Link
                to="/customer/profile"
                className="quick-action"
              >

                <div className="quick-icon green">
                  ◯
                </div>

                <div>
                  <strong>My Profile</strong>

                  <span>
                    Manage your account
                  </span>
                </div>

                <b>→</b>

              </Link>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CustomerDashboard;