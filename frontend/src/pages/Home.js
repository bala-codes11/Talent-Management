import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import { useEffect } from "react";
import "../styles/home.css"
function Home() {
  const navigate = useNavigate();
  const token = getToken();

  // 🔥 Get user safely
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔥 Handle dashboard navigation (FIXED)
  const handleDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  // 🔥 Optional: auto-redirect logged-in users (better UX)
  useEffect(() => {
    if (token && user) {
      handleDashboard();
    }
  }, []);

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-background-glow"></div>
        <div className="hero-content">
          <div className="hero-badge glass-card">✨ Smart Talent Management</div>

          <h1 className="hero-title">
            Empower Your Team with
            <span className="gradient-text"> Intelligent Workforce</span>
            <br />
            Management
          </h1>

          <p className="hero-description">
            Streamline task assignment, track performance, and unlock your team's full potential
            with our comprehensive digital talent management platform.
          </p>

          {/* 🔥 NOT LOGGED IN */}
          {!token && (
            <div className="hero-buttons">
              <button
                className="btn-primary glass-button"
                onClick={() => navigate("/register")}
              >
                Get Started Free
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                className="btn-secondary glass-button"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          )}

          {/* 🔥 LOGGED IN */}
          {token && user && (
            <div className="hero-greeting glass-card">
              <p>
                {user.role === "admin"
                  ? "Manage your team, assign tasks, and track progress."
                  : "View your tasks and submit your work efficiently."}
              </p>

              <button
                className="btn-primary glass-button"
                onClick={handleDashboard}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge glass-badge">Why Choose Us</span>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-description">
              Powerful features designed to transform how you manage talent and track progress
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📋</div>
              </div>
              <h3>Smart Task Management</h3>
              <p>
                Create, assign, and prioritize tasks with intelligent categorization and real-time updates.
              </p>
              <div className="feature-link">
                <span>Learn more</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📊</div>
              </div>
              <h3>Real-Time Analytics</h3>
              <p>
                Monitor team performance, track completion rates, and identify opportunities for improvement.
              </p>
              <div className="feature-link">
                <span>Learn more</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">👥</div>
              </div>
              <h3>Seamless Collaboration</h3>
              <p>
                Foster teamwork with intuitive assignment tools and clear communication channels.
              </p>
              <div className="feature-link">
                <span>Learn more</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
      </section>
    </div>
  );
}

export default Home;