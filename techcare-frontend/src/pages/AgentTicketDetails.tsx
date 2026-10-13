import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/auth";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketMessage = {
  _id?: string;
  sender: "CUSTOMER" | "AGENT";
  message: string;
  createdAt?: string | Date;
};
type ReportAttachment = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
};
type InternalTicketMessage = {
  _id: string;
  sender: "ADMIN" | "AGENT";
  senderName: string;
  message: string;
  createdAt?: string;
  attachments: {
    _id: string;
    originalName: string;
    mimeType: string;
    size: number;
  }[];
};

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deviceType?: string;
  brand?: string;
  model?: string;
  customerConfirmed?: boolean;
  messages?: TicketMessage[];
  sourceReportId?: {
    _id: string;
    attachments: ReportAttachment[];
  } | string | null;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
};

function getToken() {
  return getAuthToken();
}

function AgentTicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [statusNotice, setStatusNotice] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [attachmentError, setAttachmentError] = useState("");
  const [internalMessages, setInternalMessages] = useState<InternalTicketMessage[]>([]);
  const [internalMessageText, setInternalMessageText] = useState("");
  const [internalMessageError, setInternalMessageError] = useState("");
  const [sendingInternalMessage, setSendingInternalMessage] = useState(false);
  const [internalMessageFiles, setInternalMessageFiles] = useState<File[]>([]);
  const [internalAttachmentUrls, setInternalAttachmentUrls] = useState<Record<string, string>>({});
  const ticketRequestId = useRef(0);
  const statusUpdateInProgress = useRef(false);
  const reportAttachmentMetadata = JSON.stringify(
    ticket?.sourceReportId && typeof ticket.sourceReportId === "object"
      ? {
          reportId: ticket.sourceReportId._id,
          attachments: ticket.sourceReportId.attachments,
        }
      : null
  );
  const internalAttachmentSignature = JSON.stringify(
    internalMessages.flatMap((message) =>
      (message.attachments ?? []).map((attachment) => ({
        ticketId: ticket?._id,
        messageId: message._id,
        attachmentId: attachment._id,
      }))
    )
  );

  useEffect(() => {
    const sourceReport = JSON.parse(reportAttachmentMetadata) as {
      reportId: string;
      attachments: ReportAttachment[];
    } | null;
    if (!sourceReport) return;
    const sourceReportId = sourceReport.reportId;
    const attachments = sourceReport.attachments;
    if (attachments.length === 0) return;

    let active = true;
    const objectUrls: string[] = [];
    async function loadAttachments() {
      try {
        const token = getToken();
        const entries: [string, string][] = [];
        for (const attachment of attachments) {
          const response = await fetch(
            `/api/problem-reports/${sourceReportId}/attachments/${attachment._id}`,
            { headers: token ? { Authorization: "Bearer " + token } : {} }
          );
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `Unable to load ${attachment.originalName}.`);
          }
          const url = URL.createObjectURL(await response.blob());
          objectUrls.push(url);
          entries.push([attachment._id, url]);
        }
        if (active) {
          setAttachmentUrls(Object.fromEntries(entries));
          setAttachmentError("");
        }
      } catch (err) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        if (active) {
          setAttachmentError(
            err instanceof Error ? err.message : "Unable to load report attachments."
          );
        }
      }
    }

    void loadAttachments();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [reportAttachmentMetadata]);

  useEffect(() => {
    if (!ticket?._id) return;
    let active = true;
    const loadMessages = async () => {
      try {
        const token = getToken();
        const response = await fetch(`/api/tickets/${ticket._id}/internal-messages`, {
          cache: "no-store",
          headers: token ? { Authorization: "Bearer " + token } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Unable to load admin conversation (HTTP ${response.status}).`);
        }
        if (!Array.isArray(data.messages)) {
          throw new Error("The server returned an invalid admin conversation.");
        }
        if (active) {
          setInternalMessages(data.messages);
          setInternalMessageError("");
        }
      } catch (err) {
        if (active) {
          setInternalMessageError(
            err instanceof Error ? err.message : "Unable to load admin conversation."
          );
        }
      }
    };

    void loadMessages();
    const interval = window.setInterval(() => void loadMessages(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [ticket?._id]);

  useEffect(() => {
    const attachments = JSON.parse(internalAttachmentSignature) as {
      ticketId?: string;
      messageId: string;
      attachmentId: string;
    }[];
    if (attachments.length === 0) return;

    let active = true;
    const objectUrls: string[] = [];
    async function loadInternalAttachments() {
      try {
        const token = getToken();
        const entries: [string, string][] = [];
        for (const attachment of attachments) {
          if (!attachment.ticketId) continue;
          const response = await fetch(
            `/api/tickets/${attachment.ticketId}/internal-messages/${attachment.messageId}/attachments/${attachment.attachmentId}`,
            { headers: token ? { Authorization: "Bearer " + token } : {} }
          );
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Unable to load a team-chat file.");
          }
          const key = `${attachment.messageId}:${attachment.attachmentId}`;
          const url = URL.createObjectURL(await response.blob());
          objectUrls.push(url);
          entries.push([key, url]);
        }
        if (active) setInternalAttachmentUrls(Object.fromEntries(entries));
      } catch (err) {
        if (active) {
          setInternalMessageError(
            err instanceof Error ? err.message : "Unable to load team-chat files."
          );
        }
      }
    }

    void loadInternalAttachments();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [internalAttachmentSignature]);

  useEffect(() => {
    let active = true;
    async function loadTicket() {
      if (statusUpdateInProgress.current) return;
      const requestId = ++ticketRequestId.current;
      try {
        if (!id) throw new Error("Ticket ID is missing.");
        const token = getToken();
        const response = await fetch(`/api/tickets/${id}`, {
          cache: "no-store",
          headers: token ? { Authorization: "Bearer " + token } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Unable to load ticket (HTTP ${response.status}).`);
        }
        if (!data.ticket || data.ticket._id !== id) {
          throw new Error("The requested ticket was not returned by the server.");
        }
        if (active && requestId === ticketRequestId.current) {
          setTicket(data.ticket as Ticket);
          setError("");
        }
      } catch (err) {
        if (active && requestId === ticketRequestId.current) {
          setError(err instanceof Error ? err.message : "Unable to load this ticket.");
        }
      } finally {
        if (active && requestId === ticketRequestId.current) setLoading(false);
      }
    }

    void loadTicket();
    const refreshInterval = window.setInterval(() => {
      void loadTicket();
    }, 5000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadTicket();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [id]);

  async function updateStatus(status: TicketStatus) {
    if (
      !ticket ||
      status === ticket.status ||
      statusUpdateInProgress.current ||
      (status === "CLOSED" && !ticket.customerConfirmed)
    ) return;

    statusUpdateInProgress.current = true;
    ticketRequestId.current += 1;
    setSavingStatus(true);
    setError("");
    setStatusNotice("");
    try {
      const token = getToken();
      const response = await fetch(`/api/tickets/${ticket._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to update ticket (HTTP ${response.status}).`);
      }
      if (!data.ticket || data.ticket._id !== ticket._id || data.ticket.status !== status) {
        throw new Error("The server did not confirm the requested ticket status.");
      }
      setTicket(data.ticket as Ticket);
      setStatusNotice(status === "CLOSED" ? "Ticket and conversation closed successfully." : "Ticket status updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update ticket status.");
    } finally {
      statusUpdateInProgress.current = false;
      setSavingStatus(false);
    }
  }

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket || ticket.status === "CLOSED") return;

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    setSendingMessage(true);
    setError("");

    try {
      const token = getToken();
      const response = await fetch(`/api/tickets/${ticket._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ message: trimmedMessage, sender: "AGENT" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to send the message (HTTP ${response.status}).`);
      }

      setTicket((currentTicket) => {
        if (!currentTicket) return currentTicket;
        const updatedMessages = data.ticket?.messages ?? [
          ...(currentTicket.messages ?? []),
          data.newMessage ?? {
            sender: "AGENT",
            message: trimmedMessage,
            createdAt: new Date().toISOString(),
          },
        ];
        return { ...currentTicket, messages: updatedMessages };
      });
      setMessageText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message to customer.");
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleSendInternalMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket || ticket.status === "CLOSED") return;

    const message = internalMessageText.trim();
    if (!message && internalMessageFiles.length === 0) return;

    setSendingInternalMessage(true);
    setInternalMessageError("");
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("message", message);
      internalMessageFiles.forEach((file) => formData.append("attachments", file));
      const response = await fetch(`/api/tickets/${ticket._id}/internal-messages`, {
        method: "POST",
        headers: token ? { Authorization: "Bearer " + token } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to send message (HTTP ${response.status}).`);
      }
      setInternalMessages((current) => [...current, data.newMessage]);
      setInternalMessageText("");
      setInternalMessageFiles([]);
    } catch (err) {
      setInternalMessageError(
        err instanceof Error ? err.message : "Unable to send a message to the admin."
      );
    } finally {
      setSendingInternalMessage(false);
    }
  }

  function handleLogout() {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  }

  const device = ticket
    ? [ticket.brand, ticket.model, ticket.deviceType]
        .filter((part): part is string => Boolean(part))
        .join(" ")
    : "";
  const customerName = ticket?.customer?.name || "Customer";
  const statusLabel = ticket?.status === "IN_PROGRESS"
    ? "In Progress"
    : ticket?.status === "CLOSED"
      ? "Closed"
      : ticket?.status;
  const messages = ticket?.messages ?? [];
  const problemReportAttachments = JSON.parse(reportAttachmentMetadata) as {
    reportId: string;
    attachments: ReportAttachment[];
  } | null;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fc", display: "flex" }}>
      <aside style={{
        width: 245, minHeight: "100vh", background: "#fff",
        borderRight: "1px solid #e5eaf0", padding: "25px 18px",
        boxSizing: "border-box", position: "fixed", left: 0, top: 0,
      }}>
        <Link to="/agent/dashboard" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none", color: "#20252d", marginBottom: 40,
        }}>
          <div className="agent-ticket-brand-icon" style={{
            width: 40, height: 40, background: "#1677ff", color: "#fff",
            borderRadius: 10, display: "grid", placeItems: "center", fontWeight: 800,
          }}>TC</div>
          <div><strong style={{ display: "block", fontSize: 19 }}>TechCare</strong>
            <span style={{ color: "#929aaa", fontSize: 12 }}>Agent Portal</span></div>
        </Link>
        <nav style={{ display: "grid", gap: 6 }}>
          <Link to="/agent/dashboard" style={navStyle}>▦ &nbsp; Dashboard</Link>
          <Link to="/agent/tickets" style={{ ...navStyle, background: "#eaf3ff", color: "#1677ff" }}>
            ▣ &nbsp; My Tickets
          </Link>
          <Link to="/agent/profile" style={navStyle}>◯ &nbsp; My Profile</Link>
        </nav>
        <button type="button" onClick={handleLogout} style={{
          position: "absolute", bottom: 25, left: 18, right: 18, padding: 12,
          border: 0, background: "#fff1f1", color: "#e55353", borderRadius: 8,
          cursor: "pointer", textAlign: "left",
        }}>↪ &nbsp; Logout</button>
      </aside>

      <main style={{
        marginLeft: 245, width: "calc(100% - 245px)",
        padding: "0 40px 60px", boxSizing: "border-box",
      }}>
        <header style={{
          minHeight: 95, display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: "1px solid #e7ebf0",
        }}>
          <div>
            <p style={{ margin: "0 0 6px", color: "#1677ff", fontSize: 11, fontWeight: 700 }}>
              TECHCARE AGENT PORTAL
            </p>
            <h1 style={{ margin: 0, fontSize: 27, color: "#20252d" }}>Ticket Details</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: "#eaf3ff",
              color: "#1677ff", display: "grid", placeItems: "center", fontWeight: 700,
            }}>A</div>
            <div><strong style={{ display: "block", fontSize: 14 }}>Support Agent</strong>
              <span style={{ color: "#929aaa", fontSize: 12 }}>Agent Account</span></div>
          </div>
        </header>

        <Link to="/agent/tickets" style={{
          display: "inline-block", marginTop: 25, marginBottom: 20,
          color: "#697586", textDecoration: "none", fontSize: 14, fontWeight: 600,
        }}>← Back to My Tickets</Link>

        {error && <div role="alert" style={alertStyle}>{error}</div>}
        {statusNotice && <div role="status" style={successStyle}>{statusNotice}</div>}
        {loading ? (
          <section style={cardStyle}>Loading ticket details...</section>
        ) : ticket ? (
          <>
            <section style={{
              ...cardStyle, padding: 25, display: "flex",
              justifyContent: "space-between", gap: 20,
            }}>
              <div>
                <span style={{ color: "#1677ff", fontSize: 13, fontWeight: 800 }}>#{ticket._id}</span>
                <h2 style={{ margin: "8px 0", color: "#252a32", fontSize: 25 }}>{ticket.title}</h2>
                <p style={{ margin: 0, color: "#929aaa", fontSize: 13 }}>Customer: {customerName}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={badgeStyle}>{ticket.priority}</span>
                <span style={badgeStyle}>{statusLabel}</span>
              </div>
            </section>

            <section style={{
              display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 15, marginTop: 15,
            }}>
              <InfoCard title="DEVICE" value={device || "Not specified"} description={ticket.deviceType || "Device"} />
              <InfoCard title="CUSTOMER" value={customerName} description={ticket.customer?.email || "Customer account"} />
              <InfoCard title="CATEGORY" value={ticket.deviceType || "Hardware"} description={ticket.title} />
            </section>

            <section style={{ ...cardStyle, padding: 25, marginTop: 15 }}>
              <p style={{ margin: "0 0 7px", color: "#1677ff", fontSize: 10, fontWeight: 800 }}>
                PROBLEM INFORMATION
              </p>
              <h2 style={{ margin: "0 0 18px", fontSize: 19, color: "#303640" }}>Problem Description</h2>
              <div style={{ padding: 18, background: "#f8fafc", borderRadius: 8 }}>
                <strong style={{ display: "block", marginBottom: 8, color: "#303640", fontSize: 14 }}>
                  {ticket.title}
                </strong>
                <p style={{ margin: 0, color: "#687384", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {ticket.description}
                </p>
              </div>
              {problemReportAttachments && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#303640" }}>
                    Customer attachments
                  </h3>
                  {attachmentError && (
                    <p role="alert" style={{ color: "#b42318", fontSize: 14 }}>
                      {attachmentError}
                    </p>
                  )}
                  {problemReportAttachments.attachments.length === 0 ? (
                    <p style={{ color: "#929aaa", fontSize: 14 }}>
                      No files were attached to the original problem report.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {problemReportAttachments.attachments.map((attachment) => {
                        const url = attachmentUrls[attachment._id];
                        return (
                          <div key={attachment._id} style={{ display: "grid", gap: 6 }}>
                            {url && attachment.mimeType.startsWith("image/") && (
                              <img
                                src={url}
                                alt={attachment.originalName}
                                style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain", objectPosition: "left" }}
                              />
                            )}
                            {url ? (
                              <a href={url} target="_blank" rel="noreferrer">
                                {attachment.originalName}
                              </a>
                            ) : (
                              <span style={{ color: "#687384", fontSize: 14 }}>
                                {attachment.originalName} (loading...)
                              </span>
                            )}
                            <small style={{ color: "#929aaa" }}>
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section style={{ ...cardStyle, padding: "22px 25px", marginTop: 15 }}>
              <h2 style={{ margin: "0 0 15px", fontSize: 18, color: "#303640" }}>Update Ticket Status</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {(["OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => void updateStatus(value)}
                    disabled={savingStatus || ticket.status === "CLOSED"}
                    style={statusButton(ticket.status === value)}
                  >
                    {value === "IN_PROGRESS" ? "In Progress" : value === "RESOLVED" ? "Resolved" : "Open"}
                  </button>
                ))}
              </div>
              {savingStatus && <p style={{ color: "#929aaa", fontSize: 13 }}>Saving status...</p>}
            </section>

            <section style={{ ...cardStyle, marginTop: 15, overflow: "hidden" }}>
              <div style={{ padding: "22px 25px", borderBottom: "1px solid #edf0f4" }}>
                <p style={{ margin: "0 0 6px", color: "#1677ff", fontSize: 10, fontWeight: 800 }}>
                  CUSTOMER COMMUNICATION
                </p>
                <h2 style={{ margin: 0, fontSize: 19, color: "#303640" }}>
                  Conversation{ticket.status === "CLOSED" ? " (Closed)" : ""}
                </h2>
              </div>

              <div style={{ padding: 25, display: "grid", gap: 16 }}>
                {messages.length === 0 ? (
                  <div style={{ color: "#929aaa", fontSize: 13 }}>
                    No messages have been added to this ticket yet.
                  </div>
                ) : (
                  messages.map((item, index) => {
                    const isAgent = item.sender === "AGENT";
                    const sentAt = item.createdAt
                      ? new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now";

                    return (
                      <div
                        key={item._id || `${item.sender}-${index}`}
                        style={{
                          display: "flex",
                          justifyContent: isAgent ? "flex-end" : "flex-start",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            background: isAgent ? "#1677ff" : "#e9eefb",
                            color: isAgent ? "#fff" : "#566174",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {isAgent ? "A" : "C"}
                        </div>
                        <div
                          style={{
                            maxWidth: "72%",
                            background: isAgent ? "#eaf3ff" : "#f6f8fb",
                            color: "#303640",
                            borderRadius: 10,
                            padding: "12px 14px",
                            border: "1px solid #edf0f4",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                            <strong style={{ fontSize: 13 }}>
                              {isAgent ? "Support Agent" : customerName}
                            </strong>
                            <span style={{ fontSize: 11, color: "#929aaa" }}>{sentAt}</span>
                          </div>
                          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {item.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {ticket.status === "CLOSED" ? (
                  <div role="status" style={closedConversationStyle}>
                    This ticket is closed. The conversation is now read-only.
                  </div>
                ) : <form onSubmit={handleSendMessage} style={{ display: "grid", gap: 10 }}>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Write a message to the customer..."
                    rows={3}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      border: "1px solid #dfe5ec",
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontSize: 13,
                      color: "#303640",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={sendingMessage || !messageText.trim()}
                      style={{
                        padding: "10px 16px",
                        border: 0,
                        borderRadius: 8,
                        background: sendingMessage || !messageText.trim() ? "#c4d9ff" : "#1677ff",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: sendingMessage || !messageText.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {sendingMessage ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>}
              </div>
            </section>

            <section style={{ ...cardStyle, marginTop: 15, overflow: "hidden" }}>
              <div style={{ padding: "22px 25px", borderBottom: "1px solid #edf0f4" }}>
                <p style={{ margin: "0 0 6px", color: "#1677ff", fontSize: 10, fontWeight: 800 }}>
                  PRIVATE TEAM CHAT
                </p>
                <h2 style={{ margin: 0, fontSize: 19, color: "#303640" }}>
                  Conversation with Admin
                </h2>
                <p style={{ margin: "6px 0 0", color: "#929aaa", fontSize: 12 }}>
                  These messages are private and are not visible to the customer.
                </p>
              </div>
              <div style={{ padding: 25, display: "grid", gap: 12 }}>
                {internalMessageError && (
                  <div role="alert" style={alertStyle}>{internalMessageError}</div>
                )}
                {internalMessages.length === 0 ? (
                  <div style={{ color: "#929aaa", fontSize: 13 }}>
                    No admin messages yet.
                  </div>
                ) : internalMessages.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      justifySelf: item.sender === "AGENT" ? "end" : "start",
                      maxWidth: "80%",
                      padding: "12px 14px",
                      border: "1px solid #edf0f4",
                      borderRadius: 10,
                      background: item.sender === "AGENT" ? "#eaf3ff" : "#f6f8fb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                      <strong style={{ fontSize: 13 }}>
                        {item.senderName} ({item.sender === "ADMIN" ? "Admin" : "You"})
                      </strong>
                      <span style={{ fontSize: 11, color: "#929aaa" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}
                      </span>
                    </div>
                    {item.message && (
                      <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {item.message}
                      </div>
                    )}
                    {(item.attachments ?? []).map((attachment) => {
                      const url = internalAttachmentUrls[`${item._id}:${attachment._id}`];
                      return url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          key={attachment._id}
                          style={{ display: "grid", gap: 6, marginTop: 8, color: "#1677ff", fontSize: 13 }}
                        >
                          {attachment.mimeType.startsWith("image/") && (
                            <img
                              src={url}
                              alt={attachment.originalName}
                              style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain", objectPosition: "left" }}
                            />
                          )}
                          {attachment.originalName}
                        </a>
                      ) : (
                        <span key={attachment._id} style={{ display: "block", fontSize: 13 }}>
                          {attachment.originalName} (loading...)
                        </span>
                      );
                    })}
                  </div>
                ))}

                {ticket.status === "CLOSED" ? (
                  <div role="status" style={closedConversationStyle}>
                    This ticket is closed. The team conversation is read-only.
                  </div>
                ) : (
                  <form onSubmit={(event) => void handleSendInternalMessage(event)} style={{ display: "grid", gap: 10 }}>
                    <textarea
                      value={internalMessageText}
                      onChange={(event) => setInternalMessageText(event.target.value)}
                      placeholder="Reply to the admin..."
                      rows={3}
                      maxLength={5000}
                      style={{
                        width: "100%",
                        resize: "vertical",
                        border: "1px solid #dfe5ec",
                        borderRadius: 8,
                        padding: "12px 14px",
                        fontSize: 13,
                        color: "#303640",
                        boxSizing: "border-box",
                      }}
                    />
                    <label style={{ color: "#1677ff", fontSize: 13, fontWeight: 650 }}>
                      Attach files
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,.pdf,.doc,.docx,.txt"
                        onChange={(event) => {
                          const files = Array.from(event.target.files ?? []);
                          if (internalMessageFiles.length + files.length > 5) {
                            setInternalMessageError("You can attach up to 5 files per message.");
                          } else if (files.some((file) => file.size > 10 * 1024 * 1024)) {
                            setInternalMessageError("Each attachment must be 10 MB or smaller.");
                          } else {
                            setInternalMessageError("");
                            setInternalMessageFiles((current) => [...current, ...files]);
                          }
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {internalMessageFiles.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 20, color: "#687384", fontSize: 13 }}>
                        {internalMessageFiles.map((file, index) => (
                          <li key={`${file.name}-${index}`}>
                            {file.name}{" "}
                            <button
                              type="button"
                              onClick={() => setInternalMessageFiles((files) => files.filter((_, fileIndex) => fileIndex !== index))}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="submit"
                        disabled={sendingInternalMessage || (!internalMessageText.trim() && internalMessageFiles.length === 0)}
                        style={{
                          padding: "10px 16px",
                          border: 0,
                          borderRadius: 8,
                          background: sendingInternalMessage || (!internalMessageText.trim() && internalMessageFiles.length === 0) ? "#c4d9ff" : "#1677ff",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: sendingInternalMessage || (!internalMessageText.trim() && internalMessageFiles.length === 0) ? "not-allowed" : "pointer",
                        }}
                      >
                        {sendingInternalMessage ? "Sending..." : "Reply to Admin"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            <section style={{
              ...cardStyle, marginTop: 15, padding: "22px 25px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
            }}>
              <div>
                <h2 style={{ margin: "0 0 6px", color: "#303640", fontSize: 16 }}>
                  Customer Confirmation
                </h2>
                <p style={{ margin: 0, color: "#929aaa", fontSize: 12 }}>
                  {ticket.customerConfirmed
                    ? ticket.status === "CLOSED"
                      ? "The customer confirmed the problem is solved. This ticket is closed."
                      : "The customer confirmed the problem is solved. You can now close this ticket."
                    : "The customer must confirm the problem is solved before the ticket can be closed."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void updateStatus("CLOSED")}
                disabled={!ticket.customerConfirmed || savingStatus || ticket.status === "CLOSED"}
                title={ticket.customerConfirmed
                  ? "Close this ticket."
                  : "Customer confirmation is required before closing this ticket."}
                style={{
                  padding: "10px 16px", border: 0, borderRadius: 7,
                  background: ticket.customerConfirmed && ticket.status !== "CLOSED" ? "#1677ff" : "#e8ebef",
                  color: ticket.customerConfirmed && ticket.status !== "CLOSED" ? "#fff" : "#7b8491",
                  fontSize: 11, fontWeight: 700,
                  cursor: ticket.customerConfirmed && ticket.status !== "CLOSED" && !savingStatus
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                {savingStatus ? "Closing..." : ticket.status === "CLOSED" ? "Ticket Closed" : "Close Ticket"}
              </button>
            </section>
          </>
        ) : (
          <section style={cardStyle}>Ticket not found or it is not assigned to your account.</section>
        )}
      </main>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div style={{ ...cardStyle, padding: 20 }}>
      <span style={{ display: "block", marginBottom: 8, color: "#929aaa", fontSize: 10, fontWeight: 800 }}>
        {title}
      </span>
      <strong style={{ display: "block", marginBottom: 5, color: "#303640", fontSize: 14 }}>
        {value}
      </strong>
      <p style={{ margin: 0, color: "#929aaa", fontSize: 11 }}>{description}</p>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5eaf0",
  borderRadius: 12,
} as const;

const alertStyle = {
  marginBottom: 15,
  padding: 14,
  border: "1px solid #ffcaca",
  borderRadius: 8,
  background: "#fff1f1",
  color: "#b42318",
  fontSize: 14,
} as const;

const successStyle = {
  marginBottom: 15,
  padding: 14,
  border: "1px solid #b7e4c7",
  borderRadius: 8,
  background: "#effaf2",
  color: "#207548",
  fontSize: 14,
} as const;

const closedConversationStyle = {
  padding: 14,
  border: "1px solid #dfe5ec",
  borderRadius: 8,
  background: "#f7f9fc",
  color: "#687384",
  fontSize: 13,
} as const;

const navStyle = {
  display: "block",
  padding: "12px 14px",
  borderRadius: 8,
  textDecoration: "none",
  color: "#687384",
  fontSize: 13,
  fontWeight: 600,
} as const;

function statusButton(active: boolean) {
  return {
    padding: "9px 14px",
    border: active ? "1px solid #1677ff" : "1px solid #dfe5ec",
    borderRadius: 7,
    background: active ? "#1677ff" : "#fff",
    color: active ? "#fff" : "#697586",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  } as const;
}

const badgeStyle = {
  padding: "7px 11px",
  background: "#eaf3ff",
  color: "#1677ff",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 800,
} as const;

export default AgentTicketDetails;
