import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { clearAuthToken, setAuthToken } from "../utils/auth";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (
      !/^\+?[0-9().\-\s]+$/.test(phone.trim()) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      setError("Please enter a valid phone number with 7 to 15 digits.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to create account (HTTP ${response.status}).`);
      }

      if (!data.token || data.user?.role !== "CUSTOMER") {
        throw new Error("The server did not return a login token and user role.");
      }

      clearAuthToken();
      setAuthToken(data.token, data.user.role);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      navigate("/customer/dashboard");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Make sure the backend is running, then try again."
          : err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">

          <div className="auth-logo-icon">
            TC
          </div>

          <span>
            TechCare
          </span>

        </div>

        {/* Title */}
        <h1>
          Create Account
        </h1>

        <p className="auth-subtitle">
          Create your TechCare customer account
        </p>

        {/* Form */}
        <form onSubmit={handleRegister} autoComplete="off">

          {/* Full Name */}
          <div className="auth-form-group">

            <label>
              Full Name <span aria-hidden="true">*</span>
            </label>

            <input
              name="account-name"
              type="text"
              autoComplete="off"
              placeholder="Enter your full name"
              required
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />

          </div>

          {/* Email */}
          <div className="auth-form-group">

            <label>
              Email Address <span aria-hidden="true">*</span>
            </label>

            <input
              name="account-email"
              type="email"
              autoComplete="off"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* Phone */}
          <div className="auth-form-group">

            <label>
              Phone Number <span aria-hidden="true">*</span>
            </label>

            <input
              name="account-phone"
              type="tel"
              autoComplete="off"
              placeholder="Enter your phone number"
              pattern="\+?[0-9().\-\s]+"
              title="Use 7 to 15 digits; spaces, parentheses, periods, and hyphens are allowed."
              required
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

          </div>

          {/* Password */}
          <div className="auth-form-group">

            <label>
              Password <span aria-hidden="true">*</span>
            </label>

            <div className="password-input-wrapper">

              <input
                name="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div className="auth-form-group">

            <label>
              Confirm Password <span aria-hidden="true">*</span>
            </label>

            <div className="password-input-wrapper">

              <input
                name="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* Submit */}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        {/* Login */}
        <div className="auth-footer">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;