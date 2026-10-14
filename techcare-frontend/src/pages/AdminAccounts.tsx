import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/auth";
import {
  Bell,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  Headset,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Ticket,
  Users,
  X,
} from "lucide-react";
import "./AdminDashboard.css";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "AGENT" | "CUSTOMER";
  isActive: boolean;
  createdAt: string;
};

function AdminAccounts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState<ManagedUser[]>([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountNotice, setAccountNotice] = useState("");
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      try {
        const token = getAuthToken();
        const response = await fetch("/api/auth/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Unable to load accounts (HTTP ${response.status}).`);
        }
        if (!Array.isArray(data.users)) {
          throw new Error("The server returned unexpected account data.");
        }
        if (active) setAccounts(data.users);
      } catch (error) {
        if (active) {
          setAccountError(error instanceof Error ? error.message : "Unable to load accounts.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAccounts();
    return () => {
      active = false;
    };
  }, []);

  const visibleAccounts = accounts.filter((account) =>
    `${account.name} ${account.email} ${account.phone} ${account.role}`
      .toLowerCase()
      .includes(accountSearch.trim().toLowerCase())
  );

  const handleRoleChange = async (account: ManagedUser, role: ManagedUser["role"]) => {
    if (account.role === role) return;
    setUpdatingAccountId(account.id);
    setAccountError("");
    setAccountNotice("");

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/auth/users/${account.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Unable to update account role (HTTP ${response.status}).`);
      }
      if (data.user?.id !== account.id || data.user.role !== role) {
        throw new Error("The server did not confirm the account role change.");
      }
      setAccounts((current) =>
        current.map((item) => item.id === account.id ? { ...item, role } : item)
      );
      setAccountNotice(`${account.name}'s role is now ${role === "AGENT" ? "Agent" : "Customer"}.`);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Unable to update account role.");
    } finally {
      setUpdatingAccountId(null);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/login";
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="tc-admin">
      {sidebarOpen && (
        <button
          type="button"
          className="tc-sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside className={`tc-sidebar ${sidebarOpen ? "tc-sidebar-open" : ""}`}>
        <Link to="/admin/dashboard" className="tc-brand" onClick={closeSidebar}>
          <div className="tc-brand-icon">T</div>
          <div className="tc-brand-text">
            <strong>TechCare</strong>
            <span>HARDWARE SUPPORT</span>
          </div>
          <button
            type="button"
            className="tc-mobile-close"
            aria-label="Close menu"
            onClick={(event) => {
              event.preventDefault();
              closeSidebar();
            }}
          >
            <X size={19} />
          </button>
        </Link>

        <div className="tc-menu-label">WORKSPACE</div>
        <nav className="tc-navigation">
          <Link to="/admin/dashboard" className="tc-nav-link" onClick={closeSidebar}>
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/customers" className="tc-nav-link" onClick={closeSidebar}>
            <Users size={19} />
            <span>Customers</span>
          </Link>
          <Link to="/admin/agents" className="tc-nav-link" onClick={closeSidebar}>
            <Headset size={19} />
            <span>Support Agents</span>
          </Link>
          <Link to="/admin/problem-reports" className="tc-nav-link" onClick={closeSidebar}>
            <ClipboardList size={19} />
            <span>Problem Reports</span>
          </Link>
          <Link to="/admin/tickets" className="tc-nav-link" onClick={closeSidebar}>
            <Ticket size={19} />
            <span>Tickets</span>
          </Link>
        </nav>

        <div className="tc-menu-label tc-management-label">MANAGEMENT</div>
        <nav className="tc-navigation">
          <Link to="/admin/reports" className="tc-nav-link" onClick={closeSidebar}>
            <ChartNoAxesCombined size={19} />
            <span>Reports</span>
          </Link>
          <Link to="/admin/settings" className="tc-nav-link" onClick={closeSidebar}>
            <Settings size={19} />
            <span>Settings</span>
          </Link>
          <Link to="/admin/accounts" className="tc-nav-link tc-nav-active" onClick={closeSidebar}>
            <Users size={19} />
            <span>Account Management</span>
          </Link>
        </nav>

        <div className="tc-sidebar-spacer" />
        <div className="tc-support-card">
          <div className="tc-support-icon"><Headset size={20} /></div>
          <strong>Need a hand?</strong>
          <p>Keep your support team running smoothly.</p>
          <span>TechCare Admin Panel</span>
        </div>
        <button type="button" className="tc-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
        <div className="tc-sidebar-footer">
          <span className="tc-online-dot" />
          System workspace
          <span className="tc-version">v1.0</span>
        </div>
      </aside>

      <main className="tc-main">
        <header className="tc-topbar">
          <div className="tc-topbar-left">
            <button
              type="button"
              className="tc-menu-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="tc-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={15} />
              <strong>Account Management</strong>
            </div>
          </div>
          <div className="tc-topbar-actions">
            <button
              type="button"
              className="tc-notification"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
              <span />
            </button>
            <div className="tc-profile">
              <div className="tc-profile-avatar">A</div>
              <div className="tc-profile-info">
                <strong>Administrator</strong>
                <span>System Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="tc-dashboard-content">
          <section className="tc-welcome-row">
            <div>
              <div className="tc-eyebrow">
                <span className="tc-eyebrow-dot" />
                ADMINISTRATION
              </div>
              <h1>Account management</h1>
              <p>Manage customer and agent access for your TechCare workspace.</p>
            </div>
          </section>

          <section className="tc-panel tc-accounts-panel">
            <div className="tc-panel-header tc-accounts-header">
              <div>
                <div className="tc-panel-title-row">
                  <h2>Accounts</h2>
                  <span className="tc-panel-count">{accounts.length}</span>
                </div>
                <p>New signups start as customers. Assign customer or agent access here.</p>
              </div>
              <label className="tc-account-search">
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search accounts..."
                  aria-label="Search accounts"
                  value={accountSearch}
                  onChange={(event) => setAccountSearch(event.target.value)}
                />
              </label>
            </div>

            {accountError && (
              <p className="tc-account-message tc-account-error" role="alert">{accountError}</p>
            )}
            {accountNotice && (
              <p className="tc-account-message tc-account-success" role="status">{accountNotice}</p>
            )}

            <div className="tc-table-wrap">
              <table className="tc-ticket-table tc-account-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Account role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAccounts.map((account) => (
                    <tr key={account.id}>
                      <td><strong>{account.name}</strong></td>
                      <td>{account.email}</td>
                      <td>{account.phone}</td>
                      <td>
                        <select
                          className="tc-account-role"
                          aria-label={`Role for ${account.name}`}
                          value={account.role}
                          disabled={updatingAccountId === account.id}
                          onChange={(event) => {
                            const role = event.target.value;
                            if (role === "AGENT" || role === "CUSTOMER") {
                              void handleRoleChange(account, role);
                            }
                          }}
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="AGENT">Agent</option>
                        </select>
                      </td>
                      <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!loading && visibleAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="tc-empty">
                        {accountError
                          ? "Account data is unavailable."
                          : accounts.length
                            ? "No accounts match your search."
                            : "No registered accounts yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminAccounts;
