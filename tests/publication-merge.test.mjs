import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseAuthorList, publicationTitleKey } from '../scripts/publication-merge.mjs';

test('title keys treat common LaTeX math formatting as presentation only', () => {
  const arxiv = 'On the First Passage Times of Branching Random Walks in $\\mathbb R^d$';
  const published = 'On the first passage times of branching random walks in Rd';
  assert.equal(publicationTitleKey(arxiv), publicationTitleKey(published));
});

test('a longer author list wins regardless of source', () => {
  const openAlex = { source: 'OpenAlex', authors: ['A', 'B', 'C'] };
  const crossref = { source: 'Crossref', authors: ['A', 'B'] };
  assert.deepEqual(chooseAuthorList(openAlex, crossref), openAlex.authors);
});

test('Crossref wins an equal-length author conflict', () => {
  const openAlex = { source: 'OpenAlex', authors: ['A Wrong', 'B Wrong'] };
  const crossref = { source: 'Crossref', authors: ['A Correct', 'B Correct'] };
  assert.deepEqual(chooseAuthorList(openAlex, crossref), crossref.authors);
});

test('fresh arXiv metadata repairs an equal-length previously merged list', () => {
  const previous = { source: 'OpenAlex + arXiv', authors: ['Jose Blanchet', 'Wrong Name'] };
  const arxiv = { source: 'arXiv', authors: ['Jose Blanchet', 'Correct Name'] };
  assert.deepEqual(chooseAuthorList(previous, arxiv), arxiv.authors);
});
