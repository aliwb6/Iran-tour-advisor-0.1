#!/usr/bin/env node
/**
 * Auto-translation script: finds missing keys in fa/ar vs en,
 * calls Claude API to translate them, and prints a summary.
 *
 * Usage: node scripts/translate.js
 * Requires: ANTHROPIC_API_KEY env var
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const I18N_PATH = path.join(__dirname, '..', 'src', 'lib', 'i18n.jsx');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractTranslations(source) {
  const result = { en: {}, fa: {}, ar: {} };
  const langs = ['en', 'fa', 'ar'];

  for (const lang of langs) {
    const langRegex = new RegExp(`${lang}:\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`, 's');
    const langMatch = source.match(langRegex);
    if (!langMatch) continue;

    const block = langMatch[1];
    const keyValRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*"((?:[^"\\]|\\.)*)"/gm;
    let m;
    while ((m = keyValRegex.exec(block)) !== null) {
      result[lang][m[1]] = m[2];
    }
  }

  return result;
}

function findMissingKeys(translations) {
  const enKeys = Object.keys(translations.en);
  const missing = { fa: [], ar: [] };

  for (const key of enKeys) {
    if (!translations.fa[key]) missing.fa.push(key);
    if (!translations.ar[key]) missing.ar.push(key);
  }

  return missing;
}

async function translateKeys(keysToTranslate, targetLang) {
  if (keysToTranslate.length === 0) return {};

  const langName = targetLang === 'fa' ? 'Persian (Farsi)' : 'Arabic';
  const entries = keysToTranslate.map(({ key, value }) => `${key}: "${value}"`).join('\n');

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Translate the following UI strings from English to ${langName} for an Iran travel advisor app.
Return ONLY a JSON object with the same keys and translated values. No explanation.

${entries}`,
      },
    ],
  });

  const responseText = message.content[0].text.trim();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Unexpected response format:\n${responseText}`);

  return JSON.parse(jsonMatch[0]);
}

async function main() {
  console.log('Reading i18n.jsx...');
  const source = fs.readFileSync(I18N_PATH, 'utf8');
  const translations = extractTranslations(source);

  const enCount = Object.keys(translations.en).length;
  const faCount = Object.keys(translations.fa).length;
  const arCount = Object.keys(translations.ar).length;

  console.log(`\nKey counts: en=${enCount}, fa=${faCount}, ar=${arCount}`);

  const missing = findMissingKeys(translations);
  console.log(`Missing: fa=${missing.fa.length}, ar=${missing.ar.length}`);

  if (missing.fa.length === 0 && missing.ar.length === 0) {
    console.log('\nAll keys are already translated!');
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\nError: ANTHROPIC_API_KEY environment variable is not set.');
    console.log('\nMissing Persian keys:', missing.fa);
    console.log('Missing Arabic keys:', missing.ar);
    process.exit(1);
  }

  let updatedSource = source;

  for (const lang of ['fa', 'ar']) {
    if (missing[lang].length === 0) continue;

    const langName = lang === 'fa' ? 'Persian' : 'Arabic';
    console.log(`\nTranslating ${missing[lang].length} keys to ${langName}...`);

    const keysToTranslate = missing[lang].map(key => ({
      key,
      value: translations.en[key],
    }));

    const translated = await translateKeys(keysToTranslate, lang);
    console.log(`Received ${Object.keys(translated).length} translations.`);

    // Insert translated keys before the closing `},` or `}` of the language block
    const langEndRegex = lang === 'ar'
      ? /(testimonials_subtitle:\s*"[^"]*",?\s*\n)(\s*\})/
      : new RegExp(`(testimonials_subtitle:\\s*"[^"]*",?\\s*\\n)(\\s*\\},)`);

    const newEntries = Object.entries(translated)
      .map(([k, v]) => `    ${k}: "${v}",`)
      .join('\n');

    // Find insertion point: after the last key in this language section
    const marker = lang === 'ar'
      ? 'استمع لمن عاشوا سحر إيران'
      : lang === 'fa'
        ? 'از کسانی بشنوید که جادوی ایران را تجربه کرده‌اند'
        : '';

    const markerIdx = updatedSource.indexOf(marker);
    if (markerIdx === -1) {
      console.warn(`Could not find marker for ${lang}, skipping insertion.`);
      continue;
    }

    // Find the end of that line and the closing brace
    const lineEnd = updatedSource.indexOf('\n', markerIdx);
    const insertPoint = lineEnd + 1;
    updatedSource = updatedSource.slice(0, insertPoint) + newEntries + '\n' + updatedSource.slice(insertPoint);

    console.log(`Inserted ${Object.keys(translated).length} ${langName} keys.`);
  }

  fs.writeFileSync(I18N_PATH, updatedSource, 'utf8');
  console.log('\nDone! i18n.jsx updated successfully.');
  console.log('\nSummary:');
  console.log(`  fa: +${missing.fa.length} keys added`);
  console.log(`  ar: +${missing.ar.length} keys added`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
