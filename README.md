# NetworkTrace

**NetworkTrace** is an interactive graph-analysis application for exploring entities and their relationships through network visualization, graph algorithms, and statistical analysis.

The application allows users to upload relationship datasets, explore connected entities, identify communities, and analyze network structures through an interactive interface.

## Features

- Interactive network graph visualization.
- Demo graph for testing application functionality.
- CSV dataset upload and validation.
- Entity search and community filtering.
- Entity details and connected-entity exploration.
- Louvain community detection.
- Degree, betweenness, and closeness centrality.
- Graph density and clustering statistics.
- Connected-component analysis.
- Duplicate relationship handling.
- Interactive network exploration.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, Cytoscape.js |
| Backend | Python, FastAPI, Uvicorn |
| Graph Analysis | NetworkX |
| Data Processing | Pandas |

## Project Structure

```text
NetworkTrace/
│
├── backend/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/
├── .gitignore
└── README.md
```

## Requirements

- Python 3.11 or compatible.
- Node.js and npm.
- Visual Studio Code.
- Python and JavaScript extensions for VS Code (recommended).

## Getting Started

### 1. Download the Project

Clone the repository from GitHub or download and extract the ZIP file.

Open the extracted `NetworkTrace` project folder in Visual Studio Code.

### 2. Configure the Backend

Open the integrated VS Code terminal.

Select the backend directory as your working directory.

Create and activate a Python virtual environment if one does not already exist.

Install the dependencies listed in `backend/requirements.txt`.

Start the FastAPI development server using Uvicorn.

The backend runs locally at:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

### 3. Configure the Frontend

Open a second integrated terminal in VS Code.

Select the frontend directory as your working directory.

Install the dependencies defined in `frontend/package.json`.

Start the Vite development server.

The frontend runs locally at:

http://localhost:5173

**Note:** Both frontend and backend development servers must be running simultaneously.

## CSV Upload Format

NetworkTrace supports CSV datasets containing relationships between entities.

The CSV file must contain two required columns:

- `source`
- `target`

Example:

```csv
source,target
A001,A002
A001,A003
A002,A003
B001,B002
B002,B003
C001,C002
```

Each row represents a relationship between two entities.

## Testing

The backend includes a test suite for validating graph-analysis functionality.

The frontend supports a production build through its configured Vite build script.

## Responsible Use

NetworkTrace is designed for graph exploration, relationship analysis, educational activities, and research purposes.

Network statistics describe relationships and graph structures. They do not independently establish identity, intent, criminality, or wrongdoing.

Users should interpret analytical results carefully and consider the quality and limitations of the underlying data.

## Future Improvements

- Support for larger network datasets.
- Advanced graph visualization controls.
- Improved community detection techniques.
- Exportable graph-analysis reports.
- Additional network statistics.
- Performance optimization for large networks.

## License

Add an appropriate open-source license before publicly distributing or allowing reuse of this project.
