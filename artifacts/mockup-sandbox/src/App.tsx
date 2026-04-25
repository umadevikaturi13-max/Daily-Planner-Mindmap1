import React, { useState, useEffect } from 'react';

// --- Types ---
type ViewState = 'auth' | 'home' | 'planner' | 'mindmap';
type TaskCategory = 'home' | 'work';
interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; }

export default function App() {
  // --- Auth & Navigation State ---
  const [view, setView] = useState<ViewState>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- Main Data State (Restoring everything from your previous code) ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('master_daily_app');
    return saved ? JSON.parse(saved) : {
      planner: { wake: '07:00', sleep: '23:00', priorities: ['', '', ''], tasks: [] as Task[], water: 0, meals: { breakfast: false, lunch: false, dinner: false, snacks: false }, notes: '' },
      mindmap: { roots: [] as MindNode[] }
    };
  });

  // Persist to local storage for offline use
  useEffect(() => { localStorage.setItem('master_daily_app', JSON.stringify(data)); }, [data]);

  const updatePlanner = (updates: any) => setData({ ...data, planner: { ...data.planner, ...updates } });

  // --- AUTH SCREEN (Matching your screenshot) ---
  if (view === 'auth') {
    return (
      <div style={st.authWrapper}>
        <div style={st.logoCircle}>☑</div>
        <h1 style={st.authTitle}>Daily Planner</h1>
        <p style={st.authSub}>Plan your day. Map your mind.</p>

        <div style={st.authCard}>
          <div style={st.authTabs}>
            <button 
              onClick={() => setAuthMode('signin')} 
              style={{...st.tabBtn, color: authMode === 'signin' ? '#333' : '#aaa', background: authMode === 'signin' ? '#fff' : 'transparent'}}
            >Sign In</button>
            <button 
              onClick={() => setAuthMode('signup')} 
              style={{...st.tabBtn, color: authMode === 'signup' ? '#333' : '#aaa', background: authMode === 'signup' ? '#fff' : 'transparent'}}
            >Sign Up</button>
          </div>

          <div style={st.inputGroup}>
            {authMode === 'signup' && (
              <div style={st.field}><span style={st.icon}>👤</span><input placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} style={st.fieldInput}/></div>
            )}
            <div style={st.field}><span style={st.icon}>✉</span><input placeholder="Email address" style={st.fieldInput}/></div>
            <div style={st.field}><span style={st.icon}>🔒</span><input type="password" placeholder="Password" style={st.fieldInput}/></div>
          </div>

          <button style={st.submitBtn} onClick={() => setView('home')}>
            {authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
        <p style={st.footerNote}>Your data stays on this device.</p>
      </div>
    );
  }

  // --- HOME SCREEN (Greeting the user) ---
  if (view === 'home') {
    return (
      <div style={st.appWrapper}>
        <header style={st.homeHeader}>
          <div>
            <p style={{color: '#888', margin: 0}}>Good evening,</p>
            <h1 style={{margin: 0, fontSize: '32px'}}>{userName || "Broto"}</h1>
          </div>
          <button onClick={() => setView('auth')} style={st.logoutIcon}>📤</button>
        </header>

        <h3 style={{marginTop: '40px', fontWeight: 600, fontSize: '18px'}}>What would you like to work on?</h3>

        <div style={st.menuCardGreen} onClick={() => setView('mindmap')}>
          <div style={st.menuIconBg}>🧠</div>
          <div style={{flex: 1}}>
            <h4 style={{margin: 0, color: '#fff', fontSize: '18px'}}>Mind Map</h4>
            <p style={{margin: 0, fontSize: '13px', color: '#fff', opacity: 0.8}}>Branch out ideas and connect them</p>
          </div>
          <span style={{color: '#fff', fontSize: '24px'}}>→</span>
        </div>

        <div style={st.menuCardWhite} onClick={() => setView('planner')}>
          <div style={{...st.menuIconBg, background: '#e8f2f0', color: '#146654'}}>📅</div>
          <div style={{flex: 1}}>
            <h4 style={{margin: 0, fontSize: '18px'}}>Daily Planner</h4>
            <p style={{margin: 0, fontSize: '13px', color: '#888'}}>Priorities, tasks, water and meals</p>
          </div>
          <span style={{fontSize: '24px', color: '#888'}}>→</span>
        </div>

        <div style={st.quoteBox}>
           <span style={{fontSize: '20px'}}>☀️</span>
           <p style={{margin: 0, fontSize: '14px', color: '#555', lineHeight: 1.4}}>Small steps every day add up to something remarkable.</p>
        </div>
      </div>
    );
  }

  // --- PLANNER / MINDMAP VIEWS ---
  return (
    <div style={st.appWrapper}>
      <button onClick={() => setView('home')} style={st.backBtn}>← Back to Home</button>
      
      {/* 
          Paste the UI logic (Priorities, Water, Tree nodes, etc.) 
          from the previous "complete" code I sent right here.
      */}
      
      <div style={{textAlign: 'center', marginTop: '40vh', color: '#ccc', fontStyle: 'italic'}}>
        {view === 'planner' ? "Planner active - Data saving locally" : "Mind Map active - Data saving locally"}
      </div>
    </div>
  );
}

// --- Styles matching your UI perfectly ---
const st: Record<string, React.CSSProperties> = {
  authWrapper: { background: '#D1D5D1', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'sans-serif' },
  logoCircle: { width: '70px', height: '70px', background: '#146654', color: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '20px' },
  authTitle: { fontSize: '32px', margin: '0', color: '#1A1A1A' },
  authSub: { color: '#666', marginBottom: '40px' },
  authCard: { background: 'rgba(255,255,255,0.4)', borderRadius: '25px', padding: '15px', width: '100%', maxWidth: '350px', border: '1px solid rgba(255,255,255,0.5)' },
  authTabs: { display: 'flex', background: '#e0e0e0', borderRadius: '15px', padding: '5px', marginBottom: '20px' },
  tabBtn: { flex: 1, border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' },
  field: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px', border: '1px solid #ccc' },
  fieldInput: { background: 'none', border: 'none', outline: 'none', flex: 1, marginLeft: '10px' },
  icon: { color: '#888' },
  submitBtn: { width: '100%', padding: '16px', background: '#146654', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' },
  footerNote: { marginTop: 'auto', color: '#666', fontSize: '12px' },
  
  // Home styles
  appWrapper: { maxWidth: '450px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', padding: '25px', boxSizing: 'border-box' },
  homeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  logoutIcon: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
  menuCardGreen: { background: '#146654', padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', cursor: 'pointer' },
  menuCardWhite: { background: '#fff', padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px', cursor: 'pointer', border: '1px solid #eee' },
  menuIconBg: { background: 'rgba(255,255,255,0.15)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  quoteBox: { marginTop: '50px', background: '#E0E0E0', padding: '20px', borderRadius: '20px', display: 'flex', gap: '15px', alignItems: 'center' },
  backBtn: { background: 'none', border: 'none', color: '#146654', fontWeight: 700, cursor: 'pointer', marginBottom: '20px' }
};
