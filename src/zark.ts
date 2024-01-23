import { getXMLContents } from "./xml-parser";
import { getGraphFromFlowchartTree } from "./drawio-to-flowchart";
import { getUpdateFunctionFromGraph } from "./game";

// Load and parse XML file
const FILE_PATH = "assets/ZARK.drawio.xml";
const parsedZarkFile = await getXMLContents(FILE_PATH);

// This is an ugly line we need to get to the real content of the tree.
const zarkTree =
  parsedZarkFile.root?.children![0].children![0].children![0].children;
if (!zarkTree) {
  throw new Error("The tree did not have the expected format.");
}

// This is the graph representation of the game
const flowchartGraph = getGraphFromFlowchartTree(zarkTree);

// Run update loop
const updateGame = getUpdateFunctionFromGraph(flowchartGraph);
updateGame();
