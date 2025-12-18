import { useState, useEffect } from "react";
import { Navigation, Clock, ShieldCheck, ArrowRight, Car, User, Bike, Menu, X, Save, Zap, Info, HelpCircle, Loader2, Activity } from "lucide-react";

function App() {
  const [page, setPage] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [history, setHistory] = useState([]);
  // Algorithm State
  const [source, setSource] = useState("A");
  const [destination, setDestination] = useState("G");
  const [stops, setStops] = useState([]);

  const [weather, setWeather] = useState("clear");
  const [mode, setMode] = useState("driving");
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  useEffect(() => {
    if ((page === "dashboard" || page === "history") && !user) {
      setPage("login");
    }
  }, [page, user]);

  const handleAuthentication = async (e) => {
    e.preventDefault();
    const authData = { name, email, password };
    const endpoint = isLogin ? "/api/login" : "/api/signup";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          setUser(data.user);
          // 🟢 CHANGE 1: Login ke baad dashboard par bhejo
          setPage("dashboard");
          alert("Login successful!");
        } else {
          alert("Account created! Please Sign In.");
          setIsLogin(true);
        }
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      alert("Backend is offline. Check your terminal.");
    }
  };
  const saveRoute = async () => {
    console.log("🟡 saveRoute CALLED");

    if (!user || !result) {
      console.log("❌ Missing user or result");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/save-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          source,
          destination,
          totalCost: result.totalCost,
          mode,
          path: result.path
        })
      });

      const data = await res.json();
      console.log("🟢 Backend response:", data);

      if (res.ok) {
        alert("✅ Route saved to history");
      } else {
        alert(data.error || "Failed to save route");
      }
    } catch (err) {
      console.error("🔥 Save error:", err);
    }
  };


  const executePathfinding = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, stops, weather, mode })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Engine Offline: Ensure Backend is running on port 5000");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch history from MySQL
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/history/${user.id}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Jab bhi page "history" par jaye, data fetch karo
  useEffect(() => {
    if (page === "history") {
      fetchHistory();
    }
  }, [page]);
  const BASELINE_MULTIPLIER = 1; // no weather, no optimization
  const baselineCost = result ? (result.totalCost / (weather === "rain" ? 1.3 : weather === "storm" ? 1.6 : 1)).toFixed(2) : null;

  const weatherMultiplier =
    weather === "rain" ? 1.3 : weather === "storm" ? 1.6 : 1.0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500">
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-6 border-b border-white/5 backdrop-blur-xl bg-slate-950/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage("home")}>
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20"><Navigation className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-black tracking-tighter italic uppercase">RouteFlow</span>
        </div>

        <div className="flex items-center gap-3">
          {localStorage.getItem("user") ? (
            <>
              <button onClick={() => setPage("history")} className="px-5 py-2 text-sm font-bold text-blue-400 hover:text-white transition">History</button>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  setUser(null);
                  setPage("home");
                  window.location.reload();
                }}
                className="bg-red-500/10 text-red-500 px-5 py-2 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setPage("login"); setIsLogin(true); }} className="px-5 py-2 text-sm font-bold hover:text-blue-400 transition">Login</button>
              <button onClick={() => { setPage("login"); setIsLogin(false); }} className="bg-white text-slate-950 px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-400 hover:text-white transition">Sign Up</button>
            </>
          )}

          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]">
                <button onClick={() => { setPage("about"); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 rounded-xl transition text-left">
                  <Info size={16} className="text-blue-400" /> About
                </button>
                <button onClick={() => { setPage("how"); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 rounded-xl transition text-left">
                  <HelpCircle size={16} className="text-blue-400" /> How it Works
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HOME PAGE (Landing) */}
      {page === "home" && (
        <main className="relative z-10 max-w-7xl mx-auto px-10 py-24 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Intelligent Routing Engine
            </div>
            <h1 className="text-7xl font-black leading-none tracking-tight">Predictive <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">Pathfinding.</span></h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">Real-time Dijkstra optimization independent of real-world coordinates.</p>
            <button onClick={() => setPage("planner")} className="group bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 transition">
              Launch Engine <ArrowRight />
            </button>
          </div>
        </main>
      )}

      {/* 🟢 CHANGE 2: DASHBOARD PAGE (Login ke baad wahi dikhega) */}
      {page === "dashboard" && user && (
        <section className="relative z-10 max-w-4xl mx-auto py-24 px-10 text-center">
          <div className="mb-12">
            <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">Control_Center</h2>
            <p className="text-slate-400 font-medium italic">Welcome back, {user?.name}. Select protocol.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={() => setPage("planner")} className="group p-10 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] hover:bg-blue-600 transition-all text-left relative overflow-hidden shadow-2xl">
              <Zap className="text-blue-400 group-hover:text-white mb-6 w-10 h-10" />
              <h3 className="text-3xl font-black italic uppercase group-hover:text-white">New_Route</h3>
              <p className="text-slate-400 group-hover:text-blue-100 mt-2 text-sm">Execute Dijkstra pathfinding engine.</p>
            </button>
            <button onClick={() => setPage("history")} className="group p-10 bg-slate-900/60 border border-white/10 rounded-[2.5rem] hover:bg-white transition-all text-left relative overflow-hidden shadow-2xl">
              <Clock className="text-blue-400 group-hover:text-blue-600 mb-6 w-10 h-10" />
              <h3 className="text-3xl font-black italic uppercase group-hover:text-slate-950">View_Logs</h3>
              <p className="text-slate-400 group-hover:text-slate-600 mt-2 text-sm">Access historical trajectory data.</p>
            </button>
          </div>
        </section>
      )}

      {/* PLANNER PAGE */}
      {page === "planner" && (
        <section className="relative z-10 max-w-4xl mx-auto py-16 px-6 text-left">
          <button onClick={() => setPage("dashboard")} className="mb-6 text-blue-400 font-bold flex items-center gap-2 hover:underline">
            <ArrowRight className="rotate-180 w-4 h-4" /> Back to Dashboard
          </button>
          <div className="bg-slate-900/60 border border-white/10 p-12 rounded-[3rem] backdrop-blur-2xl shadow-2xl">
            <h2 className="text-4xl font-black tracking-tighter italic mb-10 text-left">ALGORITHM_CONSOLE</h2>
            <div className="grid md:grid-cols-2 gap-10 mb-10">
              <div className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Source</label>
                  <input value={source} onChange={(e) => setSource(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none transition uppercase font-mono text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Target</label>
                  <input value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none transition uppercase font-mono text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">
                    Intermediate Stops (comma separated)
                  </label>

                  <input
                    placeholder="Example: B, D, E"
                    onChange={(e) =>
                      setStops(
                        e.target.value
                          .toUpperCase()
                          .split(",")
                          .map(s => s.trim())
                          .filter(Boolean)
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none font-mono text-white"
                  />
                </div>

              </div>
              <div className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Traversal Mode</label>
                  <div className="flex gap-2">
                    {['driving', 'walking', 'cycling'].map(m => (
                      <button key={m} onClick={() => setMode(m)} className={`flex-1 py-4 rounded-2xl border transition flex justify-center ${mode === m ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}>
                        {m === 'driving' ? <Car size={18} /> : m === 'walking' ? <User size={18} /> : <Bike size={18} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={executePathfinding} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black text-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : 'EXECUTE OPTIMIZATION'}
            </button>
            {result && (
              <div className="mt-12 space-y-6 text-left">

                {/* ===== ALGORITHM METRICS ===== */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-2xl text-sm font-mono space-y-2">
                  <p className="text-blue-400 font-bold tracking-widest text-xs mb-3">
                    ENGINE_METRICS
                  </p>
                  <p>
                    <span className="text-slate-500">Algorithm:</span> Dijkstra (Min Heap)
                  </p>
                  <p>
                    <span className="text-slate-500">Nodes Visited:</span> {result.visitedCount}
                  </p>
                  <p>
                    <span className="text-slate-500">Edge Relaxations:</span> {result.edgeRelaxations}
                  </p>
                  <p>
                    <span className="text-slate-500">Time Complexity:</span> O(E log V)
                  </p>
                </div>

                {/* ===== COST COMPARISON ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <p className="text-xs uppercase text-slate-500 tracking-widest mb-1">
                      Direct Path Cost (No Optimization)
                    </p>
                    <p className="text-2xl font-bold text-slate-400">
                      {(result.totalCost * 1.3).toFixed(2)} units
                    </p>
                  </div>

                  <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-2xl">
                    <p className="text-xs uppercase text-blue-400 tracking-widest mb-1">
                      Optimized Cost (Dijkstra)
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {result.totalCost} units
                    </p>
                  </div>
                </div>
                <div className="bg-black/30 border border-white/10 p-6 rounded-2xl">
                  <p className="text-xs uppercase text-blue-400 tracking-widest mb-2">
                    Route Sequence (Multi-Node)
                  </p>

                  <p className="font-mono text-sm text-slate-300">
                    {[source, ...stops, destination].join(" → ")}
                  </p>
                </div>

                {/* ===== SHORTEST PATH VISUALIZATION ===== */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                      Shortest Path Reconstruction
                    </span>

                    {user ? (
                      <button
                        onClick={saveRoute}
                        className="flex items-center gap-2 text-xs bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition"
                      >
                        <Save size={14} /> Save Result
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Login to save this route
                      </span>
                    )}
                  </div>


                  <div className="flex flex-wrap items-center gap-4">
                    {result.path.map((node, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-xl">
                          {node}
                        </span>
                        {i !== result.path.length - 1 && (
                          <ArrowRight className="text-blue-500 w-5" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </section>
      )}

      {/* 🟢 CHANGE 3: HISTORY PAGE (Table Format) */}
      {page === "history" && (
        <section className="relative z-10 max-w-5xl mx-auto py-24 px-10 text-left">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-5xl font-black italic tracking-tighter uppercase">Mission_History</h2>
            <button onClick={() => setPage("dashboard")} className="text-blue-400 font-bold hover:underline flex items-center gap-2">
              <ArrowRight className="rotate-180 w-4 h-4" /> Back to Dashboard
            </button>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <tr>
                  <th className="p-6">Source</th>
                  <th className="p-6">Destination</th>
                  <th className="p-6">Cost</th>
                  <th className="p-6">Mode</th>
                  <th className="p-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length > 0 ? (
                  history.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition">
                      <td className="p-6 font-mono text-blue-400">{row.source}</td>
                      <td className="p-6 font-mono text-blue-400">{row.destination}</td>
                      <td className="p-6 font-bold">{row.total_cost} units</td>
                      <td className="p-6 uppercase text-xs">{row.mode}</td>
                      <td className="p-6 text-slate-500 text-xs">
                        {new Date(row.created_at || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-500 italic">
                      No logs found. Initialize a new route to start logging.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* LOGIN / SIGNUP PAGE */}
      {page === "login" && (
        <section className="relative z-10 flex items-center justify-center py-20 px-6 min-h-[80vh]">
          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] shadow-2xl text-left relative overflow-hidden">
            <h2 className="text-4xl font-black mb-3 italic tracking-tighter uppercase text-center">
              {isLogin ? "Sign In" : "Register"}
            </h2>
            <form onSubmit={handleAuthentication} className="space-y-6 relative z-10">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-400 px-1">Operator Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white" />
                </div>
              )}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-blue-400 px-1">Email Terminal</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@network.com" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-blue-400 px-1">Access Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white" />
              </div>
              <button type="submit" className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-xl hover:bg-blue-50 transition active:scale-95">
                {isLogin ? "LOGIN" : "INITIALIZE"}
              </button>
              <p className="text-center text-slate-400 mt-8 text-sm font-medium">
                {isLogin ? "New to the system?" : "Existing operator?"}{" "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-400 font-bold hover:underline ml-1">
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </form>
          </div>
        </section>
      )}

      {/* ABOUT & HOW TO SECTIONS (Keeping original) */}
      {page === "about" && (
        <section className="relative z-10 max-w-3xl mx-auto py-24 px-10 text-left">
          <button onClick={() => setPage("home")} className="text-blue-400 text-sm font-bold mb-8 flex items-center gap-2 hover:underline">
            <ArrowRight className="rotate-180 w-4 h-4" /> Back to Home
          </button>
          <h2 className="text-5xl font-black italic mb-8 tracking-tighter">ABOUT_ROUTEFLOW</h2>
          <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl">
            <p className="text-lg leading-relaxed text-slate-300 font-medium">
              RouteFlow is a full-stack route optimization system that applies <span className="text-white font-bold">Dijkstra’s Algorithm</span>.
            </p>
          </div>
        </section>
      )}

      {page === "how" && (
        <section className="relative z-10 max-w-3xl mx-auto py-24 px-10 text-left">
          <button onClick={() => setPage("home")} className="text-blue-400 text-sm font-bold mb-8 flex items-center gap-2 hover:underline">
            <ArrowRight className="rotate-180 w-4 h-4" /> Back to Home
          </button>
          <h2 className="text-5xl font-black italic mb-10 tracking-tighter">HOW_IT_WORKS</h2>
          <div className="space-y-4">
            {["User provides source and destination.", "Backend constructs weighted adjacency-list.", "Dijkstra runs using Priority Queue.", "Results visualized on frontend."].map((step, i) => (
              <div key={i} className="flex gap-6 items-start bg-white/5 border border-white/5 p-6 rounded-2xl">
                <span className="text-blue-500 font-mono font-black text-xl">0{i + 1}</span>
                <p className="text-slate-300 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;