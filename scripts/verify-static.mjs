import { access, readFile } from 'node:fs/promises';

const required = [
  '../out/index.html',
  '../out/labs/index.html',
  '../out/labs/assortment/index.html',
  '../out/labs/assortment/learning/index.html',
  '../out/labs/assortment/robustness/index.html',
  '../out/research/index.html',
  '../out/about/index.html',
  '../out/publications/index.html',
  '../out/grant-support/index.html',
  '../out/images/logo.png',
  '../out/images/hero.jpg',
];

for (const relative of required) await access(new URL(relative, import.meta.url));

const home = await readFile(new URL('../out/index.html', import.meta.url), 'utf8');
const labs = await readFile(new URL('../out/labs/index.html', import.meta.url), 'utf8');
const robustness = await readFile(new URL('../out/labs/assortment/robustness/index.html', import.meta.url), 'utf8');
const research = await readFile(new URL('../out/research/index.html', import.meta.url), 'utf8');
const publications = await readFile(new URL('../out/publications/index.html', import.meta.url), 'utf8');
const grantSupport = await readFile(new URL('../out/grant-support/index.html', import.meta.url), 'utf8');

if (!home.includes('From simulated worlds to reliable decisions in the real one.')) throw new Error('M2W homepage headline missing');
if (!home.includes('Model') || !home.includes('Simulate') || !home.includes('Decide') || !home.includes('Transfer')) throw new Error('M2W loop missing');
if (!labs.includes('Decision Lab 01') || !labs.includes('Decision Lab 02') || !labs.includes('Decision Lab 03')) throw new Error('Decision Lab portfolio incomplete');
if (!robustness.includes('Pay a little now. Protect the decision later.') || !robustness.includes('Next validation')) throw new Error('Decision Lab 03 content incomplete');
if (!research.includes('Six measurable sources of risk')) throw new Error('M2W research framework missing');
if (!publications.includes('Publications')) throw new Error('Publications page missing');
if (!publications.toLowerCase().includes('automatically')) throw new Error('Automation status missing');
if (!grantSupport.includes('Funding &amp; Support')) throw new Error('Funding and support page missing');
if (!grantSupport.includes('2312204') || !grantSupport.includes('FA9550-20-1-0397')) throw new Error('Expected award records missing');

console.log('Static export verification passed.');
