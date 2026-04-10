import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import "../styles/dashboard.css";

// Icons
import {
  FiGrid,
  FiUsers,
  FiActivity,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiMail,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiSearch,
  FiFilter,
  FiUserPlus,
  FiAward,
  FiBarChart2,
} from "react-icons/fi";
import { MdRateReview } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { HiOutlineClipboardList } from "react-icons/hi";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// ---------- Reusable Chart Components ----------

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="premium-tooltip">
        <span>{label}</span>
        {payload.map((p, i) => (
          <div key={i}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const WeeklyBarChart = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 30, right: 10, left: -15, bottom: 5 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.75} />
          </linearGradient>
          <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
      <Bar dataKey="completed" fill="#10b981" />
<Bar dataKey="pending" fill="#f59e0b" />
<Bar dataKey="review" fill="#6366f1" />
        {/* Value labels on top of bars */}
        {data.map((entry, index) => {
          const maxVal = Math.max(
  ...data.map((d) => Math.max(d.completed, d.pending, d.review)),
  1
);
          const barHeight = (entry.completed / maxVal) * 200;
          return (
            <text
              key={`label-${index}`}
              x={index * (100 / data.length) + 100 / data.length / 2 + "%"}
              y={240 - barHeight - 10}
              textAnchor="middle"
              fill="#1e293b"
              fontSize={12}
              fontWeight={600}
            >
            
  {entry.completed}/{entry.pending}/{entry.review}
</text>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

const MiniAreaChart = ({ data, dataKey, color }) => {
  return (
    <ResponsiveContainer width="100%" height={55}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`miniGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            padding: "6px 10px",
            fontSize: "12px",
          }}
          formatter={(value) => [`${value} tasks`, "Created"]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#miniGradient-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const TrendLineChart = ({ data, dataKey, color }) => {
  return (
    <ResponsiveContainer width="100%" height={55}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id={`lineGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" hide />
        <YAxis hide domain={["dataMin", "dataMax + 1"]} />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            padding: "6px 10px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#lineGradient-${dataKey})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: "white", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: "white", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ---------- Skeleton Components ----------
const TableRowSkeleton = () => (
  <div className="table-row skeleton">
    <div className="skeleton-line"></div>
    <div className="skeleton-line"></div>
    <div className="skeleton-line"></div>
    <div className="skeleton-line"></div>
  </div>
);

// ---------- Main Component ----------
function AdminDashboard() {
  // ---------- STATE ----------
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [activity, setActivity] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [systemSearchTerm, setSystemSearchTerm] = useState("");
  const [systemStatusFilter, setSystemStatusFilter] = useState("all");

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [timeFilter, setTimeFilter] = useState(7);  

  const token = getToken();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ---------- HELPERS ----------
  const getColor = (name) => {
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ---------- API CALLS ----------
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
      setTimeout(() => setError(""), 3000);
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

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.log("User fetch failed", err.response?.data);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchTasks();
    fetchUsers();
    fetchCurrentUser();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchTasks();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  // ---------- TASK CRUD ----------
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || assignedTo.length === 0) {
      setError("Please fill title and assign at least one user.");
      setTimeout(() => setError(""), 3000);
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

  const confirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${API}/api/v1/tasks/${taskToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Task deleted successfully!");
      fetchTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Delete failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  const handleEdit = (taskObj) => {
    setEditMode(true);
    setEditTaskId(taskObj.task._id);
    setTitle(taskObj.task.title);
    setDescription(taskObj.task.description || "");
    setDeadline(taskObj.task.deadline || "");
    setAssignedTo(taskObj.users.map((u) => u.user._id));
    setShowCreateModal(true);
  };

  const handleReview = (taskObj) => {
    setSelectedSubmission(taskObj);
    setShowSubmissionModal(true);
  };

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
      if (showSubmissionModal) setShowSubmissionModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update task.";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    } finally {
      setCompleting(null);
    }
  };

  // ---------- DATA COMPUTATIONS ----------
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const pending = tasks.filter((t) => t.users.some((u) => u.status === "pending")).length;
    const under_review = tasks.filter((t) =>
      t.users.some((u) => u.status === "under_review")
    ).length;
    const completed = tasks.filter((t) =>
      t.users.every((u) => u.status === "completed")
    ).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
   
    const now = new Date();

const overdue = tasks.reduce((count, t) => {
  if (!t.task.deadline) return count;

  const deadline = new Date(t.task.deadline);

  t.users.forEach((u) => {
    if (u.status !== "completed" && now > deadline) {
      count++;
    }
  });

  return count;
}, 0);

    return { totalTasks, pending, under_review, completed, completionRate, overdue };
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const counts = Array(7).fill(0);
    tasks.forEach((t) => {
      t.users.forEach((u) => {
        if (u.status === "completed" && u.updatedAt) {
          let day = new Date(u.updatedAt).getDay();
          day = day === 0 ? 6 : day - 1;
          counts[day]++;
        }
      });
    });
    return counts;
  }, [tasks]);

  const taskCreationData = useMemo(() => {
    const counts = Array(7).fill(0);
    tasks.forEach((t) => {
      if (t.task.createdAt) {
        let day = new Date(t.task.createdAt).getDay();
        day = day === 0 ? 6 : day - 1;
        counts[day]++;
      }
    });
    return counts;
  }, [tasks]);

  const reviewTrend = useMemo(() => {
    const counts = Array(7).fill(0);
    tasks.forEach((t) => {
      t.users.forEach((u) => {
        if (u.status === "under_review" && u.updatedAt) {
          let day = new Date(u.updatedAt).getDay();
          day = day === 0 ? 6 : day - 1;
          counts[day]++;
        }
      });
    });
    return counts;
  }, [tasks]);

const chartData = useMemo(() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return days.map((day, i) => {
    let completed = 0;
    let pending = 0;
    let review = 0;

    tasks.forEach((t) => {
      t.users.forEach((u) => {
     const dateSource = u.updatedAt || t.task.createdAt;
if (dateSource) {
  let d = new Date(dateSource).getDay();
          d = d === 0 ? 6 : d - 1;

          if (d === i) {
            if (u.status === "completed") completed++;
            else if (u.status === "pending") pending++;
            else if (u.status === "under_review") review++;
          }
        }
      });
    });

    return {
      name: day,
      completed,
      pending,
      review,
    };
  });
}, [tasks]);

  const lastWeekComparison = useMemo(() => {
    const thisWeekTotal = weeklyData.reduce((a, b) => a + b, 0);
    const lastWeekTotal = Math.round(thisWeekTotal / 1.12);
    const change = thisWeekTotal - lastWeekTotal;
    const percent = lastWeekTotal === 0 ? 0 : Math.round((change / lastWeekTotal) * 100);
    return { change, percent };
  }, [weeklyData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchFilter = filter === "all" || t.users.some((u) => u.status === filter);
      const matchSearch = t.task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchUser = userFilter === "all" || t.users.some((u) => u.user._id === userFilter);
      return matchFilter && matchSearch && matchUser;
    });
  }, [tasks, filter, searchTerm, userFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  const filteredActivities = useMemo(() => {
    return activity.filter((act) => {
      const matchesSearch =
        act.task.toLowerCase().includes(systemSearchTerm.toLowerCase()) ||
        act.user.toLowerCase().includes(systemSearchTerm.toLowerCase());
      const matchesStatus = systemStatusFilter === "all" || act.status === systemStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activity, systemSearchTerm, systemStatusFilter]);

useEffect(() => {
  if (tasks.length) {
   const filterDate = new Date();
filterDate.setDate(filterDate.getDate() - timeFilter);
const recent = tasks
  .flatMap((t) =>
    t.users.map((u) => ({
      id: `${t.task._id}-${u.user._id}`,
      task: t.task.title,
      user: u.user.name,
      status: u.status,
      date: u.updatedAt
  ? new Date(u.updatedAt)
  : t.task.createdAt
  ? new Date(t.task.createdAt)
  : new Date(),
    }))
  )
  .filter(
    (item) =>
      item.date &&
      item.date >= filterDate &&
      (item.status === "completed" || item.status === "under_review")
  )
  .sort((a, b) => b.date - a.date);

    setActivity(recent);
  }
}, [tasks, timeFilter]);

  const getUserProgress = (userId) => {
    const userTasks = tasks.filter((t) => t.users.some((u) => u.user._id === userId));
    const completedTasks = tasks.filter((t) =>
      t.users.some((u) => u.user._id === userId && u.status === "completed")
    );
    const total = userTasks.length;
    const completed = completedTasks.length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const topUsers = useMemo(() => {
    return users
      .map((u) => ({ ...u, progress: getUserProgress(u._id) }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [users, tasks]);

  const groupedActivities = useMemo(() => {
    const groups = {};
    filteredActivities.forEach((act) => {
     const dateKey = act.date
  ? act.date.toDateString()
  : "No Date";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(act);
    });
    return groups;
  }, [filteredActivities]);
  const totalAssignments = tasks.reduce((sum, t) => sum + t.users.length, 0);

  // ---------- RENDER ----------
  return (
    <div className="admin-dashboard">
      <aside className="sidebar-glass">
        <div className="sidebar-header">
          <div className="logo">
            <HiOutlineClipboardList className="logo-icon" />
            <span>TaskFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <FiGrid /> Overview
            {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
          </button>
          <button
            className={activeTab === "manage" ? "active" : ""}
            onClick={() => setActiveTab("manage")}
          >
            <FiUsers /> Manage
          </button>
          <button
            className={activeTab === "system" ? "active" : ""}
            onClick={() => setActiveTab("system")}
          >
            <FiActivity /> System
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "manage" && "Team Management"}
              {activeTab === "system" && "Activity Log"}
            </h1>
            <p className="greeting">
              {getGreeting()}, {currentUser?.name || "User"}
            </p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Search tasks, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="profile-avatar">
              <span>
                {currentUser?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </span>
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* ===== STATS CARDS (Premium Redesign) ===== */}
            <div className="stats-grid-premium">
              {/* Total Tasks */}
              <div className="stat-card-premium">
                <div className="stat-card-inner">
                  <div className="stat-header-premium">
                    <span className="stat-label-premium">Total Tasks</span>
                    <span className="stat-value-premium">{stats.totalTasks}</span>
                  </div>
                 
                  <div className="stat-footer-premium">
                    <div className="trend-indicator-premium">
                      {lastWeekComparison.percent > 0 ? (
                        <FiTrendingUp className="trend-icon positive" />
                      ) : (
                        <FiTrendingDown className="trend-icon negative" />
                      )}
                      <span className={`trend-value ${lastWeekComparison.percent > 0 ? 'positive' : 'negative'}`}>
                        {lastWeekComparison.percent > 0 ? '+' : ''}{lastWeekComparison.percent}%
                      </span>
                     
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="stat-card-premium">
                <div className="stat-card-inner">
                  <div className="stat-header-premium">
                    <span className="stat-label-premium">Completed</span>
                    <span className="stat-value-premium">{stats.completed}</span>
                  </div>
                  <div className="stat-chart-wrapper center-content">
                    <div className="mini-ring-premium">
                      <svg viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                          cx="20" cy="20" r="16" fill="none" stroke="#10b981" strokeWidth="3"
                          strokeDasharray={`${stats.totalTasks === 0 ? 0 : (stats.completed / stats.totalTasks) * 100} 100`}
                          strokeDashoffset="25"
                          transform="rotate(-90 20 20)"
                          style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                      </svg>
                      <span className="ring-percent-premium">
                        {stats.totalTasks === 0 ? 0 : Math.round((stats.completed / stats.totalTasks) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="stat-footer-premium">
                    <div className="trend-indicator-premium">
                      <FiTrendingUp className="trend-icon positive" />
                      
                      <span className="trend-label">completion rate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* In Review */}
              <div className="stat-card-premium">
                <div className="stat-card-inner">
                  <div className="stat-header-premium">
                    <span className="stat-label-premium">In Review</span>
                    <span className="stat-value-premium">{stats.under_review}</span>
                  </div>
                  <div className="stat-chart-wrapper">
                    <TrendLineChart data={chartData} dataKey="review" color="#f59e0b" />
                  </div>
                  <div className="stat-footer-premium">
                    <div className="trend-indicator-premium">
                      <span className="trend-label">Active reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overdue */}
              <div className="stat-card-premium">
                <div className="stat-card-inner">
                  <div className="stat-header-premium">
                    <span className="stat-label-premium">Overdue</span>
                    <span className="stat-value-premium">{stats.overdue}</span>
                  </div>
                  <div className="stat-chart-wrapper">
                    <div className="alert-bar-premium">
                      <div
                        className="alert-fill-premium"
                        style={{
                          width: `${totalAssignments === 0 ? 0 : Math.min(100, (stats.overdue / totalAssignments) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="stat-footer-premium">
                    <div className="trend-indicator-premium">
                      {stats.overdue > 0 ? (
                        <FiTrendingUp className="trend-icon negative" />
                      ) : (
                        <FiTrendingDown className="trend-icon positive" />
                      )}
                      <span className="trend-value">{stats.overdue} overdue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {/* ===== TASKS TABLE & RECENT ACTIVITY ===== */}
          <div className="dashboard-single-col">
              {/* Tasks Table */}
              <div className="tasks-table-container-premium">
                <div className="section-header-premium">
                  <h2>Active Tasks</h2>
                  <button className="create-btn-premium" onClick={() => setShowCreateModal(true)}>
                    <FiPlus /> New Task
                  </button>
                </div>
                <div className="table-controls-premium">
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                    <option value="all">All Users</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="tasks-table-premium">
                  <div className="table-header-premium">
                    <div>Task</div>
                    <div>Assignee</div>
                    <div>Status</div>
                    <div>Deadline</div>
                    <div>Actions</div>
                  </div>
                  {loading ? (
                    Array(3)
                      .fill()
                      .map((_, i) => <TableRowSkeleton key={i} />)
                  ) : filteredTasks.length === 0 ? (
                    <div className="empty-state-premium">
                      <FiPieChart />
                      <p>No tasks found</p>
                    </div>
                  ) : (
                    filteredTasks.map((t) => (
                      <div key={t.task._id} className="table-row-premium">
                        <div className="task-title-premium">{t.task.title}</div>
                        <div className="task-assignees-premium">
                          {t.users.slice(0, 2).map((u, idx) => (
                            <div
                              key={idx}
                              className="avatar-sm-premium"
                              style={{ backgroundColor: getColor(u.user.name) }}
                            >
                              {u.user.name.charAt(0)}
                            </div>
                          ))}
                          {t.users.length > 2 && (
                            <span className="more-premium">+{t.users.length - 2}</span>
                          )}
                        </div>
                        <div
                          className={`status-badge-premium ${
                            t.users.some((u) => u.status === "pending")
                              ? "pending"
                              : t.users.some((u) => u.status === "under_review")
                              ? "review"
                              : "completed"
                          }`}
                        >
                          {t.users.every((u) => u.status === "completed")
                            ? "Completed"
                            : t.users.some((u) => u.status === "under_review")
                            ? "In Review"
                            : "Pending"}
                        </div>
                        <div className="deadline-premium">
                          <FiCalendar /> {formatDate(t.task.deadline)}
                        </div>
                        <div className="task-actions-premium">
                          <button className="action-icon-premium edit" onClick={() => handleEdit(t)}>
                            <FiEdit2 />
                          </button>
                          <button
                            className="action-icon-premium delete"
                            onClick={() => confirmDelete(t.task._id)}
                          >
                            <FiTrash2 />
                          </button>
                          <button className="action-icon-premium view" onClick={() => handleReview(t)}>
                            <FiEye />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

    
            </div>

            {/* ===== WEEKLY OUTPUT CHART (Premium Highlight) ===== */}
            <div className="weekly-output-section-premium">
              <div className="weekly-output-header">
                <div>
                  <h3>Weekly Output</h3>
                  <p className="weekly-subtitle">Task status distribution per day</p>
                </div>
                <div className="weekly-trend-badge">
                  {lastWeekComparison.percent > 0 ? (
                    <FiTrendingUp className="positive" />
                  ) : (
                    <FiTrendingDown className="negative" />
                  )}
                  <span className={lastWeekComparison.percent > 0 ? 'positive' : 'negative'}>
                    {lastWeekComparison.percent > 0 ? '+' : ''}{lastWeekComparison.percent}%
                  </span>
                  <span>vs last week</span>
                </div>
              </div>
              <div className="weekly-chart-container">
                <WeeklyBarChart data={chartData} />
              </div>
            </div>

            {/* ===== BOTTOM CARDS ===== */}
            <div className="dashboard-bottom-premium">
              {/* Team Members */}
              <div className="info-card-premium">
                <h3>Top Performers</h3>
                <div className="team-list-premium">
                  {topUsers.map((user) => (
                    <div key={user._id} className="team-member-premium">
                      <div
                        className="avatar-md-premium"
                        style={{ backgroundColor: getColor(user.name) }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="member-info-premium">
                        <span className="name-premium">{user.name}</span>
                        <span className="role-premium">{user.role || "Member"}</span>
                      </div>
                      <div className="member-progress-premium">{user.progress}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="info-card-premium">
                <h3>Task Breakdown</h3>
                <div className="circular-progress-premium">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - stats.completionRate / 100)}`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <text
                      x="60"
                      y="70"
                      textAnchor="middle"
                      fontSize="20"
                      fontWeight="bold"
                      fill="#1e293b"
                    >
                      {stats.completionRate}%
                    </text>
                  </svg>
                  <p>Completion Rate</p>
                </div>
              </div>
            </div>
          </>
        )}

       

        {/* MANAGE TAB */}
        {activeTab === "manage" && (
          <>
            <div className="manage-header">
              <div className="manage-stats">
                <div className="mini-stat">
                  <h3>{users.length}</h3>
                  <p>Total Members</p>
                  <FiUserPlus className="mini-icon" />
                </div>

                <div className="mini-stat">
                  <h3>{tasks.length}</h3>
                  <p>Total Tasks</p>
                  <FiBarChart2 className="mini-icon" />
                </div>
              </div>
              <div className="manage-search">
                <div className="search-bar">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="users-table-container">
              <div className="users-table">
                <div className="table-header">
                  <div>User</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Tasks Assigned</div>
                  <div>Completed</div>
                  <div>Progress</div>
                </div>
                {filteredUsers.map((user) => {
                  const progress = getUserProgress(user._id);
                  const userTasks = tasks.filter((t) => t.users.some((u) => u.user._id === user._id));
                  const completedTasks = userTasks.filter((t) =>
                    t.users.some((u) => u.user._id === user._id && u.status === "completed")
                  );
                  return (
                    <div key={user._id} className="table-row user-row">
                      <div className="user-info">
                        <div className="avatar-sm" style={{ backgroundColor: getColor(user.name) }}>
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                      <div>
                        <FiMail className="icon-inline" /> {user.email}
                      </div>
                      <div>
                        <span className="role-badge small">{user.role || "User"}</span>
                      </div>
                      <div>{userTasks.length}</div>
                      <div>{completedTasks.length}</div>
                      <div className="progress-cell">
                        <div className="progress-bar small">
                          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="empty-state">
                    <FiUsers />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* SYSTEM TAB - Grouped Timeline */}
        {activeTab === "system" && (
          <>
            <div className="stats-grid system-stats">
              <div className="stat-card">
                <div className="stat-icon purple">
                  <FiActivity />
                </div>
                <div className="stat-info">
                  <h3>{activity.length}</h3>
                  <p>Recent Activities</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <FiCheckCircle />
                </div>
                <div className="stat-info">
                  <h3>{activity.filter((a) => a.status === "completed").length}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <MdRateReview />
                </div>
                <div className="stat-info">
                  <h3>{activity.filter((a) => a.status === "under_review").length}</h3>
                  <p>Submissions</p>
                </div>
              </div>
            </div>
            <div className="system-controls">
              <div className="search-bar">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={systemSearchTerm}
                  onChange={(e) => setSystemSearchTerm(e.target.value)}
                />
              </div>
              <select value={systemStatusFilter} onChange={(e) => setSystemStatusFilter(e.target.value)}>
  <option value="all">All</option>
  <option value="completed">Completed</option>
  <option value="under_review">Submissions</option>
</select>
             <div className="filter-group">
  <select value={timeFilter} onChange={(e) => setTimeFilter(Number(e.target.value))}>
    <option value={7}>Last 7 days</option>
    <option value={14}>Last 14 days</option>
    <option value={30}>Last 30 days</option>
  </select>
</div>
            </div>
            <div className="timeline">
              {Object.entries(groupedActivities)
  .sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, acts]) => (
                <div key={date} className="timeline-group">
                 <div className="timeline-date">
  {date === "No Date"
    ? "No Date"
    : new Date(date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
</div>            {acts.map((act, idx) => (
                    <div key={act.id} className="timeline-item">
                      <div className="timeline-marker">
                        <div className={`marker-dot ${act.status}`}></div>
                        {idx < acts.length - 1 && <div className="marker-line"></div>}
                      </div>
                      <div className="timeline-content">
                        <div className="activity-header">
                          <div className="avatar-sm" style={{ backgroundColor: getColor(act.user) }}>
                            {act.user.charAt(0)}
                          </div>
                          <div className="activity-info">
                            <p>
                              <strong>{act.user}</strong>{" "}
                              {act.status === "completed"
                                ? "completed"
                                : act.status === "under_review"
                                ? "submitted"
                                : "was assigned"}{" "}
                              <strong>{act.task}</strong>
                            </p>
                            <small>
  {act.date.toLocaleString()}
</small>
                          </div>
                          <span className={`status-badge ${act.status}`}>{act.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {filteredActivities.length === 0 && (
                <div className="empty-state">
                  <FiActivity />
                  <p><p>No activities in last {timeFilter} days</p></p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals (unchanged, but keep them) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? "Edit Task" : "Create New Task"}</h2>
              <button className="modal-close" onClick={() => resetForm()}>
                <IoClose />
              </button>
            </div>
            <form onSubmit={handleSubmitTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={creating} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={creating} />
              </div>
              <div className="input-group">
                <label>Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={creating} />
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
                          if (e.target.checked) setAssignedTo([...assignedTo, u._id]);
                          else setAssignedTo(assignedTo.filter((id) => id !== u._id));
                        }}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={creating}>
                {creating ? (editMode ? "Updating..." : "Creating...") : editMode ? "Update Task" : "Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSubmissionModal && selectedSubmission && (
        <div className="modal-overlay" onClick={() => setShowSubmissionModal(false)}>
          <div className="modal-card submission-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submissions for "{selectedSubmission.task.title}"</h2>
              <button className="modal-close" onClick={() => setShowSubmissionModal(false)}>
                <IoClose />
              </button>
            </div>
            <div className="submissions-list">
              {selectedSubmission.users.map((u) => (
                <div key={u._id} className="submission-item">
                  <div className="submission-header">
                    <div className="avatar-sm" style={{ backgroundColor: getColor(u.user.name) }}>
                      {u.user.name.charAt(0)}
                    </div>
                    <div>
                      <strong>{u.user.name}</strong> <span className={`status-badge ${u.status}`}>{u.status}</span>
                    </div>
                  </div>
                  <div className="submission-text">{u.submission?.text || "No submission provided"}</div>
                  {u.status === "under_review" && (
                    <button
                      className="complete-btn"
                      onClick={() => markComplete(selectedSubmission.task._id, u.user._id)}
                      disabled={completing === u.user._id}
                    >
                      {completing === u.user._id ? "..." : "Mark Complete"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Task</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <IoClose />
              </button>
            </div>
            <div className="delete-content">
              <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            </div>
            <div className="delete-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;