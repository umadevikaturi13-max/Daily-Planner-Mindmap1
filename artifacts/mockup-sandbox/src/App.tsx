import React, { useState, useEffect } from 'react';

// --- Types ---
type TaskCategory = 'home' | 'work';
type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; parentId?: string | null; }

/**
 * COMPONENT: App
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'mindmap'>('planner');
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('daily-sync-v2');
    return saved ? JSON.parse(saved) : {
      planner: { wake: '07:00', sleep: '22:00', priorities: ['', '', ''], tasks: [], water: 0, meals: { breakfast: false, lunch: false, dinner: false, snacks: false }, notes: '' },
      mindmap: { nodes: [] as MindNode[] }
    };
  });

  const [newTask, setNewTask] = useState("");
  const [cat, setCat] = useState<TaskCategory>('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('daily-sync-v2', JSON.stringify(data)); }, [data]);

  // --- FEATURE: Priority Deletion on Tick ---
  const handlePriorityTick = (index: number) => {
    const newPriorities = [...data.planner.priorities];
    newPriorities[index] = ""; // "Delete" (Clear) the task after completion as per SS logic
    setData({ ...data, planner: { ...data.planner, priorities: newPriorities } });
  };

  // --- FEATURE: Tree Formation (Add child to selected node) ---
  const addMindNode = () => {
    const newNode: MindNode = { id: Date.now().toString(), text: 'New Idea', children: [], parentId: selectedNodeId };
    if (!selectedNodeId) {
      setData({ ...data, mindmap: { nodes: [...data.mindmap.nodes, newNode] } });
    } else {
      // Tree logic: Find parent and push child
      const updateTree = (list: MindNode[]): MindNode[] => list.map(n => 
        n.id === selectedNodeId ? { ...n, children: [...n.children, newNode] } : { ...n, children: updateTree(n.children) }
      );
      setData({ ...data, mindmap: { nodes: updateTree(data.mindmap.nodes) } });
    }
  };

  // Recursively render the tree nodes
  const renderTree = (nodes: MindNode[], level = 0) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: level * 20 }}>
      {nodes.map(node => (
        <div key={node.id}>
          <div 
            onClick={() => setSelectedNodeId(node.id)}
            style={{ ...st.node, borderColor: selectedNodeId === node.id ? '#007AFF' : '#ddd' }}
          >
            <input 
              value={node.text} 
              style={st.nodeInput} 
              onChange={(e) => {
                const edit = (list: MindNode[]): MindNode[] => list.map(n => n.id === node.id ? { ...n, text: e.target.value } : { ...n, children: edit(n.children) });
                setData({ ...data, mindmap: { nodes: edit(data.mindmap.nodes) } });
              }} 
            />
          </div>
          {node.children.length > 0 && renderTree(node.children, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div style={st.wrapper}>
      <nav style={st.nav}>
        <button onClick={() => setActiveTab('planner')} style={{ ...st.navBtn, color: activeTab === 'planner' ? '#007AFF' : '#888' }}>📅 Planner</button>
        <button onClick={() => setActiveTab('mindmap')} style={{ ...st.navBtn, color: activeTab === 'mindmap' ? '#007AFF' : '#888' }}>🧠 Mind Map</button>
      </nav>

      {activeTab === 'planner' ? (
        <div style={st.container}>
          <section style={st.section}>
            <h3 style={st.title}>⭐ Top 3 Priorities</h3>
            {data.planner.priorities.map((p: string, i: number) => (
              <div key={i} style={st.row}>
                <button onClick={() => handlePriorityTick(i)} style={st.tickBtn}>✓</button>
                <input style={st.input} value={p} placeholder="Priority..." onChange={(e) => {
                  const copy = [...data.planner.priorities]; copy[i] = e.target.value;
                  setData({ ...data, planner: { ...data.planner, priorities: copy } });
                }} />
              </div>
            ))}
          </section>

          <section style={st.section}>
            <div style={st.row}>
               <button onClick={() => setCat('home')} style={{ ...st.tab, opacity: cat === 'home' ? 1 : 0.4 }}>Home</button>
               <button onClick={() => setCat('work')} style={{ ...st.tab, opacity: cat === 'work' ? 1 : 0.4 }}>Work</button>
            </div>
            <div style={st.row}>
              <input style={st.input} value={newTask} placeholder={`Add ${cat} task...`} onChange={e => setNewTask(e.target.value)} />
              <button style={st.addBtn} onClick={() => {
                if (!newTask) return;
                setData({ ...data, planner: { ...data.planner, tasks: [...data.planner.tasks, { id: Date.now().toString(), text: newTask, category: cat, done: false }] } });
                setNewTask("");
              }}>+</button>
            </div>
            {data.planner.tasks.filter((t: any) => t.category === cat).map((t: any) => (
              <div key={t.id} style={st.taskRow}>
                <span style={{ flex: 1 }}>{t.text}</span>
                {/* FEATURE: The "Wrong" (X) Button to remove task */}
                <button style={st.wrongBtn} onClick={() => {
                  setData({ ...data, planner: { ...data.planner, tasks: data.planner.tasks.filter((x: any) => x.id !== t.id) } });
                }}>✕</button>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <div style={st.container}>
          <div style={st.canvas}>{renderTree(data.mindmap.nodes)}</div>
          <div style={st.footer}>
            <button onClick={addMindNode} style={st.mindBtn}>{selectedNodeId ? "+ Add Child" : "+ Add Idea"}</button>
            <button onClick={() => {
              const del = (list: MindNode[]): MindNode[] => list.filter(n => n.id !== selectedNodeId).map(n => ({ ...n, children: del(n.children) }));
              setData({ ...data, mindmap: { nodes: del(data.mindmap.nodes) } });
              setSelectedNodeId(null);
            }} style={st.delBtn}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: '450px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' },
  nav: { display: 'flex', background: '#fff', borderBottom: '1px solid #eee' },
  navBtn: { flex: 1, padding: '15px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 },
  container: { padding: '20px' },
  section: { background: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  title: { fontSize: '16px', color: '#007AFF', marginBottom: '10px' },
  row: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' },
  tickBtn: { width: '25px', height: '25px', borderRadius: '50%', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' },
  wrongBtn: { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '18px' },
  input: { flex: 1, padding: '10px', border: 'none', borderBottom: '1px solid #eee', outline: 'none' },
  addBtn: { background: '#007AFF', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px' },
  tab: { background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' },
  taskRow: { display: 'flex', padding: '10px', borderBottom: '1px solid #f9f9f9' },
  canvas: { minHeight: '60vh', overflowX: 'auto' },
  node: { padding: '10px', background: '#fff', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', width: 'fit-content' },
  nodeInput: { border: 'none', outline: 'none', fontWeight: 600 },
  footer: { display: 'flex', gap: '10px', marginTop: '20px' },
  mindBtn: { flex: 1, background: '#007AFF', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 700 },
  delBtn: { background: '#ff4d4d', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px' }
};
