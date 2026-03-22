import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";


function Home() {
  const navigate = useNavigate();
  const token = getToken();

  return (
    <div className="home">

      {/* HERO */}
      <div className="hero">
        <h1>Digital Talent Management System</h1>
        <p>
          Manage tasks, assign work, and track team performance efficiently.
        </p>

        {!token && (
          <div className="hero-buttons">
            <button onClick={() => navigate("/register")}>
              Get Started
            </button>
            <button className="secondary" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        )}
      </div>

      {/* FEATURES */}
      <div className="features-section">
        <h2>What You Can Do</h2>

        <div className="features">
          <div className="card">
            <h3>📋 Manage Tasks</h3>
            <p>Create and organize tasks easily.</p>
          </div>

          <div className="card">
            <h3>📊 Track Progress</h3>
            <p>Monitor completion and performance.</p>
          </div>

          <div className="card">
            <h3>👥 Team Workflow</h3>
            <p>Assign and manage team responsibilities.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;