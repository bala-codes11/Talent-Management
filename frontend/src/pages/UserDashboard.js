import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import "../styles/userdashboard.css";

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

  const token = getToken();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleChange = (id, value) => {
    setSubmissions((prev) => ({ ...prev, [id]: value }));
    if (error) setError("");
  };

  const handleSubmitTask = async (id) => {
    const text = submissions[id];
    if (!text || !text.trim()) {
      setError("Please enter your submission");
      return;
    }
    setSubmitting((prev) => ({ ...prev, [id]: true }));
    setError("");
    try {
      await axios.put(
        `${API}/api/v1/tasks/${id}/submit`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions((prev) => ({ ...prev, [id]: "" }));
      setSuccess("Task submitted successfully!");
      await fetchTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Submission failed";
      setError(msg);
    } finally {
      setSubmitting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { class: "status-pending", text: "Pending", icon: "⏳", color: "#f59e0b" },
      under_review: { class: "status-submitted", text: "Under Review", icon: "📤", color: "#3b82f6" },
      completed: { class: "status-completed", text: "Completed", icon: "✅", color: "#10b981" },
    };
    return configs[status] || configs.pending;
  };

  const { filteredTasks, stats } = useMemo(() => {
    const validTasks = tasks.filter((t) => t.taskId);
    const filtered = validTasks.filter((task) => {
      const matchesFilter = filter === "all" || task.status === filter;
      const matchesSearch =
        task.taskId.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (task.taskId.description || "").toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    const stats = {
      total: validTasks.length,
      pending: validTasks.filter((t) => t.status === "pending").length,
      under_review: validTasks.filter((t) => t.status === "under_review").length,
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

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="user-dashboard">
      {/* WELCOME HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>My Tasks</h1>
          <p>Welcome back, {user?.name || "User"}! Here's your task overview.</p>
        </div>
        
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.under_review}</h3>
            <p>Under Review</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {error && <div className="alert alert-error glass">{error}</div>}
      {success && <div className="alert alert-success glass">{success}</div>}

      {/* CONTROLS */}
      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* TASK GRID */}
      <div className="task-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state glass">
            <p>No tasks found. 🎉</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            if (!task.taskId) return null;
            const statusConfig = getStatusConfig(task.status);
            const assignmentId = task._id;

            return (
              <div key={task._id} className="task-card glass">
                <div className="task-card-header">
                  <h3>{task.taskId.title}</h3>
                  <span className={`status-badge ${statusConfig.class}`}>
                    <span className="status-icon">{statusConfig.icon}</span>
                    {statusConfig.text}
                  </span>
                </div>

                <p className="task-description">{task.taskId.description}</p>

                <div className="task-meta">
                  <span className="due-date">📅 Due: {formatDate(task.taskId?.deadline)}</span>
                </div>

                {task.status === "pending" && (                
                   <div className="submission-area">
                    <textarea
                      placeholder="Write your submission here..."
                      value={submissions[task.taskId._id] || ""}
                      onChange={(e) => handleChange(task.taskId._id, e.target.value)}
                      rows="3"
                    />
                    <button
                      className="submit-btn gradient-btn"
                      onClick={() => handleSubmitTask(task.taskId._id)}
                     disabled={submitting[task.taskId._id] || task.status !== "pending"}

                    >
                      {submitting[task.taskId._id] ? "Submitting..." : "Submit for Review"}
                    </button>
                  </div>
                )}

                {task.status === "under_review" && (
                  <div className="submission-info">
                    <p>Your submission is under review. You'll be notified when it's completed.</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserDashboard;