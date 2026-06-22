import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const cssUrl = new URL('../src/styles/main.css', import.meta.url);

const luminance = (hex) => {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

describe('accessibility guardrails', () => {
  it('keeps key light-theme text colors at WCAG AA contrast', async () => {
    const css = await readFile(cssUrl, 'utf8');
    const root = css.match(/:root\s*{([\s\S]*?)}/)[1];
    const token = (name) => root.match(new RegExp(`--${name}:\\s*(#[a-f\\d]{6})`, 'i'))[1];

    assert.ok(contrast(token('ink'), token('bg')) >= 4.5);
    assert.ok(contrast(token('muted'), token('bg')) >= 4.5);
    assert.ok(contrast(token('green'), '#ffffff') >= 4.5);
    assert.ok(contrast(token('amber'), '#ffffff') >= 4.5);
  });

  it('keeps skip navigation and one primary heading on public index pages', async () => {
    const layout = await readFile(new URL('../src/layouts/PublicLayout.jsx', import.meta.url), 'utf8');
    assert.match(layout, /className="skip-link"/);
    assert.match(layout, /id="main-content"/);

    for (const page of ['AboutPage', 'ProjectsPage', 'BlogPage', 'ContactPage', 'PrivacyPage']) {
      const source = await readFile(new URL(`../src/pages/${page}.jsx`, import.meta.url), 'utf8');
      assert.match(source, /<SectionHeader[\s\S]*?as="h1"/);
    }
  });
});
