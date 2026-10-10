import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function CreateTicket() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("");
  const [agent, setAgent] = useState("");

  /*
   * TEMPORARY REPORT DATA
   *
   * Later this will come from:
   * GET /api/problem-reports/:id
   *
   * PostgreSQL → Prisma → Express → React
   */
  const report = {
    customerName: "Abebe Kebede",
    customerEmail: "abebe@example.com",
    customerPhone: "+251 911 234 567",

    deviceType: "Laptop",
    brand: "Dell",
    model: "Latitude 5490",
    serialNumber: "DL5490-2026-001",
    warrantyStatus: "Under Warranty",

    title: "Laptop is not charging",

    description:
      "The laptop is not charging when the charger is connected. The customer reported that the battery percentage does not increase even though the charging cable is connected. The charging indicator also sometimes disappears.",
  };

  /*
   * TEMPORARY AGENT DATA
   *
   * This is ONLY for testing the page.
   *
   * FINAL VERSION:
   * GET /api/agents
   *
   * Agents will come from PostgreSQL.
   */
  const agents = [
    {
      id: 1,
      name: "Hana Worku",
      specialization: "Laptop & Desktop",
    },
    {
      id: 2,
      name: "Dawit Tesfaye",
      specialization: "Network Devices",
    },
    {
      id: 3,
      name: "Meron Alemu",
      specialization: "Printers",
    },
  ];

  const handleCreateTicket = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
     * Later this will send:
     *
     * POST /api/tickets
     *
     * {
     *   customerId,
     *   agentId,
     *   deviceType,
     *   brand,
     *   model,
     *   serialNumber,
     *   warrantyStatus,
     *   category,
     *   title,
     *   description,
     *   priority
     * }
     */

    alert("Official ticket created successfully!");

    navigate("/admin/tickets");
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-main">

        {/* HEADER */}
        <header className="admin-header">
          <div>
            <h1>Create Official Ticket</h1>
            <p>
              Convert problem report #{id} into an official
              support ticket.
            </p>
          </div>

          <div className="admin-header-right">
            <button className="notification-btn">
              🔔
            </button>

            <div className="header-user">
              <div className="admin-avatar">
                A
              </div>

              <div>
                <strong>Administrator</strong>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </header>

        <section className="page-content">

          {/* BACK */}
          <Link
            to={`/admin/problem-reports/${id}`}
            className="back-link"
          >
            ← Back to Problem Report
          </Link>

          {/* TITLE */}
          <div className="ticket-create-title">
            <div>
              <span className="review-report-label">
                OFFICIAL SUPPORT TICKET
              </span>

              <h2>Create Ticket</h2>

              <p>
                Review the information and complete the
                ticket details.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTicket}>

            <div className="ticket-create-grid">

              {/* LEFT */}
              <div className="ticket-create-main">

                {/* CUSTOMER */}
                <div className="ticket-form-card">

                  <div className="ticket-form-header">
                    <div>
                      <h3>Customer Information</h3>
                      <p>
                        Customer who reported the problem.
                      </p>
                    </div>

                    <span>👤</span>
                  </div>

                  <div className="ticket-info-grid">

                    <div className="ticket-info-item">
                      <span>Full Name</span>
                      <strong>
                        {report.customerName}
                      </strong>
                    </div>

                    <div className="ticket-info-item">
                      <span>Email</span>
                      <strong>
                        {report.customerEmail}
                      </strong>
                    </div>

                    <div className="ticket-info-item">
                      <span>Phone</span>
                      <strong>
                        {report.customerPhone}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* DEVICE */}
                <div className="ticket-form-card">

                  <div className="ticket-form-header">
                    <div>
                      <h3>Device Information</h3>
                      <p>
                        Hardware information from the problem
                        report.
                      </p>
                    </div>

                    <span>💻</span>
                  </div>

                  <div className="ticket-info-grid">

                    <div className="ticket-info-item">
                      <span>Device Type</span>
                      <strong>
                        {report.deviceType}
                      </strong>
                    </div>

                    <div className="ticket-info-item">
                      <span>Brand</span>
                      <strong>
                        {report.brand}
                      </strong>
                    </div>

                    <div className="ticket-info-item">
                      <span>Model</span>
                      <strong>
                        {report.model}
                      </strong>
                    </div>

                    <div className="ticket-info-item">
                      <span>Serial Number</span>
                      <strong>
                        {report.serialNumber}
                      </strong>
                    </div>

                    <div className="ticket-info-item">
                      <span>Warranty Status</span>
                      <strong className="warranty-active">
                        {report.warrantyStatus}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* TICKET DETAILS */}
                <div className="ticket-form-card">

                  <div className="ticket-form-header">
                    <div>
                      <h3>Ticket Details</h3>
                      <p>
                        Information that will be stored in the
                        official ticket.
                      </p>
                    </div>

                    <span>🎫</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">
                      Ticket Title
                    </label>

                    <input
                      id="title"
                      type="text"
                      defaultValue={report.title}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">
                      Problem Description
                    </label>

                    <textarea
                      id="description"
                      defaultValue={report.description}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="ticket-form-two-columns">

                    <div className="form-group">
                      <label htmlFor="category">
                        Category
                      </label>

                      <select
                        id="category"
                        value={category}
                        onChange={(event) =>
                          setCategory(event.target.value)
                        }
                        required
                      >
                        <option value="">
                          Select category
                        </option>

                        <option value="HARDWARE">
                          Hardware
                        </option>

                        <option value="SOFTWARE">
                          Software
                        </option>

                        <option value="NETWORK">
                          Network
                        </option>

                        <option value="PRINTER">
                          Printer
                        </option>

                        <option value="OTHER">
                          Other
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="priority">
                        Priority
                      </label>

                      <select
                        id="priority"
                        value={priority}
                        onChange={(event) =>
                          setPriority(event.target.value)
                        }
                        required
                      >
                        <option value="LOW">
                          Low
                        </option>

                        <option value="MEDIUM">
                          Medium
                        </option>

                        <option value="HIGH">
                          High
                        </option>
                      </select>
                    </div>

                  </div>

                </div>

              </div>

              {/* RIGHT */}
              <aside className="ticket-create-sidebar">

                {/* ASSIGN AGENT */}
                <div className="ticket-form-card">

                  <div className="ticket-form-header">
                    <div>
                      <h3>Assign Support Agent</h3>
                      <p>
                        Choose the agent who will handle this
                        ticket.
                      </p>
                    </div>

                    <span>👨‍💻</span>
                  </div>

                  <div className="form-group">

                    <label htmlFor="agent">
                      Support Agent
                    </label>

                    <select
                      id="agent"
                      value={agent}
                      onChange={(event) =>
                        setAgent(event.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select support agent
                      </option>

                      {agents.map((supportAgent) => (
                        <option
                          key={supportAgent.id}
                          value={supportAgent.id}
                        >
                          {supportAgent.name} —{" "}
                          {supportAgent.specialization}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="agent-info-note">
                    <span>ℹ️</span>

                    <p>
                      The selected support agent will be
                      responsible for troubleshooting and
                      resolving this ticket.
                    </p>
                  </div>

                </div>

                {/* PRIORITY */}
                <div className="ticket-form-card">

                  <div className="ticket-form-header">
                    <div>
                      <h3>Priority</h3>
                      <p>
                        Set the urgency of this ticket.
                      </p>
                    </div>
                  </div>

                  <div className="priority-preview">

                    <span
                      className={`report-priority ${priority.toLowerCase()}`}
                    >
                      {priority}
                    </span>

                    <p>
                      {priority === "HIGH" &&
                        "This ticket requires urgent attention."}

                      {priority === "MEDIUM" &&
                        "This ticket requires normal attention."}

                      {priority === "LOW" &&
                        "This ticket can be handled when available."}
                    </p>

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="ticket-action-card">

                  <button
                    type="submit"
                    className="submit-ticket-btn"
                  >
                    🎫 Create Official Ticket
                  </button>

                  <Link
                    to={`/admin/problem-reports/${id}`}
                    className="cancel-ticket-btn"
                  >
                    Cancel
                  </Link>

                </div>

              </aside>

            </div>

          </form>

        </section>
      </main>
    </div>
  );
}

export default CreateTicket;