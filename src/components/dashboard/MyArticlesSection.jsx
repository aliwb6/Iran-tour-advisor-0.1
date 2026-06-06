import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';
import { Star, Trash2, PenLine, ChevronRight } from 'lucide-react';
import { useMyArticles } from '@/hooks/useSupabase';
import ArticleEditor from '@/components/articles/ArticleEditor';

const STATUS_LABEL = {
  approved: { label: 'منتشر شده', cls: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  pending:  { label: 'در انتظار بررسی', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  rejected: { label: 'رد شده', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

const WRITING_TIPS = [
  'عنوان جذاب و توصیفی انتخاب کنید.',
  'از تصاویر با کیفیت بالا استفاده کنید.',
  'خلاصه‌ای گیرا بنویسید که خواننده را ترغیب کند.',
];

export default function MyArticlesSection({ user }) {
  const authorType = user?.profile?.role || 'guide';
  const { articles, loading, refetch } = useMyArticles(user?.id);
  const [showEditor, setShowEditor] = useState(false);

  const total     = articles.length;
  const published = articles.filter(a => a.status === 'approved').length;
  const pending   = articles.filter(a => a.status === 'pending').length;
  const rejected  = articles.filter(a => a.status === 'rejected').length;

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این مقاله اطمینان دارید؟')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) { toast.error('خطا در حذف مقاله'); return; }
    toast.success('مقاله حذف شد.');
    refetch();
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <PenLine className="w-5 h-5 text-teal-400" />
          مقالات من
        </h2>
        <button
          onClick={() => setShowEditor(v => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
        >
          {showEditor ? 'بستن فرم' : '+ مقاله جدید'}
        </button>
      </div>

      {/* Inline editor */}
      {showEditor && (
        <ArticleEditor
          userId={user?.id}
          authorType={authorType}
          onSuccess={() => { setShowEditor(false); refetch(); }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'کل مقالات', value: total,     cls: 'text-white' },
          { label: 'منتشر شده', value: published, cls: 'text-teal-400' },
          { label: 'در انتظار', value: pending,   cls: 'text-yellow-400' },
          { label: 'رد شده',    value: rejected,  cls: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Article list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <PenLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>هنوز مقاله‌ای ننوشته‌اید.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => {
            const s = STATUS_LABEL[article.status] || STATUS_LABEL.pending;
            return (
              <div
                key={article.id}
                className="flex gap-4 bg-white/[0.04] border border-white/[0.07] rounded-xl p-4"
              >
                {/* Thumbnail */}
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-20 h-16 object-cover rounded-lg shrink-0 border border-white/10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-16 rounded-lg bg-white/[0.06] shrink-0 flex items-center justify-center text-white/20 border border-white/10">
                    <PenLine className="w-5 h-5" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white truncate flex-1">{article.title_fa}</p>
                    {article.is_featured && (
                      <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0 fill-yellow-400 mt-0.5" />
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  {article.excerpt_fa && (
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{article.excerpt_fa}</p>
                  )}
                  {article.status === 'rejected' && article.admin_note && (
                    <p className="text-xs text-red-400 mt-1">دلیل رد: {article.admin_note}</p>
                  )}
                  <p className="text-[10px] text-white/30 mt-2">
                    {new Date(article.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>

                {/* Delete (pending only) */}
                {article.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="shrink-0 p-2 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    title="حذف مقاله"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Writing tips */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
        <p className="text-xs font-semibold text-teal-400 mb-3 flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5" />
          نکات نویسندگی
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WRITING_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/50">
              <span className="text-teal-500 shrink-0 mt-0.5">◆</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
