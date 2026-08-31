import { describe, expect, it } from 'vitest';

import { assertYamlQuotes, lintYamlQuotes } from '../../tools/content-compiler/lint-yaml-quotes';

describe('lintYamlQuotes', () => {
  it('flags unquoted null and ~', () => {
    const issues = lintYamlQuotes(`id: ok
explain: null
prompt: ~
`);
    expect(issues.map((i) => i.raw)).toEqual(['null', '~']);
    expect(issues[0]?.line).toBe(2);
  });

  it('flags empty mapping {}', () => {
    const issues = lintYamlQuotes(`hints: {}
meta: { }
`);
    expect(issues).toHaveLength(2);
    expect(issues.every((i) => i.raw === '{}')).toBe(true);
  });

  it('allows quoted null and real content', () => {
    const issues = lintYamlQuotes(`explain: "null"
prompt: what is null?
correct: true
options: []
`);
    expect(issues).toEqual([]);
  });

  it('ignores comments and blank lines', () => {
    expect(lintYamlQuotes(`# explain: null\n\nid: a\n`)).toEqual([]);
  });

  it('assertYamlQuotes throws with path and line', () => {
    expect(() => assertYamlQuotes('explain: null\n', 'demo.yaml')).toThrow(/demo\.yaml:1:/);
  });
});
