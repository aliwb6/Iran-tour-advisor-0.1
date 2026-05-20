import { useRef, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';

export const THEMES = [
  { value: 'nature',    en: 'Nature & Wildlife 🌿',        fa: 'طبیعت‌گردی و حیات وحش 🌿', ar: 'الطبيعة والحياة البرية 🌿' },
  { value: 'cultural',  en: 'Cultural & Historical 🏛️',    fa: 'فرهنگی و تاریخی 🏛️',       ar: 'ثقافي وتاريخي 🏛️' },
  { value: 'coastal',   en: 'Coastal & Marine 🏖️',         fa: 'ساحلی و دریایی 🏖️',        ar: 'ساحلي وبحري 🏖️' },
  { value: 'urban',     en: 'Urban & Modern 🏙️',           fa: 'شهری و مدرن 🏙️',           ar: 'حضري وعصري 🏙️' },
  { value: 'rural',     en: 'Rural & Eco 🏡',              fa: 'روستایی و بوم‌گردی 🏡',     ar: 'ريفي وبيئي 🏡' },
  { value: 'luxury',    en: 'Luxury & VIP 👑',             fa: 'لاکچری و VIP 👑',           ar: 'فاخر و VIP 👑' },
  { value: 'budget',    en: 'Budget & Backpacking 🎒',     fa: 'اقتصادی و کوله‌گردی 🎒',   ar: 'اقتصادي وحقيبة ظهر 🎒' },
];

export const PURPOSES = [
  { value: 'leisure',      en: 'Leisure & Relaxation 🌅',    fa: 'تفریحی و استراحت 🌅',      ar: 'ترفيه واسترخاء 🌅' },
  { value: 'adventure',    en: 'Adventure & Thrill 🧗',       fa: 'ماجراجویی و هیجان 🧗',     ar: 'مغامرة وإثارة 🧗' },
  { value: 'religious',    en: 'Religious & Pilgrimage 🕌',   fa: 'زیارتی و مذهبی 🕌',        ar: 'ديني وزيارات 🕌' },
  { value: 'educational',  en: 'Educational & Research 📚',   fa: 'آموزشی و پژوهشی 📚',       ar: 'تعليمي وبحثي 📚' },
  { value: 'medical',      en: 'Medical Tourism 🏥',          fa: 'سلامت و درمانی 🏥',         ar: 'سياحة علاجية 🏥' },
  { value: 'business',     en: 'Business & Exhibition 💼',    fa: 'تجاری و نمایشگاهی 💼',     ar: 'تجاري ومعارض 💼' },
  { value: 'honeymoon',    en: 'Honeymoon 💑',                fa: 'ماه عسل 💑',                ar: 'شهر عسل 💑' },
  { value: 'sports',       en: 'Sports ⚽',                   fa: 'ورزشی ⚽',                  ar: 'رياضي ⚽' },
  { value: 'photography',  en: 'Photography 📸',              fa: 'عکاسی 📸',                  ar: 'تصوير 📸' },
  { value: 'architecture', en: 'Architecture 🏰',             fa: 'معماری 🏰',                 ar: 'عمارة 🏰' },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy',        en: 'Easy',        fa: 'آسان',   ar: 'سهل' },
  { value: 'moderate',    en: 'Moderate',    fa: 'متوسط',  ar: 'متوسط' },
  { value: 'challenging', en: 'Challenging', fa: 'دشوار',  ar: 'صعب' },
];

export const EMPTY_TOUR = {
  title: '', slug: '', description: '', duration: '', price: '',
  location: '', city: '', cities: '', purpose: '', theme: '',
  highlights: '', itinerary: '', included: '', excluded: '',
  image_url: '', gallery: '', status: 'draft', difficulty: '',
};

export default function TourForm({ editing, onDone, onCancel, isPlatform = false }) {
  const { t, lang } = useI18n();
  const fileRef    = useRef(null);
  const galleryRef = useRef(null);

  const initialStatus = isPlatform ? 'published' : 'draft';

  const [form, setForm] = useState(() => {
    if (!editing) return { ...EMPTY_TOUR, status: initialStatus };
    return {
      title:       editing.title || '',
      slug:        editing.slug || '',
      description: editing.description || '',
      duration:    editing.duration != null ? String(editing.duration) : '',
      price:       editing.price != null ? String(editing.price) : '',
      location:    editing.location || '',
      city:        editing.city || '',
      cities:      Array.isArray(editing.cities) ? editing.cities.join(', ') : (editing.cities || ''),
      highlights:  Array.isArray(editing.highlights) ? editing.highlights.join('\n') : (editing.highlights || ''),
      itinerary:   editing.itinerary || '',
      included:    Array.isArray(editing.included) ? editing.included.join('\n') : (editing.included || ''),
      excluded:    Array.isArray(editing.excluded) ? editing.excluded.join('\n') : (editing.excluded || ''),
      status:      editing.status || initialStatus,
      difficulty:  editing.difficulty || '',
    };
  });

  const [selectedThemes, setSelectedThemes] = useState(() => {
    if (!editing) return [];
    if (Array.isArray(editing.theme)) return editing.theme;
    return editing.theme ? [editing.theme] : [];
  });
  const [selectedPurposes, setSelectedPurposes] = useState(() => {
    if (!editing) return [];
    if (Array.isArray(editing.purpose)) return editing.purpose;
    return editing.purpose ? [editing.purpose] : [];
  });

  const [imageUrl,     setImageUrl]     = useState(editing?.image_url || '');
  const [galleryUrls,  setGalleryUrls]  = useState(() => {
    if (!editing) return [];
    if (Array.isArray(editing.gallery)) return editing.gallery;
    return editing.gallery ? editing.gallery.split(',').map(s => s.trim()).filter(Boolean) : [];
  });
  const [uploadingMain,    setUploadingMain]    = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [customTheme,   setCustomTheme]   = useState('');
  const [customPurpose, setCustomPurpose] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title') {
        updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return updated;
    });
  };

  const toggleTheme   = (v) => setSelectedThemes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const togglePurpose = (v) => setSelectedPurposes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const addCustomTheme = () => {
    const v = customTheme.trim();
    if (v) { setSelectedThemes(p => p.includes(v) ? p : [...p, v]); setCustomTheme(''); }
  };
  const addCustomPurpose = () => {
    const v = customPurpose.trim();
    if (v) { setSelectedPurposes(p => p.includes(v) ? p : [...p, v]); setCustomPurpose(''); }
  };

  const uploadFile = async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { error: uploadErr } = await supabase.storage.from('tour-images').upload(fileName, file);
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingMain(true);
    try { setImageUrl(await uploadFile(file)); }
    catch (err) { setError(err.message); }
    finally { setUploadingMain(false); }
  };

  const handleGalleryUpload = async (files) => {
    const arr = Array.from(files).slice(0, 10 - galleryUrls.length);
    if (!arr.length) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(arr.map(uploadFile));
      setGalleryUrls(prev => [...prev, ...urls.filter(Boolean)]);
    } catch (err) { setError(err.message); }
    finally { setUploadingGallery(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.difficulty) {
      setError(
        lang === 'fa' ? 'لطفاً سطح دشواری را انتخاب کنید.'
        : lang === 'ar' ? 'يرجى اختيار مستوى الصعوبة.'
        : 'Please select a difficulty level.'
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title:       form.title,
        slug:        form.slug,
        description: form.description,
        duration:    form.duration ? Number(form.duration) : null,
        price:       form.price ? Number(form.price) : null,
        location:    form.location,
        city:        form.city,
        cities:      form.cities.split(',').map(s => s.trim()).filter(Boolean),
        theme:       selectedThemes,
        purpose:     selectedPurposes,
        difficulty:  form.difficulty,
        highlights:  form.highlights.split('\n').filter(Boolean),
        itinerary:   form.itinerary,
        included:    form.included.split('\n').filter(Boolean),
        excluded:    form.excluded.split('\n').filter(Boolean),
        image_url:   imageUrl,
        gallery:     galleryUrls,
        status:      form.status,
      };

      if (editing) {
        const updatePayload = isPlatform
          ? { ...payload, status: 'published', owner_id: null, is_platform_tour: true }
          : payload;
        const { data: updated, error: err } = await supabase
          .from('tours').update(updatePayload).eq('id', editing.id).select().single();
        if (err) throw err;
        onDone(updated, false);
      } else {
        let insertPayload;
        if (isPlatform) {
          insertPayload = { ...payload, status: 'published', owner_id: null, is_platform_tour: true };
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          insertPayload = { ...payload, status: 'draft', owner_id: user.id };
        }
        const { data: created, error: err } = await supabase
          .from('tours').insert(insertPayload).select().single();
        if (err) throw err;
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setForm({ ...EMPTY_TOUR, status: initialStatus, difficulty: '' });
          setSelectedThemes([]);
          setSelectedPurposes([]);
          setImageUrl('');
          setGalleryUrls([]);
        }, 2000);
        onDone(created, true);
      }
    } catch (err) {
      setError(err.message || 'Failed to save tour');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[hsl(178,85%,32%)] focus:ring-1 focus:ring-[hsl(178,85%,32%)]/50 transition';
  const labelClass = 'block text-white/50 text-xs mb-1.5 font-medium';
  const tagBase    = 'rounded-full px-3 py-1.5 text-sm cursor-pointer flex items-center gap-1.5 border transition';
  const tagOn      = `${tagBase} border-teal-400 bg-teal-400/20 text-white`;
  const tagOff     = `${tagBase} border-white/20 text-white/70 hover:border-teal-400`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{editing ? t('dashboard_update_tour') : t('dashboard_add_tour')}</h2>
          <p className="text-white/40 text-xs mt-0.5">{editing ? t('dashboard_update_tour') : t('dashboard_add_tour')}</p>
        </div>
        {editing && (
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/15 text-white/50 text-xs hover:text-white hover:border-white/30 transition">
            ✕ {t('dashboard_cancel')}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Tour created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-6 space-y-5">

        {/* Title + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input name="title" required value={form.title} onChange={handleChange} className={inputClass} placeholder="Tour title" />
          </div>
          <div>
            <label className={labelClass}>Slug (auto-generated)</label>
            <input name="slug" value={form.slug} onChange={handleChange} className={`${inputClass} text-white/50`} placeholder="tour-slug" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Describe the tour experience..." />
        </div>

        {/* Duration / Price / Location / City */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Duration (days)</label>
            <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} className={inputClass} placeholder="7" />
          </div>
          <div>
            <label className={labelClass}>Price (USD)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className={inputClass} placeholder="1200" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="Isfahan, Iran" />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Isfahan" />
          </div>
        </div>

        {/* Cities covered */}
        <div>
          <label className={labelClass}>Cities Covered (comma separated)</label>
          <input name="cities" value={form.cities} onChange={handleChange} className={inputClass} placeholder="Tehran, Isfahan, Shiraz" />
        </div>

        {/* Difficulty (required) */}
        <div>
          <label className={labelClass}>
            Difficulty <span className="text-red-400">*</span>
            <span className="ml-1 text-white/40 text-[10px] font-normal">(Required)</span>
          </label>
          <select
            name="difficulty"
            required
            value={form.difficulty}
            onChange={handleChange}
            className={`${inputClass} w-full md:w-72 appearance-none cursor-pointer`}
          >
            <option value="" disabled>Select a difficulty level…</option>
            {DIFFICULTY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt[lang] || opt.en}</option>
            ))}
          </select>
        </div>

        {/* Theme tag chips */}
        <div>
          <label className={labelClass}>Theme (select multiple)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {THEMES.map(th => (
              <button type="button" key={th.value} onClick={() => toggleTheme(th.value)}
                className={selectedThemes.includes(th.value) ? tagOn : tagOff}>
                {th[lang] || th.en}
              </button>
            ))}
            {selectedThemes.filter(v => !THEMES.find(th => th.value === v)).map(v => (
              <button type="button" key={v} onClick={() => toggleTheme(v)} className={tagOn}>✏️ {v}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customTheme} onChange={e => setCustomTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTheme())}
              className={inputClass} placeholder="+ Add custom theme..." />
            <button type="button" onClick={addCustomTheme}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-teal-400 hover:text-white transition whitespace-nowrap">
              Add
            </button>
          </div>
        </div>

        {/* Purpose tag chips */}
        <div>
          <label className={labelClass}>Purpose (select multiple)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PURPOSES.map(pu => (
              <button type="button" key={pu.value} onClick={() => togglePurpose(pu.value)}
                className={selectedPurposes.includes(pu.value) ? tagOn : tagOff}>
                {pu[lang] || pu.en}
              </button>
            ))}
            {selectedPurposes.filter(v => !PURPOSES.find(pu => pu.value === v)).map(v => (
              <button type="button" key={v} onClick={() => togglePurpose(v)} className={tagOn}>✏️ {v}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customPurpose} onChange={e => setCustomPurpose(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomPurpose())}
              className={inputClass} placeholder="+ Add custom purpose..." />
            <button type="button" onClick={addCustomPurpose}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-teal-400 hover:text-white transition whitespace-nowrap">
              Add
            </button>
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className={labelClass}>Highlights (one per line)</label>
          <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"Visit the Great Mosque of Isfahan\nExplore Naghsh-e Jahan Square\nTraditional Persian cooking class"} />
        </div>

        {/* Itinerary */}
        <div>
          <label className={labelClass}>Day-by-Day Itinerary</label>
          <textarea name="itinerary" value={form.itinerary} onChange={handleChange} rows={5} className={`${inputClass} resize-none`} placeholder={"Day 1: Arrival in Tehran...\nDay 2: Flight to Isfahan..."} />
        </div>

        {/* Included / Excluded */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>What&#39;s Included (one per line)</label>
            <textarea name="included" value={form.included} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"Hotel accommodation\nBreakfast daily\nPrivate transport"} />
          </div>
          <div>
            <label className={labelClass}>What&#39;s Not Included (one per line)</label>
            <textarea name="excluded" value={form.excluded} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"International flights\nTravel insurance\nLunch and dinner"} />
          </div>
        </div>

        {/* Main Image drag-and-drop upload */}
        <div>
          <label className={labelClass}>Main Image</label>
          <div
            onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files[0]); }}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition-all"
          >
            {uploadingMain ? (
              <div className="flex flex-col items-center gap-2 text-white/50">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Uploading...</p>
              </div>
            ) : imageUrl ? (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} className="w-full h-48 object-cover rounded-lg" alt="main" />
                <button type="button" onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/40">
                <Upload className="w-8 h-8" />
                <p className="text-sm">📷 Drop image here or click to browse</p>
                <p className="text-xs">JPG, PNG, WEBP</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleImageUpload(e.target.files[0])} />
          </div>
        </div>

        {/* Gallery multi-image upload */}
        <div>
          <label className={labelClass}>Gallery Images ({galleryUrls.length}/10)</label>
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                  <img src={url} alt={`g${i}`} className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {galleryUrls.length < 10 && (
            <div
              onDrop={e => { e.preventDefault(); handleGalleryUpload(e.dataTransfer.files); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => galleryRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-all"
            >
              {uploadingGallery ? (
                <div className="flex flex-col items-center gap-2 text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-sm">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <Upload className="w-6 h-6" />
                  <p className="text-sm">Add up to {10 - galleryUrls.length} more images</p>
                </div>
              )}
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleGalleryUpload(e.target.files)} />
            </div>
          )}
        </div>

        {/* Status (hidden for platform tours — admin auto-publishes) */}
        {!isPlatform && (
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} w-48 appearance-none cursor-pointer`}>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white font-semibold text-sm hover:bg-[hsl(178,85%,28%)] disabled:opacity-60 transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? t('dashboard_saving') : editing ? t('dashboard_update_tour') : t('dashboard_save_tour')}
          </button>
        </div>
      </form>
    </div>
  );
}
