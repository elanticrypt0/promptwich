import { useState, useEffect } from "react";
import type {
  SandwichConfig,
  GlobalsConfig,
  PresetListItem,
  Preset,
  IngredientValues,
  ModifierStates,
  GlobalValues,
} from "../types";
import { getVariableOptions, isConditionalVariable } from "../types";

interface Props {
  values: IngredientValues;
  setValues: (values: IngredientValues) => void;
  modifierStates: ModifierStates;
  setModifierStates: (states: ModifierStates) => void;
  globals: GlobalValues;
  setGlobals: (globals: GlobalValues) => void;
  config: SandwichConfig | null;
  globalsConfig: GlobalsConfig | null;
}

export function SandwichBuilder({
  values,
  setValues,
  modifierStates,
  setModifierStates,
  globals,
  setGlobals,
  config,
  globalsConfig,
}: Props) {
  const [presets, setPresets] = useState<PresetListItem[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Load presets list
  useEffect(() => {
    fetch("/api/presets")
      .then((res) => res.json())
      .then(setPresets)
      .catch(console.error);
  }, []);

  // Handle preset selection
  const handlePresetChange = async (filename: string) => {
    setSelectedPreset(filename);
    if (!filename) return;

    try {
      const res = await fetch(`/api/presets/${filename}`);
      const preset: Preset = await res.json();

      // Apply preset values
      setValues({ ...values, ...preset.values });

      // Apply preset modifiers
      const newModifierStates: ModifierStates = {};
      config?.modifiers.forEach((mod) => {
        newModifierStates[mod.id] = preset.modifiers?.includes(mod.id) || false;
      });
      setModifierStates(newModifierStates);

      // Apply preset globals if any
      if (preset.globals) {
        setGlobals({ ...globals, ...preset.globals });
      }
    } catch (error) {
      console.error("Failed to load preset:", error);
    }
  };

  if (!config || !globalsConfig) {
    return (
      <div className="p-4 text-gray-400">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
          <span>🥪</span> Promptwich
        </h1>
        <p className="text-sm text-gray-400 mt-1">Build structured prompts with layers</p>
      </div>

      {/* Preset Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Preset Template
        </label>
        <select
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">-- Select a preset --</option>
          {presets.map((preset) => (
            <option key={preset.filename} value={preset.filename}>
              {preset.name} - {preset.description}
            </option>
          ))}
        </select>
      </div>

      {/* Global Variables */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Variables Globales</h2>
        {globalsConfig.variables.map((variable) => {
          const options = getVariableOptions(variable, globals);
          const currentValue = globals[variable.key] ?? "";
          const isValidValue = options.includes(currentValue);
          const displayValue = isValidValue ? currentValue : options[0] ?? "";

          // Skip rendering if no options available
          if (options.length === 0) return null;

          const handleChange = (newValue: string) => {
            const updatedGlobals = { ...globals, [variable.key]: newValue };

            // Reset dependent variables when parent changes
            globalsConfig.variables.forEach((v) => {
              if (isConditionalVariable(v) && v.dependsOn === variable.key) {
                const newOptions = getVariableOptions(v, updatedGlobals);
                updatedGlobals[v.key] = newOptions[0] ?? "";
              }
            });

            setGlobals(updatedGlobals);
          };

          return (
            <div key={variable.key}>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {variable.label}
              </label>
              <select
                value={displayValue}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Modifiers */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Modificadores</h2>
        <div className="space-y-2">
          {config.modifiers.map((modifier) => (
            <label
              key={modifier.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={modifierStates[modifier.id] || false}
                onChange={(e) =>
                  setModifierStates({ ...modifierStates, [modifier.id]: e.target.checked })
                }
                className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
              />
              <span className="text-gray-300">{modifier.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Ingredientes del Prompt</h2>
        {config.ingredients.map((ingredient) => (
          <div key={ingredient.id}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {ingredient.label}
              <span className="ml-2 text-xs text-gray-500">{ingredient.prefix}</span>
            </label>
            <textarea
              value={values[ingredient.id] || ""}
              onChange={(e) => setValues({ ...values, [ingredient.id]: e.target.value })}
              placeholder={ingredient.placeholder}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-y"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
