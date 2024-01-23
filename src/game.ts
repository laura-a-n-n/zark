import type { DirectedGraph } from "graphology";
import { decodeHTMLEntities } from "./decode-html-entities";

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
      button.innerHTML = decodeHTMLEntities(option);
      console.log(decodeHTMLEntities(option));
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
      decisionsContainer.innerHTML = "";
      const button = document.createElement("button");
      button.innerHTML = "The only option is to continue...";
      button.addEventListener("click", () => {
        current_node = randomTarget;
        updateGame();
      });
      decisionsContainer.appendChild(button);
    }
  };
};
