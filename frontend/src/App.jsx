import { useState } from "react";

function App() {
  const [source, setSource] = useState("A");
  const [destination, setDestination] = useState("G");
  const [weather, setWeather] = useState("clear");
  const [stops, setStops] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const findRoute = async () => {
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          destination,
          stops: stops
            ? stops.split(",").map(s => s.trim()).filter(Boolean)
            : [],
          weather
        })


      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error);
        setResult(null);
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Failed to connect to backend");
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>Route Optimizer</h2>

      <label>Source:</label>
      <input value={source} onChange={e => setSource(e.target.value)} />

      <br /><br />

      <label>Destination:</label>
      <input value={destination} onChange={e => setDestination(e.target.value)} />

      <br /><br />

      <label>Stops (comma-separated):</label>
      <input
        placeholder="e.g. C,E"
        value={stops}
        onChange={e => setStops(e.target.value)} />

      <br /><br />
      <label>Weather:</label>
      <select onChange={e => setWeather(e.target.value)}>
        <option value="clear">Clear</option>
        <option value="rain">Rain</option>
        <option value="storm">Storm</option>
      </select>

      <br /><br />

      <button onClick={findRoute}>Find Route</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <p><b>Path:</b> {result.path.join(" → ")}</p>
          <p><b>Total Cost:</b> {result.totalCost}</p>
        </div>
      )}
    </div>
  );
}

export default App;
