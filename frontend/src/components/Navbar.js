import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../utils/auth";
import { useState, useEffect } from "react";


function Navbar() {
  const token = getToken();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <nav className="navbar">
      
      <h2 className="logo" onClick={() => navigate("/")}>
        Talent Management System
      </h2>

      <div className="nav-links">

        {!token && (
          <button
            className="get-started"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        )}

        {token && user && (
          <div className="profile-wrapper">
            
            <div
              className="profile-btn"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <span className="username">{user.name}</span>

              {/* ▼ Arrow */}
              <span className={`arrow ${open ? "rotate" : ""}`}>
                ▾
              </span>
            </div>

            {open && (
              <div className="dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;