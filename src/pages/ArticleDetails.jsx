import { useParams, Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { 
  Clock, ArrowRight, ArrowLeft, Calendar, User, Tag
} from 'lucide-react';
import { getArticleBySlug, articles } from '@/data/articles';

export default function ArticleDetails() {
  const { slug } = useParams();
  const { t, lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const article = getArticleBySlug(slug);
  
  if (!article) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-accent hover:underline">{t('view_all')} →</Link>
        </div>
      </div>
    );
  }

  const title = article.title[lang] || article.title.en;
  const excerpt = article.excerpt[lang] || article.excerpt.en;
  const category = article.category[lang] || article.category.en;
  const author = article.author[lang] || article.author.en;
  const tags = article.tags[lang] || article.tags.en;
  const content = article.content[lang] || article.content.en;
  const relatedArticles = articles.filter(a => article.relatedArticles?.includes(a.id)).slice(0, 3);

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img decoding="async" loading="lazy"
          src={article.coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Back button */}
        <Link 
          to="/blog" 
          className="absolute top-24 start-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {t('back_to_home')}
        </Link>

        {/* Content overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category */}
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-white text-sm font-body font-medium mb-4">
                {category}
              </span>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
                {title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-white/70">
                <span className="flex items-center gap-1.5 font-body text-sm">
                  <User className="w-4 h-4" />
                  {author}
                </span>
                <span className="flex items-center gap-1.5 font-body text-sm">
                  <Calendar className="w-4 h-4" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1.5 font-body text-sm">
                  <Clock className="w-4 h-4" />
                  {article.readTime} {t('blog_min_read')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Excerpt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-10"
        >
          <p className="font-body text-xl text-foreground/70 leading-relaxed italic border-s-4 border-accent ps-4">
            {excerpt}
          </p>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="prose prose-lg max-w-none"
        >
          {content.map((block, i) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="font-body text-foreground/80 leading-relaxed mb-6 text-lg">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'heading') {
              return (
                <h2 key={i} className="font-heading text-2xl font-semibold text-foreground mt-10 mb-4">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote key={i} className="border-s-4 border-accent ps-6 my-8">
                  <p className="font-heading text-xl text-foreground/70 italic">
                    "{block.text}"
                  </p>
                </blockquote>
              );
            }
            return null;
          })}
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-border/50"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 rounded-full bg-secondary text-sm font-body text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 pt-10 border-t border-border/50"
          >
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-8">
              {lang === 'fa' ? 'مقالات مرتبط' : lang === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.id} 
                  to={`/blog/${related.slug}`}
                  className="group"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <img decoding="async" loading="lazy" 
                      src={related.coverImage} 
                      alt={related.title[lang] || related.title.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="mb-1">
                    <span className="font-body text-xs text-accent font-medium">
                      {related.category[lang] || related.category.en}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {related.title[lang] || related.title.en}
                  </h3>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}