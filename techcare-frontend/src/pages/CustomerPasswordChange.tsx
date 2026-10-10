import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import "./CustomerPasswordChange.css";

function CustomerPasswordChange() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setLoading(true);
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

      const savedUser = sessionStorage.getItem("user");
      if (savedUser) {
        const user: unknown = JSON.parse(savedUser);
        if (typeof user === "object" && user !== null) {
          sessionStorage.setItem(
            "user",
            JSON.stringify({ ...user, mustChangePassword: false })
          );
        }
      }

      navigate("/customer/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Check that it is running and try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong while changing your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="customer-password-page">
      <section className="customer-password-card">
        <Link to="/" className="customer-password-brand">
          <span>TC</span>
          <strong>TechCare</strong>
        </Link>
        <p className="customer-password-eyebrow">SECURE YOUR ACCOUNT</p>
        <h1>Choose your own password</h1>
        <p className="customer-password-description">
          Before using your account, replace the temporary password provided
          by the administrator with a password only you know.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="current-password">Temporary password</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />

          <label htmlFor="new-password">Your new password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />

          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {error && <p className="customer-password-error" role="alert">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Saving password..." : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default CustomerPasswordChange;
