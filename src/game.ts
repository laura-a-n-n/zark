import type { DirectedGraph } from "graphology";
import { decodeHTMLEntities } from "./decode-html-entities";

const sanitizeNodeContent = (content: string) =>
  decodeHTMLEntities(content.trim()).replace(/<\/?div>|<br>/g, "");

const getImageTagFromNodeStyle = (nodeStyle: string) => {
  const imageUrlRegex = /image=([^;]+)/;
  const imageUrlMatch = imageUrlRegex.exec(nodeStyle);
  const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;
  if (!imageUrl) {
    return "";
  }

  const imageAltRegex = /alt=([^;]+)/;
  const imageAltMatch = imageAltRegex.exec(nodeStyle);
  const imageAlt = imageAltMatch ? imageAltMatch[1] : "Zark image";

  let imageStyle = "";
  const imageWidthRegex = /zarbAssetWidth=([^;]+)/;
  const imageWidthMatch = imageWidthRegex.exec(nodeStyle);
  const imageWidth = imageWidthMatch ? imageWidthMatch[1] : null;
  imageStyle += `width: ${imageWidth};`;

  const fullImageUrl = imageUrl.startsWith("https://")
    ? imageUrl
    : "https://" + imageUrl;
  return `<img src="${fullImageUrl}" alt="${imageAlt}" style="${imageStyle}">`;
};

export const getUpdateFunctionFromGraph = (flowchartGraph: DirectedGraph) => {
  const gameContainer = document.getElementById("game-container");
  const currentNodeElement = document.getElementById("current-node");
  const valueElement = document.getElementById("value");
  const decisionsContainer = document.getElementById("decisions");
  let currentNode = [...flowchartGraph.nodes()][0];

  // Construct scene dict
  const sceneDict: Record<string, string> = {};
  flowchartGraph.forEachNode((node, attributes) => {
    const label: string = attributes.label;
    const style: string = attributes.style;
    if (!label || !style) {
      return;
    }
    const isSceneMarker =
      style.indexOf("rhombus") >= 0 && label.indexOf("GOTO:") < 0;
    if (!isSceneMarker) {
      return;
    }
    const sceneName = sanitizeNodeContent(label);
    sceneDict[sceneName] = node;
  });

  return function updateGame() {
    if (
      !gameContainer ||
      !currentNodeElement ||
      !valueElement ||
      !decisionsContainer
    ) {
      throw new Error("Did not find expected DOM elements.");
    }

    // Get node metadata
    const nodeLabel: string = flowchartGraph.getNodeAttribute(
      currentNode,
      "label",
    );
    const nodeStyle: string = flowchartGraph.getNodeAttribute(
      currentNode,
      "style",
    );

    let shouldRender = true;
    let autoContinue = false;

    if (nodeStyle.indexOf("rhombus") >= 0) {
      shouldRender = false;
      autoContinue = true;
    }

    // Process node
    const gotoIndex = nodeLabel.indexOf("GOTO:");
    if (gotoIndex >= 0) {
      const gotoSceneName = sanitizeNodeContent(
        nodeLabel.substring(gotoIndex + 5),
      );

      const gotoNode = gotoSceneName in sceneDict && sceneDict[gotoSceneName];
      if (gotoNode && flowchartGraph.hasNode(gotoNode)) {
        currentNode = gotoNode;
        updateGame();
        return;
      } else {
        console.log(
          `Psst, hey Squambo. The user just tried to go to ${gotoSceneName}, which gave node "${gotoNode}".`,
        );
      }
    }

    // Display node
    if (shouldRender) {
      valueElement.innerHTML = decodeHTMLEntities(nodeLabel);
      valueElement.innerHTML += getImageTagFromNodeStyle(nodeStyle);
    }

    const possibleDestinations = Array.from(
      flowchartGraph.outNeighbors(currentNode),
    );

    if (possibleDestinations.length === 0) {
      valueElement.innerHTML += "<p>[That's all for now.]</p>";
      decisionsContainer.innerHTML = "";
      return;
    }

    decisionsContainer.innerHTML = "<p>Decisions:</p>";
    let shouldPickRandom = true;
    possibleDestinations.forEach((target) => {
      const edgeAttributes = flowchartGraph.getEdgeAttributes(
        currentNode,
        target,
      );
      const hasLabel = "label" in edgeAttributes && edgeAttributes["label"];
      const option = hasLabel ? edgeAttributes["label"] : target;
      shouldPickRandom = shouldPickRandom && !hasLabel;

      const button = document.createElement("button");
      const decodedOption = sanitizeNodeContent(option);
      button.style.display = "block";
      button.tabIndex = 0;
      button.innerHTML = `&gt; ${decodedOption}`;
      button.addEventListener("click", () => {
        currentNode = target;
        updateGame();
      });
      decisionsContainer.appendChild(button);
    });

    if (shouldPickRandom) {
      const randomIndex = Math.floor(
        Math.random() * possibleDestinations.length,
      );
      const randomTarget = possibleDestinations[randomIndex];
      if (autoContinue) {
        currentNode = randomTarget;
        updateGame();
        return;
      }

      decisionsContainer.innerHTML = "<p>Decisions:</p>";
      const button = document.createElement("button");
      button.tabIndex = 0;
      button.innerHTML = "&gt; The only option is to continue...";
      button.addEventListener("click", () => {
        currentNode = randomTarget;
        updateGame();
      });
      decisionsContainer.appendChild(button);
    }
  };
};
