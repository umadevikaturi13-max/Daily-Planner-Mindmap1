import React, { useState, useEffect } from 'react';

// --- Types ---
type ViewState = 'auth' | 'home' | 'planner' | 'mindmap';
type TaskCategory = 'home' | 'work';
type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; }
interface Meal { id: MealKey; label: string; done: boolean; }

export default function App() {
  const [view, setView] = useState<ViewState>(() => localStorage.getItem('isLoggedIn') === 'true' ? 'home' : 'auth');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "");
  const [newTaskText, setNewTaskText] = useState("");
  const [currentCat, setCurrentCat] = useState<TaskCategory>('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('master_daily_app_data');
    return saved ? JSON.parse(saved) : {
      planner: { 
        wake: '07:00', sleep: '23:00', priorities: ['', '', ''], tasks: [] as Task[], water: 0, 
        meals: [
          { id: 'breakfast', label: 'Breakfast', done: false },
          { id: 'lunch', label: 'Lunch', done: false },
          { id: 'dinner', label: 'Dinner', done: false },
          { id: 'snacks', label: 'Snacks', done: false }
        ] as Meal[], 
        notes: '' 
      },
      mindmap: { roots: [] as MindNode[] }
    };
  });

  useEffect(() => {
    localStorage.setItem('master_daily_app_data', JSON.stringify(data));
    localStorage.setItem('userName', userName);
    localStorage.setItem('isLoggedIn', view !== 'auth' ? 'true' : 'false');
  }, [data, userName, view]);

  const updatePlanner = (updates: any) => setData({ ...data, planner: { ...data.planner, ...updates } });

  // --- Water Toggle Fix ---
  const handleWaterClick = (index: number) => {
    const targetValue = index + 1;
    updatePlanner({ water: data.planner.water === targetValue ? index : targetValue });
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const nt = { id: Date.now().toString(), text: newTaskText, category: currentCat, done: false };
    updatePlanner({ tasks: [...data.planner.tasks, nt] });
    setNewTaskText("");
  };

  // --- Auth & Home Views ---
  if (view === 'auth') {
    return (
      <div style={st.authWrapper}>
        <div style={st.logoCircle}>☑</div>
        <h1 style={st.authTitle}>Daily Planner</h1>
        <div style={st.authCard}>
          <div style={st.authTabs}>
            <button onClick={() => setView('home')} style={st.submitBtn}>Start Planning</button>
          </div>
          <div style={st.inputGroup}>
            <div style={st.field}>👤<input placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} style={st.fieldInput}/></div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div style={st.appWrapper}>
        <header style={st.homeHeader}>
          <div><p style={{color: '#888', margin: 0}}>Good evening,</p><h1 style={{margin: 0, fontSize: '32px'}}>{userName || "Broto"}</h1></div>
          <button onClick={() => setView('auth')} style={st.logoutBtn}>📤</button>
        </header>
        <div style={st.menuCardGreen} onClick={() => setView('mindmap')}>
          <div style={st.menuIconBg}>🧠</div>
          <div style={{flex: 1}}><h4 style={{margin: 0, color: '#fff'}}>Mind Map</h4><p style={{margin: 0, fontSize: '12px', color: '#fff', opacity: 0.8}}>Branch out ideas</p></div>
          <span style={{color: '#fff'}}>→</span>
        </div>
        <div style={st.menuCardWhite} onClick={() => setView('planner')}>
          <div style={{...st.menuIconBg, background: '#e8f2f0', color: '#146654'}}>📅</div>
          <div style={{flex: 1}}><h4 style={{margin: 0}}>Daily Planner</h4><p style={{margin: 0, fontSize: '12px', color: '#888'}}>Tasks & Schedule</p></div>
          <span>→</span>
        </div>
        <div style={st.quoteBox}>☀️ <p style={{margin: 0, fontSize: '14px', color: '#555'}}>Small steps lead to big changes.</p></div>
      </div>
    );
  }

  return (
    <div style={st.appWrapper}>
      <button onClick={() => setView('home')} style={st.backBtn}>← Back to Home</button>
      
      {view === 'planner' ? (
        <div>
          {/* Schedule */}
          <div style={st.section}><h3 style={st.secTitle}>🕒 Schedule</h3>
            <div style={st.row}>
              <input type="time" value={data.planner.wake} onChange={e => updatePlanner({wake: e.target.value})} style={st.timeInput} />
              <input type="time" value={data.planner.sleep} onChange={e => updatePlanner({sleep: e.target.value})} style={st.timeInput} />
            </div>
          </div>

          {/* Priorities */}
          <div style={st.section}><h3 style={st.secTitle}>⭐ Top 3 Priorities</h3>
            {data.planner.priorities.map((p: string, i: number) => (
              <div key={i} style={st.priRow}>
                <span style={st.badge}>{i+1}</span>
                <input style={st.input} value={p} placeholder="Add priority..." onChange={e => {const c=[...data.planner.priorities]; c[i]=e.target.value; updatePlanner({priorities:c});}} />
                <button onClick={() => {const p=[...data.planner.priorities]; p[i]=""; updatePlanner({priorities:p});}} style={st.tick}>✓</button>
              </div>
            ))}
          </div>

          {/* To-Do with Separator */}
          <div style={st.section}><h3 style={st.secTitle}>✔️ To-Do</h3>
            <div style={st.catRow}>
              <button onClick={() => setCurrentCat('home')} style={{...st.catBtn, background: currentCat==='home'?'#146654':'#eee', color: currentCat==='home'?'#fff':'#444'}}>Home</button>
              <button onClick={() => setCurrentCat('work')} style={{...st.catBtn, background: currentCat==='work'?'#146654':'#eee', color: currentCat==='work'?'#fff':'#444'}}>Work</button>
            </div>
            <div style={st.inputWrap}><input style={st.input} placeholder={`Add ${currentCat} task...`} value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} /><button style={st.addBtn} onClick={addTask}>+</button></div>
            
            {['home', 'work'].map((c, idx) => (
              <div key={c}>
                <div style={st.catLabel}>{c === 'home' ? '🏠 HOME' : '🏢 WORK'}</div>
                {data.planner.tasks.filter((t:any)=>t.category===c).map((t:any)=>(
                  <div key={t.id} style={st.taskRow}>
                    <input type="checkbox" checked={t.done} onChange={()=>updatePlanner({tasks: data.planner.tasks.map((x:any)=>x.id===t.id?{...x,done:!x.done}:x)})} />
                    <span style={{flex:1, textDecoration: t.done?'line-through':'none'}}>{t.text}</span>
                    <button onClick={()=>updatePlanner({tasks: data.planner.tasks.filter((x:any)=>x.id!==t.id)})} style={st.wrongBtn}>✕</button>
                  </div>
                ))}
                {idx === 0 && <hr style={st.separator} />}
              </div>
            ))}
          </div>

          {/* Water */}
          <div style={st.section}><h3 style={st.secTitle}>💧 Water Intake ({data.planner.water}/8)</h3>
            <div style={{display:'flex', gap:'8px', flexWrap: 'wrap'}}>
              {[...Array(8)].map((_, i)=>(
                <button key={i} onClick={() => handleWaterClick(i)} style={{...st.cup, background:i < data.planner.water ? '#146654' : '#eee'}} />
              ))}
            </div>
          </div>

          {/* Food/Meals Section */}
          <div style={st.section}><h3 style={st.secTitle}>🍱 Meals</h3>
            <div style={st.mealGrid}>
              {data.planner.meals.map((meal: Meal) => (
                <button key={meal.id} onClick={() => updatePlanner({ meals: data.planner.meals.map((m:any) => m.id === meal.id ? {...m, done: !m.done} : m) })}
                  style={{...st.mealBtn, background: meal.done ? '#E3F2FD' : '#fff', border: meal.done ? '1px solid #146654' : '1px solid #ddd'}}>
                  {meal.label} {meal.done ? '✅' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={st.mindCanvas}>
          <div style={st.treeWrapper}>{renderMindTree(data.mindmap.roots)}</div>
          <div style={st.mindFooter}>
            <button style={st.mainAdd} onClick={() => addNode()}>+ Add Root</button>
            <button style={st.delBtn} onClick={() => {
              const del = (list: MindNode[]): MindNode[] => list.filter(n => n.id !== selectedNodeId).map(n => ({...n, children: del(n.children)}));
              setData({...data, mindmap: { roots: del(data.mindmap.roots) }}); setSelectedNodeId(null);
            }}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Recursively render tree connections logic omitted for brevity, ensure you keep the previous renderMindTree function.

const st: Record<string, React.CSSProperties> = {
  appWrapper: { maxWidth: '450px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', padding: '20px', boxSizing: 'border-box', fontFamily: 'sans-serif' },
  section: { background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  secTitle: { color: '#146654', fontSize: '15px', marginBottom: '10px', fontWeight: 700 },
  priRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#f9f9f9', padding: '8px', borderRadius: '10px' },
  badge: { background: '#146654', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' },
  tick: { background: '#146654', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' },
  inputWrap: { display: 'flex', gap: '8px', background: '#eee', padding: '8px', borderRadius: '10px', marginBottom: '15px' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none' },
  addBtn: { background: '#146654', color: '#fff', border: 'none', borderRadius: '8px', width: '35px', height: '35px', cursor: 'pointer' },
  catRow: { display: 'flex', gap: '8px', marginBottom: '10px' },
  catBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer' },
  taskRow: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' },
  catLabel: { fontSize: '11px', color: '#888', fontWeight: 800, marginTop: '10px', marginBottom: '5px' },
  separator: { border: 'none', borderTop: '1px solid #eee', margin: '15px 0' },
  cup: { width: '35px', height: '35px', borderRadius: '10px', border: 'none', cursor: 'pointer' },
  mealGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  mealBtn: { padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
  timeInput: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee' },
  row: { display: 'flex', gap: '10px' },
  wrongBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px' },
  backBtn: { background: 'none', border: 'none', color: '#146654', fontWeight: 700, marginBottom: '20px', cursor: 'pointer' },
  authWrapper: { background: '#D1D5D1', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box' },
  logoCircle: { width: '60px', height: '60px', background: '#146654', color: '#fff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '20px' },
  authTitle: { fontSize: '28px', marginBottom: '30px' },
  authCard: { background: 'rgba(255,255,255,0.4)', borderRadius: '25px', padding: '15px', width: '100%', maxWidth: '350px' },
  authTabs: { display: 'flex', background: '#e0e0e0', borderRadius: '12px', padding: '4px', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  field: { display: 'flex', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ccc' },
  fieldInput: { border: 'none', outline: 'none', flex: 1, marginLeft: '8px' },
  submitBtn: { width: '100%', padding: '14px', background: '#146654', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  homeHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  logoutBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
  menuCardGreen: { background: '#146654', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', cursor: 'pointer', color: '#fff' },
  menuCardWhite: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', border: '1px solid #ddd' },
  menuIconBg: { width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  quoteBox: { marginTop: '40px', background: '#e0e0e0', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
};
