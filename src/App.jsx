import { useState, useEffect, useRef } from 'react'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dt-dark')
    return saved ? JSON.parse(saved) : true
  })
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('dt-tasks')
    return saved ? JSON.parse(saved) : []
  })
  
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('dt-completed')
    return saved ? JSON.parse(saved) : []
  })
  
  const [newTask, setNewTask] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work')
  const [showBreakScreen, setShowBreakScreen] = useState(false)
  const [breakTimeLeft, setBreakTimeLeft] = useState(0)
  const [totalBlocks, setTotalBlocks] = useState(() => {
    const saved = localStorage.getItem('dt-blocks')
    return saved ? JSON.parse(saved) : 0
  })
  
  const [quickTasks, setQuickTasks] = useState(() => {
    const saved = localStorage.getItem('dt-quick-tasks')
    return saved ? JSON.parse(saved) : [
      'study greedy algorithm (1hr)',
      'draw a use case diagram for a library system (30mins)',
      'study forward propagation in neural networks (2hrs)',
      'work on data structures project(1hr)',
      'study forward propagation in neural networks(2hr)'
    ]
  })
  const [newQuickTask, setNewQuickTask] = useState('')
  const [showQuickTaskInput, setShowQuickTaskInput] = useState(false)
  
  const inputRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('dt-tasks', JSON.stringify(tasks))
  }, [tasks])
  
  useEffect(() => {
    localStorage.setItem('dt-completed', JSON.stringify(completedTasks))
  }, [completedTasks])
  
  useEffect(() => {
    localStorage.setItem('dt-dark', JSON.stringify(darkMode))
  }, [darkMode])
  
  useEffect(() => {
    localStorage.setItem('dt-blocks', JSON.stringify(totalBlocks))
  }, [totalBlocks])

  useEffect(() => {
    localStorage.setItem('dt-quick-tasks', JSON.stringify(quickTasks))
  }, [quickTasks])

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      playSound()
      if (mode === 'work') {
        setTotalBlocks(b => b + 1)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode])

  useEffect(() => {
    let interval = null
    if (showBreakScreen && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft(t => t - 1)
      }, 1000)
    } else if (breakTimeLeft === 0 && showBreakScreen) {
      setShowBreakScreen(false)
      playSound()
    }
    return () => clearInterval(interval)
  }, [showBreakScreen, breakTimeLeft])

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    
    const task = {
      id: Date.now(),
      text: newTask.trim(),
      createdAt: new Date().toISOString()
    }
    setTasks(prev => [...prev, task])
    setNewTask('')
    inputRef.current?.focus()
  }

  const selectTask = (task) => {
    setActiveTask(task)
    setTimeLeft(25 * 60)
    setIsRunning(false)
    setMode('work')
  }

  const completeTask = (task, isLongBreak = false) => {
    setCompletedTasks(prev => [{
      ...task,
      completedAt: new Date().toISOString()
    }, ...prev])
    
    setTasks(prev => prev.filter(t => t.id !== task.id))
    
    if (activeTask?.id === task.id) {
      setActiveTask(null)
      setIsRunning(false)
      setTimeLeft(25 * 60)
    }
    
    if (isLongBreak) {
      setBreakTimeLeft(5 * 60)
      setShowBreakScreen(true)
    }
    
    setTotalBlocks(b => b + 1)
  }

  const handleTaskClick = (task) => {
    selectTask(task)
  }

  const handleCheckClick = (task, e) => {
    e.stopPropagation()
    completeTask(task, true)
  }

  const addQuickTaskToList = (text) => {
    const task = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toISOString()
    }
    setTasks(prev => [...prev, task])
  }

  const addNewQuickTask = (e) => {
    e.preventDefault()
    if (!newQuickTask.trim()) return
    setQuickTasks(prev => [...prev, newQuickTask.trim()])
    setNewQuickTask('')
    setShowQuickTaskInput(false)
  }

  const removeQuickTask = (index, e) => {
    e.stopPropagation()
    setQuickTasks(prev => prev.filter((_, i) => i !== index))
  }

  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setTimeLeft(25 * 60)
    setIsRunning(false)
  }

  const skipBreak = () => {
    setShowBreakScreen(false)
    setBreakTimeLeft(0)
  }

  const clearCompleted = () => {
    setCompletedTasks([])
  }

  const deleteTask = (task, e) => {
    e.stopPropagation()
    setTasks(prev => prev.filter(t => t.id !== task.id))
    if (activeTask?.id === task.id) {
      setActiveTask(null)
      setIsRunning(false)
      setTimeLeft(25 * 60)
    }
  }

  if (showBreakScreen) {
    return (
      <div className="break-screen">
        <style>{styles}</style>
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAEML5ve6rl1ABU3o+L0vng/GVeb4e69fkcYRJbc8sN6PCxPl9v6yH5DIk6T2PnPg0s4Qo3X/dGIU0A8f87+14tVQUJ7yP/akV9ORXbD+92VaVRKb7z+4ZpvW09mrfnlnnReUF+n+OuidGRSVJ7z7Kl5aVVQmO/wr4BsWEyR6/SzgXFfTonn+beGd2JIgOL8vIx7ZkV24//BkYFqQWrc/8aWh29DZtT/y5uMdkBjz//QoJF7PV7K/9WllYA6WcX/2qqaiDdTwP/frp+NOE++/+OsopE1S7n/5rClljNHtP/qsqiaNUOv/+21q500P6r/8LssnDQ6pf/zuq+fNDWg//W5sqI0MZz/97ezpTMtl//5t7aoMjGS//q1ubszLoz/+7O8vzMqiP/8sL7CMiaD//uvwMUyI37//Ky/yDMee//8qsDNNBl0//2owdAzFW7//ai/1DQRaf/+pb3YNAxk//6ivNo1CF7//p+73DYEVw==" />
        <div className="break-content">
          <div className="break-timer">{formatTime(breakTimeLeft)}</div>
          <div className="break-message">breathe</div>
          <div className="break-sub">you earned this</div>
          <button className="skip-btn" onClick={skipBreak}>skip</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <style>{styles}</style>
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAEML5ve6rl1ABU3o+L0vng/GVeb4e69fkcYRJbc8sN6PCxPl9v6yH5DIk6T2PnPg0s4Qo3X/dGIU0A8f87+14tVQUJ7yP/akV9ORXbD+92VaVRKb7z+4ZpvW09mrfnlnnReUF+n+OuidGRSVJ7z7Kl5aVVQmO/wr4BsWEyR6/SzgXFfTonn+beGd2JIgOL8vIx7ZkV24//BkYFqQWrc/8aWh29DZtT/y5uMdkBjz//QoJF7PV7K/9WllYA6WcX/2qqaiDdTwP/frp+NOE++/+OsopE1S7n/5rClljNHtP/qsqiaNUOv/+21q500P6r/8LssnDQ6pf/zuq+fNDWg//W5sqI0MZz/97ezpTMtl//5t7aoMjGS//q1ubszLoz/+7O8vzMqiP/8sL7CMiaD//uvwMUyI37//Ky/yDMee//8qsDNNBl0//2owdAzFW7//ai/1DQRaf/+pb3YNAxk//6ivNo1CF7//p+73DYEVw==" />
      
      <div className="layout">
        <div className="done-panel">
          <div className="done-header">
            <span className="done-title">done</span>
            <span className="done-count">{completedTasks.length}</span>
            {completedTasks.length > 0 && (
              <button className="clear-btn" onClick={clearCompleted}>clear</button>
            )}
          </div>
          <div className="done-list">
            {completedTasks.slice(0, 10).map(task => (
              <div key={task.id} className="done-item">
                {task.text}
              </div>
            ))}
          </div>
        </div>

        <div className="main">
          <div className="top-bar">
            <div className="blocks-count">
              <span className="blocks-num">{totalBlocks}</span>
              <span className="blocks-label">total blocks</span>
            </div>
            <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? 'light' : 'dark'}
            </button>
          </div>

          <div className="timer-section">
            {activeTask ? (
              <>
                <div className="active-task-name">{activeTask.text}</div>
                <div className={`timer ${isRunning ? 'running' : ''}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="timer-controls">
                  {!isRunning ? (
                    <button className="timer-btn start" onClick={startTimer}>start</button>
                  ) : (
                    <button className="timer-btn pause" onClick={pauseTimer}>pause</button>
                  )}
                  <button className="timer-btn reset" onClick={resetTimer}>reset</button>
                  <button className="timer-btn done" onClick={() => completeTask(activeTask, true)}>done + break</button>
                </div>
              </>
            ) : (
              <div className="no-task">
                <div className="no-task-text">pick a task below</div>
                <div className="no-task-sub">or add one</div>
              </div>
            )}
          </div>

          <form className="task-form" onSubmit={addTask}>
            <input
              ref={inputRef}
              type="text"
              className="task-input"
              placeholder="[action] + [what] + ([how long/how much))"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit" className="add-btn">add</button>
          </form>
          
          <div className="task-hint">e.g. "solve 3 algorithm problems(1hr)" or "read chapter 5(15mins)"</div>

          <div className="task-list">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`task-item ${activeTask?.id === task.id ? 'active' : ''}`}
                onClick={() => handleTaskClick(task)}
              >
                <button 
                  className="check-btn"
                  onClick={(e) => handleCheckClick(task, e)}
                  title="complete + break"
                />
                <span className="task-text">{task.text}</span>
                <button 
                  className="delete-btn"
                  onClick={(e) => deleteTask(task, e)}
                  title="delete"
                >x</button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="empty-state">no tasks yet</div>
            )}
          </div>

          <div className="quick-tasks-section">
            <div className="quick-tasks-header">
              <span className="quick-tasks-title">quick add</span>
              <button 
                className="add-quick-btn"
                onClick={() => setShowQuickTaskInput(!showQuickTaskInput)}
              >
                {showQuickTaskInput ? 'cancel' : '+ new'}
              </button>
            </div>
            
            {showQuickTaskInput && (
              <form className="quick-task-form" onSubmit={addNewQuickTask}>
                <input
                  type="text"
                  className="quick-task-input"
                  placeholder="new preset task..."
                  value={newQuickTask}
                  onChange={(e) => setNewQuickTask(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="quick-task-submit">save</button>
              </form>
            )}
            
            <div className="quick-tasks-list">
              {quickTasks.map((text, index) => (
                <button
                  key={index}
                  className="quick-task-chip"
                  onClick={() => addQuickTaskToList(text)}
                >
                  {text}
                  <span 
                    className="chip-remove"
                    onClick={(e) => removeQuickTask(index, e)}
                  >x</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

.app {
  min-height: 100vh;
  min-height: 100dvh;
  font-family: 'IBM Plex Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
  transition: background 0.3s, color 0.3s;
  display: flex;
  justify-content: center;
}

.app.dark {
  background: #0a0a0a;
  color: #c8c8c8;
}

.app.light {
  background: #fafaf8;
  color: #1a1a1a;
}

.layout {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 100vh;
  min-height: 100dvh;
}

.done-panel {
  width: 240px;
  padding: 32px 24px;
  border-right: 1px solid;
  flex-shrink: 0;
}

.dark .done-panel {
  border-color: #1f1f1f;
}

.light .done-panel {
  border-color: #e0e0e0;
}

.done-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.done-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: 0.5;
}

.done-count {
  font-size: 13px;
  opacity: 0.3;
}

.clear-btn {
  margin-left: auto;
  font-size: 12px;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.3;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 8px;
}

.clear-btn:hover {
  opacity: 0.6;
}

.done-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.done-item {
  font-size: 14px;
  opacity: 0.4;
  text-decoration: line-through;
  word-break: break-word;
  line-height: 1.5;
}

.main {
  flex: 1;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 700px;
  margin: 0 auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 56px;
  width: 100%;
}

.blocks-count {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.blocks-num {
  font-size: 40px;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.blocks-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.4;
}

.mode-toggle {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: none;
  border: 1px solid;
  padding: 12px 20px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.dark .mode-toggle {
  color: #c8c8c8;
  border-color: #333;
}

.light .mode-toggle {
  color: #1a1a1a;
  border-color: #ccc;
}

.mode-toggle:hover {
  opacity: 0.6;
}

.timer-section {
  text-align: center;
  margin-bottom: 48px;
  width: 100%;
}

.active-task-name {
  font-size: 18px;
  margin-bottom: 28px;
  opacity: 0.6;
}

.timer {
  font-size: 120px;
  font-weight: 400;
  letter-spacing: -0.03em;
  margin-bottom: 36px;
  transition: color 0.3s;
  line-height: 1;
}

.timer.running {
  color: #22c55e;
}

.no-task {
  padding: 64px 0;
}

.no-task-text {
  font-size: 22px;
  opacity: 0.3;
  margin-bottom: 12px;
}

.no-task-sub {
  font-size: 16px;
  opacity: 0.2;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.timer-btn {
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 16px 28px;
  border: 1px solid;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.dark .timer-btn {
  color: #c8c8c8;
  border-color: #333;
}

.light .timer-btn {
  color: #1a1a1a;
  border-color: #ccc;
}

.timer-btn:hover {
  opacity: 0.6;
}

.timer-btn.start {
  background: #22c55e;
  border-color: #22c55e;
  color: #0a0a0a;
}

.timer-btn.start:hover {
  background: #16a34a;
  border-color: #16a34a;
  opacity: 1;
}

.timer-btn.done {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.timer-btn.done:hover {
  background: #2563eb;
  border-color: #2563eb;
  opacity: 1;
}

.task-form {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  width: 100%;
}

.task-input {
  flex: 1;
  font-size: 17px;
  padding: 18px 22px;
  border: 1px solid;
  background: transparent;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.dark .task-input {
  color: #c8c8c8;
  border-color: #333;
}

.dark .task-input:focus {
  border-color: #555;
}

.dark .task-input::placeholder {
  color: #555;
}

.light .task-input {
  color: #1a1a1a;
  border-color: #ccc;
}

.light .task-input:focus {
  border-color: #999;
}

.light .task-input::placeholder {
  color: #aaa;
}

.add-btn {
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 18px 28px;
  border: 1px solid;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.dark .add-btn {
  color: #c8c8c8;
  border-color: #333;
}

.light .add-btn {
  color: #1a1a1a;
  border-color: #ccc;
}

.add-btn:hover {
  opacity: 0.6;
}

.task-hint {
  font-size: 13px;
  opacity: 0.3;
  margin-bottom: 24px;
  width: 100%;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
  width: 100%;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s;
}

.dark .task-item {
  border-color: #222;
}

.dark .task-item:hover {
  border-color: #444;
}

.dark .task-item.active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.light .task-item {
  border-color: #ddd;
}

.light .task-item:hover {
  border-color: #bbb;
}

.light .task-item.active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}

.check-btn {
  width: 26px;
  height: 26px;
  border: 2px solid;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.dark .check-btn {
  border-color: #444;
}

.dark .check-btn:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.2);
}

.light .check-btn {
  border-color: #bbb;
}

.light .check-btn:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

.task-text {
  flex: 1;
  font-size: 17px;
}

.delete-btn {
  font-size: 16px;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.25;
  cursor: pointer;
  font-family: inherit;
  padding: 8px 12px;
  transition: opacity 0.15s;
}

.delete-btn:hover {
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 56px;
  opacity: 0.25;
  font-size: 17px;
}

.quick-tasks-section {
  width: 100%;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid;
}

.dark .quick-tasks-section {
  border-color: #222;
}

.light .quick-tasks-section {
  border-color: #ddd;
}

.quick-tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quick-tasks-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.4;
}

.add-quick-btn {
  font-size: 13px;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.4;
  cursor: pointer;
  font-family: inherit;
  padding: 4px 8px;
  transition: opacity 0.15s;
}

.add-quick-btn:hover {
  opacity: 0.7;
}

.quick-task-form {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.quick-task-input {
  flex: 1;
  font-size: 15px;
  padding: 12px 16px;
  border: 1px solid;
  background: transparent;
  font-family: inherit;
  outline: none;
}

.dark .quick-task-input {
  color: #c8c8c8;
  border-color: #333;
}

.light .quick-task-input {
  color: #1a1a1a;
  border-color: #ccc;
}

.quick-task-submit {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 12px 20px;
  border: 1px solid;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

.dark .quick-task-submit {
  color: #c8c8c8;
  border-color: #333;
}

.light .quick-task-submit {
  color: #1a1a1a;
  border-color: #ccc;
}

.quick-tasks-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-task-chip {
  font-size: 14px;
  padding: 10px 16px;
  border: 1px solid;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark .quick-task-chip {
  color: #c8c8c8;
  border-color: #333;
}

.dark .quick-task-chip:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.light .quick-task-chip {
  color: #1a1a1a;
  border-color: #ccc;
}

.light .quick-task-chip:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.chip-remove {
  font-size: 12px;
  opacity: 0.3;
  transition: opacity 0.15s;
}

.chip-remove:hover {
  opacity: 0.8;
}

.break-screen {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #14532d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
  padding: 24px;
}

.break-content {
  text-align: center;
  color: #bbf7d0;
}

.break-timer {
  font-size: clamp(80px, 20vw, 160px);
  font-weight: 400;
  letter-spacing: -0.03em;
  margin-bottom: 32px;
  line-height: 1;
}

.break-message {
  font-size: clamp(24px, 5vw, 36px);
  margin-bottom: 12px;
  opacity: 0.8;
  letter-spacing: 0.05em;
}

.break-sub {
  font-size: clamp(14px, 3vw, 18px);
  opacity: 0.5;
  margin-bottom: 56px;
}

.skip-btn {
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 32px;
  border: 1px solid rgba(187, 247, 208, 0.3);
  background: none;
  color: #bbf7d0;
  cursor: pointer;
  font-family: inherit;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.skip-btn:hover {
  opacity: 0.9;
}

/* Tablet */
@media (max-width: 900px) {
  .layout {
    flex-direction: column;
  }
  
  .done-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid;
    padding: 24px 32px;
    max-height: none;
  }
  
  .done-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
  
  .done-item {
    font-size: 13px;
  }
  
  .main {
    padding: 40px 32px;
  }
  
  .timer {
    font-size: 100px;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .done-panel {
    padding: 20px 24px;
  }
  
  .done-header {
    margin-bottom: 14px;
  }
  
  .done-title {
    font-size: 12px;
  }
  
  .main {
    padding: 32px 20px;
  }
  
  .top-bar {
    margin-bottom: 40px;
  }
  
  .blocks-num {
    font-size: 32px;
  }
  
  .blocks-label {
    font-size: 12px;
  }
  
  .mode-toggle {
    font-size: 12px;
    padding: 10px 16px;
  }
  
  .timer {
    font-size: 72px;
    margin-bottom: 28px;
  }
  
  .active-task-name {
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  .no-task-text {
    font-size: 18px;
  }
  
  .no-task-sub {
    font-size: 14px;
  }
  
  .timer-controls {
    gap: 10px;
  }
  
  .timer-btn {
    font-size: 13px;
    padding: 14px 20px;
  }
  
  .task-form {
    flex-direction: column;
    gap: 10px;
  }
  
  .task-input {
    font-size: 16px;
    padding: 16px 18px;
  }
  
  .add-btn {
    font-size: 14px;
    padding: 16px 24px;
  }
  
  .task-item {
    padding: 16px 18px;
    gap: 14px;
  }
  
  .check-btn {
    width: 24px;
    height: 24px;
  }
  
  .task-text {
    font-size: 15px;
  }
  
  .delete-btn {
    font-size: 14px;
    padding: 6px 10px;
  }
  
  .empty-state {
    padding: 40px;
    font-size: 15px;
  }
  
  .quick-tasks-section {
    margin-top: 20px;
    padding-top: 20px;
  }
  
  .quick-task-chip {
    font-size: 13px;
    padding: 8px 14px;
  }
}

/* Small mobile */
@media (max-width: 380px) {
  .timer {
    font-size: 56px;
  }
  
  .timer-btn {
    font-size: 12px;
    padding: 12px 16px;
  }
}
`

export default App
