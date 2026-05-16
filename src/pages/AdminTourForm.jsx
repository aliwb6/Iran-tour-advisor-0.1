import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { Plus, Trash2, Save, Loader2, Upload, X, ImageIcon } from 'lucide-react';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const THEMES = [
  { value: 'nature', icon: '🌿', label: { en: 'Nature & Wildlife', fa: 'طبیعت‌گردی و حیات وحش', ar: 'الطبيعة والحياة البرية' } },
  { value: 'cultural', icon: '🏛️', label: { en: 'Cultural & Historical', fa: 'فرهنگی و تاریخی', ar: 'ثقافي وتاريخي' } },
  { value: 'coastal', icon: '🏖️', label: { en: 'Coastal & Marine', fa: 'ساحلی و دریایی', ar: 'ساحلي وبحري' } },
  { value: 'urban', icon: '🏙️', label: { en: 'Urban & Modern', fa: 'شهری و مدرن', ar: 'حضري وعصري' } },
  { value: 'rural', icon: '🏡', label: { en: 'Rural & Eco', fa: 'روستایی و بوم‌گردی', ar: 'ريفي وبيئي' } },
  { value: 'luxury', icon: '👑', label: { en: 'Luxury & VIP', fa: 'لاکچری و VIP', ar: 'فاخر و VIP' } },
  { value: 'budget', icon: '🎒', label: { en: 'Budget & Backpacking', fa: 'اقتصادی و کوله‌گردی', ar: 'اقتصادي وحقيبة ظهر' } },
];

const PURPOSES = [
  { value: 'leisure', icon: '🌅', label: { en: 'Leisure & Relaxation', fa: 'تفریحی و استراحت', ar: 'ترفيه واسترخاء' } },
  { value: 'adventure', icon: '🧗', label: { en: 'Adventure & Thrill', fa: 'ماجراجویی و هیجان', ar: 'مغامرة وإثارة' } },
  { value: 'religious', icon: '🕌', label: { en: 'Religious & Pilgrimage', fa: 'زیارتی و مذهبی', ar: 'ديني وزيارات' } },
  { value: 'educational', icon: '📚', label: { en: 'Educational & Research', fa: 'آموزشی و پژوهشی', ar: 'تعليمي وبحثي' } },
  { value: 'medical', icon: '🏥', label: { en: 'Medical Tourism', fa: 'سلامت و درمانی', ar: 'سياحة علاجية' } },
  { value: 'business', icon: '💼', label: { en: 'Business & Exhibition', fa: 'تجاری و نمایشگاهی', ar: 'تجاري ومعارض' } },
  { value: 'honeymoon', icon: '💑', label: { en: 'Honeymoon', fa: 'ماه عسل', ar: 'شهر عسل' } },
  { value: 'sports', icon: '⚽', label: { en: 'Sports', fa: 'ورزشی', ar: 'رياضي' } },
  { value: 'photography', icon: '📸', label: { en: 'Photography', fa: 'عکاسی', ar: 'تصوير' } },
  { value: 'architecture', icon: '🏰', label: { en: 'Architecture', fa: 'معماری', ar: 'عمارة' } },
];

const ACCEPT = 'image/jpeg,image/png,image/webp';

async function uploadToStorage(file) {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const { error } = await supabase.storage.from('tour-images').upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('tour-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

function TagGrid({ items, selected, onToggle, lang, customInput, onCustomAdd }) {
  const [customVal, setCustomVal] = useState('');

  const handleAdd = () => {
    const trimmed = customVal.trim();
    if (!trimmed) return;
    onCustomAdd(trimmed);
    setCustomVal('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const active = selected.includes(item.value);
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onToggle(item.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-body transition-all ${
                active
                  ? 'border-accent bg-accent/15 text-accent font-medium'
                  : 'border-border bg-background text-muted-foreground hover:border-accent/50 hover:text-foreground'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label[lang] ?? item.label.en}</span>
            </button>
          );
        })}
        {/* custom tags already added */}
        {selected.filter(v => !items.find(i => i.value === v)).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent bg-accent/15 text-accent text-sm font-body font-medium transition-all"
          >
            <span>✏️</span>
            <span>{v}</span>
          </button>
        ))}
      </div>
      {customInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder={lang === 'fa' ? '+ افزودن موضوع سفارشی...' : lang === 'ar' ? '+ إضافة موضوع مخصص...' : '+ Add custom tag...'}
            className="flex-1 px-3 py-2 rounded-xl border border-dashed border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-body font-medium hover:bg-accent/20 transition-colors border border-accent/30"
          >
            {lang === 'fa' ? 'افزودن' : lang === 'ar' ? 'إضافة' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}

function MainImageUpload({ value, onChange, lang }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    try {
      setProgress(40);
      const url = await uploadToStorage(file);
      setProgress(100);
      onChange(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <label className="block font-body text-sm text-muted-foreground">
        {lang === 'fa' ? 'تصویر اصلی' : lang === 'ar' ? 'الصورة الرئيسية' : 'Main Image'}
      </label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-border aspect-video">
          <img src={value} alt="main" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
            dragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/60 hover:bg-accent/5'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
          <p className="font-body text-sm text-muted-foreground text-center">
            {uploading
              ? (lang === 'fa' ? 'در حال آپلود...' : lang === 'ar' ? 'جارٍ الرفع...' : 'Uploading...')
              : (lang === 'fa' ? 'فایل را بکشید یا کلیک کنید' : lang === 'ar' ? 'اسحب الملف أو انقر' : 'Drag & drop or click to browse')}
          </p>
          <p className="font-body text-xs text-muted-foreground/60">JPG, PNG, WEBP</p>
          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
      {uploading && progress > 0 && (
        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function GalleryUpload({ value, onChange, lang }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(async (files) => {
    const fileArr = Array.from(files).slice(0, 10 - value.length);
    if (fileArr.length === 0) return;

    const tempIds = fileArr.map((_, i) => `tmp-${Date.now()}-${i}`);
    setUploading(() => Object.fromEntries(tempIds.map(id => [id, 0])));

    const results = await Promise.all(fileArr.map(async (file, i) => {
      const id = tempIds[i];
      setUploading(prev => ({ ...prev, [id]: 30 }));
      try {
        const url = await uploadToStorage(file);
        setUploading(prev => ({ ...prev, [id]: 100 }));
        return url;
      } catch {
        setUploading(cur => { const n = { ...cur }; delete n[id]; return n; });
        return null;
      }
    }));

    const uploaded = results.filter(Boolean);
    onChange([...value, ...uploaded]);
    setUploading({});
  }, [value, onChange]);

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const isUploading = Object.keys(uploading).length > 0;
  const remaining = 10 - value.length;

  return (
    <div className="space-y-3">
      <label className="block font-body text-sm text-muted-foreground">
        {lang === 'fa' ? `گالری تصاویر (حداکثر ۱۰ — ${value.length} عکس)` : lang === 'ar' ? `معرض الصور (الحد الأقصى ١٠ — ${value.length} صورة)` : `Gallery Images (max 10 — ${value.length} uploaded)`}
      </label>
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {remaining > 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
            dragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/60 hover:bg-accent/5'
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
          <p className="font-body text-sm text-muted-foreground text-center">
            {isUploading
              ? (lang === 'fa' ? 'در حال آپلود...' : lang === 'ar' ? 'جارٍ الرفع...' : 'Uploading...')
              : (lang === 'fa' ? `تا ${remaining} عکس اضافه کنید` : lang === 'ar' ? `أضف حتى ${remaining} صور` : `Add up to ${remaining} more images`)}
          </p>
          <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>
      )}
      {isUploading && (
        <div className="space-y-1">
          {Object.entries(uploading).map(([id, pct]) => (
            <div key={id} className="w-full h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTourForm() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    header_image: '',
    gallery: [],
    price: '',
    days: 1,
    cities: 1,
    highlights: [''],
    itinerary: [{ day: 1, title: '', description: '' }],
    included: [''],
    not_included: [''],
  });

  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedPurposes, setSelectedPurposes] = useState([]);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleTag = (setter) => (value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const addCustomTag = (setter) => (value) => {
    setter(prev => prev.includes(value) ? prev : [...prev, value]);
  };

  const updateItinerary = (index, field, value) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    updateField('itinerary', updated);
  };

  const addItineraryDay = () => {
    const newDay = formData.itinerary.length + 1;
    updateField('itinerary', [...formData.itinerary, { day: newDay, title: '', description: '' }]);
  };

  const removeItineraryDay = (index) => {
    updateField(
      'itinerary',
      formData.itinerary.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }))
    );
  };

  const updateArrayField = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    updateField(field, updated);
  };

  const addArrayItem = (field) => updateField(field, [...formData[field], '']);
  const removeArrayItem = (field, index) => updateField(field, formData[field].filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        header_image: formData.header_image,
        gallery: formData.gallery,
        price: parseFloat(formData.price) || 0,
        days: parseInt(formData.days) || 1,
        cities: parseInt(formData.cities) || 1,
        highlights: formData.highlights.filter(h => h.trim()),
        itinerary: formData.itinerary
          .filter(i => i.title.trim())
          .map(i => ({ day: parseInt(i.day) || 1, title: i.title, description: i.description })),
        included: formData.included.filter(i => i.trim()),
        not_included: formData.not_included.filter(i => i.trim()),
        theme: selectedThemes,
        purpose: selectedPurposes,
      };

      const { error: supabaseError } = await supabase.from('tours').insert(payload);
      if (supabaseError) throw supabaseError;

      setSuccess(true);
      setTimeout(() => navigate('/tours'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50';
  const sectionClass = 'p-6 rounded-2xl bg-card border border-border/50 space-y-4';
  const labelClass = 'block font-body text-sm text-muted-foreground mb-1';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">
        {lang === 'fa' ? 'ایجاد تور جدید' : lang === 'ar' ? 'إنشاء رحلة جديدة' : 'Create New Tour'}
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 font-body">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-body">
          {lang === 'fa' ? 'تور با موفقیت ذخیره شد!' : lang === 'ar' ? 'تم حفظ الرحلة بنجاح!' : 'Tour saved successfully!'}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'اطلاعات اصلی' : lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'fa' ? 'عنوان' : lang === 'ar' ? 'العنوان' : 'Title'}
              </label>
              <input type="text" value={formData.title} onChange={e => updateField('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                {lang === 'fa' ? 'توضیحات' : lang === 'ar' ? 'الوصف' : 'Description'}
              </label>
              <textarea rows={4} value={formData.description} onChange={e => updateField('description', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
            <MainImageUpload value={formData.header_image} onChange={v => updateField('header_image', v)} lang={lang} />
            <GalleryUpload value={formData.gallery} onChange={v => updateField('gallery', v)} lang={lang} />
          </div>
        </section>

        {/* Theme Tags */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'موضوع تور' : lang === 'ar' ? 'موضوع الرحلة' : 'Tour Theme'}
          </h2>
          <p className="font-body text-sm text-muted-foreground -mt-2">
            {lang === 'fa' ? 'می‌توانید چند گزینه را انتخاب کنید' : lang === 'ar' ? 'يمكنك تحديد خيارات متعددة' : 'You can select multiple options'}
          </p>
          <TagGrid
            items={THEMES}
            selected={selectedThemes}
            onToggle={toggleTag(setSelectedThemes)}
            lang={lang}
            customInput
            onCustomAdd={addCustomTag(setSelectedThemes)}
          />
        </section>

        {/* Purpose Tags */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'هدف سفر' : lang === 'ar' ? 'غرض الرحلة' : 'Tour Purpose'}
          </h2>
          <p className="font-body text-sm text-muted-foreground -mt-2">
            {lang === 'fa' ? 'می‌توانید چند گزینه را انتخاب کنید' : lang === 'ar' ? 'يمكنك تحديد خيارات متعددة' : 'You can select multiple options'}
          </p>
          <TagGrid
            items={PURPOSES}
            selected={selectedPurposes}
            onToggle={toggleTag(setSelectedPurposes)}
            lang={lang}
            customInput
            onCustomAdd={addCustomTag(setSelectedPurposes)}
          />
        </section>

        {/* Tour Details */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'جزئیات تور' : lang === 'ar' ? 'تفاصيل الرحلة' : 'Tour Details'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{lang === 'fa' ? 'قیمت ($)' : lang === 'ar' ? 'السعر ($)' : 'Price ($)'}</label>
              <input type="number" value={formData.price} onChange={e => updateField('price', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{lang === 'fa' ? 'تعداد روزها' : lang === 'ar' ? 'عدد الأيام' : 'Days'}</label>
              <select value={formData.days} onChange={e => updateField('days', e.target.value)} className={inputClass}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{lang === 'fa' ? 'تعداد شهرها' : lang === 'ar' ? 'عدد المدن' : 'Cities'}</label>
              <input type="number" min={1} value={formData.cities} onChange={e => updateField('cities', e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Itinerary */}
        <section className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {lang === 'fa' ? 'برنامه سفر (روز به روز)' : lang === 'ar' ? 'خط الرحلة (يوم بيوم)' : 'Itinerary (Day by Day)'}
            </h2>
            <button
              onClick={addItineraryDay}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {lang === 'fa' ? 'افزودن روز' : lang === 'ar' ? 'إضافة يوم' : 'Add Day'}
            </button>
          </div>
          <div className="space-y-4">
            {formData.itinerary.map((day, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-background space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-lg font-semibold text-accent">
                    {lang === 'fa' ? 'روز' : lang === 'ar' ? 'يوم' : 'Day'} {day.day}
                  </span>
                  <button onClick={() => removeItineraryDay(i)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={lang === 'fa' ? 'عنوان روز' : lang === 'ar' ? 'عنوان اليوم' : 'Day Title'}
                  value={day.title}
                  onChange={e => updateItinerary(i, 'title', e.target.value)}
                  className={inputClass}
                />
                <textarea
                  rows={3}
                  placeholder={lang === 'fa' ? 'توضیحات روز' : lang === 'ar' ? 'وصف اليوم' : 'Day Description'}
                  value={day.description}
                  onChange={e => updateItinerary(i, 'description', e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'نکات برجسته' : lang === 'ar' ? 'المميزات' : 'Highlights'}
          </h2>
          <div className="space-y-3">
            {formData.highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={h} onChange={e => updateArrayField('highlights', i, e.target.value)} className={`flex-1 ${inputClass}`} placeholder={lang === 'fa' ? 'مورد را وارد کنید' : lang === 'ar' ? 'أدخل العنصر' : 'Enter item'} />
                <button onClick={() => removeArrayItem('highlights', i)} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('highlights')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-accent text-accent text-sm font-body hover:bg-accent/10 transition-colors">
              <Plus className="w-4 h-4" />
              {lang === 'fa' ? 'افزودن مورد' : lang === 'ar' ? 'إضافة عنصر' : 'Add Item'}
            </button>
          </div>
        </section>

        {/* Included */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'شامل' : lang === 'ar' ? 'مشمول' : 'Included'}
          </h2>
          <div className="space-y-3">
            {formData.included.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={item} onChange={e => updateArrayField('included', i, e.target.value)} className={`flex-1 ${inputClass}`} placeholder={lang === 'fa' ? 'مورد را وارد کنید' : lang === 'ar' ? 'أدخل العنصر' : 'Enter item'} />
                <button onClick={() => removeArrayItem('included', i)} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('included')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-accent text-accent text-sm font-body hover:bg-accent/10 transition-colors">
              <Plus className="w-4 h-4" />
              {lang === 'fa' ? 'افزودن مورد' : lang === 'ar' ? 'إضافة عنصر' : 'Add Item'}
            </button>
          </div>
        </section>

        {/* Not Included */}
        <section className={sectionClass}>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {lang === 'fa' ? 'شامل نیست' : lang === 'ar' ? 'غير مشمول' : 'Not Included'}
          </h2>
          <div className="space-y-3">
            {formData.not_included.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={item} onChange={e => updateArrayField('not_included', i, e.target.value)} className={`flex-1 ${inputClass}`} placeholder={lang === 'fa' ? 'مورد را وارد کنید' : lang === 'ar' ? 'أدخل العنصر' : 'Enter item'} />
                <button onClick={() => removeArrayItem('not_included', i)} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('not_included')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-accent text-accent text-sm font-body hover:bg-accent/10 transition-colors">
              <Plus className="w-4 h-4" />
              {lang === 'fa' ? 'افزودن مورد' : lang === 'ar' ? 'إضافة عنصر' : 'Add Item'}
            </button>
          </div>
        </section>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving
            ? (lang === 'fa' ? 'در حال ذخیره...' : lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
            : (lang === 'fa' ? 'ذخیره تور' : lang === 'ar' ? 'حفظ الرحلة' : 'Save Tour')}
        </button>
      </div>
    </div>
  );
}
