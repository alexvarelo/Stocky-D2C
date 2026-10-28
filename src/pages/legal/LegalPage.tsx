import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StockyLogo } from "@/components/brand/StockyLogo";
import NotFound from "@/pages/NotFound";
import { LEGAL_DOCS, TERMS_VERSION, type LegalDocId } from "./legalContent";

const NAV: { id: LegalDocId; label: string }[] = [
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
  { id: "disclaimer", label: "Not investment advice" },
];

export function LegalPage() {
  const { doc } = useParams<{ doc: string }>();
  const content = doc && doc in LEGAL_DOCS ? LEGAL_DOCS[doc as LegalDocId] : null;

  useEffect(() => {
    if (content) document.title = `${content.title} · Stockfolio`;
  }, [content]);

  if (!content) return <NotFound />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <StockyLogo variant="mark" size={24} />
            <span className="font-semibold">Stockfolio</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Legal documents" className="mb-8 flex flex-wrap gap-2">
          {NAV.map((item) => (
            <Link
              key={item.id}
              to={`/legal/${item.id}`}
              aria-current={item.id === doc ? "page" : undefined}
              className={
                item.id === doc
                  ? "rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                  : "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article className="space-y-8 text-[15px] leading-7 text-foreground/90 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-foreground [&_li]:mt-1.5 [&_p+p]:mt-3 [&_p+ul]:mt-2 [&_ul+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{content.title}</h1>
            <p className="text-lg text-muted-foreground">{content.summary}</p>
          </header>
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
              {section.body}
            </section>
          ))}
          <p className="text-sm text-muted-foreground">Last updated: {TERMS_VERSION}</p>
        </article>
      </main>
    </div>
  );
}
