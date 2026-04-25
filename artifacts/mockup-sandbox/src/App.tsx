import React, { useState, useEffect } from 'react';

// --- Types ---
type ViewState = 'home' | 'planner' | 'mindmap';
type TaskCategory = 'home' | 'work';
interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface Meal { id: string; label: string; done: boolean; icon: string; }

export default function App() {
  const [view, setView] = useState<ViewState>('planner'); // Set your default view
  const [newTaskText, setNewTaskText] = useState("");
  const [currentCat, setCurrentCat] = useState<TaskCategory>('home');

  // --- OFFLINE STORAGE LOGIC ---
  // This ensures data is pulled from your phone's memory immediately
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('broto_app_local_v1');
    return saved ? JSON.parse(saved) : {
      planner: { 
        priorities: ['', '', ''], 
        tasks: [] as Task[], 
        water: 0, 
        meals: [
          { id: 'b', label: 'Breakfast', done: false, icon: '☕' },
          { id: 'l', label: 'Lunch', done: false, icon: '🍱' },
          { id: 'd', label: 'Dinner', done: false, icon: '🍲' },
          { id: 's', label: 'Snacks', done: false, icon: '🍎' }
        ]
      }
    };
  });

  // Save to memory every time a checkbox is clicked or a task is added
  useEffect(() => {
    localStorage.setItem('broto_app_local_v1', JSON.stringify(data));
  }, [data]);

  // --- Handlers (Fully Offline) ---
  const updatePlanner = (updates: any) => setData({ ...data, planner: { ...data.planner, ...updates } });

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const nt = { id: Date.now().toString(), text: newTaskText, category: currentCat, done: false };
    updatePlanner({ tasks: [...data.planner.tasks, nt] });
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    updatePlanner({ tasks: data.planner.tasks.map((t:Task) => t.id === id ? { ...t, done: !t.done } : t) });
  };

  const deleteTask = (id: string) => {
    updatePlanner({ tasks: data.planner.tasks.filter((t:Task) => t.id !== id) });
  };

  return (
    <div style={st.appWrapper}>
      <header style={st.header}>
        <button onClick={() => window.history.back()} style={st.backBtn}>← Daily Planner</button>
      </header>

      {/* Priorities Section */}
      <div style={st.section}>
        <h3 style={st.secTitle}>⭐ Top 3 Priorities</h3>
        {data.planner.priorities.map((p: string, i: number) => (
          <div key={i} style={st.priRow}>
            <span style={st.badge}>{i+1}</span>
            <input 
              style={st.input} 
              value={p} 
              placeholder="Set priority..." 
              onChange={e => {
                const copy = [...data.planner.priorities];
                copy[i] = e.target.value;
                updatePlanner({ priorities: copy });
              }} 
            />
          </div>
        ))}
      </div>

      {/* To-Do Section with Offline Delete (✕) */}
      <div style={st.section}>
        <h3 style={st.secTitle}>✔️ To-Do</h3>
        <div style={st.inputWrap}>
          <input 
            style={st.input} 
            value={newTaskText} 
            placeholder={`Add ${currentCat} task...`} 
            onChange={e => setNewTaskText(e.target.value)} 
          />
          <button style={st.addBtn} onClick={addTask}>+</button>
        </div>
        
        {data.planner.tasks.map((t: Task) => (
          <div key={t.id} style={st.taskRow}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
            <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            <button style={st.delBtn} onClick={() => deleteTask(t.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Meals Section */}
      <div style={st.section}>
        <div style={st.secHeader}>
          <h3 style={st.secTitle}>🍱 Meals</h3>
          <span style={st.countText}>{data.planner.meals.filter((m:any) => m.done).length} of 4 eaten</span>
        </div>
        <div style={st.mealGrid}>
          {data.planner.meals.map((meal: any) => (
            <button 
              key={meal.id} 
              onClick={() => updatePlanner({ 
                meals: data.planner.meals.map((m:any) => m.id === meal.id ? { ...m, done: !m.done } : m) 
              })}
              style={{ ...st.mealCard, background: meal.done ? '#E8F2F0' : '#fff', border: meal.done ? '1px solid #146654' : '1px solid #eee' }}
            >
              <span style={{ fontSize: '24px' }}>{meal.icon}</span>
              <span style={st.mealLabel}>{meal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* NOTES REMOVED AS REQUESTED */}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  appWrapper: { maxWidth: '450px', margin: '0 auto', background: '#f5f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
  header: { marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', color: '#146654', fontSize: '18px', fontWeight: 700, cursor: 'pointer' },
  section: { background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  secHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  secTitle: { margin: 0, fontSize: '16px', color: '#146654', fontWeight: 700 },
  countText: { fontSize: '12px', color: '#888' },
  priRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  badge: { background: '#146654', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
  inputWrap: { display: 'flex', background: '#f0f2f1', padding: '10px', borderRadius: '12px', marginBottom: '15px' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '14px' },
  addBtn: { background: '#146654', color: '#fff', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' },
  taskRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid #f9f9f9' },
  delBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px' },
  mealGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  mealCard: { padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  mealLabel: { fontSize: '13px', color: '#444', fontWeight: 600 }
};
