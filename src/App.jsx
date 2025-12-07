import { useState, useEffect, useRef } from 'react'

const QUOTES = [
  "you're doing great",
  "one block at a time", 
  "stay with it",
  "you've got this",
  "keep going",
  "focus is a muscle",
  "breathe and continue",
  "you're not alone",
  "trust the process",
  "small steps count",
  "almost there",
  "locked in"
]

const TIMER_OPTIONS = [10, 25, 50, 90]

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
    const savedDate = localStorage.getItem('dt-completed-date')
    const today = new Date().toDateString()
    if (savedDate !== today) {
      localStorage.setItem('dt-completed-date', today)
      return []
    }
    return saved ? JSON.parse(saved) : []
  })
  
  const [completedGoals, setCompletedGoals] = useState(() => {
    const saved = localStorage.getItem('dt-completed-goals')
    const savedDate = localStorage.getItem('dt-goals-date')
    const today = new Date().toDateString()
    if (savedDate !== today) {
      localStorage.setItem('dt-goals-date', today)
      return 0
    }
    return saved ? JSON.parse(saved) : 0
  })
  
  const [newTask, setNewTask] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const [timerDuration, setTimerDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [showBreakScreen, setShowBreakScreen] = useState(false)
  const [breakTimeLeft, setBreakTimeLeft] = useState(0)
  
  const [totalBlocks, setTotalBlocks] = useState(() => {
    const saved = localStorage.getItem('dt-blocks')
    return saved ? JSON.parse(saved) : 0
  })
  
  const [todayBlocks, setTodayBlocks] = useState(() => {
    const saved = localStorage.getItem('dt-today-blocks')
    const savedDate = localStorage.getItem('dt-today-date')
    const today = new Date().toDateString()
    if (savedDate !== today) {
      localStorage.setItem('dt-today-date', today)
      return 0
    }
    return saved ? JSON.parse(saved) : 0
  })
  
  const [quickTasks, setQuickTasks] = useState(() => {
    const saved = localStorage.getItem('dt-quick-tasks')
    return saved ? JSON.parse(saved) : [
      'study greedy algorithm (1hr)',
      'draw a use case diagram (30mins)',
      'study neural networks (2hrs)',
      'data structures project (1hr)',
      'kaust prep (1hr)'
    ]
  })
  const [newQuickTask, setNewQuickTask] = useState('')
  const [showQuickTaskInput, setShowQuickTaskInput] = useState(false)
  
  const [goalsCompleted, setGoalsCompleted] = useState(() => {
    const saved = localStorage.getItem('dt-goals-completed')
    const savedDate = localStorage.getItem('dt-goals-date')
    const today = new Date().toDateString()
    if (savedDate !== today) {
      localStorage.setItem('dt-goals-date', today)
      return 0
    }
    return saved ? JSON.parse(saved) : 0
  })
  
  const [currentQuote, setCurrentQuote] = useState(QUOTES[0])
  const [showSummary, setShowSummary] = useState(false)
  const [brownNoiseOn, setBrownNoiseOn] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)
  const [editText, setEditText] = useState('')
  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedGoal, setDraggedGoal] = useState(null)
  
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const brownNoiseRef = useRef(null)
  const editInputRef = useRef(null)

  // Persist
  useEffect(() => {
    localStorage.setItem('dt-tasks', JSON.stringify(tasks))
  }, [tasks])
  
  useEffect(() => {
    localStorage.setItem('dt-completed', JSON.stringify(completedTasks))
  }, [completedTasks])
  
  useEffect(() => {
    localStorage.setItem('dt-completed-goals', JSON.stringify(completedGoals))
  }, [completedGoals])
  
  useEffect(() => {
    localStorage.setItem('dt-dark', JSON.stringify(darkMode))
  }, [darkMode])
  
  useEffect(() => {
    localStorage.setItem('dt-blocks', JSON.stringify(totalBlocks))
  }, [totalBlocks])
  
  useEffect(() => {
    localStorage.setItem('dt-today-blocks', JSON.stringify(todayBlocks))
  }, [todayBlocks])

  useEffect(() => {
    localStorage.setItem('dt-quick-tasks', JSON.stringify(quickTasks))
  }, [quickTasks])

  useEffect(() => {
    localStorage.setItem('dt-goals-completed', JSON.stringify(goalsCompleted))
  }, [goalsCompleted])

  // Main timer
  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      playSound()
      setTotalBlocks(b => b + 1)
      setTodayBlocks(b => b + 1)
      setBreakTimeLeft(5 * 60)
      setShowBreakScreen(true)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  // Break timer
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

  // Rotate quotes
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    }, 30000)
    return () => clearInterval(interval)
  }, [isRunning])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return
      
      if (e.code === 'Space') {
        e.preventDefault()
        if (activeTask) {
          isRunning ? pauseTimer() : startTimer()
        }
      }
      if (e.code === 'Enter' && activeTask) {
        e.preventDefault()
        completeTask(activeTask, true)
      }
      if (e.code === 'KeyR' && activeTask) {
        e.preventDefault()
        resetTimer()
      }
      if (e.code === 'Escape') {
        e.preventDefault()
        setActiveTask(null)
        setIsRunning(false)
        setTimeLeft(timerDuration * 60)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTask, isRunning, timerDuration])

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const toggleBrownNoise = () => {
    if (brownNoiseOn) {
      if (brownNoiseRef.current) {
        brownNoiseRef.current.source.stop()
        brownNoiseRef.current.audioCtx.close()
        brownNoiseRef.current = null
      }
      setBrownNoiseOn(false)
    } else {
      // Create smooth deep brown noise
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const bufferSize = 4 * audioCtx.sampleRate
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
      const data = buffer.getChannelData(0)
      
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        // Deeper brown noise - more smoothing
        data[i] = (lastOut + (0.004 * white)) / 1.004
        lastOut = data[i]
        data[i] *= 15 // Boost volume since it's quieter with more smoothing
      }
      
      const source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      
      // Low pass filter for even smoother sound
      const filter = audioCtx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 150 // Only deep frequencies
      
      const gain = audioCtx.createGain()
      gain.gain.value = 0.4
      
      source.connect(filter)
      filter.connect(gain)
      gain.connect(audioCtx.destination)
      source.start()
      
      brownNoiseRef.current = { source, audioCtx, gain }
      setBrownNoiseOn(true)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const total = timerDuration * 60
    return ((total - timeLeft) / total) * 100
  }

  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    const task = {
      id: Date.now(),
      text: newTask.trim(),
      createdAt: new Date().toISOString(),
      isGoal: false // Manual tasks are not goals
    }
    setTasks(prev => [...prev, task])
    setNewTask('')
    inputRef.current?.focus()
  }

  const selectTask = (task, duration = timerDuration) => {
    setActiveTask(task)
    setTimerDuration(duration)
    setTimeLeft(duration * 60)
    setIsRunning(false)
  }

  const completeTask = (task, triggerBreak = false) => {
    setCompletedTasks(prev => [{
      ...task,
      completedAt: new Date().toISOString()
    }, ...prev])
    setTasks(prev => prev.filter(t => t.id !== task.id))
    if (activeTask?.id === task.id) {
      setActiveTask(null)
      setIsRunning(false)
      setTimeLeft(timerDuration * 60)
    }
    setTotalBlocks(b => b + 1)
    setTodayBlocks(b => b + 1)
    
    // Track if this was a goal (from quick tasks)
    if (task.isGoal) {
      setGoalsCompleted(g => g + 1)
    }
    
    if (triggerBreak) {
      setBreakTimeLeft(5 * 60)
      setShowBreakScreen(true)
    }
  }

  const handleTaskClick = (task) => selectTask(task)

  const handleCheckClick = (task, e) => {
    e.stopPropagation()
    completeTask(task, true)
  }

  const addQuickTaskToList = (text, index) => {
    const task = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toISOString(),
      isGoal: true,
      goalIndex: index
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
    setTimeLeft(timerDuration * 60)
    setIsRunning(false)
  }

  const skipBreak = () => {
    setShowBreakScreen(false)
    setBreakTimeLeft(0)
  }

  const clearCompleted = () => setCompletedTasks([])

  const deleteTask = (task, e) => {
    e.stopPropagation()
    setTasks(prev => prev.filter(t => t.id !== task.id))
    if (activeTask?.id === task.id) {
      setActiveTask(null)
      setIsRunning(false)
      setTimeLeft(timerDuration * 60)
    }
  }

  // Double click to edit task
  const handleTaskDoubleClick = (task, e) => {
    e.stopPropagation()
    setEditingTask(task.id)
    setEditText(task.text)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const saveTaskEdit = (taskId) => {
    if (editText.trim()) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, text: editText.trim() } : t
      ))
    }
    setEditingTask(null)
    setEditText('')
  }

  // Double click to edit goal
  const handleGoalDoubleClick = (index, e) => {
    e.stopPropagation()
    setEditingGoal(index)
    setEditText(quickTasks[index])
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const saveGoalEdit = (index) => {
    if (editText.trim()) {
      setQuickTasks(prev => prev.map((t, i) => 
        i === index ? editText.trim() : t
      ))
    }
    setEditingGoal(null)
    setEditText('')
  }

  // Drag and drop for tasks
  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTaskDragOver = (e, index) => {
    e.preventDefault()
    if (!draggedTask) return
    
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id)
    if (draggedIndex === index) return
    
    const newTasks = [...tasks]
    newTasks.splice(draggedIndex, 1)
    newTasks.splice(index, 0, draggedTask)
    setTasks(newTasks)
  }

  const handleTaskDragEnd = () => {
    setDraggedTask(null)
  }

  // Drag and drop for goals
  const handleGoalDragStart = (e, index) => {
    setDraggedGoal(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleGoalDragOver = (e, index) => {
    e.preventDefault()
    if (draggedGoal === null || draggedGoal === index) return
    
    const newGoals = [...quickTasks]
    const [removed] = newGoals.splice(draggedGoal, 1)
    newGoals.splice(index, 0, removed)
    setQuickTasks(newGoals)
    setDraggedGoal(index)
  }

  const handleGoalDragEnd = () => {
    setDraggedGoal(null)
  }

  // Move task to goals
  const moveTaskToGoals = (task) => {
    setQuickTasks(prev => [...prev, task.text])
    setTasks(prev => prev.filter(t => t.id !== task.id))
    if (activeTask?.id === task.id) {
      setActiveTask(null)
      setIsRunning(false)
      setTimeLeft(timerDuration * 60)
    }
  }

  // Move goal to tasks
  const moveGoalToTasks = (index) => {
    const text = quickTasks[index]
    const task = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toISOString(),
      isGoal: true
    }
    setTasks(prev => [...prev, task])
    setQuickTasks(prev => prev.filter((_, i) => i !== index))
  }

  // Panic button - switch to 10 min
  const panicMode = () => {
    setTimerDuration(10)
    setTimeLeft(10 * 60)
    setIsRunning(false)
  }

  // Random task picker
  const pickRandomTask = () => {
    if (tasks.length === 0) return
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
    selectTask(randomTask)
  }

  // Change timer duration
  const changeTimer = (mins) => {
    setTimerDuration(mins)
    setTimeLeft(mins * 60)
    setIsRunning(false)
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

  if (showSummary) {
    return (
      <div className="summary-screen">
        <style>{styles}</style>
        <div className="summary-content">
          <div className="summary-title">today's summary</div>
          <div className="summary-stat">
            <span className="summary-num">{goalsCompleted}</span>
            <span className="summary-label">goals completed</span>
          </div>
          <div className="summary-stat">
            <span className="summary-num">{completedTasks.length}</span>
            <span className="summary-label">tasks done</span>
          </div>
          <div className="summary-tasks">
            {completedTasks.map(task => (
              <div key={task.id} className="summary-task-item">{task.text}</div>
            ))}
          </div>
          <button className="summary-close" onClick={() => setShowSummary(false)}>close</button>
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
              <div key={task.id} className="done-item">{task.text}</div>
            ))}
          </div>
          {completedTasks.length > 0 && (
            <button className="summary-btn" onClick={() => setShowSummary(true)}>view summary</button>
          )}
        </div>

        <div className="main">
          <div className="top-bar">
            <div className="blocks-count">
              <span className="blocks-num">{totalBlocks}</span>
              <span className="blocks-label">total blocks</span>
            </div>
            <div className="today-count">
              <span className="today-num">{goalsCompleted}</span>
              <span className="today-divider">/</span>
              <span className="today-goal">{quickTasks.length + goalsCompleted}</span>
              <span className="today-label">goals</span>
            </div>
            <div className="top-actions">
              <button className={`noise-toggle ${brownNoiseOn ? 'active' : ''}`} onClick={toggleBrownNoise}>
                {brownNoiseOn ? 'noise on' : 'noise off'}
              </button>
              <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? 'light' : 'dark'}
              </button>
            </div>
          </div>

          <div className="timer-section">
            {activeTask ? (
              <>
                <div className="active-task-name">{activeTask.text}</div>
                
                <div className="timer-ring-container">
                  <svg className="timer-ring" viewBox="0 0 200 200">
                    <circle className="timer-ring-bg" cx="100" cy="100" r="90" />
                    <circle 
                      className="timer-ring-progress" 
                      cx="100" cy="100" r="90"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 90}`,
                        strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgress() / 100)}`
                      }}
                    />
                  </svg>
                  <div className={`timer ${isRunning ? 'running' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {isRunning && (
                  <div className="focus-quote">{currentQuote}</div>
                )}

                <div className="timer-presets">
                  {TIMER_OPTIONS.map(mins => (
                    <button 
                      key={mins}
                      className={`preset-btn ${timerDuration === mins ? 'active' : ''}`}
                      onClick={() => changeTimer(mins)}
                    >
                      {mins}m
                    </button>
                  ))}
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

                <button className="panic-btn" onClick={panicMode}>can't focus? 10 min mode</button>
              </>
            ) : (
              <div className="no-task">
                <div className="no-task-text">add a quick task</div>
                <div className="no-task-sub">or pick a goal below</div>
                {tasks.length > 0 && (
                  <button className="random-btn" onClick={pickRandomTask}>pick random for me</button>
                )}
              </div>
            )}
          </div>

          <form className="task-form" onSubmit={addTask}>
            <input
              ref={inputRef}
              type="text"
              className="task-input"
              placeholder="add a quick task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit" className="add-btn">add</button>
          </form>
          
          <div className="task-hint">quick task — won't count toward today's goals</div>

          <div className="task-list">
            {tasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`task-item ${activeTask?.id === task.id ? 'active' : ''} ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                onClick={() => handleTaskClick(task)}
                onDoubleClick={(e) => handleTaskDoubleClick(task, e)}
                draggable
                onDragStart={(e) => handleTaskDragStart(e, task)}
                onDragOver={(e) => handleTaskDragOver(e, index)}
                onDragEnd={handleTaskDragEnd}
              >
                <button 
                  className="check-btn"
                  onClick={(e) => handleCheckClick(task, e)}
                  title="complete + break"
                />
                {editingTask === task.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveTaskEdit(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTaskEdit(task.id)
                      if (e.key === 'Escape') { setEditingTask(null); setEditText('') }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="task-text">{task.text}</span>
                )}
                <button 
                  className="move-btn"
                  onClick={(e) => { e.stopPropagation(); moveTaskToGoals(task) }}
                  title="move to goals"
                >↓</button>
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
              <span className="quick-tasks-title">today's goals</span>
              <button 
                className="add-quick-btn"
                onClick={() => setShowQuickTaskInput(!showQuickTaskInput)}
              >
                {showQuickTaskInput ? 'cancel' : '+ add goal'}
              </button>
            </div>
            <div className="goals-hint">set your goals before you start — these count toward your progress</div>
            
            {showQuickTaskInput && (
              <form className="quick-task-form" onSubmit={addNewQuickTask}>
                <input
                  type="text"
                  className="quick-task-input"
                  placeholder="[action] + [what] + [time] e.g. study chapter 5 (1hr)"
                  value={newQuickTask}
                  onChange={(e) => setNewQuickTask(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="quick-task-submit">save</button>
              </form>
            )}
            
            <div className="quick-tasks-list">
              {quickTasks.map((text, index) => (
                <div
                  key={index}
                  className={`quick-task-chip ${draggedGoal === index ? 'dragging' : ''}`}
                  onClick={() => moveGoalToTasks(index)}
                  onDoubleClick={(e) => handleGoalDoubleClick(index, e)}
                  draggable
                  onDragStart={(e) => handleGoalDragStart(e, index)}
                  onDragOver={(e) => handleGoalDragOver(e, index)}
                  onDragEnd={handleGoalDragEnd}
                >
                  {editingGoal === index ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      className="edit-input-small"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => saveGoalEdit(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveGoalEdit(index)
                        if (e.key === 'Escape') { setEditingGoal(null); setEditText('') }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span>{text}</span>
                  )}
                  <span 
                    className="chip-remove"
                    onClick={(e) => removeQuickTask(index, e)}
                  >x</span>
                </div>
              ))}
            </div>
          </div>

          <div className="keyboard-hints">
            space: start/pause | enter: complete | r: reset | esc: deselect
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
  display: flex;
  flex-direction: column;
}

.dark .done-panel { border-color: #1f1f1f; }
.light .done-panel { border-color: #e0e0e0; }

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

.clear-btn:hover { opacity: 0.6; }

.done-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.done-item {
  font-size: 14px;
  opacity: 0.4;
  text-decoration: line-through;
  word-break: break-word;
  line-height: 1.5;
}

.summary-btn {
  margin-top: 20px;
  font-size: 12px;
  background: none;
  border: 1px solid;
  padding: 10px;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.dark .summary-btn { color: #c8c8c8; border-color: #333; }
.light .summary-btn { color: #1a1a1a; border-color: #ccc; }
.summary-btn:hover { opacity: 0.7; }

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
  margin-bottom: 40px;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
}

.blocks-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.blocks-num {
  font-size: 36px;
  font-weight: 500;
}

.blocks-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.4;
}

.today-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.today-num {
  font-size: 24px;
  font-weight: 500;
}

.today-divider {
  font-size: 18px;
  opacity: 0.3;
}

.today-goal {
  font-size: 18px;
  opacity: 0.4;
}

.today-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.4;
  margin-left: 6px;
}

.top-actions {
  display: flex;
  gap: 10px;
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

.dark .mode-toggle { color: #c8c8c8; border-color: #333; }
.light .mode-toggle { color: #1a1a1a; border-color: #ccc; }
.mode-toggle:hover { opacity: 0.6; }

.noise-toggle {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: none;
  border: 1px solid;
  padding: 12px 20px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.dark .noise-toggle { color: #c8c8c8; border-color: #333; }
.light .noise-toggle { color: #1a1a1a; border-color: #ccc; }
.noise-toggle:hover { opacity: 0.6; }

.noise-toggle.active {
  background: #22c55e;
  border-color: #22c55e;
  color: #0a0a0a;
}

.noise-toggle.active:hover { opacity: 0.8; }

.timer-section {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.active-task-name {
  font-size: 18px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.timer-ring-container {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto 20px;
}

.timer-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-ring-bg {
  fill: none;
  stroke-width: 4;
}

.dark .timer-ring-bg { stroke: #222; }
.light .timer-ring-bg { stroke: #ddd; }

.timer-ring-progress {
  fill: none;
  stroke: #22c55e;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  font-weight: 400;
  letter-spacing: -0.03em;
  transition: color 0.3s;
}

.timer.running { color: #22c55e; }

.focus-quote {
  font-size: 14px;
  opacity: 0.4;
  margin-bottom: 20px;
  font-style: italic;
}

.timer-presets {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.preset-btn {
  font-size: 13px;
  padding: 8px 16px;
  border: 1px solid;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.dark .preset-btn { color: #c8c8c8; border-color: #333; }
.light .preset-btn { color: #1a1a1a; border-color: #ccc; }

.preset-btn.active {
  background: #22c55e;
  border-color: #22c55e;
  color: #0a0a0a;
}

.preset-btn:hover:not(.active) { opacity: 0.6; }

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
  margin-bottom: 24px;
}

.random-btn {
  font-size: 14px;
  padding: 14px 24px;
  border: 1px solid;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.dark .random-btn { color: #c8c8c8; border-color: #333; }
.light .random-btn { color: #1a1a1a; border-color: #ccc; }
.random-btn:hover { opacity: 0.6; }

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
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

.dark .timer-btn { color: #c8c8c8; border-color: #333; }
.light .timer-btn { color: #1a1a1a; border-color: #ccc; }
.timer-btn:hover { opacity: 0.6; }

.timer-btn.start {
  background: #22c55e;
  border-color: #22c55e;
  color: #0a0a0a;
}

.timer-btn.start:hover { background: #16a34a; border-color: #16a34a; opacity: 1; }

.timer-btn.done {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.timer-btn.done:hover { background: #2563eb; border-color: #2563eb; opacity: 1; }

.panic-btn {
  font-size: 12px;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.3;
  cursor: pointer;
  font-family: inherit;
  padding: 8px;
  transition: opacity 0.2s;
}

.panic-btn:hover { opacity: 0.6; }

.task-form {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
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

.dark .task-input { color: #c8c8c8; border-color: #333; }
.dark .task-input:focus { border-color: #555; }
.dark .task-input::placeholder { color: #555; }
.light .task-input { color: #1a1a1a; border-color: #ccc; }
.light .task-input:focus { border-color: #999; }
.light .task-input::placeholder { color: #aaa; }

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

.dark .add-btn { color: #c8c8c8; border-color: #333; }
.light .add-btn { color: #1a1a1a; border-color: #ccc; }
.add-btn:hover { opacity: 0.6; }

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
  cursor: grab;
  transition: all 0.15s;
  user-select: none;
}

.task-item:active {
  cursor: grabbing;
}

.dark .task-item { border-color: #222; }
.dark .task-item:hover { border-color: #444; }
.dark .task-item.active { border-color: #22c55e; background: rgba(34, 197, 94, 0.08); }
.light .task-item { border-color: #ddd; }
.light .task-item:hover { border-color: #bbb; }
.light .task-item.active { border-color: #22c55e; background: rgba(34, 197, 94, 0.06); }

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

.dark .check-btn { border-color: #444; }
.dark .check-btn:hover { border-color: #22c55e; background: rgba(34, 197, 94, 0.2); }
.light .check-btn { border-color: #bbb; }
.light .check-btn:hover { border-color: #22c55e; background: rgba(34, 197, 94, 0.15); }

.task-text { flex: 1; font-size: 17px; }

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

.delete-btn:hover { opacity: 0.6; }

.move-btn {
  font-size: 14px;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.25;
  cursor: pointer;
  font-family: inherit;
  padding: 8px;
  transition: opacity 0.15s;
}

.move-btn:hover { opacity: 0.6; }

.edit-input {
  flex: 1;
  font-size: 17px;
  padding: 4px 8px;
  border: 1px solid #22c55e;
  background: transparent;
  font-family: inherit;
  outline: none;
}

.dark .edit-input { color: #c8c8c8; }
.light .edit-input { color: #1a1a1a; }

.edit-input-small {
  font-size: 14px;
  padding: 2px 6px;
  border: 1px solid #22c55e;
  background: transparent;
  font-family: inherit;
  outline: none;
  width: 100%;
}

.dark .edit-input-small { color: #c8c8c8; }
.light .edit-input-small { color: #1a1a1a; }

.task-item.dragging {
  opacity: 0.5;
}

.quick-task-chip.dragging {
  opacity: 0.5;
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

.dark .quick-tasks-section { border-color: #222; }
.light .quick-tasks-section { border-color: #ddd; }

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

.goals-hint {
  font-size: 12px;
  opacity: 0.3;
  margin-bottom: 16px;
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

.add-quick-btn:hover { opacity: 0.7; }

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

.dark .quick-task-input { color: #c8c8c8; border-color: #333; }
.light .quick-task-input { color: #1a1a1a; border-color: #ccc; }

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

.dark .quick-task-submit { color: #c8c8c8; border-color: #333; }
.light .quick-task-submit { color: #1a1a1a; border-color: #ccc; }

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
  cursor: grab;
  font-family: inherit;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
}

.quick-task-chip:active {
  cursor: grabbing;
}

.dark .quick-task-chip { color: #c8c8c8; border-color: #333; }
.dark .quick-task-chip:hover { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.light .quick-task-chip { color: #1a1a1a; border-color: #ccc; }
.light .quick-task-chip:hover { border-color: #22c55e; background: rgba(34, 197, 94, 0.08); }

.chip-remove {
  font-size: 12px;
  opacity: 0.3;
  transition: opacity 0.15s;
}

.chip-remove:hover { opacity: 0.8; }

.keyboard-hints {
  margin-top: 24px;
  font-size: 11px;
  opacity: 0.2;
  text-align: center;
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

.skip-btn:hover { opacity: 0.9; }

.summary-screen {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
  padding: 24px;
}

.summary-content {
  text-align: center;
  color: #c8c8c8;
  max-width: 500px;
}

.summary-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: 0.5;
  margin-bottom: 40px;
}

.summary-stat {
  margin-bottom: 32px;
}

.summary-num {
  display: block;
  font-size: 64px;
  font-weight: 500;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 14px;
  opacity: 0.4;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.summary-tasks {
  margin: 40px 0;
  text-align: left;
}

.summary-task-item {
  font-size: 14px;
  opacity: 0.5;
  padding: 8px 0;
  border-bottom: 1px solid #222;
}

.summary-close {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 32px;
  border: 1px solid #333;
  background: none;
  color: #c8c8c8;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.summary-close:hover { opacity: 0.6; }

/* Tablet */
@media (max-width: 900px) {
  .layout { flex-direction: column; }
  .done-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid;
    padding: 24px 32px;
  }
  .done-list { flex-direction: row; flex-wrap: wrap; gap: 8px 16px; }
  .done-item { font-size: 13px; }
  .main { padding: 40px 32px; }
  .timer { font-size: 56px; }
  .timer-ring-container { width: 220px; height: 220px; }
}

/* Mobile */
@media (max-width: 600px) {
  .done-panel { padding: 20px 24px; }
  .done-header { margin-bottom: 14px; }
  .done-title { font-size: 12px; }
  .main { padding: 32px 20px; }
  .top-bar { margin-bottom: 32px; }
  .blocks-num { font-size: 28px; }
  .blocks-label { font-size: 10px; }
  .today-num { font-size: 20px; }
  .today-goal { font-size: 14px; }
  .today-divider { font-size: 14px; }
  .today-label { font-size: 9px; }
  .mode-toggle { font-size: 12px; padding: 10px 16px; }
  .noise-toggle { font-size: 12px; padding: 10px 16px; }
  .timer { font-size: 48px; }
  .timer-ring-container { width: 180px; height: 180px; }
  .active-task-name { font-size: 16px; margin-bottom: 16px; }
  .focus-quote { font-size: 12px; }
  .timer-presets { gap: 6px; }
  .preset-btn { font-size: 12px; padding: 6px 12px; }
  .timer-controls { gap: 10px; }
  .timer-btn { font-size: 13px; padding: 14px 20px; }
  .task-form { flex-direction: column; gap: 10px; }
  .task-input { font-size: 16px; padding: 16px 18px; }
  .add-btn { font-size: 14px; padding: 16px 24px; }
  .task-item { padding: 16px 18px; gap: 14px; }
  .check-btn { width: 24px; height: 24px; }
  .task-text { font-size: 15px; }
  .delete-btn { font-size: 14px; padding: 6px 10px; }
  .empty-state { padding: 40px; font-size: 15px; }
  .quick-tasks-section { margin-top: 20px; padding-top: 20px; }
  .quick-task-chip { font-size: 13px; padding: 8px 14px; }
  .keyboard-hints { display: none; }
}

/* Small mobile */
@media (max-width: 380px) {
  .timer { font-size: 40px; }
  .timer-ring-container { width: 150px; height: 150px; }
  .timer-btn { font-size: 12px; padding: 12px 16px; }
}
`

export default App