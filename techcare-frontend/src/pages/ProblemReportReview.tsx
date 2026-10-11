import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import { AlertCircle, ArrowLeft, Check, Clock3, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./ProblemReportReview.css";

type ReportStatus = "PENDING" | "REVIEWED" | "CONVERTED";
type Customer = {
  name?: string;
  email?: string;
  phone?: string;
};

type ProblemReport = {
  _id: string;
  customerId?: Customer | string | null;
  customer?: Customer | string | null;
  deviceType?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  problem?: string;
  description?: string;
  status?: ReportStatus;
  createdAt?: string;
  ticketId?: string;
  assignedAgent?: Pick<Agent, "id" | "name" | "email" | "specialization"> | null;
};

type Agent = {
  id: string;
  name: string;
  email: string;
  specialization?: string;
};

const API_URL = "/api";

function getToken() {
  return getAuthToken();
}

function getCustomer(report: ProblemReport): Customer {
  const customer = report.customer ?? report.customerId;
  return customer && typeof customer === "object" ? customer : {};
}

function getStatus(status?: string): ReportStatus {
  if (status === "REVIEWED" || status === "CONVERTED") return status;
  return "PENDING";
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function ProblemReportReview() {
  const { id } = useParams();
  const [report, setReport] = useState<ProblemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const token = getToken();
    void Promise.resolve()
      .then(() => {
        if (!id) throw new Error("The problem report ID is missing.");
        return fetch(`${API_URL}/problem-reports/${id}`, {
          headers: token ? { Authorization: "Bearer " + token } : {},
        });
      })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message ||
              `Unable to load this problem report (HTTP ${response.status}).`
          );
        }
        const item = data.problemReport ?? data.report ?? data;
        if (!item || typeof item !== "object" || !item._id) {
          throw new Error("The server returned an invalid problem report.");
        }
        return item as ProblemReport;
      })
      .then((item) => {
        if (active) setReport(item);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the problem report."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    const token = getToken();
    void fetch(`${API_URL}/auth/agents`, {
      headers: token ? { Authorization: "Bearer " + token } : {},
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Unable to load agents (HTTP ${response.status}).`);
        }
        return data.agents as Agent[];
      })
      .then((items) => {
        if (active) setAgents(items);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load agents.");
        }
      })
      .finally(() => {
        if (active) setAgentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(status: ReportStatus) {
    if (!report || status === getStatus(report.status)) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/problem-reports/${report._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to update report status (HTTP ${response.status}).`);
      }
      setReport((current) => current ? { ...current, ...(data.problemReport ?? { status }) } : current);
      setNotice("Report status updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while updating the report.");
    } finally {
      setSaving(false);
    }
  }

  async function assignReport() {
    if (!report || !selectedAgentId) {
      setError("Select an active agent before assigning this report.");
      return;
    }

    setAssigning(true);
    setError("");
    setNotice("");
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/problem-reports/${report._id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ agentId: selectedAgentId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to assign report (HTTP ${response.status}).`);
      }

      const assignedAgent = agents.find((agent) => agent.id === selectedAgentId);
      setReport((current) => current ? {
        ...current,
        ...(data.problemReport ?? { status: "CONVERTED" }),
        ticketId: data.ticket?._id,
        assignedAgent: data.ticket?.agent ?? (assignedAgent
          ? {
              id: assignedAgent.id,
              name: assignedAgent.name,
              email: assignedAgent.email,
              specialization: assignedAgent.specialization,
            }
          : null),
      } : current);
      setNotice(`Ticket assigned to ${assignedAgent?.name ?? "the selected agent"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while assigning the report.");
    } finally {
      setAssigning(false);
    }
  }

  const customer = report ? getCustomer(report) : {};
  const status = report ? getStatus(report.status) : "PENDING";

  return (
    <div className="admin-layout problem-report-review-page">
      <Sidebar />
      <main className="admin-main problem-report-review-main">
        <header className="pvr-header">
          <div>
            <span className="pvr-eyebrow">WORKSPACE / PROBLEM REPORTS</span>
            <h1>Review Problem Report</h1>
            <p>Review the customer's hardware issue and report details.</p>
          </div>
          <Link to="/admin/problem-reports" className="pvr-back-link">
            <ArrowLeft size={16} />
            All reports
          </Link>
        </header>

        {error && (
          <div className="pvr-alert" role="alert">
            <AlertCircle size={19} />
            <div>
              <strong>Unable to complete this action</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {notice && (
          <div className="pvr-notice" role="status">
            <Check size={18} />
            {notice}
          </div>
        )}

        {loading ? (
          <div className="pvr-state">
            <RefreshCw size={22} className="pvr-spin" />
            <span>Loading problem report...</span>
          </div>
        ) : report ? (
          <>
            <section className="pvr-summary">
              <div className="pvr-summary-icon"><FileText size={22} /></div>
              <div className="pvr-summary-copy">
                <span>PROBLEM REPORT</span>
                <h2>#{report._id.slice(-6).toUpperCase()}</h2>
                <p>Submitted {formatDate(report.createdAt)}</p>
              </div>
              <span className={`pvr-status pvr-status-${status.toLowerCase()}`}>
                {status === "PENDING" ? "Pending review" : status.toLowerCase()}
              </span>
            </section>

            <div className="pvr-grid">
              <div className="pvr-details">
                <section className="pvr-card">
                  <div className="pvr-card-heading">
                    <div>
                      <h2>Customer details</h2>
                      <p>Information about the customer who submitted this report.</p>
                    </div>
                  </div>
                  <div className="pvr-detail-grid">
                    <div><span>Full name</span><strong>{customer.name || "Not provided"}</strong></div>
                    <div><span>Email address</span><strong>{customer.email || "Not provided"}</strong></div>
                    <div><span>Phone number</span><strong>{customer.phone || "Not provided"}</strong></div>
                  </div>
                </section>

                <section className="pvr-card">
                  <div className="pvr-card-heading">
                    <div>
                      <h2>Device information</h2>
                      <p>Hardware information supplied with the report.</p>
                    </div>
                  </div>
                  <div className="pvr-detail-grid">
                    <div><span>Device type</span><strong>{report.deviceType || "Not provided"}</strong></div>
                    <div><span>Brand</span><strong>{report.brand || "Not provided"}</strong></div>
                    <div><span>Model</span><strong>{report.model || "Not provided"}</strong></div>
                    <div><span>Serial number</span><strong>{report.serialNumber || "Not provided"}</strong></div>
                  </div>
                </section>

                <section className="pvr-card">
                  <div className="pvr-card-heading">
                    <div>
                      <h2>Problem description</h2>
                      <p>Details of the issue reported by the customer.</p>
                    </div>
                  </div>
                  <div className="pvr-problem">
                    <strong>{report.problem || "Problem not specified"}</strong>
                    <p>{report.description || "No additional description provided."}</p>
                  </div>
                </section>
              </div>

              <aside className="pvr-actions">
                <section className="pvr-card">
                  <div className="pvr-card-heading">
                    <div>
                      <h2>Report status</h2>
                      <p>Save the review status to the report.</p>
                    </div>
                  </div>
                  <div className="pvr-status-actions">
                    {(["PENDING", "REVIEWED"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`pvr-status-button ${status === value ? "selected" : ""}`}
                        onClick={() => void updateStatus(value)}
                        disabled={saving}
                      >
                        <span>{value === "PENDING" ? <Clock3 size={17} /> : <Check size={17} />}</span>
                        <span>{value === "PENDING" ? "Pending" : "Reviewed"}</span>
                        {status === value && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                  {saving && <p className="pvr-saving">Saving status...</p>}
                </section>

                <section className="pvr-card">
                  <div className="pvr-card-heading">
                    <div>
                      <h2>Assign to an agent</h2>
                      <p>Convert this report into a support ticket for an active agent.</p>
                    </div>
                  </div>
                  {status === "CONVERTED" ? (
                    <div className="pvr-assignment-details">
                      <p className="pvr-assignment-complete">
                        This report has already been converted into a ticket.
                      </p>
                      <div className="pvr-assigned-agent">
                        <span>Assigned agent</span>
                        <strong>{report.assignedAgent?.name || "No agent information available"}</strong>
                        {report.assignedAgent?.email && (
                          <span>{report.assignedAgent.email}</span>
                        )}
                        <span>Specialization</span>
                        <strong>{report.assignedAgent?.specialization || "Not specified"}</strong>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="pvr-agent-label" htmlFor="pvr-agent">
                        Support agent
                      </label>
                      <select
                        id="pvr-agent"
                        className="pvr-agent-select"
                        value={selectedAgentId}
                        onChange={(event) => setSelectedAgentId(event.target.value)}
                        disabled={agentsLoading || assigning}
                      >
                        <option value="">
                          {agentsLoading ? "Loading agents..." : "Choose an agent"}
                        </option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} - {agent.specialization || "Specialization not specified"} ({agent.email})
                          </option>
                        ))}
                      </select>
                      {!agentsLoading && agents.length === 0 && (
                        <p className="pvr-saving">No active agents are available.</p>
                      )}
                      <button
                        type="button"
                        className="pvr-assign-button"
                        onClick={() => void assignReport()}
                        disabled={assigning || agentsLoading || agents.length === 0}
                      >
                        {assigning ? "Assigning..." : "Assign and create ticket"}
                      </button>
                    </>
                  )}
                </section>

                <section className="pvr-secure-note">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Admin review</strong>
                    <p>Status changes are saved to the problem report.</p>
                  </div>
                </section>
              </aside>
            </div>
          </>
        ) : (
          <div className="pvr-state pvr-state-error">
            <AlertCircle size={22} />
            <span>The problem report could not be found.</span>
            <Link to="/admin/problem-reports">Return to reports</Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProblemReportReview;
