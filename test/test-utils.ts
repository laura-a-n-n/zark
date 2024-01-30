import fs from "fs/promises";
import path from "path";
import { describe, test, expect, mock } from "bun:test";
import { parse, type XmlNode } from "fsp-xml-parser";
import { getXMLContents } from "../src/xml-parser";
import { getGraphFromFlowchartTree } from "../src/drawio-to-flowchart";
import type { DirectedGraph } from "graphology";

export const FILE_PATH = "./public/assets/ZARK.drawio.xml";

export const readXMLFile = mock(async (filePath: string) => {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    return fileContent;
  } catch (error) {
    console.error("There was a problem reading the file:", error);
    throw error;
  }
});