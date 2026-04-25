import React, { useState, useEffect, useMemo } from 'react';

/**
 * CORE TYPES & INTERFACES
 */
type TaskCategory = 'home' | 'work';
type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface Task {
  id: string;
  text: string;
  category: TaskCategory;
  done: boolean;
}

interface Meal {
  id: MealKey;
  label: string;
  done: boolean;
}

interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
}

interface AppData {
  planner: {
    wakeTime: string;
    sleepTime: string;
    priorities: string[];
    priorityDone: boolean[];
    tasks: Task[];
    water: number;
    meals: Meal[];
    notes: string;
  };
  mindmap: {
    roots: MindNode[];
  };
}

/**
 * CONSTANTS & ASSETS (Web Alternatives for Icons)
 */
const MEAL_ICONS: Record<MealKey, string> = {
  breakfast: "☕",
  lunch: "🍱",
  dinner: "🍲",
  snacks: "🍎",
};

const INITIAL_DATA: AppData = {
  planner: {
    wakeTime: '07:00',
    sleepTime: '22:00',
    priorities: ['', '', ''],
    priorityDone: [false, false, false],
    tasks: [],
    water: 0,
    meals: [
      { id: 'breakfast', label: 'Breakfast', done: false },
      { id: 'lunch', label: 'Lunch', done: false },
      { id: 'dinner', label: 'Dinner', done: false },
      { id: 'snacks', label: 'Snacks', done: false },
    ],
    notes: '',
  },
  mindmap: {
    roots: [],
  },
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'mindmap'>('planner');
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('daily-app-storage');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Planner Local States
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('home');
  const [newTaskText, setNewTaskText] = useState('');

  // Mindmap Local States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Sync to localStorage for Offline Support
  useEffect(() => {
    localStorage.setItem('daily-app-storage', JSON.stringify(data));
  }, [data]);

  /**
   * PLANNER LOGIC
   */
  const updatePlanner = (updates: Partial<AppData['planner']>) => {
    setData(prev => ({ ...prev, planner: { ...prev.planner, ...updates } }));
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      category: taskCategory,
      done: false,
    };
    updatePlanner({ tasks: [...data.planner.tasks, newTask] });
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    updatePlanner({
      tasks: data.planner.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    });
  };

  const removeTask = (id: string) => {
    updatePlanner({ tasks: data.planner.tasks.filter(t => t.id !== id) });
  };

  /**
   * MINDMAP LOGIC
   */
  const addMindRoot = () => {
    const newRoot: MindNode = {
      id: Date.now().toString(),
      text: 'New Idea',
      children: [],
    };
    setData(prev => ({
      ...prev,
      mindmap: { roots: [...prev.mindmap.roots, newRoot] }
    }));
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setData(prev => ({
      ...prev,
      mindmap: { roots: prev.mindmap.roots.filter(r => r.id !== selectedNodeId) }
    }));
    setSelectedNodeId(null);
  };

  /**
   * RENDER HELPERS
   */
  const filteredTasks = data.planner.tasks.filter(t => t.category === taskCategory);

  return (
    <div style={styles.appWrapper}>
      {/* Navigation Tabs */}
      <nav style={styles.navBar}>
        <button 
          onClick={() => setActiveTab('planner')} 
          style={{...styles.navBtn, color: activeTab === 'planner' ? '#007AFF' : '#888'}}
        >
          📅 Planner
        </button>
        <button 
          onClick={() => setActiveTab('mindmap')} 
          style={{...styles.navBtn, color: activeTab === 'mindmap' ? '#007AFF' : '#888'}}
        >
          🧠 Mind Map
        </button>
      </nav>

      <div style={styles.mainContainer}>
        {activeTab === 'planner' ? (
          <div className="planner-view">
            <header style={styles.header}>
              <h1 style={styles.dateTitle}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
              <p style={styles.subtitle}>Stay focused, stay productive.</p>
            </header>

            {/* Schedule & Priorities */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🕒 Schedule</h3>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Wake Up</label>
                  <input type="time" value={data.planner.wakeTime} onChange={(e) => updatePlanner({ wakeTime: e.target.value })} style={styles.webInput} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Sleep</label>
                  <input type="time" value={data.planner.sleepTime} onChange={(e) => updatePlanner({ sleepTime: e.target.value })} style={styles.webInput} />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>⭐ Top 3 Priorities</h3>
              {data.planner.priorities.map((p, i) => (
                <div key={i} style={styles.priorityRow}>
                  <button 
                    onClick={() => {
                      const newStatus = [...data.planner.priorityDone];
                      newStatus[i] = !newStatus[i];
                      updatePlanner({ priorityDone: newStatus });
                    }}
                    style={{...styles.checkBtn, backgroundColor: data.planner.priorityDone[i] ? '#007AFF' : 'transparent'}}
                  >
                    {data.planner.priorityDone[i] && '✓'}
                  </button>
                  <input 
                    placeholder="Set priority..." 
                    value={p} 
                    onChange={(e) => {
                      const newP = [...data.planner.priorities];
                      newP[i] = e.target.value;
                      updatePlanner({ priorities: newP });
                    }} 
                    style={{...styles.priorityInput, textDecoration: data.planner.priorityDone[i] ? 'line-through' : 'none'}}
                  />
                </div>
              ))}
            </div>

            {/* Task Management */}
            <div style={styles.section}>
              <div style={styles.tabsRow}>
                <button onClick={() => setTaskCategory('home')} style={{...styles.catTab, borderBottomColor: taskCategory === 'home' ? '#007AFF' : 'transparent'}}>Home</button>
                <button onClick={() => setTaskCategory('work')} style={{...styles.catTab, borderBottomColor: taskCategory === 'work' ? '#007AFF' : 'transparent'}}>Work</button>
              </div>
              
              <div style={styles.addTaskBox}>
                <input 
                  placeholder={`Add ${taskCategory} task...`} 
                  value={newTaskText} 
                  onChange={(e) => setNewTaskText(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  style={styles.taskInput}
                />
                <button onClick={addTask} style={styles.addBtnSmall}>+</button>
              </div>

              <div style={styles.list}>
                {filteredTasks.map(task => (
                  <div key={task.id} style={styles.taskRow}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                    <span style={{...styles.taskText, textDecoration: task.done ? 'line-through' : 'none'}}>{task.text}</span>
                    <button onClick={() => removeTask(task.id)} style={styles.removeBtn}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Water & Meals */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💧 Water Intake ({data.planner.water}/8)</h3>
              <div style={styles.grid}>
                {[...Array(8)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => updatePlanner({ water: i + 1 === data.planner.water ? i : i + 1 })}
                    style={{...styles.waterCup, backgroundColor: i < data.planner.water ? '#007AFF' : '#eee'}}
                  />
                ))}
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🥗 Meals</h3>
              <div style={styles.mealGrid}>
                {data.planner.meals.map(meal => (
                  <button 
                    key={meal.id} 
                    onClick={() => {
                      updatePlanner({ meals: data.planner.meals.map(m => m.id === meal.id ? { ...m, done: !m.done } : m) });
                    }}
                    style={{...styles.mealCard, backgroundColor: meal.done ? '#E3F2FD' : 'white', borderColor: meal.done ? '#007AFF' : '#eee'}}
                  >
                    <span>{MEAL_ICONS[meal.id]}</span>
                    <span>{meal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📝 Notes</h3>
              <textarea 
                style={styles.textArea} 
                placeholder="Reflections, gratitude, ideas..."
                value={data.planner.notes}
                onChange={(e) => updatePlanner({ notes: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="mindmap-view" style={styles.mindmapCanvas}>
            {data.mindmap.roots.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{fontSize: '40px'}}>🌿</div>
                <h3>Start your first thought</h3>
                <p>Tap the Add button to drop an idea on the canvas.</p>
              </div>
            ) : (
              <div style={styles.nodesContainer}>
                {data.mindmap.roots.map(node => (
                  <div 
                    key={node.id} 
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      ...styles.mindNode, 
                      borderColor: selectedNodeId === node.id ? '#007AFF' : '#ccc',
                      transform: selectedNodeId === node.id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <input 
                      value={node.text} 
                      onChange={(e) => {
                        const newRoots = data.mindmap.roots.map(r => r.id === node.id ? {...r, text: e.target.value} : r);
                        setData(prev => ({ ...prev, mindmap: { roots: newRoots } }));
                      }}
                      style={styles.nodeInput}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={styles.mindFooter}>
               <button onClick={addMindRoot} style={styles.mindBtnPrimary}>+ Add Idea</button>
               <button 
                 onClick={deleteSelectedNode} 
                 disabled={!selectedNodeId} 
                 style={{...styles.mindBtnDanger, opacity: selectedNodeId ? 1 : 0.5}}
               >
                 🗑️ Delete Selected
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * WEB-FRIENDLY CSS-IN-JS
 */
const styles: Record<string, React.CSSProperties> = {
  appWrapper: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  navBar: { display: 'flex', borderBottom: '1px solid #eee', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 },
  navBtn: { flex: 1, padding: '15px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  mainContainer: { padding: '20px', paddingBottom: '100px' },
  header: { marginBottom: '25px' },
  dateTitle: { fontSize: '24px', fontWeight: 700, margin: 0, color: '#1A1A1A' },
  subtitle: { color: '#666', fontSize: '14px', margin: '4px 0 0 0' },
  section: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#007AFF' },
  row: { display: 'flex', gap: '12px' },
  inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#888', fontWeight: 500 },
  webInput: { padding: '10px', borderRadius: '8px', border: '1px solid #EEE', outline: 'none' },
  priorityRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  checkBtn: { width: '22px', height: '22px', borderRadius: '6px', border: '2px solid #007AFF', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
  priorityInput: { flex: 1, border: 'none', borderBottom: '1px solid #F0F0F0', padding: '8px 0', outline: 'none', fontSize: '15px' },
  tabsRow: { display: 'flex', gap: '20px', marginBottom: '15px' },
  catTab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '5px 0', cursor: 'pointer', fontWeight: 600, color: '#444' },
  addTaskBox: { display: 'flex', gap: '8px', marginBottom: '15px' },
  taskInput: { flex: 1, padding: '10px 15px', borderRadius: '12px', border: '1px solid #EEE', outline: 'none' },
  addBtnSmall: { width: '40px', height: '40px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '20px' },
  taskRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F9F9F9' },
  taskText: { flex: 1, fontSize: '14px', color: '#333' },
  removeBtn: { border: 'none', background: 'none', color: '#CCC', cursor: 'pointer', fontSize: '18px' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  waterCup: { width: '35px', height: '35px', borderRadius: '10px', border: 'none', cursor: 'pointer' },
  mealGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  mealCard: { padding: '15px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 },
  textArea: { width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #EEE', outline: 'none', resize: 'none', boxSizing: 'border-box' },
  
  // Mindmap Styles
  mindmapCanvas: { height: '70vh', position: 'relative', display: 'flex', flexDirection: 'column' },
  emptyState: { textAlign: 'center', marginTop: '100px', color: '#888' },
  nodesContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', justifyContent: 'center' },
  mindNode: { padding: '15px', borderRadius: '12px', backgroundColor: 'white', border: '2px solid #ccc', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' },
  nodeInput: { border: 'none', textAlign: 'center', outline: 'none', fontWeight: 600, fontSize: '14px' },
  mindFooter: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', width: '90%', maxWidth: '460px' },
  mindBtnPrimary: { flex: 1, padding: '15px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' },
  mindBtnDanger: { padding: '15px', backgroundColor: '#FF3B30', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' },
};
