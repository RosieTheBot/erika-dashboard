"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, CheckCircle2, Clock, AlertCircle, X, Eye } from "lucide-react";
import type { ListingTask } from "@/lib/listing-tasks";

interface SellerTaskCardProps {
  seller: {
    id: string;
    name: string;
    address?: string;
    tags?: string[];
  };
}

export default function SellerTaskCard({ seller }: SellerTaskCardProps) {
  const [tasks, setTasks] = useState<ListingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [goLiveDate, setGoLiveDate] = useState("");
  const [preListingDate, setPreListingDate] = useState("");
  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string>>(new Set());
  const [expandedTask, setExpandedTask] = useState<ListingTask | null>(null);
  const [showCustomTaskForm, setShowCustomTaskForm] = useState(false);
  const [customTaskForm, setCustomTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const isSTRSeller = seller.tags?.includes("strseller") || false;

  // Load tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Load go-live date from server (with localStorage fallback)
        let goliveDate = "";
        try {
          console.log(`[DEBUG] Fetching go-live date from /api/sellers/${seller.id}/golive-date`);
          const response = await fetch(`/api/sellers/${seller.id}/golive-date`);
          if (response.ok) {
            const data = await response.json();
            goliveDate = data.goliveDate || "";
            console.log(`[DEBUG] Loaded go-live date from server: ${goliveDate}`);
          }
        } catch (error) {
          console.error("[DEBUG] Error loading go-live date from server:", error);
          // Fallback to localStorage
          goliveDate = localStorage.getItem(`seller_golive_${seller.id}`) || "";
          if (goliveDate) {
            console.log(`[DEBUG] Loaded go-live date from localStorage: ${goliveDate}`);
          }
        }
        
        setGoLiveDate(goliveDate);
        
        // Load deleted task IDs from localStorage
        const deletedIds = new Set<string>();
        const deletedTasksJson = localStorage.getItem(`seller_deleted_tasks_${seller.id}`);
        if (deletedTasksJson) {
          try {
            const deleted = JSON.parse(deletedTasksJson);
            deleted.forEach((id: string) => deletedIds.add(id));
          } catch (e) {
            console.error("Error parsing deleted tasks:", e);
          }
        }
        setDeletedTaskIds(deletedIds);
        
        // Generate tasks with the loaded date (passing seller ID for deterministic task IDs)
        const { generateTasksForSeller } = await import("@/lib/listing-tasks");
        let generatedTasks = generateTasksForSeller(null, goliveDate, seller.id);
        
        // Filter out deleted tasks
        generatedTasks = generatedTasks.filter(t => !deletedIds.has(t.id));
        
        console.log(`[DEBUG] Loaded ${generatedTasks.length} generated tasks for seller ${seller.id}`);
        
        // Load saved task statuses and due dates from server
        try {
          console.log(`[DEBUG] Fetching saved statuses from /api/sellers/${seller.id}/tasks`);
          const response = await fetch(`/api/sellers/${seller.id}/tasks`);
          console.log(`[DEBUG] API response status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            const taskData = data.tasks || {};
            console.log(`[DEBUG] Loaded ${Object.keys(taskData).length} saved task statuses:`, taskData);
            
            generatedTasks = generatedTasks.map((t) => {
              const saved = taskData[t.id];
              return {
                ...t,
                status: (saved?.status || t.status) as ListingTask["status"],
                dueDate: saved?.dueDate || t.dueDate,
              };
            });
          } else {
            console.log(`[DEBUG] API response not ok, falling back to localStorage`);
            // Fallback to localStorage
            const savedTaskData = localStorage.getItem(`seller_tasks_${seller.id}`);
            if (savedTaskData) {
              const taskData = JSON.parse(savedTaskData);
              generatedTasks = generatedTasks.map((t) => {
                const saved = taskData[t.id];
                return {
                  ...t,
                  status: (saved?.status || t.status) as ListingTask["status"],
                  dueDate: saved?.dueDate || t.dueDate,
                };
              });
            }
          }
        } catch (error) {
          console.error("[DEBUG] Error loading task statuses from server:", error);
          // Fallback to localStorage
          const savedTaskData = localStorage.getItem(`seller_tasks_${seller.id}`);
          if (savedTaskData) {
            const taskData = JSON.parse(savedTaskData);
            generatedTasks = generatedTasks.map((t) => {
              const saved = taskData[t.id];
              return {
                ...t,
                status: (saved?.status || t.status) as ListingTask["status"],
                dueDate: saved?.dueDate || t.dueDate,
              };
            });
          }
        }
        
        console.log(`[DEBUG] Setting ${generatedTasks.length} final tasks`);
        setTasks(generatedTasks);
      } catch (error) {
        console.error("[DEBUG] Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [seller.id]);

  const handleGoLiveDateChange = (newDate: string) => {
    setGoLiveDate(newDate);
    setSaveStatus("idle");
  };

  const handleSaveGoLiveDate = async () => {
    if (!goLiveDate) {
      alert("Please select a go-live date");
      return;
    }

    setSaveStatus("saving");
    try {
      // Save to Supabase
      const response = await fetch(`/api/sellers/${seller.id}/golive-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goliveDate: goLiveDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to save go-live date to server");
      }

      // Also store locally as fallback
      localStorage.setItem(`seller_golive_${seller.id}`, goLiveDate);

      // Generate tasks with new date (passing seller ID for deterministic task IDs)
      const { generateTasksForSeller } = await import("@/lib/listing-tasks");
      let generatedTasks = generateTasksForSeller(null, goLiveDate, seller.id);
      
      // Preserve saved task statuses and due dates from server
      try {
        const response = await fetch(`/api/sellers/${seller.id}/tasks`);
        if (response.ok) {
          const data = await response.json();
          const taskData = data.tasks || {};
          generatedTasks = generatedTasks.map((t) => {
            const saved = taskData[t.id];
            return {
              ...t,
              status: (saved?.status || t.status) as ListingTask["status"],
              dueDate: saved?.dueDate || t.dueDate,
            };
          });
        }
      } catch (error) {
        // Fallback to localStorage
        const savedTaskData = localStorage.getItem(`seller_tasks_${seller.id}`);
        if (savedTaskData) {
          const taskData = JSON.parse(savedTaskData);
          generatedTasks = generatedTasks.map((t) => {
            const saved = taskData[t.id];
            return {
              ...t,
              status: (saved?.status || t.status) as ListingTask["status"],
              dueDate: saved?.dueDate || t.dueDate,
            };
          });
        }
      }
      
      setTasks(generatedTasks);
      setSaveStatus("saved");

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving go-live date:", error);
      setSaveStatus("idle");
      alert("Failed to save go-live date");
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    console.log(`[DEBUG] Changing task ${taskId} to ${newStatus} for seller ${seller.id}`);
    
    const updated = tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: newStatus as ListingTask["status"] }
        : t
    );
    setTasks(updated);
    
    // Save all task statuses AND due dates to server
    const taskData: Record<string, any> = {};
    updated.forEach((task) => {
      taskData[task.id] = {
        status: task.status,
        dueDate: task.dueDate,
      };
    });
    
    // Also save to localStorage as fallback
    localStorage.setItem(`seller_tasks_${seller.id}`, JSON.stringify(taskData));
    console.log(`[DEBUG] Saved to localStorage:`, taskData);
    
    // Save to server database (fire and forget - don't await)
    fetch(`/api/sellers/${seller.id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks: taskData }),
    })
      .then((res) => {
        console.log(`[DEBUG] API response status:`, res.status);
        if (!res.ok) {
          console.error(`[DEBUG] API error: ${res.status}`);
        }
      })
      .catch((error) => {
        console.error("[DEBUG] Error saving task statuses to server:", error);
      });
  };

  const handleAddCustomTask = () => {
    if (!customTaskForm.title || !customTaskForm.dueDate) {
      alert("Title and due date required");
      return;
    }

    const newTask: ListingTask = {
      id: `custom_${Date.now()}`,
      title: customTaskForm.title,
      description: customTaskForm.description || undefined,
      daysFromAnchor: 0,
      anchor: "go-live",
      dueDate: customTaskForm.dueDate,
      status: "Not Started",
      isCustom: true,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    // Save all task data (status + due dates) including the new one
    const taskData: Record<string, any> = {};
    updatedTasks.forEach((task) => {
      taskData[task.id] = {
        status: task.status,
        dueDate: task.dueDate,
      };
    });
    localStorage.setItem(`seller_tasks_${seller.id}`, JSON.stringify(taskData));
    
    setCustomTaskForm({ title: "", description: "", dueDate: "" });
    setShowCustomTaskForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    
    // Track this task as deleted
    const newDeletedIds = new Set(deletedTaskIds);
    newDeletedIds.add(taskId);
    setDeletedTaskIds(newDeletedIds);
    
    // Save deleted task IDs to localStorage
    localStorage.setItem(
      `seller_deleted_tasks_${seller.id}`,
      JSON.stringify(Array.from(newDeletedIds))
    );
    
    // Save updated task data (status + due dates)
    const taskData: Record<string, any> = {};
    updatedTasks.forEach((task) => {
      taskData[task.id] = {
        status: task.status,
        dueDate: task.dueDate,
      };
    });
    localStorage.setItem(`seller_tasks_${seller.id}`, JSON.stringify(taskData));
    
    // Delete from server
    fetch(`/api/sellers/${seller.id}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log(`[DEBUG] Delete API response status:`, res.status);
        if (!res.ok) {
          console.error(`[DEBUG] Delete API error: ${res.status}`);
        }
      })
      .catch((error) => {
        console.error("[DEBUG] Error deleting task from server:", error);
      });
  };

  const completedCount = tasks.filter((t) => t.status === "Complete").length;
  const upcomingTasks = tasks
    .filter((t) => t.status !== "Complete")
    .sort(
      (a, b) =>
        new Date(a.dueDate || "").getTime() -
        new Date(b.dueDate || "").getTime()
    );

  // Check if "Upload signed agreements" task is complete
  const agreementsTask = tasks.find(
    (t) => t.title.includes("Upload signed agreements")
  );
  const agreementsUploaded = agreementsTask?.status === "Complete";

  // Determine seller status
  const getSellerStatus = (): string => {
    if (agreementsUploaded) {
      return "Active Listing";
    }
    if (goLiveDate) {
      const today = new Date();
      const gld = new Date(goLiveDate);
      if (gld <= today) {
        return "Active Listing";
      }
    }
    return "Pre-Listing";
  };

  const sellerStatus = getSellerStatus();

  return (
    <div className="bg-gradient-to-br from-primary-800/60 to-primary-850/40 border border-primary-700/50 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{seller.name}</h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded border ${
                sellerStatus === "Active Listing"
                  ? "bg-green-600/30 text-green-300 border-green-600/50"
                  : "bg-blue-600/30 text-blue-300 border-blue-600/50"
              }`}
            >
              {sellerStatus}
            </span>
            {isSTRSeller && (
              <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs font-semibold rounded border border-purple-600/50">
                STR Seller
              </span>
            )}
          </div>
          <p className="text-primary-400 text-sm mt-1">{seller.address}</p>
        </div>
      </div>

      {/* Go-Live Date Input */}
      <div className="bg-primary-700/30 border border-primary-600/30 rounded p-4 space-y-2">
        <label className="text-sm text-primary-300 font-medium block">
          Go-Live Date
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={goLiveDate}
            onChange={(e) => handleGoLiveDateChange(e.target.value)}
            className="flex-1 bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={handleSaveGoLiveDate}
            disabled={saveStatus === "saving"}
            className={`px-4 py-2 rounded font-medium text-sm transition whitespace-nowrap ${
              saveStatus === "saved"
                ? "bg-green-600/70 text-green-300"
                : saveStatus === "saving"
                  ? "bg-primary-600 text-primary-300 opacity-50"
                  : "bg-primary-600 hover:bg-primary-500 text-white"
            }`}
          >
            {saveStatus === "saved"
              ? "✓ Saved"
              : saveStatus === "saving"
                ? "Saving..."
                : "Save"}
          </button>
        </div>
      </div>

      {/* Task Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-primary-300">Task Progress</p>
            <p className="text-sm font-semibold text-primary-300">
              {completedCount}/{tasks.length}
            </p>
          </div>
          <div className="w-full bg-primary-700/30 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      {loading ? (
        <p className="text-primary-400 text-sm">Loading tasks...</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {upcomingTasks.length === 0 ? (
            <p className="text-primary-400 text-sm">No tasks yet</p>
          ) : (
            upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-2 bg-primary-700/20 rounded border border-primary-600/20 hover:border-primary-600/40 transition group"
              >
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleTaskStatusChange(task.id, e.target.value)
                  }
                  className="mt-1 bg-primary-700/50 border border-primary-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Complete</option>
                </select>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate cursor-help" title={task.title}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-primary-400 text-xs flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setExpandedTask(task)}
                  className="text-primary-400 hover:text-primary-300 transition opacity-0 group-hover:opacity-100"
                  title="View details"
                >
                  <Eye size={16} />
                </button>
                {task.isCustom && (
                  <span className="text-xs text-primary-400 whitespace-nowrap">
                    Custom
                  </span>
                )}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-primary-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Custom Task Button */}
      <button
        onClick={() => setShowCustomTaskForm(!showCustomTaskForm)}
        className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
      >
        <Plus size={16} />
        Add Custom Task
      </button>

      {/* Custom Task Form */}
      {showCustomTaskForm && (
        <div className="bg-primary-700/30 border border-primary-600/30 rounded p-4 space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={customTaskForm.title}
            onChange={(e) =>
              setCustomTaskForm({ ...customTaskForm, title: e.target.value })
            }
            className="w-full bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white placeholder-primary-400 text-sm focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={customTaskForm.description}
            onChange={(e) =>
              setCustomTaskForm({
                ...customTaskForm,
                description: e.target.value,
              })
            }
            className="w-full bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white placeholder-primary-400 text-sm focus:outline-none h-16"
          />
          <input
            type="date"
            value={customTaskForm.dueDate}
            onChange={(e) =>
              setCustomTaskForm({ ...customTaskForm, dueDate: e.target.value })
            }
            className="w-full bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white text-sm focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCustomTask}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded font-medium text-sm transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowCustomTaskForm(false)}
              className="flex-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded font-medium text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {expandedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 border border-primary-700 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white flex-1">{expandedTask.title}</h2>
              <button
                onClick={() => {
                  // Merge updated task back into tasks array before closing
                  const updatedTasks = tasks.map(t => 
                    t.id === expandedTask.id ? expandedTask : t
                  );
                  setTasks(updatedTasks);
                  setExpandedTask(null);
                }}
                className="text-primary-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {expandedTask.description && (
                <div>
                  <p className="text-xs text-primary-400 font-semibold mb-1">
                    Description
                  </p>
                  <p className="text-white text-sm">{expandedTask.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-primary-400 font-semibold mb-1">
                  Due Date
                </p>
                <input
                  type="date"
                  value={expandedTask.dueDate || ""}
                  onChange={(e) => {
                    const newDate = e.target.value || undefined;
                    const updatedTask = {
                      ...expandedTask,
                      dueDate: newDate,
                    };
                    setExpandedTask(updatedTask);
                    
                    // Auto-save to tasks list
                    const updatedTasks = tasks.map(t => 
                      t.id === expandedTask.id ? updatedTask : t
                    );
                    setTasks(updatedTasks);
                    
                    // Save to localStorage (including due dates)
                    const taskData: Record<string, any> = {};
                    updatedTasks.forEach((task) => {
                      taskData[task.id] = {
                        status: task.status,
                        dueDate: task.dueDate,
                      };
                    });
                    localStorage.setItem(`seller_tasks_${seller.id}`, JSON.stringify(taskData));
                    console.log(`[DEBUG] Auto-saved task due date to localStorage:`, taskData[expandedTask.id]);
                    
                    // Save to Supabase (with due date)
                    fetch(`/api/sellers/${seller.id}/tasks`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ tasks: taskData }),
                    }).then((res) => {
                      console.log(`[DEBUG] Auto-save API response status:`, res.status);
                      if (!res.ok) {
                        console.error(`[DEBUG] Auto-save API error: ${res.status}`);
                      }
                    }).catch(error => {
                      console.error("[DEBUG] Error auto-saving task to server:", error);
                    });
                  }}
                  className="bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white text-sm focus:outline-none w-full"
                />
              </div>

              <div>
                <p className="text-xs text-primary-400 font-semibold mb-1">
                  Status
                </p>
                <select
                  value={expandedTask.status}
                  onChange={(e) => {
                    handleTaskStatusChange(expandedTask.id, e.target.value);
                    setExpandedTask({
                      ...expandedTask,
                      status: e.target.value as ListingTask["status"],
                    });
                  }}
                  className="bg-primary-700/50 border border-primary-600 rounded px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Complete</option>
                </select>
              </div>

              {expandedTask.isCustom && (
                <p className="text-xs text-primary-400 italic">Custom task</p>
              )}
            </div>

            <button
              onClick={() => {
                // Update the task in the tasks list if any changes were made
                const updatedTasks = tasks.map(t => 
                  t.id === expandedTask.id ? expandedTask : t
                );
                setTasks(updatedTasks);
                setExpandedTask(null);
              }}
              className="mt-6 w-full bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
