import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

import { cn } from '@/shared/lib/utils';

const components: Components = {
  h2: ({ children }) => (
    <h2 className="text-foreground mt-6 mb-2 text-lg font-medium tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-foreground mt-5 mb-2 text-base font-medium first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-foreground/90 mt-0 mb-3 text-[15px] leading-relaxed last:mb-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="text-foreground/90 mb-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-foreground/90 mb-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-success bg-success/10 text-foreground my-3 rounded-r-lg border-l-4 py-2 pr-3 pl-3 text-[15px] leading-relaxed">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted mb-3 overflow-x-auto rounded-xl p-3 font-mono text-[13px] leading-relaxed last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return <code className={cn('text-foreground font-mono', className)}>{children}</code>;
    }
    return (
      <code className="bg-success/20 text-success rounded-md px-1.5 py-0.5 font-mono text-[13px]">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-border border-b">{children}</thead>,
  th: ({ children }) => (
    <th className="text-muted-foreground px-2 py-1.5 font-medium">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-border text-foreground/90 border-t px-2 py-1.5">{children}</td>
  ),
};

/** Markdown for insight bodies and activity prompts. */
export function LessonMarkdown({
  children,
  compact = false,
}: {
  children: string;
  compact?: boolean;
}) {
  return (
    <div className={cn(compact && '[&_p]:mb-0')}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </div>
  );
}
