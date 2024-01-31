import type { XmlNode } from "fsp-xml-parser";
import DiGraph from "graphology";

export const getGraphFromFlowchartTree = (tree: XmlNode[]) => {
  // Now we will go through the tree and construct a graph
  const flowchartGraph = new DiGraph();

  // Dictionary to store edges temporarily
  const edges: { [id: string]: [string, string] } = {};

  // First, build nodes of the graph
  for (const element of tree) {
    const { id, source, target, value, style } = element.attributes || {};
    const isEdgeLabel = style && style.startsWith("edgeLabel");

    // Add vertex to graph
    if (
      !isEdgeLabel &&
      value !== undefined &&
      source === undefined &&
      target === undefined
    ) {
      flowchartGraph.addNode(id, { label: value, style });
    }
  }

  // Add edges to the graph
  for (const element of tree) {
    const { id, source, target, value, edge } = element.attributes || {};

    if (edge && source !== undefined && target !== undefined) {
      edges[id] = [source, target];
      if (value !== null) {
        flowchartGraph.addEdge(source, target, { label: value });
      } else {
        flowchartGraph.addEdge(source, target);
      }
    }
  }

  // Add edge labels to the graph
  for (const element of tree) {
    const { parent: edgeId, value, style } = element.attributes || {};
    const isEdgeLabel = style && style.startsWith("edgeLabel");

    if (
      isEdgeLabel &&
      edgeId !== undefined &&
      value !== undefined &&
      edgeId in edges
    ) {
      const [source, target] = edges[edgeId];
      flowchartGraph.setEdgeAttribute(source, target, "label", value);
    }
  }

  return flowchartGraph;
};
