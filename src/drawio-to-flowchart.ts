import type { XmlNode } from "fsp-xml-parser";
import DiGraph from "graphology";

export const getGraphFromFlowchartTree = (tree: XmlNode[]) => {
  // Now we will through the tree and construct a graph
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
      flowchartGraph.addNode(id, { label: value });
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

    if (isEdge && source !== null && target !== null) {
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

    if (isEdgeLabel && edgeId !== undefined && value !== undefined) {
      const [source, target] = edges[edgeId];
      flowchartGraph.setEdgeAttribute(source, target, "label", value);
    }
  }

  // Iterate through nodes in the graph
  for (const node of flowchartGraph.nodes()) {
    const targets = Array.from(flowchartGraph.outNeighbors(node));

    const decisions: (string | undefined)[] = [];

    // Iterate through targets
    for (const target of targets) {
      const edgeAttributes = flowchartGraph.getEdgeAttributes(node, target);

      if (edgeAttributes && "label" in edgeAttributes) {
        decisions.push(edgeAttributes["label"]);
      } else {
        decisions.push(target);
      }
    }

    // Now you have 'value', 'targets', 'sources', and 'decisions' for the current node
    // const value = flowchartGraph.getNodeAttribute(node, 'label');
    // const sources = Array.from(flowchartGraph.inNeighbors(node));
    // console.log({ value, targets, sources, decisions });
  }

  return flowchartGraph;
};
