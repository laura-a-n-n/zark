import { getXMLContents } from "./xml-parser";
import DiGraph from "graphology"; // Import the DiGraph class from the graphology library

// Load and parse XML file
const FILE_PATH = "assets/ZARK.drawio.xml";
const parsedZarkFile = await getXMLContents(FILE_PATH);

// This is an ugly line we need to get to the real content of the tree.
const zarkTree =
  parsedZarkFile.root?.children![0].children![0].children![0].children;
if (!zarkTree) {
  throw new Error("The tree did not have the expected format.");
}
console.log(zarkTree);

// Now we will through zarkTree and construct a graph
const flowchartGraph = new DiGraph();

// Dictionary to store edges temporarily
const edges: { [id: string]: [string, string] } = {};

// First, build nodes of the graph
for (const element of zarkTree) {
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
  if (!isEdgeLabel && value !== undefined && source === undefined && target === undefined) {
    flowchartGraph.addNode(id, { label: value });
  }
}

// Add edges to the graph
for (const element of zarkTree) {
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
for (const element of zarkTree) {
  if (!element.attributes) {
    continue;
  }

  const edgeId = element.attributes.parent;
  const value = element.attributes.value;
  const style = element.attributes.style;
  const isEdgeLabel = style && style.startsWith("edgeLabel");

  if (isEdgeLabel && edgeId !== undefined && value !== undefined) {
    const [source, target] = edges[edgeId];
    flowchartGraph.setEdgeAttribute(source, target, 'label', value);
  }
}

// Iterate through nodes in the graph
for (const node of flowchartGraph.nodes()) {
  const value = flowchartGraph.getNodeAttribute(node, 'label');
  const targets = Array.from(flowchartGraph.outNeighbors(node));
  const sources = Array.from(flowchartGraph.inNeighbors(node));

  const decisions: (string | undefined)[] = [];

  // Iterate through targets
  for (const target of targets) {
    const edgeAttributes = flowchartGraph.getEdgeAttributes(node, target);

    if (edgeAttributes && 'label' in edgeAttributes) {
      decisions.push(edgeAttributes['label']);
    } else {
      decisions.push(target);
    }
  }

  // Now you have 'value', 'targets', 'sources', and 'decisions' for the current node
  console.log({ value, targets, sources, decisions });
}

const gameContainer = document.getElementById('game-container');
const currentNodeElement = document.getElementById('current-node');
const valueElement = document.getElementById('value');
const decisionsContainer = document.getElementById('decisions');

let current_node = [...flowchartGraph.nodes()][0];

const decodeHTMLEntities = (text: string) => {
  const entities = [
      ['amp', '&'],
      ['apos', '\''],
      ['#x27', '\''],
      ['#x2F', '/'],
      ['#39', '\''],
      ['#47', '/'],
      ['lt', '<'],
      ['gt', '>'],
      ['nbsp', ' '],
      ['quot', '"']
  ];

  for (var i = 0, max = entities.length; i < max; ++i)
      text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);

  return text;
}

function updateGame() {
  if (!gameContainer || !currentNodeElement || !valueElement || !decisionsContainer) {
    throw new Error('Did not find expected dom elements.');
  }

  // currentNodeElement.textContent = `Current node: ${current_node}`;
  const nodeLabel = flowchartGraph.getNodeAttribute(current_node, 'label');
  valueElement.innerHTML = decodeHTMLEntities(nodeLabel);

  const targets = Array.from(flowchartGraph.outNeighbors(current_node));

  if (targets.length === 0) {
    valueElement.innerHTML += "<p>[That's all for now.]</p>";
    decisionsContainer.innerHTML = '';
    return;
  }

  decisionsContainer.innerHTML = '<p>Decisions:</p>';
  let shouldPickRandom = true;
  targets.forEach((target, index) => {
    const edgeAttributes = flowchartGraph.getEdgeAttributes(current_node, target);
    const hasLabel = 'label' in edgeAttributes && edgeAttributes['label'];
    const option = hasLabel ? edgeAttributes['label'] : target;
    const button = document.createElement('button');
    shouldPickRandom = shouldPickRandom && !hasLabel;

    button.innerHTML = decodeHTMLEntities(option);
    console.log(decodeHTMLEntities(option));
    button.addEventListener('click', () => {
      current_node = target;
      updateGame();
    });
    decisionsContainer.appendChild(button);
  });

  if (shouldPickRandom) {
    const randomIndex = Math.floor(Math.random() * targets.length);
    const randomTarget = targets[randomIndex];
    decisionsContainer.innerHTML = '';
    const button = document.createElement('button');
    button.innerHTML = 'The only option is to continue...';
    button.addEventListener('click', () => {
      current_node = randomTarget;
      updateGame();
    });
    decisionsContainer.appendChild(button);
  }
}

updateGame();

