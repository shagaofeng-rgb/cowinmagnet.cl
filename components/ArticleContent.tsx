import type { ReactNode } from "react";

const internalSectionHeadings = new Set([
  "seo meta",
  "primary keyword",
  "search intent",
  "target country",
  "target buyer",
  "suggested cta",
  "cms checklist"
]);

const internalFieldPattern = /^(SEO Title|Meta Description|URL Slug|Primary Keyword|Secondary Keywords|Search Intent|Target Country|Target Buyer|Suggested CTA):/i;
const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const strongPattern = /\*\*([^*]+)\*\*/g;

function safeHref(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function renderStrong(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(strongPattern)) {
    if (match.index! > lastIndex) nodes.push(value.slice(lastIndex, match.index));
    nodes.push(<strong key={`${keyPrefix}-strong-${match.index}`}>{match[1]}</strong>);
    lastIndex = match.index! + match[0].length;
  }

  if (lastIndex < value.length) nodes.push(value.slice(lastIndex));
  return nodes.length ? nodes : [value];
}

function renderInline(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(linkPattern)) {
    if (match.index! > lastIndex) nodes.push(...renderStrong(value.slice(lastIndex, match.index), `${keyPrefix}-text-${match.index}`));
    const href = safeHref(match[2]);
    if (href) {
      nodes.push(
        <a key={`${keyPrefix}-link-${match.index}`} href={href} target="_blank" rel="nofollow noopener noreferrer">
          {renderStrong(match[1], `${keyPrefix}-link-label-${match.index}`)}
        </a>
      );
    } else {
      nodes.push(...renderStrong(match[0], `${keyPrefix}-unsafe-${match.index}`));
    }
    lastIndex = match.index! + match[0].length;
  }

  if (lastIndex < value.length) nodes.push(...renderStrong(value.slice(lastIndex), `${keyPrefix}-tail`));
  return nodes.length ? nodes : [value];
}

function visibleBlocks(body: string) {
  const blocks = body.replace(/```[\s\S]*?```/g, "").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const visible: string[] = [];
  let hideSection = false;

  for (const block of blocks) {
    if (block.startsWith("## ")) {
      hideSection = internalSectionHeadings.has(block.slice(3).trim().toLowerCase());
      if (hideSection) continue;
    }
    if (!hideSection && !internalFieldPattern.test(block)) visible.push(block);
  }
  return visible;
}

function listItems(block: string, ordered: boolean) {
  const expression = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
  return block.split("\n").map((line) => line.match(expression)?.[1]).filter((item): item is string => Boolean(item));
}

export function ArticleContent({ body }: { body: string }) {
  return visibleBlocks(body).map((block, index) => {
    if (block.startsWith("### ")) return <h3 key={`heading-3-${index}`}>{renderInline(block.slice(4), `heading-3-${index}`)}</h3>;
    if (block.startsWith("## ")) return <h2 key={`heading-2-${index}`}>{renderInline(block.slice(3), `heading-2-${index}`)}</h2>;

    const unorderedItems = listItems(block, false);
    if (unorderedItems.length) {
      return <ul key={`unordered-${index}`}>{unorderedItems.map((item, itemIndex) => <li key={`item-${itemIndex}`}>{renderInline(item, `unordered-${index}-${itemIndex}`)}</li>)}</ul>;
    }

    const orderedItems = listItems(block, true);
    if (orderedItems.length) {
      return <ol key={`ordered-${index}`}>{orderedItems.map((item, itemIndex) => <li key={`item-${itemIndex}`}>{renderInline(item, `ordered-${index}-${itemIndex}`)}</li>)}</ol>;
    }

    return <p key={`paragraph-${index}`}>{renderInline(block.replace(/\n+/g, " "), `paragraph-${index}`)}</p>;
  });
}
