import { parse } from "fsp-xml-parser";

export const readXMLFile = async (filePath: string) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(
        `Network response was not ok, status: ${response.status}`,
      );
    }
    return await response.text();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

export const getXMLContents = async (filePath: string) => {
  const xmlContents = await readXMLFile(filePath);
  if (!xmlContents) {
    throw new Error("Could not get XML contents.");
  }
  return parse(xmlContents);
};
