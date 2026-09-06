import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function PublicProfileGallery({ images = [], lang = 'en' }) {
  const [expanded, setExpanded] = useState(false);
  const gallery = Array.isArray(images)
    ? images.filter(image => typeof image === 'string' && image.trim())
    : [];

  const visibleImages = expanded ? gallery : gallery.slice(0, 6);
  const labels = lang === 'fa'
    ? { title: 'گالری', emptyTitle: 'گالری خالی است', emptyDescription: 'هنوز عکسی اضافه نشده است.' }
    : lang === 'ar'
      ? { title: 'معرض الصور', emptyTitle: 'المعرض فارغ', emptyDescription: 'لم تتم إضافة أي صور بعد.' }
      : { title: 'Gallery', emptyTitle: 'Gallery is empty', emptyDescription: 'No photos have been added yet.' };

  return (
    <section className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <ImageIcon className="w-4 h-4 text-gold" />
          {labels.title}
        </h3>
        <span className="font-body text-xs text-muted-foreground">{gallery.length}</span>
      </div>

      {gallery.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-7 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
            <ImageIcon className="h-5 w-5" />
          </div>
          <p className="font-body text-sm font-semibold text-foreground">{labels.emptyTitle}</p>
          <p className="mt-1 font-body text-xs text-muted-foreground">{labels.emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {visibleImages.map((image, index) => (
            <a
              key={`${image}-${index}`}
              href={image}
              target="_blank"
              rel="noreferrer"
              className="group block aspect-square overflow-hidden rounded-xl bg-muted border border-border/50"
              aria-label={`${labels.title} ${index + 1}`}
            >
              <img
                decoding="async"
                loading="lazy"
                src={image}
                alt={`${labels.title} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      )}

      {gallery.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded(value => !value)}
          className="w-full mt-3 py-2 rounded-xl border border-gold/30 text-gold font-body text-xs font-semibold hover:bg-gold/5 transition"
        >
          {expanded
            ? (lang === 'fa' ? 'نمایش کمتر' : lang === 'ar' ? 'عرض أقل' : 'Show Less')
            : (lang === 'fa' ? `نمایش همه ${gallery.length} عکس` : lang === 'ar' ? `عرض كل الصور (${gallery.length})` : `View All ${gallery.length} Photos`)}
        </button>
      )}
    </section>
  );
}
