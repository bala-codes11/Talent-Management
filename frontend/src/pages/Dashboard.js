import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  const token = getToken();

  // FETCH TASKS
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  // CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) return alert("Title required");

    if (editingTask) {
      await axios.put(
        `http://localhost:5000/api/tasks/${editingTask._id}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTask(null);
    } else {
      await axios.post(
        "http://localhost:5000/api/tasks",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setTitle("");
    setDescription("");
    fetchTasks();
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchTasks();
  };

  // EDIT
  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  // TOGGLE STATUS
  const toggleStatus = async (task) => {
    await axios.put(
      `http://localhost:5000/api/tasks/${task._id}`,
      {
        status: task.status === "pending" ? "completed" : "pending",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // STATS
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {/* STATS */}
    <div className="stats">
  <div className="stat-card total">Total: {total}</div>
  <div className="stat-card completed">Completed: {completed}</div>
  <div className="stat-card pending">Pending: {pending}</div>
</div>

      {/* FORM */}
      <form className="task-form" onSubmit={handleSubmit}>
  <input
    placeholder="Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
  <input
    placeholder="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  <button type="submit">
    {editingTask ? "Update Task" : "Add Task"}
  </button>
</form>

      {/* TASK LIST */}
     <div className="task-list">
  {tasks.map((task) => (
    <div className="task-card" key={task._id}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>

      <span className={`status ${task.status}`}>
        {task.status}
      </span>

      <div className="task-actions">
        <button
          className="edit-btn"
          onClick={() => handleEdit(task)}
        >
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={() => handleDelete(task._id)}
        >
          Delete
        </button>

        <button
          className="toggle-btn"
          onClick={() => toggleStatus(task)}
        >
          Toggle
        </button>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}

export default Dashboard;