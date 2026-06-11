"use client";

export function FAQAccordion({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="geo-grid">
      {items.map(([question, answer]) => (
        <details className="content-card" key={question}>
          <summary className="content-card-body"><strong>{question}</strong></summary>
          <p className="content-card-body">{answer}</p>
        </details>
      ))}
    </div>
  );
}
