# NetworkTrace — Project Overview

## 1. Purpose

NetworkTrace helps users explore relationships represented as a graph and inspect structural network patterns through an interactive interface.

## 2. Main Components

### Frontend

The React and Vite frontend provides the interface for loading graph data, exploring nodes and edges, searching entities, filtering communities, and reviewing analytics.

### Backend

The FastAPI backend exposes endpoints for health checks, demo graph data, CSV upload, and graph analysis.

### Graph Engine

The graph engine uses NetworkX and Pandas to process relationships and calculate graph statistics, centrality measures, and communities.

## 3. Input Data

CSV uploads expect source and target columns. Each valid row represents a relationship between two entities. Invalid headers and empty inputs should be rejected with an appropriate error.

## 4. Analytics

Available structural measures include:

- Degree and degree centrality
- Betweenness centrality
- Closeness centrality
- Louvain community detection
- Graph density
- Average degree
- Average clustering coefficient
- Connected-component statistics
- Average shortest-path length when defined

## 5. Local Development

Run the backend on port 8000 and the frontend using the Vite development server. Refer to the root README for complete setup instructions.

## 6. Validation

Run the backend test suite from the backend directory:

python -m pytest -v

Build the frontend from the frontend directory:

npm run build

## 7. Responsible Interpretation

Graph analytics describe mathematical relationships and connectivity. They should not be treated as proof of identity, intent, or misconduct. Use appropriate authorization and privacy safeguards when working with real-world data.
