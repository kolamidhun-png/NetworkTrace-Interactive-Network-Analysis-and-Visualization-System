
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Network,
  Users,
  GitBranch,
  RefreshCw,
  AlertCircle,
  X,
  Search,
  UserRound,
  Link2,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Gauge,
} from "lucide-react";

import NetworkGraph from "./features/network-explorer/NetworkGraph";
import {
  getDemoGraph,
  getHealth,
  uploadGraphCsv,
} from "./services/api";
import "./App.css";

export default function App() {
  const [graph, setGraph] = useState(null);
  const [status, setStatus] = useState("Connecting");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    setError("");
    setNotice("");
    setIsRefreshing(true);

    try {
      const health = await getHealth();

      if (health.status !== "healthy") {
        throw new Error("Backend health check failed.");
      }

      const graphData = await getDemoGraph();

      setGraph(graphData);
      setStatus("Connected");
      setSelectedNode(null);
      setSearchQuery("");
      setSelectedCommunity("all");
    } catch (err) {
      setStatus("Disconnected");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    // Allow the same file to be selected again later.
    event.target.value = "";

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Choose a CSV file with source and target columns.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The file exceeds the 5 MB upload limit.");
      return;
    }

    setError("");
    setNotice("");
    setIsUploading(true);

    try {
      const result = await uploadGraphCsv(file);

      setGraph(result);
      setSelectedNode(null);
      setSearchQuery("");
      setSelectedCommunity("all");
      setNotice(
        `Analyzed ${result.upload.filename}: ${result.node_count} entities, ` +
        `${result.edge_count} relationships, and ` +
        `${result.communities.length} communities.`
      );
      setStatus("Connected");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this CSV file."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const communities = graph?.communities ?? [];

  const filteredNodes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return nodes.filter((node) => {
      const matchesSearch =
        !query ||
        String(node.label ?? "").toLowerCase().includes(query) ||
        String(node.id ?? "").toLowerCase().includes(query);

      const matchesCommunity =
        selectedCommunity === "all" ||
        String(node.community) === selectedCommunity;

      return matchesSearch && matchesCommunity;
    });
  }, [nodes, searchQuery, selectedCommunity]);

  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes]
  );

  const filteredGraph = useMemo(
    () => ({
      ...graph,
      nodes: filteredNodes,
      edges: edges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target)
      ),
    }),
    [graph, filteredNodes, edges, visibleNodeIds]
  );

  const selectedNeighbors = useMemo(() => {
    if (!selectedNode) return [];

    const neighborIds = edges
      .filter(
        (edge) =>
          edge.source === selectedNode.id ||
          edge.target === selectedNode.id
      )
      .map((edge) =>
        edge.source === selectedNode.id ? edge.target : edge.source
      );

    return nodes.filter((node) => neighborIds.includes(node.id));
  }, [selectedNode, nodes, edges]);

  const density = Number(graph?.density ?? 0);
  const analytics = graph?.analytics ?? {};
  const rankings = graph?.rankings ?? {};

  const selectEntity = (node) => {
    setSelectedNode(node);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Network size={23} />
          </div>
          <div className="brand-copy">
            <h1>NetworkTrace</h1>
            <p>Network Intelligence Platform</p>
          </div>
        </div>

        <div className="topbar-actions">
          <div className={`connection-status ${status.toLowerCase()}`}>
            <span className="status-dot" />
            {status}
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadDashboard}
            disabled={isRefreshing || isUploading}
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "spin" : ""}
            />
            Refresh demo
          </button>
        </div>
      </header>

      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <Activity size={15} />
            GRAPH ANALYTICS WORKSPACE
          </div>
          <h2>Network Explorer</h2>
          <p>
            Import relationship data, explore graph communities, and
            inspect connections between entities.
          </p>
        </div>

        <div className="demo-label">
          <ShieldCheck size={16} />
          Structural analysis only
        </div>
      </section>

      <section
        style={{
          background: "#111c2e",
          border: "1px solid #293b54",
          borderRadius: 14,
          padding: 20,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: "1 1 240px" }}>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                margin: "0 0 8px",
                color: "#f1f5f9",
                fontSize: 16,
              }}
            >
              <FileSpreadsheet size={19} />
              Import relationships
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Upload a CSV containing <code>source</code> and{" "}
              <code>target</code> columns. Maximum file size: 5 MB.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRefreshing}
          >
            {isUploading ? (
              <RefreshCw size={17} className="spin" />
            ) : (
              <Upload size={17} />
            )}
            {isUploading ? "Analyzing CSV..." : "Upload CSV"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleUpload}
            disabled={isUploading || isRefreshing}
            style={{ display: "none" }}
          />
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 9,
            background: "#0b1220",
            color: "#94a3b8",
            fontSize: 12,
            overflowX: "auto",
          }}
        >
          <strong style={{ color: "#cbd5e1" }}>Example CSV</strong>
          <pre style={{ margin: "8px 0 0", lineHeight: 1.8 }}>
{`source,target
P001,P002
P001,P003
P002,P003
P004,P005`}
          </pre>
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={18} />
          <div style={{ flex: 1 }}>
            <strong>Unable to complete request</strong>
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            background: "#102b25",
            border: "1px solid #226653",
            color: "#a7f3d0",
            padding: 14,
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          <ShieldCheck size={16} style={{ verticalAlign: "middle" }} />{" "}
          {notice}
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<Users size={19} />}
          label="Total Entities"
          value={graph?.node_count ?? 0}
          detail="Unique network nodes"
        />
        <StatCard
          icon={<GitBranch size={19} />}
          label="Relationships"
          value={graph?.edge_count ?? 0}
          detail="Unique connections"
        />
        <StatCard
          icon={<Network size={19} />}
          label="Communities"
          value={communities.length}
          detail="Detected graph groups"
        />
        <StatCard
          icon={<Activity size={19} />}
          label="Network Density"
          value={`${(density * 100).toFixed(1)}%`}
          detail="Graph connectivity measure"
        />
      </section>

      {graph && (
        <section
          className="panel analytics-panel"
          style={{ marginBottom: 22, padding: 20 }}
        >
          <div className="panel-heading">
            <div>
              <h3>
                <BarChart3 size={18} />
                Advanced Graph Analytics
              </h3>
              <p>Structural metrics calculated from the current network.</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
              marginTop: 16,
            }}
          >
            <AnalyticsMetric
              icon={<Gauge size={17} />}
              label="Average degree"
              value={analytics.average_degree ?? "—"}
              detail="Connections per entity"
            />
            <AnalyticsMetric
              icon={<Activity size={17} />}
              label="Average clustering"
              value={formatPercent(analytics.average_clustering)}
              detail="Local connection density"
            />
            <AnalyticsMetric
              icon={<Network size={17} />}
              label="Connected components"
              value={analytics.connected_components ?? "—"}
              detail={analytics.is_connected === true ? "Network is connected" : analytics.is_connected === false ? "Network has separate components" : "Connectivity status"}
            />
            <AnalyticsMetric
              icon={<Users size={17} />}
              label="Largest component"
              value={analytics.largest_component_size ?? "—"}
              detail="Entities in largest component"
            />
            <AnalyticsMetric
              icon={<GitBranch size={17} />}
              label="Average path length"
              value={analytics.average_shortest_path_length ?? "N/A"}
              detail="Connected networks only"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            <RankingCard
              title="Top Degree Centrality"
              description="Entities with the most direct connections"
              icon={<TrendingUp size={16} />}
              items={rankings.degree_centrality}
            />
            <RankingCard
              title="Top Betweenness Centrality"
              description="Entities positioned on more shortest paths"
              icon={<GitBranch size={16} />}
              items={rankings.betweenness_centrality}
            />
            <RankingCard
              title="Top Closeness Centrality"
              description="Entities close to others by path distance"
              icon={<Network size={16} />}
              items={rankings.closeness_centrality}
            />
          </div>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: "16px 0 0" }}>
            Centrality and community metrics describe the structure of this graph. They do not establish intent, misconduct, or criminal activity.
          </p>
        </section>
      )}

      <section className="content-grid">
        <div className="panel graph-panel">
          <div className="panel-heading">
            <div>
              <h3>
                <Network size={18} />
                Relationship Graph
              </h3>
              <p>Select a node to inspect its connections.</p>
            </div>
            <span className="panel-count">
              {filteredNodes.length} of {nodes.length} entities
            </span>
          </div>

          <div className="network-controls">
            <label className="search-control">
              <Search size={17} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search entity name or ID..."
                aria-label="Search entity"
              />
            </label>

            <select
              value={selectedCommunity}
              onChange={(event) =>
                setSelectedCommunity(event.target.value)
              }
              aria-label="Filter by community"
            >
              <option value="all">All communities</option>
              {communities.map((community) => (
                <option
                  key={community.community_id}
                  value={String(community.community_id)}
                >
                  Community {community.community_id + 1}
                </option>
              ))}
            </select>

            {(searchQuery || selectedCommunity !== "all") && (
              <button
                type="button"
                className="refresh-button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCommunity("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="graph-legend">
            {communities.map((community) => (
              <div className="legend-item" key={community.community_id}>
                <span
                  className={`legend-dot community-color-${community.community_id % 2}`}
                />
                Community {community.community_id + 1}
              </div>
            ))}
            <div className="legend-note">
              <span className="legend-line" />
              Relationship
            </div>
          </div>

          {graph ? (
            filteredNodes.length ? (
              <NetworkGraph
                data={filteredGraph}
                onNodeSelect={selectEntity}
              />
            ) : (
              <div className="loading-state">
                <Search size={24} />
                <p>No entities match these filters.</p>
              </div>
            )
          ) : (
            <div className="loading-state">
              <RefreshCw size={24} className="spin" />
              <p>Loading network...</p>
            </div>
          )}

          <p
            style={{
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: 1.6,
              marginTop: 14,
            }}
          >
            Community membership describes graph structure only. It is
            not proof of criminal activity or wrongdoing.
          </p>
        </div>

        <div className="panel community-panel">
          <div className="panel-heading">
            <div>
              <h3>
                <Users size={18} />
                Detected Communities
              </h3>
              <p>Groups found in the network.</p>
            </div>
          </div>

          <div className="community-list">
            {communities.map((community) => {
              const members = nodes.filter(
                (node) => node.community === community.community_id
              );

              const active =
                selectedCommunity === String(community.community_id);

              return (
                <div
                  className="community-card"
                  key={community.community_id}
                >
                  <div className="community-card-heading">
                    <div className="community-title">
                      <span
                        className={`community-icon community-color-${community.community_id % 2}`}
                      >
                        <Users size={17} />
                      </span>
                      <div>
                        <h4>Community {community.community_id + 1}</h4>
                        <p>
                          {community.size}{" "}
                          {community.size === 1 ? "entity" : "entities"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setSelectedCommunity(active
                          ? "all"
                          : String(community.community_id))
                      }
                    >
                      {active ? "Show all" : "Explore"}
                    </button>
                  </div>

                  <div className="member-list">
                    {members.map((member) => (
                      <button
                        type="button"
                        className="member-chip"
                        key={member.id}
                        onClick={() => setSelectedNode(member)}
                      >
                        <span className="member-status" />
                        {member.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {!communities.length && (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                Community results will appear after analysis.
              </p>
            )}
          </div>
        </div>
      </section>

      {selectedNode && (
        <section className="panel entity-details">
          <div className="panel-heading">
            <div>
              <h3>
                <UserRound size={19} />
                Entity Details
              </h3>
              <p>Entity information and observed connections.</p>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setSelectedNode(null)}
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="entity-summary">
            <div className="entity-avatar">
              <UserRound size={25} />
            </div>
            <div className="entity-primary">
              <h4>{selectedNode.label}</h4>
              <p>{selectedNode.id}</p>
            </div>
            <div className="entity-metric">
              <span>Community</span>
              <strong>{Number(selectedNode.community) + 1}</strong>
            </div>
            <div className="entity-metric">
              <span>Connections</span>
              <strong>{selectedNode.degree ?? selectedNeighbors.length}</strong>
            </div>
          </div>

          <div className="neighbor-section">
            <h4>
              <Link2 size={16} />
              Connected entities ({selectedNeighbors.length})
            </h4>

            <div className="neighbor-list">
              {selectedNeighbors.map((neighbor) => (
                <button
                  type="button"
                  className="neighbor-chip"
                  key={neighbor.id}
                  onClick={() => setSelectedNode(neighbor)}
                >
                  <UserRound size={14} />
                  {neighbor.label}
                  <span>{neighbor.id}</span>
                </button>
              ))}

              {!selectedNeighbors.length && (
                <p className="muted-text">
                  No connected entities found.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <span>NetworkTrace</span>
        <span>Graph analytics · Uploaded data or fictional demo</span>
      </footer>
    </main>
  );
}

function StatCard({ icon, label, value, detail }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}


function formatPercent(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "N/A";
  }
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function AnalyticsMetric({ icon, label, value, detail }) {
  return (
    <article
      style={{
        background: "#0b1220",
        border: "1px solid #293b54",
        borderRadius: 10,
        padding: 14,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7dd3fc", fontSize: 12 }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ color: "#f8fafc", fontSize: 23, fontWeight: 700, marginTop: 10, overflowWrap: "anywhere" }}>
        {value}
      </div>
      <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.5, margin: "5px 0 0" }}>
        {detail}
      </p>
    </article>
  );
}

function RankingCard({ title, description, icon, items = [] }) {
  return (
    <article
      style={{
        background: "#0b1220",
        border: "1px solid #293b54",
        borderRadius: 10,
        padding: 14,
        minWidth: 0,
      }}
    >
      <h4 style={{ display: "flex", alignItems: "center", gap: 8, color: "#e2e8f0", fontSize: 13, margin: "0 0 5px" }}>
        <span style={{ color: "#7dd3fc" }}>{icon}</span>
        {title}
      </h4>
      <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.5, margin: "0 0 12px" }}>{description}</p>
      {items.length ? (
        <div style={{ display: "grid", gap: 8 }}>
          {items.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              style={{ display: "grid", gridTemplateColumns: "22px minmax(0, 1fr) auto", alignItems: "center", gap: 8, fontSize: 12 }}
            >
              <span style={{ color: "#64748b" }}>{index + 1}.</span>
              <span style={{ color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${item.label} (${item.id})`}>
                {item.label}
              </span>
              <span style={{ color: "#7dd3fc", fontVariantNumeric: "tabular-nums" }}>
                {formatPercent(item.score)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>Analytics rankings are not available for this response.</p>
      )}
    </article>
  );
}
