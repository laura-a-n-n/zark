
import { describe, test, expect } from "bun:test";
import parse, { type XmlNode } from "fsp-xml-parser";
import type { DirectedGraph } from "graphology";
import { getGraphFromFlowchartTree } from "../src/drawio-to-flowchart";
import { readXMLFile, FILE_PATH } from "./test-utils";

describe("zark graph", async () => {
    const file = await readXMLFile(FILE_PATH);
    const parsed = parse(file);
    let zarkTree: XmlNode[] | undefined;
    let graph: DirectedGraph;
    try {
      zarkTree = parsed.root?.children![0].children![0].children![0].children;
    } catch {
      zarkTree = undefined;
    }
  
    test("should be graphy", () => {
      expect(zarkTree).toBeTruthy();
      if (!zarkTree) {
        return;
      }
      graph = getGraphFromFlowchartTree(zarkTree);
      expect(graph).toBeDefined();
    });
  
    if (!zarkTree) {
      return;
    }
  
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
        expect(attributes.label?.length).toBeTruthy();
      });
    });
  
    test("should have edge labels where needed", () => {
      let needsLabelCount = 0;
      let hasLabelCount = 0;
  
      graph.forEachNode((node: string) => {
        let hasUndefinedLabel = false;
        let needsLabel = false;
  
        const labels: string[] = [];
        graph.forEachOutboundEdge(node, (edge: string) => {
          const label = graph.getEdgeAttribute(edge, "label");
          labels.push(label);
          hasUndefinedLabel = hasUndefinedLabel || !label;
          needsLabel = needsLabel || !!label;
        });
  
        if (needsLabel) {
          needsLabelCount += 1;
        }
        if (needsLabel && !hasUndefinedLabel) {
          hasLabelCount += 1;
        } else if (needsLabel) {
          console.log("Erroneous decision labels found:");
          console.log(labels);
        }
      });
  
      expect(needsLabelCount).toEqual(hasLabelCount);
    });
  });