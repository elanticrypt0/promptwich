import { useState, useEffect } from "react";
import "./index.css";
import { SandwichBuilder } from "./components/SandwichBuilder";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { usePromptGenerator } from "./hooks/usePromptGenerator";
import type {
  SandwichConfig,
  GlobalsConfig,
  IngredientValues,
  ModifierStates,
  GlobalValues,
} from "./types";
import { getVariableOptions, isConditionalVariable } from "./types";

export function App() {
  // Configuration state
  const [config, setConfig] = useState<SandwichConfig | null>(null);
  const [globalsConfig, setGlobalsConfig] = useState<GlobalsConfig | null>(null);

  // User input state
  const [values, setValues] = useState<IngredientValues>({});
  const [modifierStates, setModifierStates] = useState<ModifierStates>({});
  const [globals, setGlobals] = useState<GlobalValues>({});

  // Load configurations on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/config/sandwich.json").then((res) => res.json()),
      fetch("/api/config/globals.json").then((res) => res.json()),
    ])
      .then(([sandwichConfig, globalsConfig]) => {
        setConfig(sandwichConfig);
        setGlobalsConfig(globalsConfig);

        // Initialize default values
        const initialValues: IngredientValues = {};
        sandwichConfig.ingredients.forEach((ing: { id: string; default?: string }) => {
          if (ing.default) {
            initialValues[ing.id] = ing.default;
          }
        });
        setValues(initialValues);

        // Initialize globals with first option (process in order for dependencies)
        const initialGlobals: GlobalValues = {};
        for (const v of globalsConfig.variables) {
          const options = getVariableOptions(v, initialGlobals);
          initialGlobals[v.key] = options[0] ?? "";
        }
        setGlobals(initialGlobals);
      })
      .catch(console.error);
  }, []);

  // Generate prompt
  const generatedPrompt = usePromptGenerator(
    config?.ingredients || [],
    values,
    config?.modifiers || [],
    modifierStates,
    globals
  );

  return (
    <div className="h-screen w-screen flex bg-gray-900">
      {/* Left Panel - Builder */}
      <div className="w-1/2 border-r border-gray-700">
        <SandwichBuilder
          values={values}
          setValues={setValues}
          modifierStates={modifierStates}
          setModifierStates={setModifierStates}
          globals={globals}
          setGlobals={setGlobals}
          config={config}
          globalsConfig={globalsConfig}
        />
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2">
        <MarkdownPreview content={generatedPrompt} />
      </div>
    </div>
  );
}
