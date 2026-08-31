import { access, readFile } from 'node:fs/promises';

const required = [
  '../out/index.html',
  '../out/publications/index.html',
  '../out/images/logo.png',
  '../out/images/hero.jpg',
];

for (const relative of required) await access(new URL(relative, import.meta.url));

const home = await readFile(new URL('../out/index.html', import.meta.url), 'utf8');
const publications = await readFile(new URL('../out/publications/index.html', import.meta.url), 'utf8');

if (!home.includes('Probability, learning, and decisions under uncertainty.')) throw new Error('Homepage headline missing');
if (!publications.includes('Publications')) throw new Error('Publications page missing');
if (!publications.toLowerCase().includes('automatically')) throw new Error('Automation status missing');

console.log('Static export verification passed.');
