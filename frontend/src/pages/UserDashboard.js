// UserDashboard.jsx - Premium Redesign
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import "../styles/userdashboard.css";
import {
  FiGrid,
  FiList,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiSend,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiBarChart2,
  FiAward,
  FiChevronDown,
  FiX,
  FiPaperclip,
} from "react-icons/fi";
import { MdRateReview } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";

function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionText, setSubmissionText] = useState("");

  const token = getToken();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/v1/tasks/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      setError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setSubmissionText(submissions[task.taskId._id] || "");
    setShowSubmitModal(true);
  };

  const handleSubmitTask = async () => {
    if (!submissionText.trim()) {
      setError("Please enter your submission");
      return;
    }
    setSubmitting((prev) => ({ ...prev, [selectedTask.taskId._id]: true }));
    setError("");
    try {
      await axios.put(
        `${API}/api/v1/tasks/${selectedTask.taskId._id}/submit`,
        { text: submissionText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubmissions((prev) => ({
        ...prev,
        [selectedTask.taskId._id]: submissionText,
      }));
      setSuccess("Task submitted successfully!");
      await fetchTasks();
      setShowSubmitModal(false);
      setSubmissionText("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Submission failed";
      setError(msg);
    } finally {
      setSubmitting((prev) => ({ ...prev, [selectedTask.taskId._id]: false }));
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        class: "status-pending",
        text: "Pending",
        icon: <FiClock />,
        color: "#f59e0b",
      },
      under_review: {
        class: "status-review",
        text: "Under Review",
        icon: <MdRateReview />,
        color: "#3b82f6",
      },
      completed: {
        class: "status-completed",
        text: "Completed",
        icon: <FiCheckCircle />,
        color: "#10b981",
      },
    };
    return configs[status] || configs.pending;
  };

  const { filteredTasks, stats } = useMemo(() => {
    const validTasks = tasks.filter((t) => t.taskId);
    const filtered = validTasks.filter((task) => {
      const matchesFilter = filter === "all" || task.status === filter;
      const matchesSearch =
        task.taskId.title
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        (task.taskId.description || "")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    const stats = {
      total: validTasks.length,
      pending: validTasks.filter((t) => t.status === "pending").length,
      under_review: validTasks.filter((t) => t.status === "under_review")
        .length,
      completed: validTasks.filter((t) => t.status === "completed").length,
    };
    return { filteredTasks: filtered, stats };
  }, [tasks, filter, debouncedSearch]);

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const completionRate =
    stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="user-dashboard-premium">
      {/* Sidebar */}
      <aside className="sidebar-premium">
        <div className="sidebar-header">
          <div className="logo">
            <HiOutlineClipboardList className="logo-icon" />
            <span>TaskFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === "tasks" ? "active" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            <FiList /> My Tasks
            {stats.pending > 0 && (
              <span className="badge">{stats.pending}</span>
            )}
          </button>
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser /> Profile
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
            <div className="user-details">
              <span className="name">{user?.name || "User"}</span>
              <span className="role">Team Member</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content-premium">
        <header className="dashboard-header-premium">
          <div className="header-left">
            <h1>{activeTab === "tasks" ? "My Tasks" : "Profile Settings"}</h1>
            <p>Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {(error || success) && (
          <div className={`alert-premium ${error ? "error" : "success"}`}>
            {error || success}
            <button
              onClick={() => {
                setError("");
                setSuccess("");
              }}
            >
              <FiX />
            </button>
          </div>
        )}

        {activeTab === "tasks" && (
          <>
            {/* Premium Stats Cards */}
            <div className="stats-grid-premium">
              <div className="stat-card-premium">
                <div className="stat-icon-wrapper">
                  <HiOutlineClipboardList />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Tasks</span>
                  <h2>{stats.total}</h2>
                </div>
                <div className="stat-badge">
                  <FiTrendingUp /> +{stats.completed}
                </div>
              </div>
              <div className="stat-card-premium pending">
                <div className="stat-icon-wrapper">
                  <FiClock />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Pending</span>
                  <h2>{stats.pending}</h2>
                </div>
                <div className="stat-badge">Awaiting</div>
              </div>
              <div className="stat-card-premium review">
                <div className="stat-icon-wrapper">
                  <MdRateReview />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Under Review</span>
                  <h2>{stats.under_review}</h2>
                </div>
                <div className="stat-badge">In progress</div>
              </div>
              <div className="stat-card-premium completed">
                <div className="stat-icon-wrapper">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Completed</span>
                  <h2>{stats.completed}</h2>
                </div>
                <div className="stat-progress-ring">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionRate / 100)}`}
                      transform="rotate(-90 24 24)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Custom Filter Dropdown */}
            <div className="controls-premium">
              <div className="custom-select">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                </select>
                <FiChevronDown className="select-icon" />
              </div>
            </div>

            {/* Task Grid */}
            <div className="task-grid-premium">
              {loading ? (
                Array(3)
                  .fill()
                  .map((_, i) => (
                    <div key={i} className="task-card-premium skeleton">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  ))
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state-premium">
                  <FiAlertCircle />
                  <p>No tasks found. Great job! 🎉</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const statusConfig = getStatusConfig(task.status);
                  const isOverdue =
                    task.taskId.deadline &&
                    new Date(task.taskId.deadline) < new Date() &&
                    task.status !== "completed";
                  return (
                    <div key={task._id} className="task-card-premium">
                      <div className="task-header">
                        <h3>{task.taskId.title}</h3>
                        <span className={`status-badge ${statusConfig.class}`}>
                          {statusConfig.icon} {statusConfig.text}
                        </span>
                      </div>
                      <p className="task-description">
                        {task.taskId.description || "No description provided."}
                      </p>
                      <div className="task-meta">
                        <span
                          className={`due-date ${isOverdue ? "overdue" : ""}`}
                        >
                          <FiCalendar /> {formatDate(task.taskId.deadline)}
                        </span>
                      </div>
                      {task.status === "pending" && (
                        <button
                          className="submit-btn-premium"
                          onClick={() => handleOpenSubmitModal(task)}
                        >
                          <FiSend /> Submit Work
                        </button>
                      )}
                      {task.status === "under_review" && (
                        <div className="info-message review">
                          <MdRateReview /> Your submission is under review.
                        </div>
                      )}
                      {task.status === "completed" && (
                        <div className="info-message completed">
                          <FiCheckCircle /> Task completed! Great job!
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === "profile" && (
          <div className="profile-section">
            <div className="profile-card-premium">
              <div className="profile-avatar-premium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <h2>{user?.name || "User"}</h2>
              <p>{user?.email || "user@example.com"}</p>
              <span className="role-badge-premium">Team Member</span>
              <div className="profile-stats-premium">
                <div className="stat-item">
                  <FiBarChart2 />
                  <div>
                    <strong>{stats.total}</strong>
                    <span>Total Tasks</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FiAward />
                  <div>
                    <strong>{stats.completed}</strong>
                    <span>Completed</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FiTrendingUp />
                  <div>
                    <strong>{completionRate}%</strong>
                    <span>Rate</span>
                  </div>
                </div>
              </div>
              <div className="profile-progress-premium">
                <h4>Overall Progress</h4>
                <div className="progress-bar-premium">
                  <div
                    className="progress-fill-premium"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span>{completionRate}% Complete</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Premium Submission Modal */}
      {showSubmitModal && selectedTask && (
        <div
          className="modal-overlay-premium"
          onClick={() => setShowSubmitModal(false)}
        >
          <div className="modal-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <h2>Submit Work</h2>
              <button
                className="modal-close-premium"
                onClick={() => setShowSubmitModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body-premium">
              <div className="task-info-premium">
                <strong>{selectedTask.taskId.title}</strong>
                <p>{selectedTask.taskId.description}</p>
              </div>
              <label>Your Submission</label>
              <textarea
                placeholder="Write your submission details here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows="6"
              />
            </div>
            <div className="modal-footer-premium">
              <button
                className="btn-secondary-premium"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary-premium"
                onClick={handleSubmitTask}
                disabled={submitting[selectedTask.taskId._id]}
              >
                {submitting[selectedTask.taskId._id]
                  ? "Submitting..."
                  : "Submit Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
