# NetworkTrace

NetworkTrace is a graph-analysis application for exploring entities and their relationships through an interactive network visualization.

## Features

- Interactive network graph
- Demo graph and CSV file upload
- Entity search and community filtering
- Entity details and connected entities
- Louvain community detection
- Degree, betweenness, and closeness centrality
- Graph density and clustering statistics
- Connected-component analysis
- CSV validation and duplicate relationship handling

## Technology Stack

- Frontend: React, Vite, Cytoscape.js
- Backend: Python, FastAPI, NetworkX, Pandas, Uvicorn

## Project Structure

- backend/ — Backend API and graph analysis
- frontend/ — Web interface
- data/ — Project data
- docs/ — Project documentation
- scripts/ — Utility scripts

## Requirements

- Python 3.11 or compatible
- Node.js and npm

## How to Run

### Start the Backend

From the project root, run:

```powershell
cd "D:\Kola Personal\Downloads\NetworkTrace_NextGen\backend"
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### Start the Frontend

Open a second terminal:

```powershell
cd "D:\Kola Personal\Downloads\NetworkTrace_NextGen\frontend"
npm install
npm run dev
```

Frontend: http://localhost:5173

### Run Backend Tests

```powershell
cd "D:\Kola Personal\Downloads\NetworkTrace_NextGen\backend"
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

### Build the Frontend

```powershell
cd "D:\Kola Personal\Downloads\NetworkTrace_NextGen\frontend"
npm install
npm run dev
```

## CSV Upload Format

The CSV file must have source and target column headers.

Example:

source,target
A001,A002
A001,A003
A002,A003
B001,B002
B002,B003

Each row represents a relationship between two entities.

## Responsible Use

Network statistics describe relationships and graph structure. They do not establish identity, intent, criminality, or wrongdoing.

## Testing

The backend graph-engine test suite previously passed seven tests, and the frontend production build succeeded. Run the commands above to verify the current version.

## License

Add an appropriate license before distributing this project publicly.
