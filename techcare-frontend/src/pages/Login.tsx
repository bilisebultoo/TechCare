
import { useState, type FormEvent } from "react";
import { clearAuthToken, setAuthToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user?.role) {
        throw new Error("The server did not return a login token and user role.");
      }

      clearAuthToken();
      setAuthToken(data.token, data.user.role);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "AGENT") {
        navigate("/agent/dashboard");
      } else if (data.user.role === "CUSTOMER") {
        navigate("/customer/dashboard");
      } else {
        clearAuthToken();
        throw new Error("Unknown account role.");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Make sure the backend is running, then try again."
          : err instanceof Error
          ? err.message
          : "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-info">
          <Link to="/" className="login-logo">
            <div className="logo-icon">T</div>
            <div>
              <h2>TechCare</h2>
              <span>Hardware Support</span>
            </div>
          </Link>

          <div className="login-welcome">
            <span>WELCOME BACK</span>
            <h1>
              Get Support
              <br />
              <strong>When You Need It.</strong>
            </h1>
            <p>
              Login to your TechCare account to report hardware
              problems, track support tickets, and communicate
              with our support team.
            </p>
          </div>

          <div className="login-feature">
            <div>✓</div>
            <span>Track your support tickets</span>
          </div>

          <div className="login-feature">
            <div>✓</div>
            <span>Communicate with support agents</span>
          </div>

          <div className="login-feature">
            <div>✓</div>
            <span>Get your hardware problems resolved</span>
          </div>
        </div>

        <div className="login-form-area">
          <div className="login-form">
            <div className="mobile-login-logo">
              <div className="logo-icon">T</div>
              <h2>TechCare</h2>
            </div>

            <h2>Sign in to your account</h2>
            <p className="login-description">
              Enter your account information below.
            </p>

            <form onSubmit={handleLogin} autoComplete="off">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="account-contact"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-group">
                <div className="password-label">
                  <label htmlFor="password">Password</label>
                  <a href="#forgot">Forgot password?</a>
                </div>

                <input
                  id="password"
                  name="account-access-key"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              {error && (
                <p
                  role="alert"
                  style={{
                    color: "#d92d20",
                    background: "#fef3f2",
                    padding: "10px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <p className="register-text">
              Don't have an account?{" "}
              <Link to="/register" className="create-account-link">
                Create Account
              </Link>
            </p>

            <Link to="/" className="back-home">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;