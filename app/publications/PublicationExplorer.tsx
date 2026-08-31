'use client';

import { useMemo, useState } from 'react';

export type Publication = {
  id: string;
  title: string;
  year: number;
  date: string;
  venue: string;
  type: string;
  doi: string | null;
  url: string;
  authors: string[];
};

export default function PublicationExplorer({ publications }: { publications: Publication[] }) {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('all');
  const years = useMemo(() => [...new Set(publications.map((item) => item.year))].sort((a, b) => b - a), [publications]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return publications.filter((item) => {
      const matchesYear = year === 'all' || item.year === Number(year);
      const haystack = [item.title, item.venue, item.authors.join(' '), item.doi ?? ''].join(' ').toLowerCase();
      return matchesYear && (!needle || haystack.includes(needle));
    });
  }, [publications, query, year]);

  const grouped = useMemo(() => {
    const groups = new Map<number, Publication[]>();
    for (const item of filtered) groups.set(item.year, [...(groups.get(item.year) ?? []), item]);
    return [...groups.entries()].sort(([a], [b]) => b - a);
  }, [filtered]);

  return (
    <>
      <div className="publication-tools">
        <label>
          <span>Search publications</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, author, journal, or DOI" type="search" />
        </label>
        <label>
          <span>Year</span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="all">All years</option>
            {years.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <p className="result-count" aria-live="polite">{filtered.length} publication{filtered.length === 1 ? '' : 's'}</p>

      <div className="publication-groups">
        {grouped.map(([groupYear, items]) => (
          <section className="publication-year-group" key={groupYear} aria-labelledby={`year-${groupYear}`}>
            <h2 id={`year-${groupYear}`}>{groupYear}</h2>
            <div>
              {items.map((item) => (
                <article className="publication-record" key={item.id}>
                  <div>
                    <h3>{item.url ? <a href={item.url}>{item.title}</a> : item.title}</h3>
                    {item.authors.length > 0 && <p className="publication-authors">{item.authors.join(', ')}</p>}
                    <p className="publication-venue">{item.venue || item.type.replaceAll('-', ' ')}</p>
                  </div>
                  <div className="publication-identifiers">
                    {item.doi && <a href={`https://doi.org/${item.doi}`}>DOI <span aria-hidden="true">↗</span></a>}
                    {!item.doi && item.url && <a href={item.url}>View <span aria-hidden="true">↗</span></a>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
