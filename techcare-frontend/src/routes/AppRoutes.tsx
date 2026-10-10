import CustomerTickets from "../pages/CustomerTickets";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

// ================= PUBLIC =================
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

// ================= CUSTOMER =================
import CustomerDashboard from "../pages/CustomerDashboard";

import CustomerTicketDetails from "../pages/CustomerTicketDetails";
import ReportProblem from "../pages/ReportProblem";
import CustomerProfile from "../pages/CustomerProfile";

// ================= AGENT =================
import AgentDashboard from "../pages/AgentDashboard";
import AgentTickets from "../pages/AgentTickets";
import AgentTicketDetails from "../pages/AgentTicketDetails";
import AgentProfile from "../pages/AgentProfile";

// ================= ADMIN =================
import AdminDashboard from "../pages/AdminDashboard";
import Customers from "../pages/Customers";
import CreateCustomer from "../pages/CreateCustomer";
import Agents from "../pages/Agents";
import CreateAgent from "../pages/CreateAgent";
import AdminTickets from "../pages/AdminTickets";
import ProblemReports from "../pages/ProblemReports";
import ProblemReportReview from "../pages/ProblemReportReview";
import AdminReports from "../pages/AdminReports";
import AdminSettings from "../pages/AdminSettings";
import CustomerPasswordChange from "../pages/CustomerPasswordChange";

function customerMustChangePassword(): boolean {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    return user?.mustChangePassword === true;
  } catch {
    return false;
  }
}

function CustomerPasswordGate() {
  const location = useLocation();
  const mustChangePassword = customerMustChangePassword();
  const isPasswordChangePage = location.pathname === "/customer/change-password";

  if (mustChangePassword && !isPasswordChangePage) {
    return <Navigate to="/customer/change-password" replace />;
  }
  if (!mustChangePassword && isPasswordChangePage) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ================= CUSTOMER ================= */}

      <Route element={<CustomerPasswordGate />}>
        <Route
          path="/customer/change-password"
          element={<CustomerPasswordChange />}
        />
        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customer/tickets"
          element={<CustomerTickets />}
        />

        <Route
          path="/customer/tickets/:id"
          element={<CustomerTicketDetails />}
        />

        <Route
          path="/customer/report-problem"
          element={<ReportProblem />}
        />

        <Route
          path="/customer/profile"
          element={<CustomerProfile />}
        />
      </Route>


      {/* ================= AGENT ================= */}

      <Route
        path="/agent/dashboard"
        element={<AgentDashboard />}
      />

      <Route
        path="/agent/tickets"
        element={<AgentTickets />}
      />

      <Route
        path="/agent/tickets/:id"
        element={<AgentTicketDetails />}
      />

      <Route
        path="/agent/profile"
        element={<AgentProfile />}
      />


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/customers"
        element={<Customers />}
      />

      <Route
        path="/admin/customers/create"
        element={<CreateCustomer />}
      />

      <Route
        path="/admin/agents"
        element={<Agents />}
      />

      <Route
        path="/admin/agents/create"
        element={<CreateAgent />}
      />

      <Route
        path="/admin/tickets"
        element={<AdminTickets />}
      />

      <Route
        path="/admin/problem-reports"
        element={<ProblemReports />}
      />

      <Route
        path="/admin/problem-reports/:id"
        element={<ProblemReportReview />}
      />

      <Route
        path="/admin/reports"
        element={<AdminReports />}
      />

      <Route
        path="/admin/settings"
        element={<AdminSettings />}
      />

    </Routes>
  );
}

export default AppRoutes;