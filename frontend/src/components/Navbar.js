import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import { useState, useEffect, useRef } from "react";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = getToken();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Safe user parsing
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Clean logout
  const handleLogout = () => {
    logout(); // clears everything
    navigate("/login");
  };

  // Role-based home navigation
  const handleHome = () => {
    if (!token || !user) {
      navigate("/");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="logo" onClick={handleHome}>
         
           <span className="logo-text">Talent Flow</span>
        </div>

        <div className="nav-right">
          {/* Not Logged In */}
          {!token && (
            <button
              className="btn-get-started"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>
          )}

          {/* Logged In */}
          {token && user && (
            <div className="profile-wrapper" ref={dropdownRef}>
              <div
                className={`profile-btn ${open ? "active" : ""}`}
                onClick={() => setOpen(prev => !prev)}
              >
                <div className="avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="username">{user.name}</span>
                <svg
                  className={`chevron ${open ? "rotate" : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {open && (
                <div className="dropdown">
                  
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M16 17L21 12L16 7"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M21 12H9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>  
    </nav>
  );
}

export default Navbar;