import { MinHeap } from './priorityQueue.js';

export function findShortestPath(graph, start, end, weightCalculator) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = new MinHeap();
  
  // STEP Metrics
  let visitedCount = 0;
  let edgeRelaxations = 0;
  const propagationSequence = []; // Order of nodes extracted from PQ

  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[start] = 0;
  pq.push({ id: start, priority: 0 });

  while (pq.size() > 0) {
    const { id: currentNode, priority: currentDist } = pq.pop();

    if (visited.has(currentNode)) continue;
    
    // Algorithm Transparency: Track state
    visited.add(currentNode);
    visitedCount++;
    propagationSequence.push(currentNode);

    if (currentNode === end) break;

    const neighbors = graph[currentNode] || [];
    for (let edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const weight = weightCalculator(edge);
      const newDist = distances[currentNode] + weight;

      // STEP Metric: Edge Relaxation attempt
      edgeRelaxations++;

      if (newDist < distances[edge.to]) {
        distances[edge.to] = newDist;
        previous[edge.to] = currentNode;
        pq.push({ id: edge.to, priority: newDist });
      }
    }
  }

  const result = reconstructPath(previous, end, distances[end]);
  return {
    ...result,
    visitedCount,
    edgeRelaxations,
    propagationSequence
  };
}

function reconstructPath(previous, end, totalCost) {
  if (totalCost === Infinity) return { path: [], totalCost: Infinity };
  const path = [];
  let curr = end;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }
  return { path, totalCost: parseFloat(totalCost.toFixed(2)) };
}