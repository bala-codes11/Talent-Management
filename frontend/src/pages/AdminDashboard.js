import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import "../styles/dashboard.css";

function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [completing, setCompleting] = useState(null);

  // Filters and search
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  // UI state
  const [activeTab, setActiveTab] = useState("tasks"); // tasks | users | activity
  const [activity, setActivity] = useState([]);

  const token = getToken();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Helper
  const getColor = (name) => {
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fetch data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/v1/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      setError("");
    } catch {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTasks();
    fetchUsers();
  }, [token]);

  // Create / Update task
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || assignedTo.length === 0) {
      setError("Please fill title and assign at least one user.");
      return;
    }
    setCreating(true);
    try {
      const payload = { title, description, deadline, assignedTo };
      if (editMode) {
        await axios.put(`${API}/api/v1/tasks/${editTaskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Task updated successfully!");
      } else {
        await axios.post(`${API}/api/v1/tasks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Task created successfully!");
      }
      resetForm();
      fetchTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Operation failed.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setAssignedTo([]);
    setEditMode(false);
    setEditTaskId(null);
    setShowCreateModal(false);
  };

  // Delete task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API}/api/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Task deleted successfully!");
      fetchTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
  setError("Delete failed");
  setTimeout(() => setError(""), 3000);
}
  };

  // Edit task
  const handleEdit = (taskObj) => {
    setEditMode(true);
    setEditTaskId(taskObj.task._id);
    setTitle(taskObj.task.title);
    setDescription(taskObj.task.description || "");
    setDeadline(taskObj.task.deadline || "");
    setAssignedTo(taskObj.users.map((u) => u.user._id));
    setShowCreateModal(true);
  };

  // Review submissions
  const handleReview = (taskObj) => {
    const submissions = taskObj.users
      .map(
        (u) =>
          `${u.user.name} → ${u.status}\n${u.submission?.text || "No submission"}`
      )
      .join("\n\n");
    alert(submissions);
  };

  // Mark complete
 const markComplete = async (taskId, userId) => {
  setCompleting(userId);
  try {
    await axios.put(
      `${API}/api/v1/tasks/${taskId}/complete`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccess("Task marked as completed!");
    setTimeout(() => setSuccess(""), 3000);
    fetchTasks();
  } catch (err) {
    const msg = err?.response?.data?.message || "Failed to update task.";
    setError(msg);
    setTimeout(() => setError(""), 3000);
  } finally {
    setCompleting(null);
  }
};

  // Stats
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const pending = tasks.filter((t) =>
      t.users.some((u) => u.status === "pending")
    ).length;
    const under_review = tasks.filter((t) =>
      t.users.some((u) => u.status === "under_review")
    ).length;
    const completed = tasks.filter((t) =>
      t.users.every((u) => u.status === "completed")
    ).length;
    return { totalTasks, pending, under_review, completed };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchFilter =
        filter === "all" || t.users.some((u) => u.status === filter);
      const matchSearch = t.task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchUser =
        userFilter === "all" ||
        t.users.some((u) => u.user._id === userFilter);
      return matchFilter && matchSearch && matchUser;
    });
  }, [tasks, filter, searchTerm, userFilter]);

  // Activity feed
  useEffect(() => {
    if (tasks.length) {
      const recent = tasks
        .flatMap((t) =>
          t.users.map((u) => ({
            id: `${t.task._id}-${u.user._id}`,
            task: t.task.title,
            user: u.user.name,
            status: u.status,
            date: new Date().toLocaleString(),
          }))
        )
        .slice(0, 5);
      setActivity(recent);
    }
  }, [tasks]);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar-glass">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === "tasks" ? "active" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            📋 Tasks
          </button>
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            👥 Users
          </button>
          <button
            className={activeTab === "activity" ? "active" : ""}
            onClick={() => setActiveTab("activity")}
          >
            📈 Activity
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>
              {activeTab === "tasks" && "Task Management"}
              {activeTab === "users" && "User Management"}
              {activeTab === "activity" && "Recent Activity"}
            </h1>
            <p>Overview and control panel</p>
          </div>
          {activeTab === "tasks" && (
            <button
              className="create-btn gradient-btn"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Task
            </button>
          )}
        </div>

        {/* Stats Cards (visible only on tasks tab, placed below header) */}
        {activeTab === "tasks" && (
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.totalTasks}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">📤</div>
              <div className="stat-info">
                <h3>{stats.under_review}</h3>
                <p>Under Review</p>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && <div className="alert alert-error glass">{error}</div>}
        {success && <div className="alert alert-success glass">{success}</div>}

        {/* Tasks Tab Content */}
        {activeTab === "tasks" && (
          <>
            {/* Controls */}
            <div className="dashboard-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-box">
                <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="filter-box">
                <select onChange={(e) => setUserFilter(e.target.value)} value={userFilter}>
                  <option value="all">All Users</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Grid */}
            <div className="task-grid">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state glass">
                  <p>No tasks found</p>
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div key={t.task._id} className="task-card glass">
                    <div className="task-header">
                      <h3>{t.task.title}</h3>
                      <div className="task-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(t)}
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(t.task._id)}
                          title="Delete task"
                        >
                          🗑️
                        </button>
                        <button
                          className="action-btn review"
                          onClick={() => handleReview(t)}
                          title="View submissions"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                    {t.task.description && (
                      <p className="task-description">{t.task.description}</p>
                    )}
                    <div className="task-deadline">
                      📅 Due: {formatDate(t.task.deadline)}
                    </div>
                    <div className="assignees-section">
                      <div className="assignees-header">Assigned Users</div>
                      <div className="assignees-list">
                        {t.users.map((u) => (
                          <div key={u._id} className="assignee-item">
                            <div
                              className="avatar"
                              style={{ backgroundColor: getColor(u.user.name) }}
                            >
                              {u.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="assignee-info">
                              <span className="assignee-name">{u.user.name}</span>
                              <span className={`status-badge ${u.status}`}>
                                {u.status === "pending" && "⏳ Pending"}
                                {u.status === "under_review" && "📤 Under Review"}
                                {u.status === "completed" && "✅ Completed"}
                              </span>
                            </div>
                           {u.status === "under_review" && (
  <button
  className="complete-btn"
  onClick={() => markComplete(t.task._id, u.user._id)}
  disabled={completing === u.user._id}
>
  {completing === u.user._id ? "Processing..." : "Complete"}
</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card glass">
                <div className="user-header">
                  <div
                    className="avatar large"
                    style={{ backgroundColor: getColor(user.name) }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <span className="role-badge">{user.role || "User"}</span>
                  </div>
                </div>
                <div className="user-stats">
                  <div className="stat">
                    <span>Tasks Assigned</span>
                    <strong>
                      {tasks.filter((t) =>
                        t.users.some((u) => u.user._id === user._id)
                      ).length}
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Completed</span>
                    <strong>
                      {
                        tasks.filter((t) =>
                          t.users.some(
                            (u) =>
                              u.user._id === user._id && u.status === "completed"
                          )
                        ).length
                      }
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab Content */}
        {activeTab === "activity" && (
          <div className="activity-feed">
            {activity.map((act) => (
              <div key={act.id} className="activity-item glass">
                <div className="activity-icon">
                  {act.status === "completed" && "✅"}
                  {act.status === "under_review" && "📤"}
                  {act.status === "pending" && "⏳"}
                </div>
                <div className="activity-details">
                 <p>
  <strong>{act.user}</strong>{" "}
  {act.status === "completed" && "completed"}
  {act.status === "under_review" && "submitted"}
  {act.status === "pending" && "was assigned"}
  {" task "}
  <strong>{act.task}</strong>
</p>
                  <small>{act.date}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal for Create/Edit Task */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-card glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? "Edit Task" : "Create New Task"}</h2>
              <button className="modal-close" onClick={() => resetForm()}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitTask}>
              <div
                className={`input-group ${activeField === "title" ? "focused" : ""}`}
              >
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setActiveField("title")}
                  onBlur={() => setActiveField(null)}
                  disabled={creating}
                />
              </div>
              <div
                className={`input-group ${activeField === "desc" ? "focused" : ""}`}
              >
                <label>Description (optional)</label>
                <textarea
                  placeholder="Describe the task"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setActiveField("desc")}
                  onBlur={() => setActiveField(null)}
                  rows="3"
                  disabled={creating}
                />
              </div>
              <div className="input-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div className="input-group">
                <label>Assign to Users</label>
                <div className="user-checkboxes">
                  {users.map((u) => (
                    <label key={u._id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={assignedTo.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedTo([...assignedTo, u._id]);
                          } else {
                            setAssignedTo(assignedTo.filter((id) => id !== u._id));
                          }
                        }}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="submit-btn gradient-btn"
                disabled={creating}
              >
                {creating
                  ? editMode
                    ? "Updating..."
                    : "Creating..."
                  : editMode
                  ? "Update Task"
                  : "Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;