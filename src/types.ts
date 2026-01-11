// Sandwich Configuration Types

export interface Ingredient {
  id: string;
  label: string;
  prefix: string;
  placeholder: string;
  default?: string;
}

export interface Modifier {
  id: string;
  label: string;
  text: string;
}

export interface SandwichMeta {
  app_name: string;
  version: string;
}

export interface SandwichConfig {
  meta: SandwichMeta;
  ingredients: Ingredient[];
  modifiers: Modifier[];
}

// Global Variables Types

export interface GlobalVariableBase {
  key: string;
  label: string;
}

export interface SimpleGlobalVariable extends GlobalVariableBase {
  options: string[];
  dependsOn?: never;
  conditionalOptions?: never;
}

export interface ConditionalGlobalVariable extends GlobalVariableBase {
  dependsOn: string;
  conditionalOptions: Record<string, string[]>;
  options?: never;
}

export type GlobalVariable = SimpleGlobalVariable | ConditionalGlobalVariable;

export interface GlobalsConfig {
  variables: GlobalVariable[];
}

// Type guards
export function isConditionalVariable(
  variable: GlobalVariable
): variable is ConditionalGlobalVariable {
  return "dependsOn" in variable && variable.dependsOn !== undefined;
}

export function getVariableOptions(
  variable: GlobalVariable,
  globals: GlobalValues
): string[] {
  if (isConditionalVariable(variable)) {
    const parentValue = globals[variable.dependsOn] ?? "";
    return variable.conditionalOptions[parentValue] ?? [];
  }
  return variable.options;
}

// Preset Types

export interface PresetListItem {
  filename: string;
  name: string;
  description: string;
}

export interface Preset {
  name: string;
  description: string;
  values: Record<string, string>;
  modifiers: string[];
  globals: Record<string, string>;
}

// State Types

export interface IngredientValues {
  [ingredientId: string]: string;
}

export interface ModifierStates {
  [modifierId: string]: boolean;
}

export interface GlobalValues {
  [variableKey: string]: string;
}
