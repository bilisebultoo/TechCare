
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
  UserRound,
  UserCheck,
  UserX,
  Filter,
  X,
} from "lucide-react";
import "./Customers.css";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  status: "Active" | "Inactive";
};

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Abebe Kebede",
    email: "abebe@gmail.com",
    phone: "+251 911 123 456",
    tickets: 5,
    status: "Active",
  },
  {
    id: 2,
    name: "Hana Worku",
    email: "hana@gmail.com",
    phone: "+251 922 456 789",
    tickets: 2,
    status: "Active",
  },
  {
    id: 3,
    name: "Dawit Tesfaye",
    email: "dawit@gmail.com",
    phone: "+251 933 654 321",
    tickets: 4,
    status: "Active",
  },
  {
    id: 4,
    name: "Meron Alemu",
    email: "meron@gmail.com",
    phone: "+251 944 987 654",
    tickets: 1,
    status: "Active",
  },
  {
    id: 5,
    name: "Sara Mohammed",
    email: "sara@gmail.com",
    phone: "+251 955 321 654",
    tickets: 3,
    status: "Inactive",
  },
];

function Customers() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(searchText) ||
        customer.email.toLowerCase().includes(searchText) ||
        customer.phone.toLowerCase().includes(searchText) ||
        String(customer.id).includes(searchText);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const activeCount = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const inactiveCount = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="tc-customer-management">
      {sidebarOpen && (
        <button
          type="button"
          className="tc-cm-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`tc-cm-sidebar ${
          sidebarOpen ? "tc-cm-sidebar-open" : ""
        }`}
      >
        <Link
          to="/admin/dashboard"
          className="tc-cm-brand"
          onClick={closeSidebar}
        >
          <div className="tc-cm-brand-icon">T</div>
          <div>
            <strong>TechCare</strong>
            <span>HARDWARE SUPPORT</span>
          </div>
          <button
            type="button"
            className="tc-cm-close"
            aria-label="Close menu"
            onClick={(event) => {
              event.preventDefault();
              closeSidebar();
            }}
          >
            <X size={19} />
          </button>
        </Link>

        <div className="tc-cm-nav-label">WORKSPACE</div>

        <nav className="tc-cm-nav">
          <Link to="/admin/dashboard" className="tc-cm-nav-link">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/customers"
            className="tc-cm-nav-link tc-cm-nav-active"
            onClick={closeSidebar}
          >
            <Users size={19} />
            <span>Customers</span>
          </Link>

          <Link to="/admin/agents" className="tc-cm-nav-link">
            <Headset size={19} />
            <span>Support Agents</span>
          </Link>

          <Link to="/admin/problem-reports" className="tc-cm-nav-link">
            <ClipboardList size={19} />
            <span>Problem Reports</span>
          </Link>

          <Link to="/admin/tickets" className="tc-cm-nav-link">
            <Ticket size={19} />
            <span>Tickets</span>
          </Link>
        </nav>

        <div className="tc-cm-nav-label tc-cm-management-label">
          MANAGEMENT
        </div>

        <nav className="tc-cm-nav">
          <Link to="/admin/reports" className="tc-cm-nav-link">
            <ChartNoAxesCombined size={19} />
            <span>Reports</span>
          </Link>

          <Link to="/admin/settings" className="tc-cm-nav-link">
            <Settings size={19} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="tc-cm-sidebar-spacer" />

        <div className="tc-cm-help-card">
          <div className="tc-cm-help-icon">
            <Headset size={20} />
          </div>
          <strong>Need a hand?</strong>
          <p>Keep your support team running smoothly.</p>
          <span>TechCare Admin Panel</span>
        </div>

        <button
          type="button"
          className="tc-cm-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>

        <div className="tc-cm-sidebar-footer">
          <span className="tc-cm-online-dot" />
          System workspace
          <span className="tc-cm-version">v1.0</span>
        </div>
      </aside>

      <main className="tc-cm-main">
        <header className="tc-cm-topbar">
          <div className="tc-cm-topbar-left">
            <button
              type="button"
              className="tc-cm-menu-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="tc-cm-menu-icon">
                <LayoutDashboard size={21} />
              </span>
            </button>

            <div className="tc-cm-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={15} />
              <strong>Customers</strong>
            </div>
          </div>

          <div className="tc-cm-topbar-right">
            <div className="tc-cm-system-label">
              <span className="tc-cm-online-dot" />
              System operational
            </div>

            <button
              type="button"
              className="tc-cm-bell"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="tc-cm-admin">
              <div className="tc-cm-admin-avatar">A</div>
              <div>
                <strong>Administrator</strong>
                <span>System Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="tc-cm-content">
          <section className="tc-cm-heading">
            <div>
              <div className="tc-cm-eyebrow">
                <span />
                CUSTOMER MANAGEMENT
              </div>
              <h1>Customers</h1>
              <p>
                Manage customer accounts and keep track of their support
                activity.
              </p>
            </div>

            <Link
              to="/admin/customers/create"
              className="tc-cm-add-button"
            >
              <Plus size={19} />
              Add Customer
            </Link>
          </section>

          <section className="tc-cm-stats">
            <article className="tc-cm-stat-card">
              <div className="tc-cm-stat-icon tc-cm-blue">
                <Users size={22} />
              </div>
              <div className="tc-cm-stat-details">
                <span>Total customers</span>
                <strong>{customers.length}</strong>
                <small>Customer accounts in this list</small>
              </div>
              <div className="tc-cm-stat-decoration">01</div>
            </article>

            <article className="tc-cm-stat-card">
              <div className="tc-cm-stat-icon tc-cm-green">
                <UserCheck size={22} />
              </div>
              <div className="tc-cm-stat-details">
                <span>Active customers</span>
                <strong>{activeCount}</strong>
                <small>Accounts marked active</small>
              </div>
              <div className="tc-cm-stat-decoration">02</div>
            </article>

            <article className="tc-cm-stat-card">
              <div className="tc-cm-stat-icon tc-cm-orange">
                <UserX size={22} />
              </div>
              <div className="tc-cm-stat-details">
                <span>Inactive customers</span>
                <strong>{inactiveCount}</strong>
                <small>Accounts marked inactive</small>
              </div>
              <div className="tc-cm-stat-decoration">03</div>
            </article>

            <article className="tc-cm-stat-card">
              <div className="tc-cm-stat-icon tc-cm-purple">
                <Ticket size={22} />
              </div>
              <div className="tc-cm-stat-details">
                <span>Total reported tickets</span>
                <strong>
                  {customers.reduce(
                    (total, customer) => total + customer.tickets,
                    0
                  )}
                </strong>
                <small>Sample ticket counts</small>
              </div>
              <div className="tc-cm-stat-decoration">04</div>
            </article>
          </section>

          <section className="tc-cm-table-panel">
            <div className="tc-cm-table-heading">
              <div>
                <div className="tc-cm-table-title">
                  <h2>All customers</h2>
                  <span>{filteredCustomers.length}</span>
                </div>
                <p>Search and manage customer account information.</p>
              </div>

              <div className="tc-cm-total-label">
                <UserRound size={17} />
                {customers.length} sample accounts
              </div>
            </div>

            <div className="tc-cm-toolbar">
              <label className="tc-cm-search">
                <Search size={19} />
                <input
                  type="search"
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search customers"
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

              <label className="tc-cm-filter">
                <Filter size={17} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by customer status"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="tc-cm-table-wrap">
              <table className="tc-cm-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>CONTACT INFORMATION</th>
                    <th>TICKETS</th>
                    <th>ACCOUNT STATUS</th>
                    <th className="tc-cm-action-heading">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => {
                    const initials = customer.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={customer.id}>
                        <td>
                          <div className="tc-cm-customer">
                            <div className="tc-cm-avatar">{initials}</div>
                            <div>
                              <strong>{customer.name}</strong>
                              <span>
                                Customer #{String(customer.id).padStart(3, "0")}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="tc-cm-contact">
                            <a href={`mailto:${customer.email}`}>
                              {customer.email}
                            </a>
                            <span>{customer.phone}</span>
                          </div>
                        </td>

                        <td>
                          <span className="tc-cm-ticket-count">
                            <Ticket size={15} />
                            {customer.tickets}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`tc-cm-status ${
                              customer.status === "Active"
                                ? "tc-cm-status-active"
                                : "tc-cm-status-inactive"
                            }`}
                          >
                            <span />
                            {customer.status}
                          </span>
                        </td>

                        <td>
                          <div className="tc-cm-actions">
                            <Link
                              to={`/admin/customers/${customer.id}`}
                              className="tc-cm-view"
                              aria-label={`View ${customer.name}`}
                              title="View customer"
                            >
                              <Eye size={17} />
                              <span>View</span>
                            </Link>

                            <Link
                              to={`/admin/customers/${customer.id}`}
                              className="tc-cm-edit"
                              aria-label={`Edit ${customer.name}`}
                              title="Open customer details"
                            >
                              <Pencil size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="tc-cm-empty">
                        <Search size={28} />
                        <strong>No customers found</strong>
                        <span>
                          Try another search term or change the status filter.
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

            <div className="tc-cm-table-footer">
              <span>
                Showing {filteredCustomers.length} of {customers.length} sample
                customers
              </span>
              <span className="tc-cm-footer-note">
                <span className="tc-cm-online-dot" />
                Customer directory
              </span>
            </div>
          </section>

          <section className="tc-cm-bottom-note">
            <div className="tc-cm-note-icon">
              <Headset size={21} />
            </div>
            <div>
              <strong>Keep customer support organized</strong>
              <p>
                Create customer accounts and review their support activity from
                one place.
              </p>
            </div>
            <Link to="/admin/customers/create">
              Add a customer <ChevronRight size={17} />
            </Link>
          </section>

          <footer className="tc-cm-footer">
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

export default Customers;