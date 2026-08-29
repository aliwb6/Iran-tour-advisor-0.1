import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'architecture', label: 'معماری' },
  { value: 'history',      label: 'تاریخ' },
  { value: 'culture',      label: 'فرهنگ' },
  { value: 'nature',       label: 'طبیعت' },
  { value: 'food',         label: 'غذا' },
  { value: 'photography',  label: 'عکاسی' },
  { value: 'general',      label: 'عمومی' },
];

const EMPTY = { image_url: '', title_fa: '', excerpt_fa: '', content_fa: '', category: 'general' };

export default function ArticleEditor({ userId, authorType, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = authorType === 'admin';

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title_fa.trim()) {
      toast.error('عنوان مقاله الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const slug = `article-${Date.now()}`;
      const { error } = await supabase.from('articles').insert({
        slug,
        author_id: userId,
        author_type: authorType,
        image_url: form.image_url.trim() || null,
        title_fa: form.title_fa.trim(),
        title_en: form.title_fa.trim(),
        excerpt_fa: form.excerpt_fa.trim(),
        excerpt_en: form.excerpt_fa.trim(),
        content_fa: form.content_fa.trim(),
        content_en: form.content_fa.trim(),
        category: form.category,
        status: isAdmin ? 'approved' : 'pending',
        is_featured: false,
        is_published: isAdmin,
      });
      if (error) throw error;
      toast.success(isAdmin ? 'مقاله منتشر شد.' : 'مقاله ارسال شد و در انتظار بررسی است.');
      setForm(EMPTY);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'خطا در ذخیره مقاله');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      dir="rtl"
      onSubmit={handleSubmit}
      className="space-y-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
    >
      <h2 className="text-lg font-semibold text-white">مقاله جدید</h2>

      {!isAdmin && (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-yellow-300 text-sm">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>مقاله شما پس از بررسی ادمین منتشر می‌شود.</span>
        </div>
      )}

      {/* Image URL + preview */}
      <div className="space-y-2">
        <label className="block text-xs text-white/60 font-medium">آدرس تصویر (URL)</label>
        <input
          type="url"
          value={form.image_url}
          onChange={set('image_url')}
          placeholder="https://..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50"
        />
        {form.image_url && (
          <img decoding="async" loading="lazy"
            src={form.image_url}
            alt="پیش‌نمایش"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="mt-2 h-40 w-full object-cover rounded-xl border border-white/10"
          />
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">
          عنوان مقاله <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title_fa}
          onChange={set('title_fa')}
          maxLength={120}
          required
          placeholder="عنوان جذاب برای مقاله..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50"
        />
        <p className="text-xs text-white/30 text-left">{form.title_fa.length}/120</p>
      </div>

      {/* Excerpt */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">خلاصه</label>
        <textarea
          value={form.excerpt_fa}
          onChange={set('excerpt_fa')}
          maxLength={500}
          rows={2}
          placeholder="یک یا دو جمله درباره مقاله..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 resize-none"
        />
        <p className="text-xs text-white/30 text-left">{form.excerpt_fa.length}/500</p>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">متن کامل</label>
        <textarea
          value={form.content_fa}
          onChange={set('content_fa')}
          rows={10}
          placeholder="متن کامل مقاله را اینجا بنویسید..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 resize-y"
        />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">دسته‌بندی</label>
        <select
          value={form.category}
          onChange={set('category')}
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value} className="bg-zinc-900">
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          {submitting ? 'در حال ارسال...' : isAdmin ? 'انتشار مقاله' : 'ارسال برای بررسی'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 bg-white/[0.05] hover:bg-white/[0.09] text-white/70 text-sm py-2.5 rounded-xl transition-colors border border-white/10"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
