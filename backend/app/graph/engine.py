
import csv
import io
import networkx as nx


MAX_ENTITY_ID_LENGTH = 150
MAX_UNIQUE_RELATIONSHIPS = 10_000


def create_demo_graph():
    """Create a fictional demonstration network."""
    graph = nx.Graph()

    entities = {
        "P001": "Alex",
        "P002": "Jordan",
        "P003": "Taylor",
        "P004": "Morgan",
        "P005": "Casey",
        "P006": "Riley",
        "P007": "Avery",
        "P008": "Sam",
    }

    graph.add_nodes_from(entities.keys())

    graph.add_edges_from([
        ("P001", "P002"),
        ("P001", "P003"),
        ("P002", "P003"),
        ("P003", "P004"),
        ("P005", "P006"),
        ("P005", "P007"),
        ("P006", "P007"),
        ("P007", "P008"),
    ])

    return graph, entities


def build_graph_from_csv(file_content: bytes):
    """Build an undirected graph from a source,target CSV file."""
    if not file_content:
        raise ValueError("The uploaded CSV file is empty.")

    try:
        content = file_content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError(
            "The CSV must use UTF-8 text encoding."
        ) from exc

    try:
        reader = csv.DictReader(io.StringIO(content))
        fieldnames = reader.fieldnames
    except csv.Error as exc:
        raise ValueError("The CSV file could not be parsed.") from exc

    if not fieldnames:
        raise ValueError(
            "The CSV must contain source and target headers."
        )

    headers = {
        header.strip().lower(): header
        for header in fieldnames
        if header and header.strip()
    }

    if "source" not in headers or "target" not in headers:
        raise ValueError(
            "Required columns are missing. Use the headers: source,target"
        )

    graph = nx.Graph()
    entities = {}
    valid_rows = 0
    skipped_rows = 0

    try:
        for row_number, row in enumerate(reader, start=2):
            source_value = row.get(headers["source"])
            target_value = row.get(headers["target"])

            source = str(source_value or "").strip()
            target = str(target_value or "").strip()

            if not source or not target:
                skipped_rows += 1
                continue

            if (
                len(source) > MAX_ENTITY_ID_LENGTH
                or len(target) > MAX_ENTITY_ID_LENGTH
            ):
                raise ValueError(
                    f"Row {row_number}: entity IDs must be "
                    f"{MAX_ENTITY_ID_LENGTH} characters or fewer."
                )

            if source == target:
                skipped_rows += 1
                continue

            graph.add_edge(source, target)

            entities[source] = source
            entities[target] = target
            valid_rows += 1

            if graph.number_of_edges() > MAX_UNIQUE_RELATIONSHIPS:
                raise ValueError(
                    "The CSV exceeds the limit of 10,000 unique relationships."
                )

    except csv.Error as exc:
        raise ValueError(
            "The CSV contains malformed data."
        ) from exc

    if valid_rows == 0 or graph.number_of_nodes() < 2:
        raise ValueError(
            "No valid relationships were found. Include at least one "
            "connection between two different entities."
        )

    return graph, entities, {
        "valid_rows": valid_rows,
        "skipped_rows": skipped_rows,
        "unique_entities": graph.number_of_nodes(),
        "unique_relationships": graph.number_of_edges(),
        "duplicate_relationship_rows": (
            valid_rows - graph.number_of_edges()
        ),
    }


def analyze_graph(graph: nx.Graph, entities=None):
    """Calculate graph statistics, centrality and community metrics."""
    entities = entities or {}

    if graph.number_of_nodes() == 0:
        raise ValueError("The graph contains no entities.")

    node_count = graph.number_of_nodes()
    edge_count = graph.number_of_edges()

    # Detect communities deterministically for reproducible results.
    if edge_count == 0:
        detected_communities = [
            {node} for node in graph.nodes()
        ]
    else:
        detected_communities = nx.community.louvain_communities(
            graph,
            seed=42,
        )

    detected_communities.sort(
        key=lambda group: min(str(node) for node in group)
    )

    community_lookup = {}

    for community_id, members in enumerate(detected_communities):
        for member in members:
            community_lookup[member] = community_id

    # Centrality scores describe structural positions, not intent or behavior.
    degree_centrality = nx.degree_centrality(graph)
    betweenness_centrality = nx.betweenness_centrality(
        graph,
        normalized=True,
    )
    closeness_centrality = nx.closeness_centrality(graph)

    nodes = []

    for node in sorted(graph.nodes(), key=str):
        nodes.append({
            "id": str(node),
            "label": entities.get(node, str(node)),
            "community": community_lookup[node],
            "degree": int(graph.degree(node)),
            "degree_centrality": round(
                float(degree_centrality[node]), 6
            ),
            "betweenness_centrality": round(
                float(betweenness_centrality[node]), 6
            ),
            "closeness_centrality": round(
                float(closeness_centrality[node]), 6
            ),
        })

    edges = [
        {
            "source": str(source),
            "target": str(target),
        }
        for source, target in sorted(
            graph.edges(),
            key=lambda edge: (
                str(edge[0]),
                str(edge[1]),
            ),
        )
    ]

    # Calculate statistics for each detected community.
    community_results = []

    for community_id, members in enumerate(detected_communities):
        sorted_members = sorted(members, key=str)
        subgraph = graph.subgraph(members)

        internal_edges = subgraph.number_of_edges()
        size = len(members)

        community_results.append({
            "community_id": community_id,
            "members": [
                {
                    "id": str(member),
                    "label": entities.get(member, str(member)),
                }
                for member in sorted_members
            ],
            "size": size,
            "internal_edges": internal_edges,
            "density": round(
                float(nx.density(subgraph)), 4
            ),
            "average_degree": round(
                (
                    sum(graph.degree(member) for member in members)
                    / size
                ),
                4,
            ) if size else 0.0,
        })

    # Rank entities independently by each centrality measure.
    def top_entities(metric, limit=10):
        ranked = sorted(
            nodes,
            key=lambda node: (
                -node[metric],
                -node["degree"],
                node["id"],
            ),
        )

        return [
            {
                "id": node["id"],
                "label": node["label"],
                "community": node["community"],
                "degree": node["degree"],
                "score": node[metric],
            }
            for node in ranked[:limit]
        ]

    components = list(nx.connected_components(graph))

    average_degree = (
        (2 * edge_count / node_count)
        if node_count
        else 0.0
    )

    average_clustering = (
        nx.average_clustering(graph)
        if node_count > 1
        else 0.0
    )

    return {
        # Preserve the existing response fields.
        "node_count": node_count,
        "edge_count": edge_count,
        "density": round(float(nx.density(graph)), 4),
        "communities": community_results,
        "nodes": nodes,
        "edges": edges,

        # Additional analytics for future frontend panels.
        "analytics": {
            "average_degree": round(average_degree, 4),
            "average_clustering": round(
                float(average_clustering), 4
            ),
            "connected_components": len(components),
            "is_connected": len(components) == 1,
            "largest_component_size": max(
                (len(component) for component in components),
                default=0,
            ),
            "average_shortest_path_length": (
                round(
                    float(nx.average_shortest_path_length(graph)),
                    4,
                )
                if node_count > 1 and nx.is_connected(graph)
                else None
            ),
        },
        "rankings": {
            "degree_centrality": top_entities(
                "degree_centrality"
            ),
            "betweenness_centrality": top_entities(
                "betweenness_centrality"
            ),
            "closeness_centrality": top_entities(
                "closeness_centrality"
            ),
        },
    }
