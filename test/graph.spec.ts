import { describe, test, expect, beforeAll } from "bun:test";
import parse, { type XmlNode } from "fsp-xml-parser";
import type { DirectedGraph } from "graphology";
import { getGraphFromFlowchartTree } from "../src/drawio-to-flowchart";
import { readXMLFile, FILE_PATH } from "./test-utils";

describe("zark graph", () => {
  let zarkTree: XmlNode[] | undefined;
  let graph: DirectedGraph;

  beforeAll(async () => {
    const file = await readXMLFile(FILE_PATH);
    const parsed = parse(file);
    try {
      zarkTree =
        parsed.root?.children?.[0]?.children?.[0]?.children?.[0]?.children;
    } catch {
      zarkTree = undefined;
    }
  });

  test("should be graphy", () => {
    expect(zarkTree).toBeTruthy();
    if (!zarkTree) {
      return;
    }
    graph = getGraphFromFlowchartTree(zarkTree);
    expect(graph).toBeDefined();
  });

  test("should be sexy", () => {
    expect(true).toBe(true);
  });

  test("should have a label for every node", () => {
    graph.forEachNode((node, attributes) => {
      if (!attributes.label) {
        console.log(`Node ${node} is without label.`);
      }
      expect(attributes.label).toBeDefined();
      expect(attributes.label).toBeString();
      expect(attributes.label.length).toBeGreaterThan(0);
    });
  });

  test("should have edge labels where needed", () => {
    let needsLabelCount = 0;
    let hasLabelCount = 0;

    graph.forEachNode((node: string) => {
      const labels: string[] = [];
      graph.forEachOutboundEdge(node, (edge: string) => {
        const label = graph.getEdgeAttribute(edge, "label");
        labels.push(label || "");
      });

      const needsLabel = labels.some((label) => !!label);
      const hasUndefinedLabel = labels.some((label) => label === "");

      if (needsLabel) {
        needsLabelCount++;
      }
      if (needsLabel && !hasUndefinedLabel) {
        hasLabelCount++;
      } else if (needsLabel) {
        console.log("Erroneous decision labels found:");
        console.log(labels);
      }
    });

    expect(needsLabelCount).toEqual(hasLabelCount);
  });
});
