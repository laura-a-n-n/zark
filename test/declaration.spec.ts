import { describe, test, expect, beforeAll } from "bun:test";
import { parse, type XmlNode } from "fsp-xml-parser";
import { FILE_PATH, readXMLFile } from "./test-utils";

describe("zark tree declaration", () => {
  let file: string;
  let zarkTree: XmlNode[] | undefined;

  beforeAll(async () => {
    file = await readXMLFile(FILE_PATH);
    const parsed = parse(file);
    expect(parsed.root).toBeDefined();
    zarkTree =
      parsed.root?.children?.[0]?.children?.[0]?.children?.[0]?.children;
    expect(zarkTree).toBeDefined();
  });

  test("should exist", () => {
    expect(file).toBeDefined();
  });

  test("should parse just fine", () => {
    expect(zarkTree).toBeDefined();
  });

  test("should have valid edges", () => {
    if (!zarkTree) {
      expect(zarkTree).toBeDefined();
      return;
    }

    let edgesCount = 0;
    let validEdgesCount = 0;

    for (const element of zarkTree) {
      const { id, source, target, edge } = element.attributes || {};

      if (edge) {
        edgesCount++;
        if (!!source === !!target) {
          validEdgesCount++;
        } else {
          console.log("Invalid edge detected!");
          console.log(`ID: ${id}`);
          console.log(`Source: ${source}, Target: ${target}`);
        }
      }
    }

    expect(edgesCount).toEqual(validEdgesCount);
  });
});
