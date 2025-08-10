import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type InputArticle = {
  id?: string;
  title?: string;
  content?: string;
  source?: string;
  url?: string;
  publishedAt?: string;
  author?: string;
};

export type EnrichedArticle = Required<Pick<InputArticle,"title">> & {
  url?: string;
  source?: string;
  text: string;   // cleaned full text
};

const UA = "ArticleSynthesisAI/1.0 (+replit)";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html,application/xhtml+xml" } });
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  return await res.text();
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
}

export async function extractArticleText(url: string): Promise<{ title: string; text: string } | null> {
  try {
    const html = await fetchHtml(url);
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;
    const reader = new Readability(doc);
    const parsed = reader.parse();
    const title = parsed?.title || doc.title || "";
    const text = clean(parsed?.textContent || "");
    if (!text) return null;
    return { title, text };
  } catch {
    return null;
  }
}

function dedupeByUrl<T extends { url?: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const a of arr) {
    const u = (a.url || "").split("#")[0];
    if (u && seen.has(u)) continue;
    if (u) seen.add(u);
    out.push(a);
  }
  return out;
}

export async function enrichArticles(raw: InputArticle[]): Promise<EnrichedArticle[]> {
  const deduped = dedupeByUrl(raw);
  const out: EnrichedArticle[] = [];
  for (const a of deduped) {
    let title = a.title?.trim() || "";
    let text = (a.content || "").trim();

    const contentLooksThin = !text || text.length < 500;
    if (a.url && contentLooksThin) {
      const extracted = await extractArticleText(a.url);
      if (extracted) {
        title ||= extracted.title;
        text = extracted.text;
      }
    }

    // final clean + guardrails
    title = title.slice(0, 200);
    text = clean(text).slice(0, 18000); // ~18k chars cap to avoid blowing context

    // drop hopeless sources
    if (!text || text.split(" ").length < 80) continue;

    out.push({ title: title || "Untitled", text, url: a.url, source: a.source });
  }
  return out;
}