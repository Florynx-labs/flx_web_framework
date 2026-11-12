/**
 * `flx create <name>` — Create a new FLX project
 * FLX by Florynx Labs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';
import prompts from 'prompts';
import { VERSION } from '../version.js';
import { showBanner, log, writeFile } from './shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createCommand(name?: string) {
  showBanner();

  if (!name) {
    const response = await prompts({
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-flx-app',
    });
    name = response.name;
    if (!name) { log.error('Project name is required'); process.exit(1); }
  }

  const projectDir = path.resolve(process.cwd(), name);

  if (fs.existsSync(projectDir)) {
    log.error(`Directory ${name} already exists`);
    process.exit(1);
  }

  // Choose template
  const flags = process.argv.slice(3);
  const templateFlag = flags.find(a => a.startsWith('--template='))?.split('=')[1];
  const tailwindFlag = flags.includes('--tailwind');
  const noTailwindFlag = flags.includes('--no-tailwind');

  let template = templateFlag;
  let useTailwind: boolean | undefined = tailwindFlag ? true : (noTailwindFlag ? false : undefined);

  if (!template) {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { title: 'Standard (Tailwind v4, Components, API, TypeScript)', value: 'standard' },
        { title: 'Minimal (Barebones starter)', value: 'minimal' },
      ],
      initial: 0,
    });
    template = response.template;
  }

  // Choose Shadcn / UI components if standard template
  let useShadcn = false;
  if (template === 'standard' && !flags.includes('--no-ui')) {
    const response = await prompts({
      type: 'confirm',
      name: 'shadcn',
      message: 'Include modern UI component primitives (Button, Card, cn utility)?',
      initial: true,
    });
    useShadcn = response.shadcn;
  }

  // Ask for Tailwind if not passed via flag
  if (useTailwind === undefined) {
    const response = await prompts({
      type: 'confirm',
      name: 'tailwind',
      message: 'Use Tailwind CSS v4?',
      initial: true,
    });
    useTailwind = response.tailwind;
  }

  // Prompt for FLX Pack
  const usePack = true;

  log.blank();
  log.info(`Creating FLX application in ${pc.cyan(projectDir)}...`);

  // Create directory
  fs.mkdirSync(projectDir, { recursive: true });

  // Scaffold files
  scaffoldProject(projectDir, name, {
    template: template || 'standard',
    useTailwind: useTailwind ?? true,
    useShadcn,
    usePack
  });

  log.blank();
  log.success(`Project ${pc.bold(name)} created successfully!`);
  log.blank();
  console.log(`  ${pc.bold('Next steps:')}`);
  console.log(`    ${pc.dim('$')} cd ${name}`);
  console.log(`    ${pc.dim('$')} pnpm install  ${pc.dim('# or npm install / bun install')}`);
  console.log(`    ${pc.dim('$')} pnpm flx dev   ${pc.dim('# or npm run dev')}`);
  console.log('');
  console.log(`  ${pc.bold('FLX by Florynx Labs')} — ${pc.dim('Build without limits.')}`);
  console.log('');
}

interface ScaffoldOptions {
  template: string;
  useTailwind: boolean;
  useShadcn: boolean;
  usePack: boolean;
}

function scaffoldProject(dir: string, name: string, { template, useTailwind, useShadcn, usePack }: ScaffoldOptions) {
  // package.json
  const pkg: any = {
    name,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: usePack ? 'flx dev --pack' : 'flx dev',
      build: usePack ? 'flx build --pack' : 'flx build',
      start: 'flx start',
    },
    dependencies: {
      '@florynx-labs/flx': `^${VERSION}`,
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@florynx-labs/flx-cli': `^${VERSION}`,
      '@florynx-labs/flx-pack': `^${VERSION}`,
      typescript: '^5.7.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
    },
  };

  if (useTailwind) {
    pkg.devDependencies = {
      ...pkg.devDependencies,
      'tailwindcss': '^4.0.0',
      '@tailwindcss/cli': '^4.0.0',
    };
  }

  if (useShadcn) {
    pkg.dependencies = {
      ...pkg.dependencies,
      'clsx': '^2.1.0',
      'tailwind-merge': '^2.2.1',
      'lucide-react': '^0.359.0'
    };
  }

  writeFile(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));

  writeFile(path.join(dir, 'flx.config.ts'), `import { defineConfig${useTailwind ? ', tailwindPlugin' : ''} } from "@florynx-labs/flx";

export default defineConfig({
  app: {
    name: "${name}",
  },
  server: {
    port: 3000,
    host: "localhost",
  },
  seo: {
    sitemap: true,
    robots: true,
    openGraph: true,
  },
  favicon: "/favicon.ico",
  ${useTailwind ? `plugins: [\n    tailwindPlugin()\n  ],` : 'plugins: [],'}
});
`);

  writeFile(path.join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['app/**/*.ts', 'app/**/*.tsx', 'server/**/*.ts'],
    exclude: ['node_modules', '.flx', '.velix']
  }, null, 2));

  fs.mkdirSync(path.join(dir, 'app'), { recursive: true });
  writeFile(path.join(dir, 'app', 'css.d.ts'), 'declare module "*.css";\n');
  writeFile(
    path.join(dir, 'app', 'globals.css'),
    useTailwind
      ? `@import "tailwindcss" source(none);\n@source "../app";\n@source "../components";\n\n@theme {\n  --color-flx-deep: #0a0a0a;\n  --color-flx-dark: #111211;\n  --color-flx-accent: #00e87a;\n  --color-flx-cyan: #39ffa0;\n  --color-flx-glow: rgba(0,232,122,0.15);\n  --color-velix-deep: #0a0a0a;\n  --color-velix-dark: #111211;\n  --color-velix-accent: #00e87a;\n  --color-velix-cyan: #39ffa0;\n  --color-velix-glow: rgba(0,232,122,0.15);\n}\n`
      : `body { margin: 0; font-family: sans-serif; }\n`
  );

  writeFile(path.join(dir, 'app', 'layout.tsx'), `import "./globals.css";

export const metadata = {
  title: "${name}",
  description: "Built with FLX by Florynx Labs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="${useTailwind ? 'bg-flx-deep text-slate-100' : 'bg-slate-900 text-white'} min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
`);

  if (template === 'minimal') {
    writeFile(path.join(dir, 'app', 'page.tsx'), `export const metadata = {\n  title: "${name}",\n};\n\nexport default function MinimalPage() {\n  return (\n    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-slate-100 font-sans">\n      <h1 className="text-4xl font-bold tracking-tight text-[#00e87a] mb-2">FLX</h1>\n      <p className="text-slate-400">Minimal starter · Build without limits.</p>\n    </main>\n  );\n}\n`);
  } else {
    // Full template with components...
    fs.mkdirSync(path.join(dir, 'components', 'ui'), { recursive: true });

    let buttonCode = `import React from 'react';\n\nexport interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary';\n}\n\nexport const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(\n  ({ className = '', variant = 'primary', ...props }, ref) => {\n    const base = "inline-flex flex-row gap-2 items-center justify-center font-medium transition-all duration-300 h-12 rounded-xl px-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50";\n    const variants = {\n      primary: "bg-gradient-to-r from-[#00e87a] to-[#39ffa0] text-[#0a0a0a] font-bold shadow-[0_0_20px_rgba(0,232,122,0.25)] hover:shadow-[0_0_30px_rgba(0,232,122,0.45)]",\n      secondary: "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30"\n    };\n    return <button ref={ref} className={\`\${base} \${variants[variant]} \${className}\`} {...props} />;\n  }\n);\nButton.displayName = "Button";\n`;

    if (useShadcn) {
      fs.mkdirSync(path.join(dir, 'lib'), { recursive: true });
      writeFile(path.join(dir, 'lib', 'utils.ts'), `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`);
      buttonCode = `import * as React from "react";\nimport { cn } from "../../lib/utils";\n\nexport interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary';\n}\n\nexport const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(\n  ({ className, variant = 'primary', ...props }, ref) => {\n    const classes = cn(\n      "inline-flex flex-row gap-2 items-center justify-center font-medium transition-all duration-300 h-12 rounded-xl px-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",\n      variant === 'primary' ? "bg-gradient-to-r from-[#00e87a] to-[#39ffa0] text-[#0a0a0a] font-bold shadow-[0_0_20px_rgba(0,232,122,0.25)] hover:shadow-[0_0_30px_rgba(0,232,122,0.45)]" : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30",\n      className\n    );\n    return <button className={classes} ref={ref} {...props} />;\n  }\n);\nButton.displayName = "Button";\n`;
    }
    writeFile(path.join(dir, 'components', 'ui', 'button.tsx'), buttonCode);

    const cardClasses = "group relative p-8 bg-[#111211]/60 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-colors duration-300 overflow-hidden";
    const cardGradient = "absolute inset-0 bg-gradient-to-br from-[#00e87a]/0 to-[#39ffa0]/0 group-hover:from-[#00e87a]/5 group-hover:to-[#39ffa0]/5 transition-all duration-500";
    const cardCode = useShadcn
      ? `import React from "react";\nimport { cn } from "../../lib/utils";\n\nexport function Card({ title, description, className = '' }: { title: string; description: string; className?: string }) {\n  return (\n    <div className={cn("${cardClasses}", className)}>\n      <div className="${cardGradient}"></div>\n      <h3 className="text-xl font-semibold text-slate-100 mb-3 relative z-10">{title}</h3>\n      <p className="text-sm text-slate-400 leading-relaxed relative z-10">{description}</p>\n    </div>\n  );\n}\n`
      : `import React from "react";\n\nexport function Card({ title, description, className = '' }: { title: string; description: string; className?: string }) {\n  return (\n    <div className={"${cardClasses} " + className}>\n      <div className="${cardGradient}"></div>\n      <h3 className="text-xl font-semibold text-slate-100 mb-3 relative z-10">{title}</h3>\n      <p className="text-sm text-slate-400 leading-relaxed relative z-10">{description}</p>\n    </div>\n  );\n}\n`;
    writeFile(path.join(dir, 'components', 'ui', 'card.tsx'), cardCode);

    writeFile(path.join(dir, 'app', 'page.tsx'), `import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const metadata = {
  title: "Welcome to FLX",
  description: "FLX — Build without limits. By Florynx Labs",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0A1610] via-[#111211] to-[#0a0a0a] text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#00e87a]/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#39ffa0]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="z-10 flex flex-col items-center max-w-5xl w-full text-center mt-12 mb-auto">
        <div className="mb-10 w-24 h-24 bg-gradient-to-br from-[#00e87a] to-[#39ffa0] rounded-2xl shadow-[0_0_50px_rgba(0,232,122,0.3)] flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-[#39ffa0]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <span className="text-4xl font-black text-[#0a0a0a] relative z-10 tracking-tighter">FLX</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Welcome to</span>{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#39ffa0] via-[#00e87a] to-[#00c96a]">FLX</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-12 tracking-wide font-light">
          The Full-Stack React Framework &middot; Build without limits.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 mb-24 w-full sm:w-auto">
          <a href="https://github.com/florynx-labs/flx" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">Get Started</Button>
          </a>
          <a href="https://flx.florynx.dev" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">Documentation</Button>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          <Card title="File Routing" description="Modern React 19 file-based routing with nested layouts and dynamic parameters." />
          <Card title="Server Actions" description="Type-safe RPC execution with validation and automatic state synchronization." />
          <Card title="FLX Pack" description="Ultra-fast incremental build and compilation engine optimized for React full-stack." />
          <Card title="Islands Architecture" description="Partial hydration strategies for exceptional Lighthouse performance." />
        </div>
      </div>
      <div className="mt-16 pb-8 text-slate-600 text-sm tracking-widest uppercase font-mono">
        FLX by Florynx Labs &copy; ${new Date().getFullYear()}
      </div>
    </main>
  );
}
`);
  }

  if (template !== 'minimal') {
    fs.mkdirSync(path.join(dir, 'server', 'api'), { recursive: true });
    writeFile(path.join(dir, 'server', 'api', 'hello.ts'), `export function GET() {
  return Response.json({ message: "Hello from FLX API by Florynx Labs!" });
}

export function POST(_request: Request) {
  return Response.json({ received: true });
}
`);

    fs.mkdirSync(path.join(dir, 'public'), { recursive: true });
  }
}
