import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import "./CreateCustomer.css";

function CreateCustomer() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const token = getAuthToken();

    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          password: formData.get("password"),
          isActive: formData.get("status") === "ACTIVE",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to create customer (HTTP ${response.status}).`
        );
      }

      form.reset();
      setSuccess(data.message || "Customer account created successfully.");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Make sure the backend is running, then try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong while creating the customer account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-customer-page">

      <Sidebar />

      <main className="create-customer-main">

        <header className="create-customer-header">
          <div>
            <span className="create-customer-eyebrow">CUSTOMER MANAGEMENT</span>
            <h1>Add Customer</h1>
            <p>Create a new customer account.</p>
          </div>
        </header>

        <section className="create-customer-content">
          <div className="create-customer-card">
            <div className="create-customer-card-header">
              <div className="create-customer-card-icon" aria-hidden="true">
                +
              </div>
              <div>
                <h2>Customer information</h2>
                <p>Enter the customer's basic contact information.</p>
              </div>
            </div>

            <form className="create-customer-form" onSubmit={handleCreateCustomer} autoComplete="off">
              <div className="create-customer-fields">
                <div className="create-customer-field">
                  <label htmlFor="customer-name">Full name</label>
                  <input
                    id="customer-name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="create-customer-field">
                  <label htmlFor="customer-email">Email address</label>
                  <input
                    id="customer-email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="create-customer-fields">
                <div className="create-customer-field">
                  <label htmlFor="customer-phone">Phone number</label>
                  <input
                    id="customer-phone"
                    name="phone"
                    type="tel"
                    placeholder="+251 9XX XXX XXX"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="create-customer-field">
                  <label htmlFor="customer-status">Account status</label>
                  <select id="customer-status" name="status" defaultValue="ACTIVE">
                    <option value="ACTIVE">
                      Active
                    </option>
                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="create-customer-field create-customer-password">
                <label htmlFor="customer-password">Initial password</label>
                <input
                  id="customer-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className="create-customer-note">
                <span aria-hidden="true">i</span>
                <div>
                  <strong>Temporary customer password</strong>
                  <p>
                    The customer must replace this password with one only they
                    know the first time they sign in.
                  </p>
                </div>
              </div>

              {error && (
                <p className="create-customer-message create-customer-error" role="alert">
                  {error}
                </p>
              )}
              {success && (
                <p className="create-customer-message create-customer-success" role="status">
                  {success}
                </p>
              )}

              <div className="create-customer-actions">
                <Link to="/admin/customers" className="create-customer-cancel">
                  Cancel
                </Link>
                <button type="submit" className="create-customer-submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CreateCustomer;