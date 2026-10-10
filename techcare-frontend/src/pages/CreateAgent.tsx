import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import "./CreateAgent.css";

function CreateAgent() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const token = getAuthToken();
      const response = await fetch("/api/auth/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          password: formData.get("password"),
          specialization: formData.get("specialization"),
          isActive: formData.get("status") === "ACTIVE",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to create agent (HTTP ${response.status}).`);
      }

      form.reset();
      setSuccess(data.message || "Agent account created successfully.");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Make sure the backend is running, then try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong while creating the agent account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-agent-page">
      <Sidebar />

      <main className="create-agent-main">
        <header className="create-agent-header">
          <span className="create-agent-eyebrow">TEAM MANAGEMENT</span>
          <h1>Add Support Agent</h1>
          <p>Create a new support agent account.</p>
        </header>

        <section className="create-agent-content">
          <div className="create-agent-card">
            <div className="create-agent-card-header">
              <div className="create-agent-card-icon" aria-hidden="true">
                +
              </div>
              <div>
                <h2>Support agent information</h2>
                <p>Enter the basic information for the new support agent.</p>
              </div>
            </div>

            <form className="create-agent-form" onSubmit={handleCreateAgent} autoComplete="off">
              <div className="create-agent-fields">
                <div className="create-agent-field">
                  <label htmlFor="agent-name">Full name</label>
                  <input
                    id="agent-name"
                    name="name"
                    type="text"
                    placeholder="Enter agent full name"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="create-agent-field">
                  <label htmlFor="agent-email">Email address</label>
                  <input
                    id="agent-email"
                    name="email"
                    type="email"
                    placeholder="agent@techcare.com"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="create-agent-fields">
                <div className="create-agent-field">
                  <label htmlFor="agent-phone">Phone number</label>
                  <input
                    id="agent-phone"
                    name="phone"
                    type="tel"
                    placeholder="+251 9XX XXX XXX"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="create-agent-field">
                  <label htmlFor="agent-specialization">Specialization</label>
                  <select
                    id="agent-specialization"
                    name="specialization"
                    defaultValue="Hardware Support"
                  >
                    <option value="Hardware Support">Hardware Support</option>
                    <option value="Laptop & Desktop">Laptop &amp; Desktop</option>
                    <option value="Printer Support">Printer Support</option>
                    <option value="Mobile Devices">Mobile Devices</option>
                    <option value="Network & Router">Network &amp; Router</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="create-agent-fields create-agent-status-row">
                <div className="create-agent-field">
                  <label htmlFor="agent-status">Account status</label>
                  <select id="agent-status" name="status" defaultValue="ACTIVE">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="create-agent-field create-agent-password">
                <label htmlFor="agent-password">Initial password</label>
                <input
                  id="agent-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className="create-agent-note">
                <span aria-hidden="true">i</span>
                <div>
                  <strong>Agent account security</strong>
                  <p>
                    Set an initial password for this agent. Their account role
                    is stored securely and cannot be changed by editing a password.
                  </p>
                </div>
              </div>

              {error && <p className="create-agent-message create-agent-error" role="alert">{error}</p>}
              {success && (
                <p className="create-agent-message create-agent-success" role="status">
                  {success}
                </p>
              )}

              <div className="create-agent-actions">
                <Link to="/admin/agents" className="create-agent-cancel">
                  Cancel
                </Link>
                <button type="submit" className="create-agent-submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CreateAgent;
