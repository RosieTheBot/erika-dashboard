"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: string;
}

export default function TaskTrackerView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "complete")
      return task.status.toLowerCase() === "complete";
    if (filter === "pending")
      return task.status.toLowerCase() !== "complete";
    return true;
  });

  const stats = {
    total: tasks.length,
    complete: tasks.filter((t) => t.status.toLowerCase() === "complete").length,
    pending: tasks.filter((t) => t.status.toLowerCase() !== "complete").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Task Tracker</h1>
        <p className="text-primary-300">Live view of all Rosie Tasks from Google Sheets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox label="Total Tasks" value={stats.total} />
        <StatBox label="Completed" value={stats.complete} color="green" />
        <StatBox label="Pending" value={stats.pending} color="yellow" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-primary-600 text-white"
              : "bg-primary-800 text-primary-300 hover:bg-primary-700"
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "pending"
              ? "bg-primary-600 text-white"
              : "bg-primary-800 text-primary-300 hover:bg-primary-700"
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter("complete")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "complete"
              ? "bg-primary-600 text-white"
              : "bg-primary-800 text-primary-300 hover:bg-primary-700"
          }`}
        >
          Complete ({stats.complete})
        </button>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-primary-300 text-center py-8">Loading tasks...</div>
      ) : (
        <div className="bg-gradient-to-br from-primary-800/50 to-primary-850/50 border border-primary-700/50 rounded-lg overflow-hidden hover:border-primary-600/50 transition-all duration-300">
          <table className="w-full">
            <thead className="bg-primary-900/70 border-b border-primary-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary-200">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary-200">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary-200">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary-200">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-primary-400"
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-primary-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{task.title}</p>
                    </td>
                    <td className="px-6 py-4 text-primary-300">
                      {task.assignedTo}
                    </td>
                    <td className="px-6 py-4 text-primary-300">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                          task.status.toLowerCase() === "complete"
                            ? "bg-green-500/20 text-green-300"
                            : task.status.toLowerCase() === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {task.status.toLowerCase() === "complete" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: number;
  color?: "green" | "yellow" | "blue";
}

function StatBox({ label, value, color = "blue" }: StatBoxProps) {
  const colors = {
    blue: "bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50 text-blue-400",
    green: "bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-500/50 text-green-400",
    yellow: "bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400",
  };

  return (
    <div
      className={`${colors[color]} rounded-lg p-4 border transition-all duration-300`}
    >
      <p className="text-primary-300 text-sm font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
