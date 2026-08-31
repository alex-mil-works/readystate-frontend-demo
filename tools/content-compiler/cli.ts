import { compileCourse, formatCompileResult } from './compile-course.js';
import { compileStack, formatCompileStackResult } from './compile-stack.js';
import { discoverCourses } from './load-course.js';
import { discoverDisciplines, discoverStackIds, loadDiscipline } from './load-discipline.js';
import { paths } from './paths.js';
import { writeDisciplineCatalog } from './write-discipline-catalog.js';

/** CLI: compile legacy flat courses and discipline stacks → generated JSON. */
const courseDirs = await discoverCourses();
const disciplineDirs = await discoverDisciplines(paths.coursesDir);

console.log(`content:compile source → ${paths.coursesDirRelative}/`);

if (courseDirs.length === 0 && disciplineDirs.length === 0) {
  console.log(
    `No courses found in ${paths.coursesDirRelative}/ (expected */course.yaml or */discipline.yaml).`,
  );
  process.exit(0);
}

for (const courseDir of courseDirs) {
  const result = await compileCourse(courseDir);
  console.log(`Compiled ${formatCompileResult(result)}`);
}

for (const disciplineDir of disciplineDirs) {
  const stackIds = await discoverStackIds(disciplineDir);
  for (const stackId of stackIds) {
    const result = await compileStack(disciplineDir, stackId);
    console.log(`Compiled ${formatCompileStackResult(result)}`);
  }
}

if (disciplineDirs.length > 0) {
  const manifests = await Promise.all(disciplineDirs.map((dir) => loadDiscipline(dir)));
  const catalogPath = await writeDisciplineCatalog(manifests);
  console.log(`Synced catalog from discipline.yaml → ${catalogPath}`);
}
