import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  description: string;
  articleCount: number;
  slug?: string;
}

export default function ArticleCard({
  title,
  description,
  articleCount,
  slug,
}: ArticleCardProps) {
  const content = (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-blue-500 transition-all duration-200 group">
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-dark-muted text-sm mb-4 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-dark-muted">
          See all {articleCount} articles →
        </span>
        <ArrowRight
          size={18}
          className="text-dark-muted group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
        />
      </div>
    </div>
  );

  if (slug) {
    return <Link href={`/docs/${slug}`}>{content}</Link>;
  }

  return content;
}

