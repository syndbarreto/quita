import { getToolRecords } from "./api-service.js";

let cachedTools = null;

function normalizeTool(tool) {
  return {
    ...tool,
    imageUrl: tool.imageUrl
      ?.replace("../assets/", "../assets/")
      .replace("./assets/", "../assets/"),
  };
}

export async function getCalmingTools() {
  if (cachedTools) {
    return cachedTools;
  }

  const tools = await getToolRecords();

  cachedTools = (tools || []).map(normalizeTool);

  return cachedTools;
}

export async function getCalmingToolsByIds(ids) {
  const tools = await getCalmingTools();

  return ids
    .map((id) => tools.find((tool) => Number(tool.id) === Number(id)))
    .filter(Boolean);
}
