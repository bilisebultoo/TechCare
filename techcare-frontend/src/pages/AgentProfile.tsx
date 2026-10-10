import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import "./AgentProfile.css";

type AgentUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
};

function AgentProfile() {
  const [user, setUser] = useState<AgentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = getAuthToken();

    void Promise.resolve()
      .then(() => {
        if (!token) {
          throw new Error("Please sign in again to view your profile.");
        }
        return fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `Unable to load your profile (HTTP ${response.status}).`
          );
        }
        if (!data.user?.name || !data.user?.email || data.user.role !== "AGENT") {
          throw new Error("This account does not have an Agent profile.");
        }
        return data.user as AgentUser;
      })
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        sessionStorage.setItem("user", JSON.stringify(profile));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof TypeError
            ? "Cannot reach the TechCare server. Check that it is running and try again."
            : err instanceof Error
              ? err.message
              : "Something went wrong while loading your profile."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/agent/dashboard" className="profile-logo">
          <div className="profile-logo-icon">TC</div>
          <div>
            <strong>TechCare</strong>
            <span>Agent Portal</span>
          </div>
        </Link>
        <Link to="/agent/dashboard" className="profile-back">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="profile-main">
        <div className="profile-title">
          <p>TECHCARE ACCOUNT</p>
          <h1>My Profile</h1>
          <span>View your Agent account information.</span>
        </div>

        {error && (
          <div className="profile-load-error" role="alert">
            <p>{error}</p>
            {error.includes("sign in") && <Link to="/login">Go to sign in</Link>}
          </div>
        )}

        {loading ? (
          <div className="profile-loading" role="status">
            Loading your profile...
          </div>
        ) : user ? (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-avatar">{initials}</div>
              <div>
                <h2>{user.name}</h2>
                <p>Agent Account</p>
              </div>
            </div>

            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Full Name</label>
                  <div className="profile-value">{user.name}</div>
                </div>
                <div className="profile-field">
                  <label>Email Address</label>
                  <div className="profile-value">{user.email}</div>
                </div>
                <div className="profile-field">
                  <label>Phone Number</label>
                  <div className="profile-value">{user.phone || "Not provided"}</div>
                </div>
                <div className="profile-field">
                  <label>Account Type</label>
                  <div className="profile-value">Agent</div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Security</h3>
              <div className="security-row">
                <div>
                  <strong>Password</strong>
                  <p>Your password is stored securely and is never displayed here.</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <Link to="/agent/dashboard" className="profile-cancel-btn">
                Back
              </Link>
            </div>
          </div>
        ) : (
          !error && (
            <div className="profile-load-error" role="alert">
              Your profile information is unavailable.
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default AgentProfile;
