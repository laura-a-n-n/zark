import type { DirectedGraph } from "graphology";
import { decodeHTMLEntities } from "./decode-html-entities";

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
  let current_node = [...flowchartGraph.nodes()][0];

  return function updateGame() {
    if (
      !gameContainer ||
      !currentNodeElement ||
      !valueElement ||
      !decisionsContainer
    ) {
      throw new Error("Did not find expected DOM elements.");
    }

    // currentNodeElement.textContent = `Current node: ${current_node}`;
    const nodeLabel = flowchartGraph.getNodeAttribute(current_node, "label");
    valueElement.innerHTML = decodeHTMLEntities(nodeLabel);

    const nodeStyle = flowchartGraph.getNodeAttribute(current_node, "style");
    valueElement.innerHTML += getImageTagFromNodeStyle(nodeStyle);

    const possibleDestinations = Array.from(
      flowchartGraph.outNeighbors(current_node),
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
        current_node,
        target,
      );
      const hasLabel = "label" in edgeAttributes && edgeAttributes["label"];
      const option = hasLabel ? edgeAttributes["label"] : target;
      shouldPickRandom = shouldPickRandom && !hasLabel;

      const button = document.createElement("button");
      const decodedOption = decodeHTMLEntities(option).replace(
        /<\/?div>|<br>/g,
        "",
      );
      button.style.display = "block";
      button.tabIndex = 0;
      button.innerHTML = `&gt; ${decodedOption}`;
      button.addEventListener("click", () => {
        current_node = target;
        updateGame();
      });
      decisionsContainer.appendChild(button);
    });

    if (shouldPickRandom) {
      const randomIndex = Math.floor(
        Math.random() * possibleDestinations.length,
      );
      const randomTarget = possibleDestinations[randomIndex];
      decisionsContainer.innerHTML = "<p>Decisions:</p>";
      const button = document.createElement("button");
      button.tabIndex = 0;
      button.innerHTML = "&gt; The only option is to continue...";
      button.addEventListener("click", () => {
        current_node = randomTarget;
        updateGame();
      });
      decisionsContainer.appendChild(button);
    }
  };
};
