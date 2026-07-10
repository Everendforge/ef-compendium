import { useEffect, useMemo, useRef } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import type { SiteData } from "../types";
import type { ReaderNavigation } from "./Reader";

type GraphNode = SimulationNodeDatum & {
  id: string;
  name: string;
  type: string;
  route: string;
  degree: number;
};

type GraphLink = SimulationLinkDatum<GraphNode> & {
  kind: "wikilink" | "story";
};

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function typeColor(type: string, palette: string[]) {
  let hash = 0;
  for (const char of type) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export function buildGraph(site: SiteData) {
  const nodes: GraphNode[] = site.entities.map((entity) => ({
    id: entity.id,
    name: entity.name,
    type: entity.type,
    route: entity.route,
    degree: 0,
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const seen = new Set<string>();
  const links: GraphLink[] = [];

  const addLink = (source: string, target: string, kind: GraphLink["kind"]) => {
    if (source === target) return;
    const key = [kind, ...[source, target].sort()].join("|");
    if (seen.has(key)) return;
    if (!byId.has(source) || !byId.has(target)) return;
    seen.add(key);
    links.push({ source, target, kind });
    byId.get(source)!.degree += 1;
    byId.get(target)!.degree += 1;
  };

  for (const entity of site.entities) {
    for (const linked of entity.linkedIds) addLink(entity.id, linked, "wikilink");
  }
  for (const story of site.stories) {
    for (const sequence of story.sequences) {
      for (const event of sequence.events) {
        for (let i = 0; i < event.canonRefs.length; i += 1) {
          for (let j = i + 1; j < event.canonRefs.length; j += 1) {
            addLink(event.canonRefs[i], event.canonRefs[j], "story");
          }
        }
      }
    }
  }
  return { nodes, links };
}

export function GraphView({
  site,
  navigate,
}: {
  site: SiteData;
  navigate: ReaderNavigation;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graph = useMemo(() => buildGraph(site), [site]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const transform = { x: 0, y: 0, k: 1 };
    let hovered: GraphNode | undefined;
    let dragging = false;
    let lastPointer = { x: 0, y: 0 };
    let moved = false;

    const accent = cssVar("--cp-accent", "#C89B3C");
    const graphPalette = [
      accent,
      cssVar("--cp-link", accent),
      cssVar("--cp-warning", accent),
      cssVar("--cp-danger", accent),
      cssVar("--cp-muted", accent),
    ];
    const textColor = cssVar("--cp-text", "#f7f2e8");
    const mutedColor = cssVar("--cp-muted", "#8fa4b3");
    const surface = cssVar("--cp-bg", "#03121d");

    const { nodes, links } = graph;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * devicePixelRatio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      render();
    };

    const radius = (node: GraphNode) => 5 + Math.min(9, node.degree * 1.4);

    function render() {
      if (!context || !canvas) return;
      context.save();
      context.scale(devicePixelRatio, devicePixelRatio);
      const width = canvas.width / devicePixelRatio;
      const height = canvas.height / devicePixelRatio;
      context.fillStyle = surface;
      context.fillRect(0, 0, width, height);
      context.translate(width / 2 + transform.x, height / 2 + transform.y);
      context.scale(transform.k, transform.k);

      for (const link of links) {
        const source = link.source as GraphNode;
        const target = link.target as GraphNode;
        if (source.x === undefined || target.x === undefined) continue;
        context.beginPath();
        context.moveTo(source.x, source.y!);
        context.lineTo(target.x, target.y!);
        context.strokeStyle =
          link.kind === "story" ? `${accent}55` : `${mutedColor}44`;
        context.lineWidth = link.kind === "story" ? 1.4 : 1;
        if (link.kind === "story") context.setLineDash([4, 3]);
        context.stroke();
        context.setLineDash([]);
      }

      for (const node of nodes) {
        if (node.x === undefined || node.y === undefined) continue;
        context.beginPath();
        context.arc(node.x, node.y, radius(node), 0, Math.PI * 2);
        context.fillStyle = typeColor(node.type, graphPalette);
        context.globalAlpha = hovered && hovered !== node ? 0.55 : 1;
        context.fill();
        context.globalAlpha = 1;
        if (hovered === node) {
          context.strokeStyle = textColor;
          context.lineWidth = 1.6;
          context.stroke();
        }
        if (transform.k > 0.7 || hovered === node) {
          context.fillStyle = hovered === node ? textColor : mutedColor;
          context.font = "11px Georgia, serif";
          context.textAlign = "center";
          context.fillText(node.name, node.x, node.y + radius(node) + 12);
        }
      }
      context.restore();
    }

    const simulation: Simulation<GraphNode, GraphLink> = forceSimulation(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((node) => node.id)
          .distance(70)
          .strength(0.5),
      )
      .force("charge", forceManyBody().strength(-160))
      .force("x", forceX(0).strength(0.06))
      .force("y", forceY(0).strength(0.06))
      .force(
        "collide",
        forceCollide<GraphNode>().radius((node) => radius(node) + 4),
      )
      .on("tick", render);

    function pointerToGraph(event: PointerEvent | WheelEvent) {
      const rect = canvas!.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const x = (event.clientX - rect.left - width / 2 - transform.x) / transform.k;
      const y = (event.clientY - rect.top - height / 2 - transform.y) / transform.k;
      return { x, y };
    }

    function nodeAt(point: { x: number; y: number }) {
      let found: GraphNode | undefined;
      for (const node of nodes) {
        if (node.x === undefined || node.y === undefined) continue;
        const distance = Math.hypot(node.x - point.x, node.y - point.y);
        if (distance <= radius(node) + 3) found = node;
      }
      return found;
    }

    function handlePointerDown(event: PointerEvent) {
      dragging = true;
      moved = false;
      lastPointer = { x: event.clientX, y: event.clientY };
      canvas!.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent) {
      if (dragging) {
        const dx = event.clientX - lastPointer.x;
        const dy = event.clientY - lastPointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        transform.x += dx;
        transform.y += dy;
        lastPointer = { x: event.clientX, y: event.clientY };
        render();
        return;
      }
      const next = nodeAt(pointerToGraph(event));
      if (next !== hovered) {
        hovered = next;
        canvas!.style.cursor = hovered ? "pointer" : "grab";
        render();
      }
    }

    function handlePointerUp(event: PointerEvent) {
      dragging = false;
      canvas!.releasePointerCapture(event.pointerId);
      if (moved) return;
      const clicked = nodeAt(pointerToGraph(event));
      if (clicked) navigate(clicked.route);
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 0.89;
      transform.k = Math.min(4, Math.max(0.25, transform.k * factor));
      render();
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => {
      simulation.stop();
      observer.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [graph, navigate]);

  if (graph.nodes.length === 0) {
    return (
      <section className="page-title">
        <p className="chapter">Graph</p>
        <h1>No published entities to graph yet.</h1>
      </section>
    );
  }

  return (
    <div className="graph-view" ref={containerRef}>
      <canvas ref={canvasRef} aria-label="Relationship graph" />
      <div className="graph-legend">
        <span>
          <i className="legend-line solid" /> Wikilink
        </span>
        <span>
          <i className="legend-line dashed" /> Shared scene
        </span>
      </div>
    </div>
  );
}
