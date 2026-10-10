
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Headset,
  ClipboardList,
  Ticket,
  ChartNoAxesCombined,
  Settings,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";
import { clearAuthToken } from "../utils/auth";

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">T</div>

        <div className="logo-text">
          <h2>TechCare</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="menu-title">MAIN MENU</p>

        <NavLink to="/admin/dashboard" className="sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/customers" className="sidebar-link">
          <Users size={20} />
          <span>Customers</span>
        </NavLink>

        <NavLink to="/admin/agents" className="sidebar-link">
          <Headset size={20} />
          <span>Support Agents</span>
        </NavLink>

        <NavLink to="/admin/problem-reports" className="sidebar-link">
          <ClipboardList size={20} />
          <span>Problem Reports</span>
        </NavLink>

        <NavLink to="/admin/tickets" className="sidebar-link">
          <Ticket size={20} />
          <span>Tickets</span>
        </NavLink>

        <p className="menu-title second-title">MANAGEMENT</p>

        <NavLink to="/admin/reports" className="sidebar-link">
          <ChartNoAxesCombined size={20} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/admin/settings" className="sidebar-link">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Admin profile and logout */}
      <div className="sidebar-bottom">
        <div className="admin-user">
          <div className="admin-avatar">A</div>

          <div className="admin-user-info">
            <strong>Administrator</strong>
            <span>Admin</span>
          </div>
        </div>

        <button type="button" onClick={handleLogout} className="logout-link">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;