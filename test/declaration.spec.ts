import fs from "fs/promises";
import path from "path";
import { describe, test, expect, mock } from "bun:test";
import { parse, type XmlNode } from "fsp-xml-parser";
import { getGraphFromFlowchartTree } from "../src/drawio-to-flowchart";
import type { DirectedGraph } from "graphology";
import { FILE_PATH, readXMLFile } from "./test-utils";

describe("zark tree declaration", () => {
  test("should exist", async () => {
    const file = await readXMLFile(FILE_PATH);
    expect(file).toBeDefined;
  });

  test("should parse just fine", async () => {
    const file = await readXMLFile(FILE_PATH);
    const parsed = parse(file);
    expect(parsed.root).toBeDefined();

    const zarkTree =
      parsed.root?.children![0].children![0].children![0].children;
    expect(zarkTree).toBeDefined();
  });

  test("should have valid edges", async () => {
    const file = await readXMLFile(FILE_PATH);
    const parsed = parse(file);
    expect(parsed.root).toBeDefined();

    const zarkTree =
      parsed.root?.children![0].children![0].children![0].children;
    expect(zarkTree).toBeDefined();

    if (!zarkTree) {
      return;
    }

    let edgesCount = 0;
    let validEdgesCount = 0;

    for (const element of zarkTree) {
      const id = element.attributes!.id;
      const source = element.attributes!.source;
      const target = element.attributes!.target;
      const isEdge = element.attributes!.edge;
  
      if (isEdge) {
        edgesCount += 1;
        if (!!source === !!target) {
          validEdgesCount += 1;
        } else {
          console.log("Invalid edge detected!");
          console.log(`ID: ${id}`);
          console.log(`Source: ${source}, Target: ${target}`);
        }
      }
    }

    expect(edgesCount).toEqual(validEdgesCount);
  })
});
