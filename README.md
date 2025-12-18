# RouteFlow — Scalable Route Optimization System

RouteFlow is a **full-stack route optimization system** that applies **Dijkstra’s Algorithm** to compute optimal paths over a weighted graph.  
The project focuses on **algorithmic correctness, system design, and practical integration**, rather than UI-heavy features.

It demonstrates how classical **Data Structures & Algorithms** can be applied to real-world routing problems with dynamic constraints.

---

## 🚀 Key Features

- **Shortest Path Computation**
  - Custom implementation of **Dijkstra’s Algorithm**
  - Uses a **Min Heap (Priority Queue)**
  - Graph represented as an **adjacency list**

- **Multi-Stop Route Optimization**
  - Supports routing through multiple intermediate nodes  
    *(source → stop₁ → stop₂ → destination)*

- **Dynamic Edge Weights**
  - Edge costs adjusted based on:
    - Weather conditions (clear / rain / storm)
    - Mode of transport (driving / walking / cycling)

- **Algorithm Metrics**
  - Tracks internal execution details:
    - Nodes visited
    - Edge relaxations
    - Time complexity: `O(E log V)`

- **Full-Stack Architecture**
  - REST API for route computation
  - Persistent route history storage
  - User-specific route logs

---

## 🧠 Algorithmic Details

- **Algorithm:** Dijkstra’s Algorithm  
- **Data Structures Used:**
  - Priority Queue (Min Heap)
  - Adjacency List Graph

### Time Complexity
  O(E log V)

### Why Dijkstra?
Dijkstra’s algorithm guarantees optimal shortest paths in graphs with non-negative edge weights and is widely used in routing systems, navigation software, and network optimization.

---

## 🏗 System Workflow

1. User provides source, destination, and routing parameters
2. Backend constructs a weighted graph from stored graph data
3. Dynamic edge weights are calculated using contextual multipliers
4. Dijkstra’s algorithm runs on each route segment (multi-stop supported)
5. Optimized path and execution metrics are returned
6. Route data can be saved and retrieved later

---

## 🛠 Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| Frontend    | React.js, Tailwind CSS |
| Backend     | Node.js, Express.js |
| Database    | MySQL |
| Algorithms  | Dijkstra’s Algorithm, Min Heap |
| Tools       | Git, GitHub |

---

## 📊 Data Storage

- Route execution history is stored in MySQL
- Each entry includes:
  - Source and destination
  - Optimized total cost
  - Transport mode
  - Path reconstruction

---

## 📌 Design Focus

This project emphasizes:

- Algorithmic clarity over UI complexity
- Correctness and scalability
- Clean separation between frontend, backend, and algorithm logic
- Practical application of Data Structures and Algorithms

Authentication and persistence are included only to support core functionality.

---

## 🧪 Future Improvements

- Mapping abstract graph nodes to real-world coordinates
- Visualization of graph traversal steps
- Additional routing constraints (traffic, time windows)

---

## 📎 Note

This project was built to demonstrate **problem-solving skills, algorithmic thinking, and system design**.
