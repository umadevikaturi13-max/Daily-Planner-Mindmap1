import React, { useState, useEffect } from 'react';

// --- Types ---
type ViewState = 'auth' | 'home' | 'planner' | 'mindmap';
type TaskCategory = 'home' | 'work';
type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; }
interface Meal { id: MealKey; label: string; done: boolean; }

export default function App() {
  // --- Auth & Navigation ---
  const [view, setView] = useState<ViewState>(() => {
    return localStorage.getItem('isLoggedIn') === 'true' ? 'home' : 'auth';
  });
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "");
  const [newTaskText, setNewTaskText] = useState("");
  const [currentCat, setCurrentCat] = useState<TaskCategory>('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // --- Main Data State ---
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

  // --- Persistence Side Effects ---
  useEffect(() => {
    localStorage.setItem('master_daily_app_data', JSON.stringify(data));
    localStorage.setItem('userName', userName);
    localStorage.setItem('isLoggedIn', view !== 'auth' ? 'true' : 'false');
  }, [data, userName, view]);

  // --- Handlers ---
  const updatePlanner = (updates: any) => setData({ ...data, planner: { ...data.planner, ...updates } });
  
  const handlePriorityTick = (index: number) => {
    const p = [...data.planner.priorities]; p[index] = ""; 
    updatePlanner({ priorities: p });
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const nt = { id: Date.now().toString(), text: newTaskText, category: currentCat, done: false };
    updatePlanner({ tasks: [...data.planner.tasks, nt] });
    setNewTaskText("");
  };

  // --- Mind Map Logic ---
  const addNode = (parentId: string | null = null) => {
    const newNode = { id: Date.now().toString(), text: 'New idea', children: [] };
    if (!parentId) setData({ ...data, mindmap: { roots: [...data.mindmap.roots, newNode] } });
    else {
      const addToTree = (nodes: MindNode[]): MindNode[] => nodes.map(n => 
        n.id === parentId ? { ...n, children: [...n.children, newNode] } : { ...n, children: addToTree(n.children) }
      );
      setData({ ...data, mindmap: { roots: addToTree(data.mindmap.roots) } });
    }
  };

  const renderMindTree = (nodes: MindNode[]) => (
    <div style={st.treeRow}>
      {nodes.map(node => (
        <div key={node.id} style={st.nodeColumn}>
          <div style={{...st.mindCard, border: selectedNodeId === node.id ? '2px solid #146654' : '1px solid #ddd'}} onClick={() => setSelectedNodeId(node.id)}>
            <input style={st.nodeInput} value={node.text} onChange={(e) => {
                const edit = (list: MindNode[]): MindNode[] => list.map(n => n.id === node.id ? {...n, text: e.target.value} : {...n, children: edit(n.children)});
                setData({...data, mindmap: { roots: edit(data.mindmap.roots) }});
            }} />
          </div>
          <button style={st.branchBtn} onClick={() => addNode(node.id)}>+</button>
          {node.children.length > 0 && <div style={st.childContainer}>{renderMindTree(node.children)}</div>}
        </div>
      ))}
    </div>
  );

  // --- VIEW: Auth ---
  if (view === 'auth') {
    return (
      <div style={st.authWrapper}>
        <div style={st.logoCircle}>☑</div>
        <h1 style={st.authTitle}>Daily Planner</h1>
        <div style={st.authCard}>
          <div style={st.authTabs}>
            <button onClick={() => setAuthMode('signin')} style={{...st.tabBtn, background: authMode === 'signin' ? '#fff' : 'transparent'}}>Sign In</button>
            <button onClick={() => setAuthMode('signup')} style={{...st.tabBtn, background: authMode === 'signup' ? '#fff' : 'transparent'}}>Sign Up</button>
          </div>
          <div style={st.inputGroup}>
            {authMode === 'signup' && <div style={st.field}>👤<input placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} style={st.fieldInput}/></div>}
            <div style={st.field}>✉<input placeholder="Email address" style={st.fieldInput}/></div>
            <div style={st.field}>🔒<input type="password" placeholder="Password" style={st.fieldInput}/></div>
          </div>
          <button style={st.submitBtn} onClick={() => setView('home')}>{authMode === 'signup' ? 'Create Account' : 'Sign In'}</button>
        </div>
      </div>
    );
  }

  // --- VIEW: Home ---
  if (view === 'home') {
    return (
      <div style={st.appWrapper}>
        <header style={st.homeHeader}>
          <div><p style={{color: '#888', margin: 0}}>Good evening,</p><h1 style={{margin: 0, fontSize: '32px'}}>{userName || "Broto"}</h1></div>
          <button onClick={() => setView('auth')} style={{background: 'none', border: 'none', fontSize: '24px'}}>📤</button>
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

  // --- VIEW: Planner / MindMap ---
  return (
    <div style={st.appWrapper}>
      <button onClick={() => setView('home')} style={st.backBtn}>← Back to Home</button>
      
      {view === 'planner' ? (
        <div>
          <div style={st.section}><h3 style={st.secTitle}>🕒 Schedule</h3>
            <div style={st.row}>
              <input type="time" value={data.planner.wake} onChange={e => updatePlanner({wake: e.target.value})} style={st.timeInput} />
              <input type="time" value={data.planner.sleep} onChange={e => updatePlanner({sleep: e.target.value})} style={st.timeInput} />
            </div>
          </div>
          <div style={st.section}><h3 style={st.secTitle}>⭐ Top 3 Priorities</h3>
            {data.planner.priorities.map((p: string, i: number) => (
              <div key={i} style={st.priRow}><span style={st.badge}>{i+1}</span><input style={st.input} value={p} onChange={e => {const c=[...data.planner.priorities]; c[i]=e.target.value; updatePlanner({priorities:c});}} /><button onClick={() => handlePriorityTick(i)} style={st.tick}>✓</button></div>
            ))}
          </div>
          <div style={st.section}><h3 style={st.secTitle}>✔️ To-Do</h3>
            <div style={st.catRow}><button onClick={() => setCurrentCat('home')} style={{...st.catBtn, background: currentCat==='home'?'#146654':'#eee', color: currentCat==='home'?'#fff':'#444'}}>Home</button><button onClick={() => setCurrentCat('work')} style={{...st.catBtn, background: currentCat==='work'?'#146654':'#eee', color: currentCat==='work'?'#fff':'#444'}}>Work</button></div>
            <div style={st.inputWrap}><input style={st.input} value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} /><button style={st.addBtn} onClick={addTask}>+</button></div>
            {data.planner.tasks.filter((t:any)=>t.category===currentCat).map((t:any)=>(
              <div key={t.id} style={st.taskRow}><input type="checkbox" checked={t.done} onChange={()=>updatePlanner({tasks: data.planner.tasks.map((x:any)=>x.id===t.id?{...x,done:!x.done}:x)})} /><span style={{flex:1, textDecoration: t.done?'line-through':'none'}}>{t.text}</span><button onClick={()=>updatePlanner({tasks: data.planner.tasks.filter((x:any)=>x.id!==t.id)})} style={st.wrongBtn}>✕</button></div>
            ))}
          </div>
          <div style={st.section}><h3 style={st.secTitle}>💧 Water ({data.planner.water}/8)</h3>
            <div style={{display:'flex', gap:'8px'}}>{[...Array(8)].map((_, i)=>(<button key={i} onClick={()=>updatePlanner({water:i+1})} style={{...st.cup, background:i<data.planner.water?'#146654':'#eee'}} />))}</div>
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

// --- Combined Styles ---
const st: Record<string, React.CSSProperties> = {
  authWrapper: { background: '#D1D5D1', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box' },
  logoCircle: { width: '60px', height: '60px', background: '#146654', color: '#fff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '20px' },
  authTitle: { fontSize: '28px', marginBottom: '30px' },
  authCard: { background: 'rgba(255,255,255,0.4)', borderRadius: '25px', padding: '15px', width: '100%', maxWidth: '350px' },
  authTabs: { display: 'flex', background: '#e0e0e0', borderRadius: '12px', padding: '4px', marginBottom: '20px' },
  tabBtn: { flex: 1, border: 'none', padding: '8px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  field: { display: 'flex', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ccc' },
  fieldInput: { border: 'none', outline: 'none', flex: 1, marginLeft: '8px' },
  submitBtn: { width: '100%', padding: '14px', background: '#146654', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  appWrapper: { maxWidth: '450px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' },
  homeHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  menuCardGreen: { background: '#146654', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', cursor: 'pointer', color: '#fff' },
  menuCardWhite: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', border: '1px solid #ddd' },
  menuIconBg: { width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  quoteBox: { marginTop: '40px', background: '#e0e0e0', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
  backBtn: { background: 'none', border: 'none', color: '#146654', fontWeight: 700, marginBottom: '20px', cursor: 'pointer' },
  section: { background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px' },
  secTitle: { color: '#146654', fontSize: '15px', marginBottom: '10px' },
  priRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#f9f9f9', padding: '8px', borderRadius: '10px' },
  badge: { background: '#146654', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' },
  tick: { background: '#146654', border: 'none', color: '#fff', borderRadius: '50%', width: '22px', height: '22px' },
  inputWrap: { display: 'flex', gap: '8px', background: '#eee', padding: '8px', borderRadius: '10px' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none' },
  addBtn: { background: '#146654', color: '#fff', border: 'none', borderRadius: '8px', width: '30px', height: '30px' },
  catRow: { display: 'flex', gap: '8px', marginBottom: '10px' },
  catBtn: { flex: 1, padding: '8px', borderRadius: '8px', border: 'none' },
  taskRow: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' },
  wrongBtn: { background: 'none', border: 'none', color: '#ccc' },
  cup: { width: '30px', height: '30px', borderRadius: '8px', border: 'none' },
  treeWrapper: { display: 'flex', justifyContent: 'center', overflowX: 'auto' },
  treeRow: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  nodeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  mindCard: { background: '#fff', padding: '12px', borderRadius: '12px', textAlign: 'center', minWidth: '80px' },
  nodeInput: { border: 'none', textAlign: 'center', outline: 'none', fontWeight: 600, width: '70px' },
  branchBtn: { marginTop: '8px', background: '#fff', border: '1px solid #146654', color: '#146654', borderRadius: '50%', width: '20px', height: '20px' },
  childContainer: { marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' },
  mindFooter: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', width: '90%', maxWidth: '400px' },
  mainAdd: { flex: 4, background: '#146654', color: '#fff', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 700 },
  delBtn: { flex: 1, background: '#eee', border: 'none', borderRadius: '15px' },
  timeInput: { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #eee' },
  row: { display: 'flex', gap: '10px' }
};
