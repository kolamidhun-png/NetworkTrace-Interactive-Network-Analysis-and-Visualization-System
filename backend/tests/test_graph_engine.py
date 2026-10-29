
import pytest

from app.graph.engine import (
    analyze_graph,
    build_graph_from_csv,
    create_demo_graph,
)


def test_demo_graph_has_expected_counts():
    graph, entities = create_demo_graph()

    result = analyze_graph(graph, entities)

    assert result["node_count"] == 8
    assert result["edge_count"] == 8
    assert len(result["nodes"]) == 8
    assert len(result["edges"]) == 8
    assert len(result["communities"]) == 2


def test_analytics_fields_are_returned():
    graph, entities = create_demo_graph()

    result = analyze_graph(graph, entities)

    assert "analytics" in result
    assert "rankings" in result

    assert "degree_centrality" in result["rankings"]
    assert "betweenness_centrality" in result["rankings"]
    assert "closeness_centrality" in result["rankings"]

    assert result["analytics"]["connected_components"] == 2
    assert result["analytics"]["is_connected"] is False


def test_csv_upload_builds_correct_graph():
    content = (
        b"source,target\n"
        b"A001,A002\n"
        b"A001,A003\n"
        b"A002,A003\n"
        b"B001,B002\n"
        b"B002,B003\n"
    )

    graph, entities, stats = build_graph_from_csv(content)
    result = analyze_graph(graph, entities)

    assert result["node_count"] == 6
    assert result["edge_count"] == 5
    assert len(result["communities"]) == 2
    assert stats["valid_rows"] == 5
    assert stats["skipped_rows"] == 0


def test_duplicate_and_reversed_edges_are_deduplicated():
    content = (
        b"source,target\n"
        b"A001,A002\n"
        b"A001,A002\n"
        b"A002,A003\n"
        b"A003,A001\n"
    )

    graph, entities, stats = build_graph_from_csv(content)
    result = analyze_graph(graph, entities)

    assert result["node_count"] == 3
    assert result["edge_count"] == 3
    assert len(result["communities"]) == 1
    assert stats["duplicate_relationship_rows"] == 1


def test_invalid_csv_headers_are_rejected():
    content = (
        b"person,connection\n"
        b"A001,A002\n"
    )

    with pytest.raises(ValueError, match="Required columns are missing"):
        build_graph_from_csv(content)


def test_empty_csv_is_rejected():
    with pytest.raises(ValueError, match="empty"):
        build_graph_from_csv(b"")


def test_self_relationship_is_skipped():
    content = (
        b"source,target\n"
        b"A001,A001\n"
        b"A001,A002\n"
    )

    graph, entities, stats = build_graph_from_csv(content)
    result = analyze_graph(graph, entities)

    assert result["node_count"] == 2
    assert result["edge_count"] == 1
    assert stats["skipped_rows"] == 1
