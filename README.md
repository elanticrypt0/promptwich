# 🥪 Promptwich

**The Bun-based Prompt Builder**

Promptwich is a high-performance "Single Binary" desktop-oriented web application built with **Bun** and **React**. It is designed for standardized prompt engineering, helping architects and developers generate high-quality Markdown prompts using a configurable "Sandwich" paradigm (layers of ingredients and modifiers).

---

## 🚀 Key Features

- **Dynamic Sandwich Builder**: Assemble prompts by layering "ingredients" (Role, Task, Context, etc.) and "modifiers" (No Yapping, CoT, Safety).
- **Split View Interface**: Configure your prompt on the left and see the Markdown preview in real-time on the right.
- **Local Config First**: All ingredients, global variables (`globals.json`), and templates (`presets/`) are stored as local JSON files for easy customization without recompiling.
- **Single Binary Distribution**: Compiles into a single executable for zero-dependency portability.
- **Fast Runtime**: Powered by Bun for near-instant boot times and high-speed build processes.

---

## 🛠 Tech Stack

- **Runtime & Bundler**: [Bun](https://bun.sh)
- **Frontend**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com)
- **Icons/Assets**: Inline SVG & Lucide-like custom icons.

---

## 📦 Project Structure

```text
promptwich/
├── config/             # User-editable configuration (External to binary)
│   ├── sandwich.json   # Logic for sections & modifiers
│   ├── globals.json    # Global variables (Language, Stacks)
│   └── presets/        # Pre-defined prompt templates
├── src/                # Source code
│   ├── components/     # React UI Components
│   ├── hooks/          # Prompt assembly logic
│   ├── types.ts        # Shared TypeScript definitions
│   └── index.ts        # Entry point (Bun Server + Static serving)
├── package.json        # Dependencies & scripts
└── tsconfig.json       # TypeScript configuration
```

---

## 🚦 Getting Started

### Prerequisites

You need [Bun](https://bun.sh) installed on your system.

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd promptwich
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Development

To start the development server with hot-reloading:

```bash
bun dev
```
Then visit: `http://localhost:3000`

### Building for Production

To create a single portable binary:

```bash
bun run build:bin
```
This will generate a `promptwich` executable in the root directory.

---

## 🥪 How to Use

1. **Ingredients**: Edit `config/sandwich.json` to add or remove prompt sections.
2. **Globals**: Define your stack or preferences in `config/globals.json`.
3. **Build**: Open the app, select a preset or fill in the ingredients, and copy your optimized prompt.

---

## 📄 License

MIT © 2026 Promptwich Team
