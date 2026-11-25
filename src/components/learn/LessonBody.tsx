import ReactMarkdown from "react-markdown";

/**
 * Renders a lesson's markdown. react-markdown ignores raw HTML by default, so lesson text
 * can never inject markup.
 */
export function LessonBody({ body }: { body: string }) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => <h2 className="mb-2 mt-6 text-lg font-semibold tracking-tight first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-1 mt-4 text-base font-semibold">{children}</h3>,
        p: ({ children }) => <p className="my-3 text-[15px] leading-relaxed text-foreground/90">{children}</p>,
        ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">{children}</ul>,
        ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        a: ({ children }) => <span>{children}</span>,
      }}
    >
      {body}
    </ReactMarkdown>
  );
}

export default LessonBody;
