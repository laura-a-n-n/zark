import type { XmlNode } from "fsp-xml-parser";
import DiGraph from "graphology";

export const getGraphFromFlowchartTree = (tree: XmlNode[]) => {
  // Now we will go through the tree and construct a graph
  const flowchartGraph = new DiGraph();

  // Dictionary to store edges temporarily
  const edges: { [id: string]: [string, string] } = {};

  // First, build nodes of the graph
  for (const element of tree) {
    if (!element.attributes) {
      // We don't care about elements that don't have any attributes.
      // This is mostly to silence the type error.
      continue;
    }

    const id = element.attributes.id;
    const source = element.attributes.source;
    const target = element.attributes.target;
    const value = element.attributes.value;
    const style = element.attributes.style;
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
    if (!element.attributes) {
      continue;
    }

    const id = element.attributes.id;
    const source = element.attributes.source;
    const target = element.attributes.target;
    const value = element.attributes.value;
    const isEdge = element.attributes.edge;

    if (isEdge && source !== undefined && target !== undefined) {
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
    if (!element.attributes) {
      continue;
    }

    const edgeId = element.attributes.parent;
    const value = element.attributes.value;
    const style = element.attributes.style;
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
