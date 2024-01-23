import { getXMLContents } from "./xml-parser";

// Load and parse XML file
const FILE_PATH = "assets/ZARK.drawio.xml";
const parsedZarkFile = await getXMLContents(FILE_PATH);

// This is an ugly line we need to get to the real content of the tree.
const zarkTree =
  parsedZarkFile.root?.children![0].children![0].children![0].children;
if (!zarkTree) {
  throw new Error("ZarkTree did not have the expected format.");
}
console.log(zarkTree);
