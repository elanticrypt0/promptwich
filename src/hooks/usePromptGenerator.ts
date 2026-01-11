import { useMemo } from "react";
import type { Ingredient, Modifier, IngredientValues, ModifierStates, GlobalValues } from "../types";

function buildTechnicalContext(globals: GlobalValues): string {
  const framework = globals["FRAMEWORK"];
  const database = globals["DATABASE"];

  const hasFramework = framework && framework !== "None";
  const hasDatabase = database && database !== "None";

  if (!hasFramework && !hasDatabase) return "";

  const parts: string[] = [];

  if (hasFramework) {
    parts.push(`- Framework: **${framework}**`);
  }

  if (hasDatabase) {
    parts.push(`- Base de datos: **${database}**`);
  }

  parts.push("");
  parts.push("Puedes consultar la documentación oficial de estas tecnologías para resolver la tarea correctamente.");

  return `# Contexto Técnico\n${parts.join("\n")}\n\n`;
}

export function usePromptGenerator(
  ingredients: Ingredient[],
  values: IngredientValues,
  modifiers: Modifier[],
  modifierStates: ModifierStates,
  globals: GlobalValues
): string {
  return useMemo(() => {
    let prompt = "";

    // 1. Add active modifiers as blockquotes
    const activeModifiers = modifiers.filter((mod) => modifierStates[mod.id]);
    if (activeModifiers.length > 0) {
      activeModifiers.forEach((mod) => {
        prompt += `> ${mod.text}\n`;
      });
      prompt += "\n";
    }

    // 2. Add technical context (framework + database)
    prompt += buildTechnicalContext(globals);

    // 3. Add ingredients with their prefixes
    ingredients.forEach((ing) => {
      let content = values[ing.id] || "";

      // 4. Interpolate global variables (e.g. {{LANGUAGE}})
      Object.keys(globals).forEach((key) => {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), globals[key] ?? "");
      });

      if (content.trim()) {
        prompt += `${ing.prefix}\n${content}\n\n`;
      }
    });

    return prompt.trim();
  }, [ingredients, values, modifiers, modifierStates, globals]);
}
