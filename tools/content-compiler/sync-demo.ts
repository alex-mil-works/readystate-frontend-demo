/**
 * Sync public demo curriculum from private `.courses/`.
 *
 * Copies each role's discipline/skeleton + every stack's course.yaml and only
 * the stage folders listed in that course.yaml (currently S01). Full skeleton
 * stays so empty stages still render as «Скоро» on the map.
 *
 * Usage: yarn content:sync-demo
 */
import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRoot = path.join(repoRoot, '.courses');
const destRoot = path.join(repoRoot, 'courses-demo');

const ROLE_FILES = ['discipline.yaml', 'skeleton.yaml', 'README.md'] as const;

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function syncRole(roleId: string): Promise<{ stacks: string[]; stages: string[] }> {
  const srcRole = path.join(sourceRoot, roleId);
  const destRole = path.join(destRoot, roleId);
  await mkdir(destRole, { recursive: true });

  for (const file of ROLE_FILES) {
    const from = path.join(srcRole, file);
    if (await exists(from)) {
      await cp(from, path.join(destRole, file));
    }
  }

  const stacksDir = path.join(srcRole, 'stacks');
  if (!(await exists(stacksDir))) return { stacks: [], stages: [] };

  const stackIds = (await readdir(stacksDir)).toSorted();
  const syncedStacks: string[] = [];
  const syncedStages: string[] = [];

  for (const stackId of stackIds) {
    const courseYamlPath = path.join(stacksDir, stackId, 'course.yaml');
    if (!(await exists(courseYamlPath))) continue;

    const destStack = path.join(destRole, 'stacks', stackId);
    await mkdir(path.join(destStack, 'content'), { recursive: true });
    await cp(courseYamlPath, path.join(destStack, 'course.yaml'));

    const raw = await readFile(courseYamlPath, 'utf8');
    const manifest = parseYaml(raw) as { stages?: string[] };
    const stageFolders = manifest.stages ?? [];

    for (const stageFolder of stageFolders) {
      const fromStage = path.join(stacksDir, stackId, 'content', stageFolder);
      if (!(await exists(fromStage))) {
        throw new Error(`Missing stage folder for ${roleId}/${stackId}: ${stageFolder}`);
      }
      await cp(fromStage, path.join(destStack, 'content', stageFolder), { recursive: true });
      syncedStages.push(`${roleId}/${stackId}/${stageFolder}`);
    }

    const courseActivities = path.join(stacksDir, stackId, 'content', 'activities');
    if (await exists(courseActivities)) {
      await cp(courseActivities, path.join(destStack, 'content', 'activities'), {
        recursive: true,
      });
    }

    syncedStacks.push(`${roleId}/${stackId}`);
  }

  return { stacks: syncedStacks, stages: syncedStages };
}

async function main() {
  if (!(await exists(sourceRoot))) {
    console.error('sync-demo: `.courses/` not found. Author full curriculum locally first.');
    process.exit(1);
  }

  await rm(destRoot, { recursive: true, force: true });
  await mkdir(destRoot, { recursive: true });

  const roleEntries = await readdir(sourceRoot);
  const roles: string[] = [];
  const allStacks: string[] = [];
  const allStages: string[] = [];

  for (const entry of roleEntries.toSorted()) {
    const disciplinePath = path.join(sourceRoot, entry, 'discipline.yaml');
    if (!(await exists(disciplinePath))) continue;
    roles.push(entry);
    const result = await syncRole(entry);
    allStacks.push(...result.stacks);
    allStages.push(...result.stages);
  }

  const readme = `# courses-demo

Public **demo** curriculum slice for ReadyState (committed).

- Synced from private \`.courses/\` via \`yarn content:sync-demo\`
- Includes full \`discipline.yaml\` + \`skeleton.yaml\` (empty stages → «Скоро»)
- Stack content is limited to stages listed in each \`course.yaml\` (today: **S01 only**)
- Local authoring stays in \`.courses/\` (gitignored)
- **Deploy/CI** compile this tree via GitHub Variables (\`CONTENT_SOURCE=demo\`, \`VITE_DEMO=true\`)

Do not hand-edit unless you intend a demo-only change; prefer sync from \`.courses/\`.
`;

  await writeFile(path.join(destRoot, 'README.md'), readme, 'utf8');

  console.log(`sync-demo: wrote ${destRoot}`);
  console.log(`  roles: ${roles.join(', ') || '(none)'}`);
  console.log(`  stacks: ${allStacks.join(', ') || '(none)'}`);
  console.log(`  stages: ${allStages.join(', ') || '(none)'}`);
}

await main();
