import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { findShortestPath } from '../algorithms/dijkstra.js';
import { getMultiplier } from '../services/weatherService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load graph data safely using absolute path
const graphPath = path.join(__dirname, '../data/graph.json');
const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));

router.post('/', (req, res) => {
  const { source, destination, stops,weather } = req.body;

  // 1. Validation
  if (!graphData[source] || !graphData[destination]) {
    return res.status(400).json({
      error: "Invalid source or destination. Please check your graph data."
    });
  }
  if (stops && !Array.isArray(stops)) {
  return res.status(400).json({
    error: "Stops must be an array"
  });
  }


  // 2. Weight calculator (Weather + Distance)
  const weightCalculator = (edge) => {
    const multiplier = getMultiplier(weather || 'clear');
    return edge.distance * multiplier;
  };

  try {
    // 3. Run Dijkstra
    // -------- MULTI-STOP ROUTE LOGIC START --------

// Build route sequence: source -> stops -> destination
const routePoints = [
  source,
  ...(stops || []),
  destination
];

let fullPath = [];
let totalCost = 0;

for (let i = 0; i < routePoints.length - 1; i++) {
  const from = routePoints[i];
  const to = routePoints[i + 1];

  const segmentResult = findShortestPath(
    graphData,
    from,
    to,
    weightCalculator
  );

  // If any segment has no path, fail early
  if (segmentResult.totalCost === Infinity) {
    return res.status(404).json({
      message: `No path found between ${from} and ${to}`,
      path: [],
      totalCost: Infinity
    });
  }

  // Merge paths (avoid duplicate nodes)
  if (i === 0) {
    fullPath.push(...segmentResult.path);
  } else {
    fullPath.push(...segmentResult.path.slice(1));
  }

  totalCost += segmentResult.totalCost;
}

const result = {
  path: fullPath,
  totalCost: parseFloat(totalCost.toFixed(2))
};

// -------- MULTI-STOP ROUTE LOGIC END --------


    // 4. Handle no-path case
    if (result.totalCost === Infinity) {
      return res.status(404).json({
        message: "No path found between these locations.",
        path: [],
        totalCost: Infinity
      });
    }

    // 5. Success
    res.json(result);
  } catch (error) {
    console.error("Pathfinding error:", error);
    res.status(500).json({
      error: "Internal server error during calculation."
    });
  }
});

export default router;
