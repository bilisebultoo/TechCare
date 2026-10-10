import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./CreateCustomer.css";

function CreateCustomer() {
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

            <form className="create-customer-form">
              <div className="create-customer-fields">
                <div className="create-customer-field">
                  <label htmlFor="customer-name">Full name</label>
                  <input
                    id="customer-name"
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
                    type="tel"
                    placeholder="+251 9XX XXX XXX"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="create-customer-field">
                  <label htmlFor="customer-status">Account status</label>
                  <select id="customer-status" defaultValue="ACTIVE">
                    <option value="ACTIVE">
                      Active
                    </option>
                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="create-customer-note">
                <span aria-hidden="true">i</span>
                <div>
                  <strong>Customer password</strong>
                  <p>
                    The customer will create their own private password.
                    The administrator will never see the customer's password.
                  </p>
                </div>
              </div>

              <div className="create-customer-actions">
                <Link to="/admin/customers" className="create-customer-cancel">
                  Cancel
                </Link>
                <button type="submit" className="create-customer-submit">
                  Create Customer
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