import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ts from 'typescript';

const projectRoot = process.cwd();

export async function resolve(specifier, context, defaultResolve) {
  let resolvedSpecifier = specifier;

  // Handle CSS files
  if (specifier.endsWith('.css')) {
    return {
      url: `data:text/javascript,export default {};`,
      shortCircuit: true,
    };
  }

  // Handle @/ path alias
  if (specifier.startsWith('@/')) {
    const subPath = specifier.slice(2);
    resolvedSpecifier = path.join(projectRoot, 'src', subPath);
  }

  // If path is absolute or relative without extension
  if (resolvedSpecifier.startsWith('/') || resolvedSpecifier.startsWith('.') || path.isAbsolute(resolvedSpecifier)) {
    const candidatePath = resolvedSpecifier.startsWith('file://')
      ? url.fileURLToPath(resolvedSpecifier)
      : path.isAbsolute(resolvedSpecifier)
      ? resolvedSpecifier
      : path.resolve(path.dirname(url.fileURLToPath(context.parentURL)), resolvedSpecifier);

    const extensions = ['.ts', '.tsx', '.js', '.mjs', '.json', '/index.ts', '/index.tsx', '/index.js'];
    for (const ext of extensions) {
      const full = candidatePath + ext;
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        return {
          url: url.pathToFileURL(full).href,
          shortCircuit: true,
        };
      }
    }

    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      return {
        url: url.pathToFileURL(candidatePath).href,
        shortCircuit: true,
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(urlStr, context, defaultLoad) {
  if (urlStr.startsWith('data:text/javascript')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }

  if (!urlStr.startsWith('file:')) {
    return defaultLoad(urlStr, context, defaultLoad);
  }

  const filePath = url.fileURLToPath(urlStr);

  if (filePath.endsWith('.json')) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return {
      format: 'json',
      source: raw,
      shortCircuit: true,
    };
  }

  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const sourceText = fs.readFileSync(filePath, 'utf8');
    const result = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
      fileName: filePath,
    });

    return {
      format: 'module',
      source: result.outputText,
      shortCircuit: true,
    };
  }

  return defaultLoad(urlStr, context, defaultLoad);
}
