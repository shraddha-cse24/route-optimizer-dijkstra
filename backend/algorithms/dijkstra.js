import { MinHeap } from './priorityQueue.js';

/**
 * Dijkstra's Algorithm (Optimized for STEP Interview)
 * @param {Object} graph - Adjacency list from graph.json
 * @param {string} start - Source node ID
 * @param {string} end - Destination node ID
 * @param {Function} weightCalculator - Callback function (edge) => number
 */
export function findShortestPath(graph, start, end, weightCalculator) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = new MinHeap();

  // 1. Initialize Graph State
  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[start] = 0;
  pq.push({ id: start, priority: 0 });

  while (pq.size() > 0) {
    // 2. Extract node with the smallest current distance
    const { id: currentNode, priority: currentDist } = pq.pop();

    // Optimization: If we've already found a shorter path to this node, skip it
    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    // Optimization: If we reached our target, we can stop early
    if (currentNode === end) break;

    // 3. Process Neighbors
    const neighbors = graph[currentNode] || [];
    for (let edge of neighbors) {
      if (visited.has(edge.to)) continue;

      // Use the injected weight calculator (Weather + Distance)
      const weight = weightCalculator(edge);
      const newDist = distances[currentNode] + weight;

      // 4. Relaxation Step
      if (newDist < distances[edge.to]) {
        distances[edge.to] = newDist;
        previous[edge.to] = currentNode;
        pq.push({ id: edge.to, priority: newDist });
      }
    }
  }

  return reconstructPath(previous, end, distances[end]);
}

/**
 * Reconstructs the path from the 'previous' pointers
 */
function reconstructPath(previous, end, totalCost) {
  // Safety check: if distance is still Infinity, no path exists
  if (totalCost === Infinity) {
    return { path: [], totalCost: Infinity };
  }

  const path = [];
  let curr = end;

  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return { 
    path, 
    totalCost: parseFloat(totalCost.toFixed(2)) 
  };
}