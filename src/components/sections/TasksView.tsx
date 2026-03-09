"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";
import Link from "next/link";

interface RosieTask {
  id: string;
  category: string;
  task: string;
  status: string;
  priority: string;
  dueDate: string;
  notes: string;
}

export default function TasksView() {
  const [tasks, setTasks] = useState<RosieTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks/rosie-tasks");
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching Rosie Tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const statusCounts = {
    "To Do": tasks.filter((t) => t.status === "To Do").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Done: tasks.filter((t) => t.status === "Done").length,
  };

  const priorityColors = {
    Low: "text-blue-400",
    Medium: "text-yellow-400",
    High: "text-red-400",
  };

  const statusBgColors = {
    "To Do": "bg-blue-500/20 border-blue-500/30",
    "In Progress": "bg-yellow-500/20 border-yellow-500/30",
    Done: "bg-green-500/20 border-green-500/30",
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            Rosie Tasks
          </h1>
          <p className="text-primary-300 text-sm sm:text-base">
            Complete project backlog and task overview
          </p>
        </div>
        <Link
          href="/my-tasks"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap"
        >
          My Tasks →
        </Link>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`${
              statusBgColors[status as keyof typeof statusBgColors]
            } border rounded-lg p-4 cursor-pointer transition hover:shadow-lg`}
            onClick={() => setFilter(status)}
          >
            <p className="text-primary-300 text-xs font-semibold">{status}</p>
            <p className="text-2xl font-bold text-white">{count}</p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {["all", "To Do", "In Progress", "Done"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? "bg-primary-600 text-white"
                : "bg-primary-800/50 text-primary-300 hover:bg-primary-800"
            }`}
          >
            {status === "all" ? "All Tasks" : status}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center gap-2 text-primary-300">
          <Loader size={20} className="animate-spin" />
          Loading Rosie Tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-primary-800 border border-primary-700 rounded-lg p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-primary-400" />
          <p className="text-primary-300 mb-4">No tasks found</p>
          <p className="text-primary-400 text-sm">
            Tasks will appear here when added to the Rosie Tasks spreadsheet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`${
                statusBgColors[task.status as keyof typeof statusBgColors]
              } border rounded-lg p-4 hover:shadow-lg transition`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{task.task}</h3>
                    <span className="text-xs bg-primary-700 text-primary-300 px-2 py-1 rounded">
                      {task.category}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-primary-300 text-sm mb-2">{task.notes}</p>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <span className="text-xs text-primary-400">
                      Status: {task.status}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        priorityColors[
                          task.priority as keyof typeof priorityColors
                        ] || "text-primary-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-primary-400">
                        Due: {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
