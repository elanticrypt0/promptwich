PROJECT BLUEPRINT: Promptwich (The Bun-based Prompt Builder)1. Project OverviewPromptwich es una aplicación de escritorio "Single Binary" construida con Bun y React para ingeniería de prompts estandarizada. Su objetivo es ayudar a arquitectos y desarrolladores a generar prompts de alta calidad (Markdown) utilizando un paradigma de "Sandwich" (capas configurables) y presets definidos externamente.Core Stack:Runtime/Bundler: Bun (Latest)Frontend: React + Vite + TypeScript (Strict)Styling: TailwindCSSDistribution: Single executable (bun build --compile)Data: Archivos JSON locales en ./config para fácil edición sin recompilar.Key Features:Split View: Panel izquierdo para configuración, derecho para vista previa de Markdown en tiempo real.Local Config: Los ingredientes del prompt (sandwich.json) y variables globales (globals.json) son editables por el usuario.Standalone: Funciona sin internet (salvo para instalar dependencias iniciales).Language Strategy: Branding e UI en inglés (para consistencia técnica), descripciones de ayuda en Español, Output del prompt en Inglés (optimizado para LLMs).2. Directory Structurepromptwich/
├── config/                     # User-editable configuration (External to binary in prod)
│   ├── sandwich.json           # Manifest of sections (ingredients) & modifiers
│   ├── globals.json            # Global variables (Languages, stacks)
│   └── presets/                # Pre-defined templates
│       ├── 01_init_project.json
│       ├── 02_fix_bug.json
│       ├── 03_refactor.json
│       └── 04_feature.json
├── src/
│   ├── backend/                # Bun HTTP Server & File API
│   │   ├── main.ts             # Entry point
│   │   └── api.ts              # Config loader logic
│   └── frontend/               # React UI
│       ├── src/
│       │   ├── components/     # UI Components (SplitView, IngredientBuilder, PreviewPane)
│       │   ├── hooks/          # Logic for prompt assembly
│       │   ├── types/          # Shared Types
│       │   └── App.tsx
│       ├── index.html
│       ├── tailwind.config.js
│       └── vite.config.ts
├── package.json
├── tsconfig.json
└── bun.lockb
3. Configuration SpecsFile: config/sandwich.jsonDefine la estructura de los prompts.Note: label se muestra en la UI (Español), prefix y contenido van al prompt (Inglés).{
  "meta": {
    "app_name": "Promptwich",
    "version": "1.0.0"
  },
  "ingredients": [
    {
      "id": "role",
      "label": "Rol del Sistema",
      "prefix": "# ROLE",
      "placeholder": "Senior Software Architect...",
      "default": "Senior Software Architect expert in {{LANGUAGE}}"
    },
    {
      "id": "task",
      "label": "Tarea Principal",
      "prefix": "# TASK",
      "placeholder": "Define the goal..."
    },
    {
      "id": "context",
      "label": "Contexto Técnico",
      "prefix": "# CONTEXT",
      "placeholder": "Stack details..."
    },
    {
      "id": "constraints",
      "label": "Limitaciones",
      "prefix": "# CONSTRAINTS",
      "placeholder": "- Strict typing\n- No external libs"
    },
    {
      "id": "output",
      "label": "Formato de Salida",
      "prefix": "# OUTPUT",
      "placeholder": "1. File tree\n2. Code blocks"
    }
  ],
  "modifiers": [
    {
      "id": "no_yapping",
      "label": "Sin Rodeos (Conciso)",
      "text": "Go straight to the point. No theoretical explanations unless critical. Only code and essential comments."
    },
    {
      "id": "cot",
      "label": "Pensamiento en Cadena",
      "text": "Think step-by-step before generating the final code. Identify edge cases."
    },
    {
      "id": "safety",
      "label": "Modo Seguro (OWASP)",
      "text": "Analyze for OWASP Top 10 vulnerabilities before suggesting code."
    }
  ]
}
File: config/globals.jsonVariables globales inyectables en los templates mediante {{VARIABLE}}.{
  "variables": [
    {
      "key": "LANGUAGE",
      "label": "Lenguaje Principal",
      "options": [
        "TypeScript (Strict)",
        "Go 1.22+",
        "PHP 8.2+",
        "PHP 5.6.4 (Legacy)",
        "Python 3.11+"
      ]
    },
    {
      "key": "CSS_FRAMEWORK",
      "label": "Framework CSS",
      "options": ["TailwindCSS", "Bootstrap 5", "CSS Modules", "None"]
    }
  ]
}
4. Backend Implementation (Bun)File: src/backend/main.tsServidor capaz de ejecutarse como script o binario compilado.import { serve, file } from "bun";
import { join, dirname } from "path";
import { existsSync } from "fs";

// Determine root directory based on execution mode (Binary vs Source)
const IS_COMPILED = process.argv0.endsWith("promptwich");
const BASE_DIR = IS_COMPILED ? dirname(process.argv0) : process.cwd();
const CONFIG_DIR = join(BASE_DIR, "config");
const STATIC_DIR = join(process.cwd(), "src/frontend/dist");

console.log(`🥪 Promptwich is running!`);
console.log(`📂 Config loaded from: ${CONFIG_DIR}`);
console.log(`🚀 Open http://localhost:3000`);

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // API Routes for Config
    if (url.pathname.startsWith("/api/config")) {
      const filename = url.pathname.replace("/api/config/", "");
      // Security: Prevent directory traversal
      if (filename.includes("..")) return new Response("Forbidden", { status: 403 });
      
      const filePath = join(CONFIG_DIR, filename);
      if (existsSync(filePath)) {
        return new Response(file(filePath));
      }
      return new Response("Config not found", { status: 404 });
    }

    // Static File Serving (SPA Fallback)
    // In a real build, you might want to embed these using Bun.file(import.meta.dir + "...")
    // or keep them external.
    let filePath = join(STATIC_DIR, url.pathname === "/" ? "index.html" : url.pathname);
    if (!existsSync(filePath)) {
      filePath = join(STATIC_DIR, "index.html");
    }
    
    return new Response(file(filePath));
  },
});

// Optional: Open browser on start
// Bun.spawn(["open", "http://localhost:3000"]); 
5. Frontend Implementation (React Logic)Core ComponentsSplitLayout: Contenedor principal Grid (50% input / 50% preview).SandwichBuilder:Lee sandwich.json.Renderiza inputs dinámicos basados en el array ingredients.Permite seleccionar presets que auto-completan los inputs.MarkdownPreview:Toma el estado del SandwichBuilder.Concatena strings: Modifiers + Ingredients (con variables reemplazadas).Botón "Copy to Clipboard".Pseudo-Code for generatePrompt functionconst generatePrompt = (
  ingredients: Ingredient[], 
  values: Record<string, string>, 
  modifiers: Modifier[], 
  globals: Record<string, string>
) => {
  let prompt = "";

  // 1. Add Modifiers (Intro)
  modifiers.forEach(mod => {
    if (mod.active) prompt += `> ${mod.text}\n`;
  });
  prompt += "\n";

  // 2. Add Ingredients
  ingredients.forEach(ing => {
    let content = values[ing.id] || "";
    
    // 3. Interpolate Globals (e.g. {{LANGUAGE}})
    Object.keys(globals).forEach(key => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), globals[key]);
    });

    if (content.trim()) {
      prompt += `${ing.prefix}\n${content}\n\n`;
    }
  });

  return prompt;
};
6. Build & ScriptsFile: package.json{
  "name": "promptwich",
  "module": "src/backend/main.ts",
  "type": "module",
  "scripts": {
    "dev:front": "vite src/frontend",
    "dev:server": "bun run src/backend/main.ts",
    "build:front": "vite build src/frontend --outDir src/frontend/dist",
    "build:bin": "bun build --compile --minify --sourcemap ./src/backend/main.ts --outfile promptwich",
    "release": "bun run build:front && bun run build:bin"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "bun-types": "latest",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
