#!/usr/bin/env node
/**
 * Copies the server settings from .env.local to the Vercel project (Production).
 *
 *   npm run setup:vercel     (logs in to Vercel and links the project if needed)
 *
 * Variables that already exist on Vercel are never overwritten
 * (changing AUTH_SECRET would make the stored data unreadable).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const REQUIRED = ['AUTH_SECRET', 'COACH_PASSWORD'];
const OPTIONAL = ['COACH_EMAIL', 'SYNC_STORE_URL'];
const TARGET = 'production';

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function vercel(args, options = {}) {
  return spawnSync('npx', ['--yes', 'vercel@latest', ...args], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    // Captured calls must never wait for keyboard input.
    stdio: options.input === undefined ? ['ignore', 'pipe', 'pipe'] : 'pipe',
    ...options
  });
}

function readEnvFile(file) {
  if (!existsSync(file)) fail(`${file} not found. Copy .env.example to ${file} and fill it in.`);
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && match[2]) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}

const env = readEnvFile('.env.local');
for (const key of REQUIRED) if (!env[key]) fail(`${key} is missing in .env.local`);
if (env.AUTH_SECRET.length < 16) fail('AUTH_SECRET must be at least 16 characters');

console.log('Checking Vercel login... (the first run downloads the Vercel CLI, this can take 1-2 minutes)');
if (vercel(['whoami']).status !== 0) {
  console.log('Log in to Vercel (a browser window will open)...');
  if (vercel(['login'], { stdio: 'inherit' }).status !== 0) fail('Vercel login failed');
}

if (!existsSync('.vercel/project.json')) {
  console.log('Linking this folder to your Vercel project...');
  if (vercel(['link'], { stdio: 'inherit' }).status !== 0) fail('vercel link failed');
}

console.log('Reading existing Vercel settings...');
const listed = vercel(['env', 'ls', TARGET]);
if (listed.status !== 0) fail(`Could not list Vercel env vars:\n${listed.stderr || listed.stdout}`);
const existing = new Set([...REQUIRED, ...OPTIONAL].filter(key => new RegExp(`\\b${key}\\b`).test(`${listed.stdout}\n${listed.stderr}`)));

let added = 0;
for (const key of [...REQUIRED, ...OPTIONAL]) {
  if (!env[key]) continue;
  if (existing.has(key)) {
    console.log(`• ${key}: already set on Vercel, left unchanged`);
    continue;
  }
  const result = vercel(['env', 'add', key, TARGET], { input: env[key] });
  if (result.status !== 0) fail(`Failed to add ${key}:\n${result.stderr || result.stdout}`);
  console.log(`✔ ${key}: added`);
  added++;
}

console.log(
  added
    ? '\nDone. Redeploy for the new values to take effect (push to GitHub, or run: npx vercel --prod).\n'
    : '\nNothing to add — Vercel already has these settings.\n'
);
