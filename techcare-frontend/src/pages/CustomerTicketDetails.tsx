import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/auth";

type Message = {
  _id: string;
  sender: "CUSTOMER" | "AGENT";
  message: string;
  createdAt: string;
};

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deviceType?: string;
  brand?: string;
  model?: string;
  createdAt: string;
  messages: Message[];
  customerConfirmed: boolean;
  agent?: {
    name?: string;
  } | null;
};

function getToken() {
  return getAuthToken();
}

function CustomerTicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [confirmingSolved, setConfirmingSolved] = useState(false);
  const [messageText, setMessageText] = useState("");
  const customerConfirmed = ticket?.customerConfirmed ?? false;
  const messages = ticket?.messages ?? [];

  useEffect(() => {
    let active = true;

    async function loadTicket() {
      try {
        if (!id) throw new Error("Ticket ID is missing.");
        const token = getToken();
        const response = await fetch(`/api/tickets/${id}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Unable to load ticket (HTTP ${response.status}).`);
        }
        if (!data.ticket || data.ticket._id !== id) {
          throw new Error("The requested ticket was not returned by the server.");
        }
        if (active) {
          setTicket(data.ticket as Ticket);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load this ticket.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTicket();
    const refreshInterval = window.setInterval(() => {
      void loadTicket();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ticket || ticket.status === "CLOSED") return;

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) {
      return;
    }

    setSendingMessage(true);
    setError("");
    try {
      const token = getToken();
      const response = await fetch(`/api/tickets/${ticket._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to send message (HTTP ${response.status}).`);
      }
      if (!data.newMessage) {
        throw new Error("The server did not return the sent message.");
      }

      setTicket((currentTicket) => currentTicket
        ? { ...currentTicket, messages: [...currentTicket.messages, data.newMessage] }
        : currentTicket);
      setMessageText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message to your support agent.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Confirm that the problem is solved
  const handleConfirmSolved = async () => {
    if (!ticket || confirmingSolved || customerConfirmed) return;

    const confirmed = window.confirm(
      "Are you sure your hardware problem has been solved?"
    );
    if (!confirmed) {
      return;
    }

    setConfirmingSolved(true);
    setError("");
    try {
      const token = getToken();
      const response = await fetch(`/api/tickets/${ticket._id}/confirmation`, {
        method: "POST",
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to confirm ticket (HTTP ${response.status}).`);
      }
      if (!data.ticket || data.ticket._id !== ticket._id || data.ticket.status !== "CLOSED") {
        throw new Error("The server did not confirm that the ticket was closed.");
      }
      setTicket(data.ticket as Ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to confirm the problem is solved.");
    } finally {
      setConfirmingSolved(false);
    }
  };

  // Logout
  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="customer-ticket-details-page">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="customer-dashboard-sidebar">

        <div className="customer-sidebar-top">

          <Link
            to="/customer/dashboard"
            className="customer-dashboard-logo"
          >
            <div className="customer-dashboard-logo-icon">
              TC
            </div>

            <div>
              <strong>TechCare</strong>
              <span>Customer Portal</span>
            </div>
          </Link>

          <nav className="customer-dashboard-nav">

            <Link
              to="/customer/dashboard"
              className="customer-dashboard-nav-link"
            >
              <span>▦</span>
              Dashboard
            </Link>

            <Link
              to="/customer/tickets"
              className="customer-dashboard-nav-link active"
            >
              <span>▣</span>
              My Tickets
            </Link>

            <Link
              to="/customer/report-problem"
              className="customer-dashboard-nav-link"
            >
              <span>＋</span>
              Report Problem
            </Link>

            <Link
              to="/customer/profile"
              className="customer-dashboard-nav-link"
            >
              <span>◯</span>
              My Profile
            </Link>

          </nav>
        </div>

        <div className="customer-sidebar-bottom">

          <div className="customer-support-box">
            <strong>Need Help?</strong>

            <p>
              Contact our support team if you
              need additional assistance.
            </p>

            <a href="mailto:support@techcare.com">
              Contact Support →
            </a>
          </div>

          <button
            type="button"
            className="customer-dashboard-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="customer-ticket-details-main">

        {/* =========================================
            TOP BAR
        ========================================= */}

        <header className="customer-ticket-details-topbar">

          <div>
            <p>TECHCARE CUSTOMER PORTAL</p>
            <h1>Ticket Details</h1>
          </div>

          <div className="customer-ticket-user">

            <div className="customer-ticket-user-avatar">
              C
            </div>

            <div>
              <strong>Customer</strong>
              <span>Customer Account</span>
            </div>

          </div>

        </header>


        {/* =========================================
            BACK BUTTON
        ========================================= */}

        <Link
          to="/customer/tickets"
          className="customer-ticket-back"
        >
          ← Back to My Tickets
        </Link>


        {/* =========================================
            TICKET HEADER
        ========================================= */}

        <section className="customer-ticket-header-card">

          <div className="customer-ticket-header-left">

            <div className="customer-ticket-number">
              #{ticket?._id || id || "Ticket"}
            </div>

            <h2>{ticket?.title || "Loading ticket..."}</h2>

            <p>
              {ticket?.createdAt
                ? `Created ${new Date(ticket.createdAt).toLocaleString()}`
                : ""}
            </p>

          </div>

          <div className="customer-ticket-header-right">

            <span className="customer-ticket-priority high">
              {ticket?.priority || "—"}
            </span>

            <span className={`customer-ticket-status ${ticket?.status?.toLowerCase().replace("_", "-") || "in-progress"}`}>
              {ticket?.status?.replace("_", " ") || "—"}
            </span>

          </div>

        </section>


        {/* =========================================
            TICKET INFORMATION
        ========================================= */}

        <section className="customer-ticket-info-grid">

          <div className="customer-ticket-info-card">

            <div className="customer-ticket-info-icon">
              💻
            </div>

            <div>
              <span>DEVICE</span>
              <strong>{[ticket?.brand, ticket?.model].filter(Boolean).join(" ") || "Not specified"}</strong>
              <p>{ticket?.deviceType || "Device details"}</p>
            </div>

          </div>


          <div className="customer-ticket-info-card">

            <div className="customer-ticket-info-icon">
              👨‍💻
            </div>

            <div>
              <span>ASSIGNED AGENT</span>
              <strong>{ticket?.agent?.name || "Support Agent"}</strong>
              <p>TechCare Support Team</p>
            </div>

          </div>


          <div className="customer-ticket-info-card">

            <div className="customer-ticket-info-icon">
              🛠
            </div>

            <div>
              <span>CATEGORY</span>
              <strong>{ticket?.deviceType || "Hardware"}</strong>
              <p>{ticket?.title || "Ticket category"}</p>
            </div>

          </div>

        </section>


        {/* =========================================
            PROBLEM DESCRIPTION
        ========================================= */}

        <section className="customer-ticket-description-card">

          <div className="customer-ticket-section-title">

            <div>
              <span>PROBLEM INFORMATION</span>
              <h2>Problem Description</h2>
            </div>

          </div>

          <div className="customer-problem-box">

            <strong>{ticket?.title || "Problem details"}</strong>

            <p>
              {ticket?.description || "Loading ticket description..."}
            </p>

          </div>

        </section>


        {/* =========================================
            CONVERSATION
        ========================================= */}

        <section className="customer-conversation-card">

          <div className="customer-conversation-header">

            <div>
              <span>SUPPORT CONVERSATION</span>
              <h2>Messages</h2>
            </div>

            <div className="conversation-status">
              {ticket?.status === "CLOSED" ? "● Closed" : "● Live Support"}
            </div>

          </div>

          {ticket?.status === "CLOSED" && (
            <div className="customer-requests-error" role="status">
              This ticket is closed. The conversation is now read-only.
            </div>
          )}

          {error && (
            <div role="alert" className="customer-requests-error">
              {error}
            </div>
          )}

          {/* =========================================
              MESSAGES
          ========================================= */}

          <div className="customer-messages">

            {loading ? (
              <p role="status">Loading conversation...</p>
            ) : messages.length === 0 ? (
              <p>No messages yet. Send a message to start the conversation with your support agent.</p>
            ) : messages.map((message, index) => (

              <div
                key={message._id || `${message.sender}-${index}`}
                className={`customer-message-row ${
                  message.sender === "CUSTOMER"
                    ? "customer-message"
                    : "agent-message"
                }`}
              >

                <div className="customer-message-avatar">
                  {message.sender === "CUSTOMER"
                    ? "C"
                    : "A"}
                </div>

                <div className="customer-message-content">

                  <div className="customer-message-meta">

                    <strong>
                      {message.sender === "CUSTOMER" ? "You" : ticket?.agent?.name || "Support Agent"}
                    </strong>

                    <span>
                      {new Date(message.createdAt).toLocaleString()}
                    </span>

                  </div>

                  <div className="customer-message-bubble">
                    {message.message}
                  </div>

                </div>

              </div>

            ))}

          </div>


          {/* =========================================
              MESSAGE INPUT
          ========================================= */}

          {ticket?.status !== "CLOSED" && !customerConfirmed && (

            <form
              className="customer-message-form"
              onSubmit={handleSendMessage}
            >

              <textarea
                value={messageText}
                onChange={(e) =>
                  setMessageText(e.target.value)
                }
                placeholder="Write a message to your support agent..."
                rows={3}
                disabled={loading || !ticket || sendingMessage}
              />

              <div className="customer-message-actions">

                <span>
                  Your support agent will see this message.
                </span>

                <button
                  type="submit"
                  className="customer-send-message-btn"
                  disabled={loading || !ticket || sendingMessage || !messageText.trim()}
                >
                  {sendingMessage ? "Sending..." : "Send Message →"}
                </button>

              </div>

            </form>

          )}

        </section>


        {/* =========================================
            PROBLEM SOLVED CONFIRMATION
        ========================================= */}

        {!customerConfirmed ? (

          <section className="customer-confirm-card">

            <div className="customer-confirm-icon">
              ✓
            </div>

            <div className="customer-confirm-content">

              <h2>
                Is your problem solved?
              </h2>

              <p>
                Only confirm this after you have
                tested your device and are satisfied
                that the problem has been resolved.
              </p>

            </div>

            <button
              type="button"
              className="customer-confirm-btn"
              onClick={handleConfirmSolved}
              disabled={loading || confirmingSolved || !ticket}
            >
              {confirmingSolved ? "Saving Confirmation..." : "Yes, Problem Is Solved"}
            </button>

          </section>

        ) : (

          <section className="customer-confirmed-card">

            <div className="customer-confirmed-icon">
              ✓
            </div>

            <div>

              <h2>
                Problem Confirmed as Solved
              </h2>

              <p>
                Thank you for confirming. This ticket is now closed.
              </p>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default CustomerTicketDetails;