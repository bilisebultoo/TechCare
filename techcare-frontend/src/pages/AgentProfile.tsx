import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import "./AgentProfile.css";

type AgentUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialization?: string;
};

const SPECIALIZATIONS = [
  "Hardware Support",
  "Laptop & Desktop",
  "Printer Support",
  "Mobile Devices",
  "Network & Router",
  "Other",
];

function AgentProfile() {
  const [user, setUser] = useState<AgentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [specializationError, setSpecializationError] = useState("");
  const [specializationSuccess, setSpecializationSuccess] = useState("");
  const [specializationLoading, setSpecializationLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleSpecializationSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSpecializationError("");
    setSpecializationSuccess("");

    const token = getAuthToken();
    if (!token) {
      setSpecializationError("Your session has expired. Please sign in again.");
      return;
    }

    setSpecializationLoading(true);
    try {
      const response = await fetch("/api/auth/specialization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ specialization }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to update specialization (HTTP ${response.status}).`
        );
      }

      if (!user) {
        throw new Error("Your profile information is unavailable. Please reload the page.");
      }

      const updatedUser = { ...user, specialization: data.specialization };
      setUser(updatedUser);
      setSpecialization(data.specialization);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setSpecializationSuccess(data.message || "Your specialization has been updated.");
    } catch (err) {
      setSpecializationError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Check that it is running and try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong while updating your specialization."
      );
    } finally {
      setSpecializationLoading(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setPasswordError("Your session has expired. Please sign in again.");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to change password (HTTP ${response.status}).`
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(data.message || "Your password has been changed successfully.");
    } catch (err) {
      setPasswordError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Check that it is running and try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong while changing your password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

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
        setSpecialization(profile.specialization || "");
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
              <form className="agent-specialization-form" onSubmit={handleSpecializationSave}>
                <div className="profile-password-field">
                  <label htmlFor="agent-profile-specialization">Specialization</label>
                  <select
                    id="agent-profile-specialization"
                    value={specialization}
                    onChange={(event) => setSpecialization(event.target.value)}
                    required
                  >
                    <option value="" disabled>Select your specialization</option>
                    {SPECIALIZATIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                {specializationError && (
                  <p className="profile-password-message profile-password-error" role="alert">
                    {specializationError}
                  </p>
                )}
                {specializationSuccess && (
                  <p className="profile-password-message profile-password-success" role="status">
                    {specializationSuccess}
                  </p>
                )}
                <button
                  type="submit"
                  className="change-password-btn"
                  disabled={specializationLoading || !specialization}
                >
                  {specializationLoading ? "Saving..." : "Save Specialization"}
                </button>
              </form>
            </div>

            <div className="profile-section">
              <h3>Security</h3>
              <div className="security-row">
                <div>
                  <strong>Password</strong>
                  <p>Your password is stored securely and is never displayed here.</p>
                </div>
              </div>
              <form className="profile-password-form" onSubmit={handlePasswordChange}>
                <div className="profile-password-fields">
                  <div className="profile-password-field">
                    <label htmlFor="agent-current-password">Current password</label>
                    <input
                      id="agent-current-password"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div className="profile-password-field">
                    <label htmlFor="agent-new-password">New password</label>
                    <input
                      id="agent-new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div className="profile-password-field">
                    <label htmlFor="agent-confirm-password">Confirm new password</label>
                    <input
                      id="agent-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>
                {passwordError && (
                  <p className="profile-password-message profile-password-error" role="alert">
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p className="profile-password-message profile-password-success" role="status">
                    {passwordSuccess}
                  </p>
                )}
                <button
                  type="submit"
                  className="change-password-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Saving..." : "Change Password"}
                </button>
              </form>
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
