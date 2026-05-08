import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { articles } from '@/data/articles';

export default function Blog() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const posts = articles;

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {t('blog_title')}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg">
            {t('blog_subtitle')}
          </p>
        </motion.div>

        {/* Featured Post */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => navigate(`/blog/${posts[0].slug}`)}
          className="group grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 cursor-pointer"
        >
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <img
              src={posts[0].coverImage}
              alt={posts[0].title[lang] || posts[0].title.en}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-body text-xs font-medium text-accent uppercase tracking-wider mb-3">
              {posts[0].category[lang] || posts[0].category.en}
            </span>
            <h2 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-4 group-hover:text-accent transition-colors">
              {posts[0].title[lang] || posts[0].title.en}
            </h2>
            <p className="font-body text-foreground/70 leading-relaxed mb-6">
              {posts[0].excerpt[lang] || posts[0].excerpt.en}
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {posts[0].readTime} {t('blog_min_read')}
              </span>
              <span className="flex items-center gap-1.5 font-body text-sm text-accent font-medium">
                {t('blog_read_more')}
                <Arrow className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.article>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <img
                  src={post.coverImage}
                  alt={post.title[lang] || post.title.en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="font-body text-xs font-medium text-accent uppercase tracking-wider">
                {post.category[lang] || post.category.en}
              </span>
              <h3 className="font-heading text-xl font-medium text-foreground mt-2 mb-2 group-hover:text-accent transition-colors">
                {post.title[lang] || post.title.en}
              </h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed mb-3">
                {post.excerpt[lang] || post.excerpt.en}
              </p>
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {post.readTime} {t('blog_min_read')}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}