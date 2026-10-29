
import { useCallback, useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Move,
} from "lucide-react";

const graphStyles = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      color: "#f8fafc",
      "font-size": 13,
      "font-weight": 600,
      "font-family": "Arial, sans-serif",
      "text-wrap": "wrap",
      "text-max-width": 110,
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 12,
      width: 48,
      height: 48,
      "background-color": "#38bdf8",
      "border-width": 2,
      "border-color": "#bae6fd",
      "overlay-opacity": 0,
      "z-index": 10,
    },
  },
  {
    selector: 'node[community = 0]',
    style: {
      "background-color": "#38bdf8",
      "border-color": "#bae6fd",
    },
  },
  {
    selector: 'node[community = 1]',
    style: {
      "background-color": "#a78bfa",
      "border-color": "#ddd6fe",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-width": 5,
      "border-color": "#fbbf24",
    },
  },
  {
    selector: "edge",
    style: {
      width: 2.5,
      "line-color": "#64748b",
      "curve-style": "bezier",
      opacity: 0.9,
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#64748b",
      "arrow-scale": 0.8,
    },
  },
];

const layoutOptions = {
  name: "cose",
  animate: false,
  fit: true,
  padding: 80,
  nodeRepulsion: 65000,
  idealEdgeLength: 160,
  edgeElasticity: 80,
  nodeOverlap: 15,
  componentSpacing: 120,
  gravity: 0.2,
  numIter: 1000,
  randomize: true,
};

export default function NetworkGraph({ data, onNodeSelect }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const onNodeSelectRef = useRef(onNodeSelect);

  useEffect(() => {
    onNodeSelectRef.current = onNodeSelect;
  }, [onNodeSelect]);

  const fitGraph = useCallback(() => {
    const cy = cyRef.current;

    if (!cy || cy.destroyed() || cy.nodes().length === 0) {
      return;
    }

    cy.resize();
    cy.fit(cy.elements(), 70);
    cy.center();
  }, []);

  const resetLayout = useCallback(() => {
    const cy = cyRef.current;

    if (!cy || cy.destroyed() || cy.nodes().length === 0) {
      return;
    }

    cy.layout(layoutOptions).run();
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const nodes = (data?.nodes ?? []).map((node) => ({
      group: "nodes",
      data: {
        id: String(node.id),
        label: String(node.label ?? node.id),
        community: Number(node.community ?? 0),
        degree: Number(node.degree ?? 0),
      },
    }));

    const nodeIds = new Set(nodes.map((node) => node.data.id));

    const edges = (data?.edges ?? [])
      .filter(
        (edge) =>
          nodeIds.has(String(edge.source)) &&
          nodeIds.has(String(edge.target))
      )
      .map((edge, index) => ({
        group: "edges",
        data: {
          id: `edge-${index}-${edge.source}-${edge.target}`,
          source: String(edge.source),
          target: String(edge.target),
        },
      }));

    const cy = cytoscape({
      container,
      elements: [...nodes, ...edges],
      style: graphStyles,
      minZoom: 0.1,
      maxZoom: 3,
      boxSelectionEnabled: false,
      layout: layoutOptions,
    });

    cyRef.current = cy;

    cy.on("tap", "node", (event) => {
      const node = event.target;

      onNodeSelectRef.current?.({
        id: node.id(),
        label: node.data("label"),
        community: node.data("community"),
        degree: node.degree(),
        neighbors: node.neighborhood("node").map((item) => item.id()),
      });
    });

    cy.ready(() => {
      requestAnimationFrame(() => {
        if (cy.destroyed()) return;
        cy.resize();

        if (cy.nodes().length > 0) {
          cy.fit(cy.elements(), 70);
          cy.center();
        }
      });
    });

    let frameId;

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
              if (cy.destroyed()) return;
              cy.resize();

              if (cy.nodes().length > 0) {
                cy.fit(cy.elements(), 70);
              }
            });
          })
        : null;

    observer?.observe(container);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frameId);

      if (!cy.destroyed()) {
        cy.destroy();
      }

      if (cyRef.current === cy) {
        cyRef.current = null;
      }
    };
  }, [data]);

  const zoomIn = () => {
    const cy = cyRef.current;
    if (!cy || cy.destroyed()) return;

    cy.zoom({
      level: Math.min(cy.zoom() * 1.25, cy.maxZoom()),
      renderedPosition: {
        x: cy.width() / 2,
        y: cy.height() / 2,
      },
    });
  };

  const zoomOut = () => {
    const cy = cyRef.current;
    if (!cy || cy.destroyed()) return;

    cy.zoom({
      level: Math.max(cy.zoom() / 1.25, cy.minZoom()),
      renderedPosition: {
        x: cy.width() / 2,
        y: cy.height() / 2,
      },
    });
  };

  return (
    <div className="network-graph-shell">
      <div
        className="graph-toolbar"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          width: "100%",
          minHeight: "54px",
          padding: "8px 4px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          <Move size={14} />
          <span>Scroll to zoom · Drag to pan · Click a node for details</span>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            type="button"
            className="graph-control-button"
            onClick={zoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            className="graph-control-button"
            onClick={zoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            className="graph-control-button"
            onClick={fitGraph}
            title="Fit graph"
          >
            <Maximize size={14} />
            <span>Fit</span>
          </button>

          <button
            type="button"
            className="graph-control-button"
            onClick={resetLayout}
            title="Reset graph layout"
          >
            <RotateCcw size={14} />
            <span>Reset layout</span>
          </button>
        </div>
      </div>

      <div
        className="network-graph-canvas"
        style={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          height: "850px",
          overflow: "hidden",
        }}
      >
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            background: "#101b2d",
          }}
        />
      </div>
    </div>
  );
}
