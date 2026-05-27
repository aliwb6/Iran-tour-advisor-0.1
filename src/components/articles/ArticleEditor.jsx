import { useState, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n.jsx';
import { Upload, Loader2, X } from 'lucide-react';

const BASE_CATEGORIES = [
  'architecture',
  'history',
  'culture',
  'nature',
  'food',
  'photography',
  'general',
];

const EMPTY = { title_fa: '', excerpt_fa: '', content_fa: '', category: 'general' };

export default function ArticleEditor({ userId, authorType, onSuccess, onCancel }) {
  const { t, dir } = useI18n();
  const isAdmin = authorType === 'admin';

  const categories = BASE_CATEGORIES.map(v => ({ value: v, label: t(`article_cat_${v}`) }));

  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  // image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // custom category state
  const [extraCategories, setExtraCategories] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCatInput, setCustomCatInput] = useState('');

  const allCategories = [...categories, ...extraCategories];

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setShowCustomInput(true);
      setCustomCatInput('');
    } else {
      setForm(f => ({ ...f, category: val }));
      setShowCustomInput(false);
    }
  };

  const confirmCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    if (!allCategories.find(c => c.value === trimmed)) {
      setExtraCategories(prev => [...prev, { value: trimmed, label: trimmed }]);
    }
    setForm(f => ({ ...f, category: trimmed }));
    setShowCustomInput(false);
    setCustomCatInput('');
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `articles/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(data.path);
      return publicUrl;
    } catch {
      toast.error(t('article_img_upload_error'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title_fa.trim()) {
      toast.error(t('article_title_required'));
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) { setSubmitting(false); return; }
      }
      const { error } = await supabase.from('articles').insert({
        slug: `article-${Date.now()}`,
        author_id: userId,
        author_type: authorType,
        image_url: imageUrl,
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
      toast.success(isAdmin ? t('article_published_toast') : t('article_submitted_toast'));
      setForm(EMPTY);
      clearImage();
      setExtraCategories([]);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || t('article_save_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50';

  return (
    <form
      dir={dir}
      onSubmit={handleSubmit}
      className="space-y-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
    >
      <h2 className="text-lg font-semibold text-white">{t('article_editor_title')}</h2>

      {!isAdmin && (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-yellow-300 text-sm">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{t('article_pending_notice')}</span>
        </div>
      )}

      {/* Cover image — file picker */}
      <div className="space-y-2">
        <label className="block text-xs text-white/60 font-medium">{t('article_field_image')}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:border-teal-500/50 transition-colors text-sm disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />}
          {uploading ? t('article_img_uploading') : t('article_img_upload_btn')}
        </button>
        {imagePreview && (
          <div className="relative mt-2">
            <img
              src={imagePreview}
              alt={t('article_img_preview_alt')}
              className="h-40 w-full object-cover rounded-xl border border-white/10"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">
          {t('article_field_title')} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title_fa}
          onChange={set('title_fa')}
          maxLength={120}
          required
          placeholder={t('article_title_placeholder')}
          className={inputCls}
        />
        <p className="text-xs text-white/30 text-end">{form.title_fa.length}/120</p>
      </div>

      {/* Excerpt */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">{t('article_field_excerpt')}</label>
        <textarea
          value={form.excerpt_fa}
          onChange={set('excerpt_fa')}
          maxLength={500}
          rows={2}
          placeholder={t('article_excerpt_placeholder')}
          className={`${inputCls} resize-none`}
        />
        <p className="text-xs text-white/30 text-end">{form.excerpt_fa.length}/500</p>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <label className="block text-xs text-white/60 font-medium">{t('article_field_content')}</label>
        <textarea
          value={form.content_fa}
          onChange={set('content_fa')}
          rows={10}
          placeholder={t('article_content_placeholder')}
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-xs text-white/60 font-medium">{t('article_field_category')}</label>
        <select
          value={showCustomInput ? '__custom__' : form.category}
          onChange={handleCategoryChange}
          className={`${inputCls} appearance-none cursor-pointer`}
        >
          {allCategories.map(c => (
            <option key={c.value} value={c.value} className="bg-zinc-900">{c.label}</option>
          ))}
          <option value="__custom__" className="bg-zinc-900">{t('article_cat_add_new')}</option>
        </select>

        {showCustomInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customCatInput}
              onChange={e => setCustomCatInput(e.target.value)}
              placeholder={t('article_cat_custom_placeholder')}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmCustomCategory(); } }}
              autoFocus
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={confirmCustomCategory}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded-xl transition-colors shrink-0"
            >
              {t('article_cat_confirm')}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          {submitting
            ? t('article_submitting')
            : isAdmin ? t('article_publish') : t('article_submit_for_review')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 bg-white/[0.05] hover:bg-white/[0.09] text-white/70 text-sm py-2.5 rounded-xl transition-colors border border-white/10"
          >
            {t('dashboard_cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
