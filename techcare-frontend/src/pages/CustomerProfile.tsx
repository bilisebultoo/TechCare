import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";

type ProfileUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  mustChangePassword?: boolean;
};

function CustomerProfile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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

      if (!user) {
        throw new Error("Your profile information is unavailable. Please reload the page.");
      }

      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
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
        if (!data.user?.name || !data.user?.email || !data.user?.role) {
          throw new Error("The server returned incomplete profile information.");
        }
        return data.user as ProfileUser;
      })
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        sessionStorage.setItem("user", JSON.stringify(profile));
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof TypeError
              ? "Cannot reach the TechCare server. Check that it is running and try again."
              : err instanceof Error
                ? err.message
                : "Something went wrong while loading your profile."
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
        <Link to="/customer/dashboard" className="profile-logo">
          <div className="profile-logo-icon">TC</div>
          <div>
            <strong>TechCare</strong>
            <span>Hardware Support</span>
          </div>
        </Link>
        <Link to="/customer/dashboard" className="profile-back">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="profile-main">
        <div className="profile-title">
          <p>TECHCARE ACCOUNT</p>
          <h1>My Profile</h1>
          <span>View your TechCare account information.</span>
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
                <p>{user.role.charAt(0) + user.role.slice(1).toLowerCase()} Account</p>
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
                  <div className="profile-value">
                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </div>
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
              <form className="profile-password-form" onSubmit={handlePasswordChange}>
                <div className="profile-password-fields">
                  <div className="profile-password-field">
                    <label htmlFor="profile-current-password">Current password</label>
                    <input
                      id="profile-current-password"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div className="profile-password-field">
                    <label htmlFor="profile-new-password">New password</label>
                    <input
                      id="profile-new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div className="profile-password-field">
                    <label htmlFor="profile-confirm-password">Confirm new password</label>
                    <input
                      id="profile-confirm-password"
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
              <Link to="/customer/dashboard" className="profile-cancel-btn">
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

export default CustomerProfile;
