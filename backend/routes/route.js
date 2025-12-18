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
  const { source, destination, stops, weather, mode } = req.body;

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

  // Mode multipliers
  const modeMultipliers = {
    driving: 1.0,
    walking: 2.5,
    cycling: 1.8
  };

  // 2. Weight calculator (Weather + Mode + Distance)
  const weightCalculator = (edge) => {
    const weatherMultiplier = getMultiplier(weather || 'clear');
    const modeMultiplier = modeMultipliers[mode || 'driving'];
    return edge.distance * weatherMultiplier * modeMultiplier;
  };

  try {
    // -------- MULTI-STOP ROUTE LOGIC START --------

    const routePoints = [
      source,
      ...(stops || []),
      destination
    ];

    let fullPath = [];
    let totalCost = 0;

    // ✅ ADD THESE (ALGORITHM METRICS)
    let visitedCount = 0;
    let edgeRelaxations = 0;

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

      // ✅ ACCUMULATE METRICS
      visitedCount += segmentResult.visitedCount;
      edgeRelaxations += segmentResult.edgeRelaxations;

      // Merge paths (avoid duplicate nodes)
      if (i === 0) {
        fullPath.push(...segmentResult.path);
      } else {
        fullPath.push(...segmentResult.path.slice(1));
      }

      totalCost += segmentResult.totalCost;
    }

    // ✅ INCLUDE METRICS IN RESPONSE
    const result = {
      path: fullPath,
      totalCost: parseFloat(totalCost.toFixed(2)),
      visitedCount,
      edgeRelaxations
    };

    // -------- MULTI-STOP ROUTE LOGIC END --------

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
