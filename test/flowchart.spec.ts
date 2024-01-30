import fs from "fs/promises";
import path from "path";
import { describe, test, expect, mock } from "bun:test";
import { parse, type XmlNode } from "fsp-xml-parser";
import { getXMLContents } from "../src/xml-parser";
import { getGraphFromFlowchartTree } from "../src/drawio-to-flowchart";
import type { DirectedGraph } from "graphology";

const FILE_PATH = "./public/assets/ZARK.drawio.xml";

const readXMLFile = mock(async (filePath: string) => {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    return fileContent;
  } catch (error) {
    console.error("There was a problem reading the file:", error);
    throw error;
  }
});

describe("zark tree declaration", () => {
  test("should exist", async () => {
    const file = await readXMLFile(FILE_PATH);
    expect(file).toBeDefined;
  });

  test("should parse just fine", async () => {
    const file = await readXMLFile(FILE_PATH);
    const parsed = parse(file);
    expect(parsed.root).toBeDefined();

    const zarkTree = parsed.root?.children![0].children![0].children![0].children;
    expect(zarkTree).toBeDefined();
  });
});

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
    graph.forEachNode((_, attributes) => {
      expect(attributes.label).toBeDefined();
      expect(attributes.label).toBeString();
      expect(attributes.label?.length).toBeTruthy();
    })
  });
});
