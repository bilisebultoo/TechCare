
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { clearAuthToken } from "../utils/auth";
import {
  LayoutDashboard,
  Users,
  Headset,
  ClipboardList,
  Ticket,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  ChevronRight,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  BriefcaseBusiness,
  Filter,
  X,
  Laptop,
  Printer,
  Smartphone,
  Network,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import "./Agents.css";

type Agent = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  tickets: number;
  status: "Active" | "Inactive";
};

const initialAgents: Agent[] = [
  {
    id: 1,
    name: "Hana Worku",
    email: "hana@techcare.com",
    phone: "+251 911 234 567",
    specialization: "Laptop & Desktop",
    tickets: 12,
    status: "Active",
  },
  {
    id: 2,
    name: "Dawit Tesfaye",
    email: "dawit@techcare.com",
    phone: "+251 922 345 678",
    specialization: "Printer Support",
    tickets: 8,
    status: "Active",
  },
  {
    id: 3,
    name: "Meron Alemu",
    email: "meron@techcare.com",
    phone: "+251 933 456 789",
    specialization: "Mobile Devices",
    tickets: 6,
    status: "Active",
  },
  {
    id: 4,
    name: "Ahmed Ali",
    email: "ahmed@techcare.com",
    phone: "+251 944 567 890",
    specialization: "Network & Router",
    tickets: 10,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Sara Mohammed",
    email: "sara@techcare.com",
    phone: "+251 955 678 901",
    specialization: "Hardware Support",
    tickets: 4,
    status: "Active",
  },
];

function getSpecializationIcon(specialization: string) {
  if (specialization.includes("Laptop")) return Laptop;
  if (specialization.includes("Printer")) return Printer;
  if (specialization.includes("Mobile")) return Smartphone;
  if (specialization.includes("Network")) return Network;
  return Wrench;
}

function Agents() {
  const [agents] = useState<Agent[]>(initialAgents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const query = search.toLowerCase();

      const matchesSearch =
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        agent.phone.toLowerCase().includes(query) ||
        agent.specialization.toLowerCase().includes(query) ||
        String(agent.id).includes(query);

      const matchesStatus =
        statusFilter === "All" || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, search, statusFilter]);

  const activeCount = agents.filter(
    (agent) => agent.status === "Active"
  ).length;

  const inactiveCount = agents.filter(
    (agent) => agent.status === "Inactive"
  ).length;

  const totalTickets = agents.reduce(
    (total, agent) => total + agent.tickets,
    0
  );

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="tc-agent-management">
      {sidebarOpen && (
        <button
          type="button"
          className="tc-ag-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`tc-ag-sidebar ${
          sidebarOpen ? "tc-ag-sidebar-open" : ""
        }`}
      >
        <Link
          to="/admin/dashboard"
          className="tc-ag-brand"
          onClick={closeSidebar}
        >
          <div className="tc-ag-brand-icon">T</div>
          <div className="tc-ag-brand-text">
            <strong>TechCare</strong>
            <span>HARDWARE SUPPORT</span>
          </div>
          <button
            type="button"
            className="tc-ag-close"
            aria-label="Close menu"
            onClick={(event) => {
              event.preventDefault();
              closeSidebar();
            }}
          >
            <X size={19} />
          </button>
        </Link>

        <div className="tc-ag-nav-label">WORKSPACE</div>

        <nav className="tc-ag-navigation">
          <Link to="/admin/dashboard" className="tc-ag-nav-link">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/customers" className="tc-ag-nav-link">
            <Users size={19} />
            <span>Customers</span>
          </Link>

          <Link
            to="/admin/agents"
            className="tc-ag-nav-link tc-ag-nav-active"
            onClick={closeSidebar}
          >
            <Headset size={19} />
            <span>Support Agents</span>
          </Link>

          <Link to="/admin/problem-reports" className="tc-ag-nav-link">
            <ClipboardList size={19} />
            <span>Problem Reports</span>
          </Link>

          <Link to="/admin/tickets" className="tc-ag-nav-link">
            <Ticket size={19} />
            <span>Tickets</span>
          </Link>
        </nav>

        <div className="tc-ag-nav-label tc-ag-management-label">
          MANAGEMENT
        </div>

        <nav className="tc-ag-navigation">
          <Link to="/admin/reports" className="tc-ag-nav-link">
            <ChartNoAxesCombined size={19} />
            <span>Reports</span>
          </Link>

          <Link to="/admin/settings" className="tc-ag-nav-link">
            <Settings size={19} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="tc-ag-sidebar-spacer" />

        <div className="tc-ag-help-card">
          <div className="tc-ag-help-icon">
            <Headset size={20} />
          </div>
          <strong>Need a hand?</strong>
          <p>Keep your support team running smoothly.</p>
          <span>TechCare Admin Panel</span>
        </div>

        <button
          type="button"
          className="tc-ag-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>

        <div className="tc-ag-sidebar-footer">
          <span className="tc-ag-online-dot" />
          System workspace
          <span className="tc-ag-version">v1.0</span>
        </div>
      </aside>

      <main className="tc-ag-main">
        <header className="tc-ag-topbar">
          <div className="tc-ag-topbar-left">
            <button
              type="button"
              className="tc-ag-menu-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <LayoutDashboard size={21} />
            </button>

            <div className="tc-ag-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={15} />
              <strong>Support Agents</strong>
            </div>
          </div>

          <div className="tc-ag-topbar-right">
            <div className="tc-ag-system-label">
              <span className="tc-ag-online-dot" />
              System operational
            </div>

            <button
              type="button"
              className="tc-ag-bell"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="tc-ag-admin">
              <div className="tc-ag-admin-avatar">A</div>
              <div>
                <strong>Administrator</strong>
                <span>System Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="tc-ag-content">
          <section className="tc-ag-heading">
            <div>
              <div className="tc-ag-eyebrow">
                <span />
                TEAM MANAGEMENT
              </div>
              <h1>Support Agents</h1>
              <p>
                Manage your technical support team, specializations, and
                assigned workload.
              </p>
            </div>

            <Link to="/admin/agents/create" className="tc-ag-add-button">
              <Plus size={19} />
              Add Agent
            </Link>
          </section>

          <section className="tc-ag-stats">
            <article className="tc-ag-stat-card">
              <div className="tc-ag-stat-icon tc-ag-blue">
                <Headset size={22} />
              </div>
              <div className="tc-ag-stat-details">
                <span>Total agents</span>
                <strong>{agents.length}</strong>
                <small>Members in this sample list</small>
              </div>
              <div className="tc-ag-stat-watermark">
                <Users size={43} />
              </div>
            </article>

            <article className="tc-ag-stat-card">
              <div className="tc-ag-stat-icon tc-ag-green">
                <UserCheck size={22} />
              </div>
              <div className="tc-ag-stat-details">
                <span>Active agents</span>
                <strong>{activeCount}</strong>
                <small>Marked available</small>
              </div>
              <div className="tc-ag-stat-watermark">
                <ArrowUpRight size={43} />
              </div>
            </article>

            <article className="tc-ag-stat-card">
              <div className="tc-ag-stat-icon tc-ag-orange">
                <UserX size={22} />
              </div>
              <div className="tc-ag-stat-details">
                <span>Inactive agents</span>
                <strong>{inactiveCount}</strong>
                <small>Marked unavailable</small>
              </div>
              <div className="tc-ag-stat-watermark">
                <BriefcaseBusiness size={43} />
              </div>
            </article>

            <article className="tc-ag-stat-card">
              <div className="tc-ag-stat-icon tc-ag-purple">
                <Ticket size={22} />
              </div>
              <div className="tc-ag-stat-details">
                <span>Assigned tickets</span>
                <strong>{totalTickets}</strong>
                <small>Sample workload count</small>
              </div>
              <div className="tc-ag-stat-watermark">
                <ClipboardList size={43} />
              </div>
            </article>
          </section>

          <section className="tc-ag-team-banner">
            <div className="tc-ag-team-banner-icon">
              <Headset size={24} />
            </div>
            <div className="tc-ag-team-banner-text">
              <strong>Your technical support team</strong>
              <p>
                {activeCount} of {agents.length} listed agents are active.
                Review specializations to help organize hardware support
                requests.
              </p>
            </div>
            <div className="tc-ag-avatar-stack" aria-label="Agent initials">
              {agents.slice(0, 4).map((agent) => (
                <span key={agent.id}>
                  {agent.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              ))}
              <small>+{Math.max(agents.length - 4, 0)}</small>
            </div>
          </section>

          <section className="tc-ag-table-panel">
            <div className="tc-ag-table-heading">
              <div>
                <div className="tc-ag-table-title">
                  <h2>All support agents</h2>
                  <span>{filteredAgents.length}</span>
                </div>
                <p>Agent directory and assigned ticket workload.</p>
              </div>

              <div className="tc-ag-directory-label">
                <BriefcaseBusiness size={17} />
                Team directory
              </div>
            </div>

            <div className="tc-ag-toolbar">
              <label className="tc-ag-search">
                <Search size={19} />
                <input
                  type="search"
                  placeholder="Search name, email or specialization..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search support agents"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>

              <label className="tc-ag-filter">
                <Filter size={17} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by agent status"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="tc-ag-table-wrap">
              <table className="tc-ag-table">
                <thead>
                  <tr>
                    <th>SUPPORT AGENT</th>
                    <th>CONTACT INFORMATION</th>
                    <th>SPECIALIZATION</th>
                    <th>WORKLOAD</th>
                    <th>STATUS</th>
                    <th className="tc-ag-action-heading">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAgents.map((agent) => {
                    const initials = agent.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    const SpecializationIcon = getSpecializationIcon(
                      agent.specialization
                    );

                    return (
                      <tr key={agent.id}>
                        <td>
                          <div className="tc-ag-agent-cell">
                            <div className="tc-ag-agent-avatar">
                              {initials}
                            </div>
                            <div>
                              <strong>{agent.name}</strong>
                              <span>
                                Agent #{String(agent.id).padStart(3, "0")}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="tc-ag-contact">
                            <a href={`mailto:${agent.email}`}>
                              {agent.email}
                            </a>
                            <span>{agent.phone}</span>
                          </div>
                        </td>

                        <td>
                          <span className="tc-ag-specialization">
                            <SpecializationIcon size={16} />
                            {agent.specialization}
                          </span>
                        </td>

                        <td>
                          <div className="tc-ag-workload">
                            <div className="tc-ag-workload-top">
                              <strong>{agent.tickets}</strong>
                              <span>tickets</span>
                            </div>
                            <div className="tc-ag-workload-track">
                              <span
                                style={{
                                  width: `${Math.min(
                                    (agent.tickets / 15) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`tc-ag-status ${
                              agent.status === "Active"
                                ? "tc-ag-status-active"
                                : "tc-ag-status-inactive"
                            }`}
                          >
                            <span />
                            {agent.status}
                          </span>
                        </td>

                        <td>
                          <div className="tc-ag-actions">
                            <Link
                              to={`/admin/agents/${agent.id}`}
                              className="tc-ag-view"
                              title="View agent"
                              aria-label={`View ${agent.name}`}
                            >
                              <Eye size={16} />
                              <span>View</span>
                            </Link>
                            <Link
                              to={`/admin/agents/${agent.id}`}
                              className="tc-ag-edit"
                              title="Open agent details"
                              aria-label={`Open ${agent.name} details`}
                            >
                              <Pencil size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredAgents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="tc-ag-empty">
                        <Search size={28} />
                        <strong>No agents found</strong>
                        <span>
                          Try another search or choose a different status.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                          }}
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="tc-ag-table-footer">
              <span>
                Showing {filteredAgents.length} of {agents.length} sample
                agents
              </span>
              <span className="tc-ag-footer-note">
                <span className="tc-ag-online-dot" />
                Support team directory
              </span>
            </div>
          </section>

          <section className="tc-ag-bottom-note">
            <div className="tc-ag-bottom-icon">
              <ClipboardList size={21} />
            </div>
            <div>
              <strong>Organize your support workload</strong>
              <p>
                Keep agent specializations and assigned ticket counts easy to
                review as your team grows.
              </p>
            </div>
            <Link to="/admin/agents/create">
              Add an agent <ChevronRight size={17} />
            </Link>
          </section>

          <footer className="tc-ag-footer">
            <span>
              © {new Date().getFullYear()} TechCare Support System
            </span>
            <span>Admin workspace · v1.0</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Agents;