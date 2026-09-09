const { useState, useEffect, createElement: e } = React;

const motivationalQuotes = [
  "Focus on progress, not perfection.",
  "Quiet your mind, embrace the learning journey.",
  "Small daily steps lead to massive achievements.",
  "Your effort today shapes your future self.",
  "Deep focus is a muscle—train it daily."
];

function App() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Persistent storage for tasks
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tracker_app_tasks_v2");
    return saved ? JSON.parse(saved) : [];
  });

  const [taskName, setTaskName] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  // Timer States
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState("focus");

  useEffect(() => {
    localStorage.setItem("tracker_app_tasks_v2", JSON.stringify(tasks));
  }, [tasks]);

  // Pomodoro Countdown Hook
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      if (timerMode === "focus") {
        alert("🎉 Focus session completed! Take a break.");
        switchTimerMode("break");
      } else {
        alert("⚡ Break over! Ready to focus?");
        switchTimerMode("focus");
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, timerMode]);

  // Task Actions
  const handleAddTask = (evt) => {
    evt.preventDefault();
    if (!taskName.trim()) return;

    const newTask = {
      id: Date.now(),
      name: taskName.trim(),
      subject: subject.trim() || "General",
      priority: priority,
      deadline: deadline || null,
      createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed: false
    };

    setTasks([newTask, ...tasks]);
    setTaskName("");
    setSubject("");
    setPriority("medium");
    setDeadline("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Erase all completed tasks reset handler
  const eraseCompletedTasks = () => {
    if (confirm("Are you sure you want to erase all completed tasks?")) {
      setTasks(tasks.filter(t => !t.completed));
    }
  };

  const switchTimerMode = (mode) => {
    setTimerMode(mode);
    setIsActive(false);
    setSecondsLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  // Check if deadline is past today
  const isOverdue = (deadlineDate) => {
    if (!deadlineDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return deadlineDate < today;
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return e("div", { className: "app-container" },
    e("div", { className: "glow-orb orb-1" }),
    e("div", { className: "glow-orb orb-2" }),
    e("main", { className: "content-wrapper" },

      /* HEADER & BRANDING LOGO */
      e("header", { className: "app-header" },
        e("div", { className: "brand-logo" },
          e("div", { className: "logo-icon" }, e("i", { className: "fa-solid fa-bolt" })),
          e("span", { className: "logo-text" }, "Tracker Workspace")
        ),
        e("h1", { className: "title-glow" }, "Tracker"),
        e("div", { className: "quote-box" },
          e("span", null, `“${motivationalQuotes[quoteIndex]}”`),
          e("button", { onClick: nextQuote, className: "btn-quote-refresh", title: "Change Quote" },
            e("i", { className: "fa-solid fa-arrows-rotate" })
          )
        )
      ),

      /* OVERVIEW STATS & GOAL PROGRESS */
      e("section", { className: "stats-bar" },
        e("div", { className: "stat-box" },
          e("div", { className: "stat-icon purple" }, e("i", { className: "fa-solid fa-list-check" })),
          e("div", { className: "stat-info" },
            e("div", { className: "value" }, tasks.length),
            e("div", { className: "label" }, "Total Tasks")
          )
        ),
        e("div", { className: "stat-divider" }),
        e("div", { className: "stat-box" },
          e("div", { className: "stat-icon emerald" }, e("i", { className: "fa-solid fa-circle-check" })),
          e("div", { className: "stat-info" },
            e("div", { className: "value" }, completedCount),
            e("div", { className: "label" }, "Completed")
          )
        ),
        e("div", { className: "stat-divider" }),
        e("div", { className: "stat-box" },
          e("div", { className: "stat-icon cyan" }, e("i", { className: "fa-solid fa-fire" })),
          e("div", { className: "stat-info" },
            e("div", { className: "value" }, `${progressPercent}%`),
            e("div", { className: "label" }, "Success Rate")
          )
        ),
        e("div", { className: "stat-divider" }),
        e("div", { className: "goal-tracker" },
          e("div", { className: "goal-header" },
            e("span", null, "Daily Goal"),
            e("span", null, `${completedCount}/${tasks.length || 1}`)
          ),
          e("div", { className: "progress-bar-bg" },
            e("div", { className: "progress-bar-fill", style: { width: `${progressPercent}%` } })
          )
        )
      ),

      /* MAIN WORKSPACE GRID */
      e("div", { className: "workspace-grid" },

        /* LEFT: TASKS SECTION */
        e("section", { className: "glass-card" },
          e("div", { className: "card-title" },
            e("div", { className: "card-title-left" },
              e("i", { className: "fa-solid fa-layer-group" }),
              e("h2", null, "Active Tasks")
            ),
            completedCount > 0 && e("button", {
              onClick: eraseCompletedTasks,
              className: "btn-erase-completed",
              title: "Clear all completed tasks"
            },
              e("i", { className: "fa-solid fa-broom" }),
              "Erase Completed"
            )
          ),

          /* Task Addition Form with Date & Deadline */
          e("form", { onSubmit: handleAddTask, className: "add-form" },
            e("input", {
              type: "text",
              placeholder: "Add new task or goal...",
              value: taskName,
              onChange: (evt) => setTaskName(evt.target.value),
              className: "input-box",
              required: true
            }),
            e("div", { className: "form-split" },
              e("input", {
                type: "text",
                placeholder: "Subject (e.g. Math)",
                value: subject,
                onChange: (evt) => setSubject(evt.target.value),
                className: "input-box"
              }),
              e("select", {
                value: priority,
                onChange: (evt) => setPriority(evt.target.value),
                className: "input-box"
              },
                e("option", { value: "low" }, "Low Priority"),
                e("option", { value: "medium" }, "Medium Priority"),
                e("option", { value: "high" }, "High Priority")
              )
            ),
            e("div", { className: "form-split" },
              e("div", { className: "date-input-group" },
                e("span", { className: "input-label" }, "Deadline"),
                e("input", {
                  type: "date",
                  value: deadline,
                  onChange: (evt) => setDeadline(evt.target.value),
                  className: "input-box"
                })
              )
            ),
            e("button", { type: "submit", className: "btn-add" },
              e("i", { className: "fa-solid fa-plus" }), " Add To Track"
            )
          ),

          /* Task List Display */
          e("ul", { className: "task-list-container" },
            tasks.length === 0
              ? e("div", { className: "empty-view" },
                  e("i", { className: "fa-regular fa-clipboard", style: { fontSize: "2rem", marginBottom: "8px" } }),
                  e("p", null, "Your workspace is clear. Add a task to begin!")
                )
              : tasks.map(task =>
                  e("li", { key: task.id, className: `task-card ${task.completed ? "completed" : ""}` },
                    e("div", { className: "task-left" },
                      e("div", { onClick: () => toggleTask(task.id), className: "check-btn" },
                        task.completed && e("i", { className: "fa-solid fa-check" })
                      ),
                      e("div", { className: "task-meta" },
                        e("span", { className: "task-name" }, task.name),
                        e("div", { className: "tag-group" },
                          e("span", { className: "tag-subject" }, task.subject),
                          e("span", { className: `tag-prio prio-${task.priority}` }, task.priority),
                          task.deadline && e("span", {
                            className: `tag-deadline ${!task.completed && isOverdue(task.deadline) ? "overdue" : ""}`
                          },
                            e("i", { className: "fa-regular fa-calendar" }),
                            `Due: ${task.deadline}`
                          )
                        )
                      )
                    ),
                    e("button", { onClick: () => deleteTask(task.id), className: "btn-remove", title: "Delete Task" },
                      e("i", { className: "fa-solid fa-trash-can" })
                    )
                  )
                )
          )
        ),

        /* RIGHT: POMODORO TIMER */
        e("section", { className: "glass-card timer-card" },
          e("div", { className: "card-title" },
            e("div", { className: "card-title-left" },
              e("i", { className: "fa-solid fa-stopwatch" }),
              e("h2", null, "Focus Session")
            )
          ),

          e("div", { className: "timer-nav" },
            e("button", {
              className: `timer-nav-btn ${timerMode === "focus" ? "active" : ""}`,
              onClick: () => switchTimerMode("focus")
            }, "Focus (25m)"),
            e("button", {
              className: `timer-nav-btn ${timerMode === "break" ? "active" : ""}`,
              onClick: () => switchTimerMode("break")
            }, "Break (5m)")
          ),

          e("div", { className: "timer-clock" }, formatTimer(secondsLeft)),

          e("div", { className: "timer-controls" },
            e("button", {
              onClick: () => setIsActive(!isActive),
              className: "btn-timer-main btn-start"
            },
              e("i", { className: `fa-solid ${isActive ? "fa-pause" : "fa-play"}`, style: { marginRight: "8px" } }),
              isActive ? "Pause" : "Start"
            ),
            e("button", {
              onClick: () => {
                setIsActive(false);
                setSecondsLeft(timerMode === "focus" ? 25 * 60 : 5 * 60);
              },
              className: "btn-timer-main btn-reset"
            }, "Reset")
          )
        )
      )
    )
  );
}

// Render React App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(e(App));