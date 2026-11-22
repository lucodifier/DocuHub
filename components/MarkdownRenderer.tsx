'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import MermaidBlock from './MermaidBlock';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content max-w-4xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }], rehypeRaw]}
        components={{
          pre(props) {
            const child = React.Children.toArray(props.children)[0] as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
            if (child?.props?.className?.includes('language-mermaid')) {
              const code = String(child.props.children ?? '').replace(/\n$/, '');
              return <MermaidBlock code={code} />;
            }
            return <pre {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
