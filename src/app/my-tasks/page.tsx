"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, AlertCircle, Trash2 } from "lucide-react";

interface MyTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "To Do" | "In Progress" | "Done";
  priority?: "Low" | "Medium" | "High";
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    status: "To Do" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
  }>({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
    priority: "Medium",
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("my_tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleSaveTask = () => {
    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    const newTask: MyTask = {
      id: `task_${Date.now()}`,
      title: formData.title,
      description: formData.description || undefined,
      dueDate: formData.dueDate || undefined,
      status: formData.status,
      priority: formData.priority,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("my_tasks", JSON.stringify(updatedTasks));

    setFormData({
      title: "",
      description: "",
      dueDate: "",
      status: "To Do",
      priority: "Medium",
    });
    setShowForm(false);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem("my_tasks", JSON.stringify(updatedTasks));
  };

  const handleStatusChange = (id: string, newStatus: MyTask["status"]) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("my_tasks", JSON.stringify(updatedTasks));
  };

  const todoTasks = tasks.filter((t) => t.status === "To Do");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            My Tasks
          </h1>
          <p className="text-primary-300 text-sm sm:text-base">
            Your personal daily tasks and priorities
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {/* Listing Photo Prep Timeline */}
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-700/50 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={24} className="text-purple-400" />
          <h2 className="text-xl font-bold text-white">📸 Listing Photo Prep Timeline</h2>
        </div>
        <p className="text-purple-300 text-sm mb-4">
          Photo Date: <strong>3/20/2026</strong> | Sellers: Maxine Garcia, Tif De Vol (3807 Wilson), Piyush Mehta
        </p>
        <div className="space-y-3">
          {[
            { date: "3/10", day: "Mon", task: "Schedule maids", properties: "All 3", blocker: false },
            { date: "3/12", day: "Wed", task: "Schedule staging", properties: "Tif De Vol", blocker: true },
            { date: "3/13", day: "Thu", task: "Schedule photographer", properties: "All 3", blocker: false },
            { date: "3/16", day: "Sun", task: "Marketing drafts ready", properties: "All 3", blocker: false },
            { date: "3/18", day: "Tue", task: "Final cleaning & staging", properties: "All 3", blocker: false },
            { date: "3/20", day: "Thu", task: "PHOTOS", properties: "All 3", blocker: false },
            { date: "3/21", day: "Fri", task: "Upload photos & order brochures", properties: "All 3", blocker: false },
            { date: "3/25", day: "Tue", task: "Install sign, lockbox", properties: "All 3", blocker: false },
            { date: "3/26", day: "Wed", task: "GO LIVE", properties: "All 3", blocker: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-3 rounded ${
                item.blocker
                  ? "bg-red-900/30 border border-red-600/50"
                  : "bg-primary-800/40 border border-primary-600/30"
              }`}
            >
              <div className="flex-shrink-0 text-center">
                <div className={`font-bold ${item.blocker ? "text-red-400" : "text-purple-400"}`}>
                  {item.date}
                </div>
                <div className="text-xs text-primary-400">{item.day}</div>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{item.task}</div>
                <div className="text-xs text-primary-300">{item.properties}</div>
              </div>
              {item.blocker && (
                <div className="flex-shrink-0 px-2 py-1 bg-red-600/50 rounded text-xs font-semibold text-red-300">
                  BLOCKER
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded text-sm text-red-300">
          <strong>🔴 Critical Blocker:</strong> 3807 Wilson remodel must be complete before 3/12. Once done, immediately call staging vendors (Hevenle, Simply Staged ATX).
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-primary-800/60 to-primary-850/40 border border-primary-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">New Task</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white placeholder-primary-400 focus:outline-none focus:border-primary-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white placeholder-primary-400 focus:outline-none focus:border-primary-500 h-20"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as "Low" | "Medium" | "High",
                  })
                }
                className="bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as MyTask["status"],
                  })
                }
                className="bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTask}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Save Task
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-4">
          <p className="text-primary-300 text-xs font-semibold">To Do</p>
          <p className="text-2xl font-bold text-white">{todoTasks.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-primary-300 text-xs font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-white">
            {inProgressTasks.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-lg p-4">
          <p className="text-primary-300 text-xs font-semibold">Done</p>
          <p className="text-2xl font-bold text-white">{doneTasks.length}</p>
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="space-y-6">
        {[
          { title: "To Do", tasks: todoTasks, color: "blue" },
          { title: "In Progress", tasks: inProgressTasks, color: "yellow" },
          { title: "Done", tasks: doneTasks, color: "green" },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-bold text-white mb-4">
              {section.title}
            </h2>
            {section.tasks.length === 0 ? (
              <p className="text-primary-400 text-sm">No tasks</p>
            ) : (
              <div className="space-y-3">
                {section.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: MyTask;
  onStatusChange: (id: string, status: MyTask["status"]) => void;
  onDelete: (id: string) => void;
}

function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const priorityColors = {
    Low: "text-blue-400",
    Medium: "text-yellow-400",
    High: "text-red-400",
  };

  return (
    <div className="bg-gradient-to-br from-primary-800/60 to-primary-850/40 border border-primary-700/50 rounded-lg p-4 hover:border-primary-600/50 transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold">{task.title}</h3>
          {task.description && (
            <p className="text-primary-300 text-sm mt-1">{task.description}</p>
          )}
          <div className="flex gap-3 mt-3">
            {task.priority && (
              <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-primary-400 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(task.id, e.target.value as MyTask["status"])
            }
            className="bg-primary-700/50 border border-primary-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <button
            onClick={() => onDelete(task.id)}
            className="text-primary-400 hover:text-red-400 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
