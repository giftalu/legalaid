const fs = require("fs");
const path = require("path");

const root = process.cwd();

function walk(directory, results = []) {
  if (!fs.existsSync(directory)) return results;

  for (const entry of fs.readdirSync(directory)) {
    if (
      entry === "node_modules" ||
      entry === ".next" ||
      entry === ".git"
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      results.push(path.relative(root, fullPath));
    }
  }

  return results;
}

const files = walk(root);

const sourceFiles = files.filter((file) =>
  /\.(ts|tsx|js|jsx|prisma)$/.test(file)
);

const documentation = `# Code Reference

Automatically generated from the Git repository.

## Project

Malawi Legal Aid Management System

## Generated

${new Date().toISOString()}

## Source Files

${sourceFiles.map((file) => `- \`${file}\``).join("\n")}

## Technology

- Next.js
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- GitHub
- Vercel

## Documentation Policy

This document is automatically regenerated whenever changes are
pushed to the main branch.
`;

const docsDirectory = path.join(root, "docs");

fs.mkdirSync(docsDirectory, { recursive: true });

fs.writeFileSync(
  path.join(docsDirectory, "CODE-REFERENCE.md"),
  documentation
);

console.log("Documentation generated successfully.");