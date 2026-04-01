import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeField, setActiveField] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, [e.target.name]: value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }

    if (e.target.name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    return ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  };

  const getPasswordStrengthColor = () => {
    return ["#e2e8f0", "#ef4444", "#f59e0b", "#10b981", "#059669"][passwordStrength];
  };

  const validateForm = () => {
    const newErrors = {};

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/login", {
        state: { message: "Account created successfully! Please login." },
      });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Registration failed. Try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Decorative circles */}
        <div className="deco-circle deco-1"></div>
        <div className="deco-circle deco-2"></div>

        <div className="form-header">
          <div className="welcome-badge">
            <span>✨ Create Account</span>
          </div>
          <h2>Join our platform</h2>
          <p>Start managing your tasks smarter</p>
        </div>

        {errors.submit && (
          <div className="alert alert-error">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Name Field */}
          <div className={`input-group ${activeField === "name" ? "focused" : ""}`}>
            <label>Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setActiveField("name")}
                onBlur={() => setActiveField(null)}
                disabled={loading}
              />
            </div>
            {errors.name && <span className="input-error">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className={`input-group ${activeField === "email" ? "focused" : ""}`}>
            <label>Email address</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="input-error">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className={`input-group ${activeField === "password" ? "focused" : ""}`}>
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setActiveField("password")}
                onBlur={() => setActiveField(null)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {form.password && (
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${(passwordStrength / 4) * 100}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                />
                <span>{getPasswordStrengthText()}</span>
              </div>
            )}

            {errors.password && <span className="input-error">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className={`input-group ${activeField === "confirmPassword" ? "focused" : ""}`}>
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => setActiveField("confirmPassword")}
                onBlur={() => setActiveField(null)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Footer */}
          <div className="signup-prompt">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;