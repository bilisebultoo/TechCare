import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { clearAuthToken, getAuthToken } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import "./AdminSettings.css";

function AdminSettings() {
  const navigate = useNavigate();
  const hasActiveSession = Boolean(getAuthToken());

  function handleLogout() {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="admin-layout admin-settings-page">
      <Sidebar />
      <main className="admin-settings-main">
        <header className="as-header">
          <span className="as-eyebrow">WORKSPACE / SETTINGS</span>
          <h1>Settings</h1>
          <p>Manage your administrator account and sign-in session.</p>
        </header>

        <section className="as-panel" aria-labelledby="as-account-title">
          <div className="as-panel-heading">
            <div className="as-heading-icon"><UserRound size={20} /></div>
            <div>
              <h2 id="as-account-title">Administrator account</h2>
              <p>Account access for the TechCare admin workspace.</p>
            </div>
          </div>
          <div className="as-detail">
            <span>Role</span>
            <strong>Administrator</strong>
          </div>
          <div className="as-detail">
            <span>Sign-in status</span>
            <strong className={hasActiveSession ? "as-session-active" : "as-session-inactive"}>
              {hasActiveSession ? "Active session" : "No active session"}
            </strong>
          </div>
        </section>

        <section className="as-panel" aria-labelledby="as-security-title">
          <div className="as-panel-heading">
            <div className="as-heading-icon"><ShieldCheck size={20} /></div>
            <div>
              <h2 id="as-security-title">Session and security</h2>
              <p>End your current session when you are finished managing support.</p>
            </div>
          </div>
          <div className="as-action-row">
            <div className="as-action-icon"><KeyRound size={19} /></div>
            <div className="as-action-copy">
              <strong>Sign out of TechCare</strong>
              <span>Your saved login credentials will be removed from this browser.</span>
            </div>
            <button type="button" className="as-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </section>

        <section className="as-panel as-shortcuts" aria-labelledby="as-shortcuts-title">
          <div className="as-panel-heading">
            <div className="as-heading-icon"><LayoutDashboard size={20} /></div>
            <div>
              <h2 id="as-shortcuts-title">Workspace</h2>
              <p>Go back to your admin overview.</p>
            </div>
          </div>
          <button
            type="button"
            className="as-workspace-link"
            onClick={() => navigate("/admin/dashboard")}
          >
            Open admin dashboard <ArrowRight size={17} />
          </button>
        </section>
      </main>
    </div>
  );
}

export default AdminSettings;
