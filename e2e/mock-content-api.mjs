/**
 * Minimal content API for Playwright smoke tests.
 * Serves committed fixtures so e2e does not depend on a deployed backend.
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = path.join(root, '__tests__/fixtures/courses');

const roles = JSON.parse(readFileSync(path.join(fixturesDir, 'disciplines.json'), 'utf8'));
const courses = {
  'frontend/react': JSON.parse(readFileSync(path.join(fixturesDir, 'frontend-react.json'), 'utf8')),
  'qa-automation/java': JSON.parse(readFileSync(path.join(fixturesDir, 'qa-java.json'), 'utf8')),
};

const port = Number.parseInt(process.env.MOCK_CONTENT_API_PORT ?? '3001', 10);

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Content-Type',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
    });
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'method_not_allowed' });
    return;
  }

  if (url.pathname === '/v1/health') {
    sendJson(res, 200, {
      ok: true,
      artifacts: { ready: true, courseCount: Object.keys(courses).length },
    });
    return;
  }

  if (url.pathname === '/v1/disciplines') {
    sendJson(res, 200, { roles });
    return;
  }

  const courseMatch = url.pathname.match(/^\/v1\/courses\/([^/]+)\/([^/]+)\/?$/);
  if (courseMatch) {
    const key = `${courseMatch[1]}/${courseMatch[2]}`;
    const course = courses[key];
    if (!course) {
      sendJson(res, 404, {
        error: 'course_not_found',
        roleId: courseMatch[1],
        stackId: courseMatch[2],
      });
      return;
    }
    sendJson(res, 200, { course });
    return;
  }

  sendJson(res, 404, { error: 'not_found' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`e2e mock content API on http://127.0.0.1:${port}`);
});
