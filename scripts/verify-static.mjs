import { access, readFile } from 'node:fs/promises';

const required = [
  '../out/index.html',
  '../out/publications/index.html',
  '../out/grant-support/index.html',
  '../out/images/logo.png',
  '../out/images/hero.jpg',
];

for (const relative of required) await access(new URL(relative, import.meta.url));

const home = await readFile(new URL('../out/index.html', import.meta.url), 'utf8');
const publications = await readFile(new URL('../out/publications/index.html', import.meta.url), 'utf8');
const grantSupport = await readFile(new URL('../out/grant-support/index.html', import.meta.url), 'utf8');

if (!home.includes('Probability, learning, and decisions under uncertainty.')) throw new Error('Homepage headline missing');
if (!publications.includes('Publications')) throw new Error('Publications page missing');
if (!publications.toLowerCase().includes('automatically')) throw new Error('Automation status missing');
if (!grantSupport.includes('Funding &amp; Support')) throw new Error('Funding and support page missing');
if (!grantSupport.includes('2312204') || !grantSupport.includes('FA9550-20-1-0397')) throw new Error('Expected award records missing');

console.log('Static export verification passed.');
