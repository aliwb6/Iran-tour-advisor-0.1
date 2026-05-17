import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, Star, Image, User, Settings, ExternalLink, LogOut,
  CheckCircle, AlertCircle, Camera, X, Menu, ChevronDown,
  Bell, Shield, MapPin, Loader2, Plus, Globe, Upload, BookOpen,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const SPECIALTY_OPTIONS = [
  'History & Archaeology', 'Architecture', 'Food & Cuisine', 'Photography',
  'Nature & Hiking', 'Desert Safari', 'Art & Handicrafts', 'Religious Sites',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const earningsData = MONTHS.map(m => ({ month: m, earnings: 0, future: 0 }));

// ── i18n dictionary ───────────────────────────────────────────────────────────
const D = {
  en: {
    appName: 'Iran Tour Advisor',
    guideLabel: 'Guide Dashboard',
    agencyLabel: 'Agency Dashboard',
    navHome: 'Dashboard', navBookings: 'My Bookings', navReviews: 'My Reviews',
    navGallery: 'My Gallery', navProfile: 'Profile', navSettings: 'Settings',
    navGeneral: 'General', navNotifications: 'Notifications', navPrivacy: 'Privacy',
    navViewProfile: 'View Public Profile', navSignOut: 'Sign Out',
    active: '● Active', pending: '● Pending',
    welcome: 'Welcome Back', upcomingTours: 'Upcoming Tours', noUpcoming: 'No Upcoming Tours',
    verificationStatus: 'Verification Status', verifiedGuide: 'Verified Guide',
    uploadLicenseHint: 'Upload your guide license to get verified faster',
    uploadLicense: 'Upload License', tourRequests: 'Tour Requests',
    latestReviews: 'Latest Reviews', noReviewsYet: 'No reviews yet',
    viewAll: 'View All', seeAllRequests: 'See All Requests',
    earningsTitle: 'My Earnings This Year', actualEarnings: 'Actual Earnings',
    futureEarnings: 'Future Earnings', bookingServicePct: 'of travelers booked',
    yourServices: 'your services', toursCompleted: 'Tours Completed',
    reviewsReceived: 'Reviews Received', averageRating: 'Average Rating',
    myBookings: 'My Bookings', noBookingsYet: 'No Bookings Yet',
    noBookingsDesc: 'Booking requests from travelers will appear here.',
    myReviews: 'My Reviews', noReviews: 'No Reviews Yet', noReviewsDesc: 'Reviews from travelers will appear here after completed tours.',
    myGallery: 'My Gallery', uploadPhoto: 'Upload Photo',
    noPhotosYet: 'No Photos Yet', noPhotosDesc: 'Add photos to attract more travelers to your tours.',
    editProfile: 'Edit Profile', saveChanges: 'Save Changes', saving: 'Saving...', saved: 'Saved',
    profilePicture: 'Profile Picture', changePhoto: 'Change Photo',
    basicInfo: 'Basic Information', fullName: 'Full Name', phoneNumber: 'Phone Number',
    email: 'Email', city: 'City', aboutMe: 'Bio / About Me',
    languages: 'Languages', langPlaceholder: 'e.g. English, Persian, German...',
    add: 'Add', specialties: 'Specialties', customSpecialtyPlaceholder: 'Add custom specialty...',
    changePassword: 'Change Password', newPassword: 'New password', confirmPassword: 'Confirm new password',
    updatePassword: 'Update Password', passwordUpdated: 'Password updated',
    profilePreview: 'Profile Preview', cityNotSet: 'City not set',
    guideLicense: 'Guide License', licensePlaceholder: 'Upload your official guide license to speed up verification',
    licenseUpload: 'Click to upload license (image or PDF)',
    acceptBookings: 'Accept Bookings', acceptBookingsDesc: 'Allow travelers to send you booking requests',
    settingsGeneral: 'Settings — General', acceptBookingEnquiries: 'Accept Booking Enquiries',
    acceptBookingEnquiriesDesc: 'Allow travelers to contact you with booking requests',
    defaultCurrency: 'Default Currency', timezone: 'Timezone', saveAll: 'Save All Changes',
    settingsNotifications: 'Settings — Notifications',
    notifyRequests: 'Tour Request Notifications', notifyRequestsDesc: 'Get notified when you receive a new tour request',
    notifyArea: 'Area Notifications', notifyAreaDesc: 'Notify me about travelers looking for guides in my area',
    notifyEmail: 'Email Notifications', notifyEmailDesc: 'Receive marketing and update emails from Iran Tour Advisor',
    notifyWhatsapp: 'WhatsApp Notifications', notifyWhatsappDesc: 'Receive booking notifications via WhatsApp',
    settingsPrivacy: 'Settings — Privacy', publishProfile: 'Publish My Profile',
    publishProfileDesc: 'Turn this on to make your profile visible to travelers',
    dangerZone: 'Danger Zone', deactivateDesc: 'Deactivating your account will hide your profile from all travelers.',
    deactivate: 'Deactivate Account', deactivateConfirmTitle: 'Deactivate Account?',
    deactivateConfirmDesc: 'Your profile will be hidden from travelers. You can reactivate it anytime by signing back in.',
    cancel: 'Cancel',
  },
  fa: {
    appName: 'ایران تور ادوایزر',
    guideLabel: 'داشبورد راهنما',
    agencyLabel: 'داشبورد آژانس',
    navHome: 'داشبورد', navBookings: 'رزروها', navReviews: 'نظرات من',
    navGallery: 'گالری من', navProfile: 'پروفایل', navSettings: 'تنظیمات',
    navGeneral: 'عمومی', navNotifications: 'اعلان‌ها', navPrivacy: 'حریم خصوصی',
    navViewProfile: 'مشاهده پروفایل عمومی', navSignOut: 'خروج',
    active: '● فعال', pending: '● در انتظار',
    welcome: 'خوش آمدید', upcomingTours: 'تورهای آینده', noUpcoming: 'تور آینده‌ای ندارید',
    verificationStatus: 'وضعیت تأیید', verifiedGuide: 'راهنمای تأییدشده',
    uploadLicenseHint: 'مجوز راهنمایی خود را برای تأیید سریع‌تر آپلود کنید',
    uploadLicense: 'آپلود مجوز', tourRequests: 'درخواست‌های تور',
    latestReviews: 'آخرین نظرات', noReviewsYet: 'هنوز نظری نیست',
    viewAll: 'مشاهده همه', seeAllRequests: 'مشاهده همه درخواست‌ها',
    earningsTitle: 'درآمد امسال من', actualEarnings: 'درآمد واقعی',
    futureEarnings: 'درآمد آینده', bookingServicePct: 'از مسافران رزرو کردند',
    yourServices: 'خدمات شما', toursCompleted: 'تورهای تکمیل‌شده',
    reviewsReceived: 'نظرات دریافتی', averageRating: 'میانگین امتیاز',
    myBookings: 'رزروهای من', noBookingsYet: 'هنوز رزروی ندارید',
    noBookingsDesc: 'درخواست‌های رزرو از مسافران اینجا نمایش داده می‌شود.',
    myReviews: 'نظرات من', noReviews: 'هنوز نظری ندارید', noReviewsDesc: 'نظرات پس از اتمام تورها نمایش داده می‌شود.',
    myGallery: 'گالری من', uploadPhoto: 'آپلود عکس',
    noPhotosYet: 'هنوز عکسی ندارید', noPhotosDesc: 'عکس اضافه کنید تا مسافران بیشتری جذب کنید.',
    editProfile: 'ویرایش پروفایل', saveChanges: 'ذخیره تغییرات', saving: 'در حال ذخیره...', saved: 'ذخیره شد',
    profilePicture: 'تصویر پروفایل', changePhoto: 'تغییر عکس',
    basicInfo: 'اطلاعات پایه', fullName: 'نام کامل', phoneNumber: 'شماره تلفن',
    email: 'ایمیل', city: 'شهر', aboutMe: 'درباره من',
    languages: 'زبان‌ها', langPlaceholder: 'مثلاً: انگلیسی، فارسی، آلمانی...',
    add: 'افزودن', specialties: 'تخصص‌ها', customSpecialtyPlaceholder: 'تخصص سفارشی...',
    changePassword: 'تغییر رمز عبور', newPassword: 'رمز عبور جدید', confirmPassword: 'تأیید رمز عبور',
    updatePassword: 'بروزرسانی رمز', passwordUpdated: 'رمز بروزرسانی شد',
    profilePreview: 'پیش‌نمایش پروفایل', cityNotSet: 'شهر تعیین نشده',
    guideLicense: 'مجوز راهنمایی', licensePlaceholder: 'مجوز رسمی خود را آپلود کنید',
    licenseUpload: 'برای آپلود مجوز کلیک کنید',
    acceptBookings: 'قبول رزرو', acceptBookingsDesc: 'به مسافران اجازه دهید درخواست رزرو ارسال کنند',
    settingsGeneral: 'تنظیمات — عمومی', acceptBookingEnquiries: 'قبول درخواست رزرو',
    acceptBookingEnquiriesDesc: 'به مسافران اجازه دهید با شما تماس بگیرند',
    defaultCurrency: 'ارز پیش‌فرض', timezone: 'منطقه زمانی', saveAll: 'ذخیره همه تغییرات',
    settingsNotifications: 'تنظیمات — اعلان‌ها',
    notifyRequests: 'اعلان درخواست تور', notifyRequestsDesc: 'هنگام دریافت درخواست تور اعلان بگیرید',
    notifyArea: 'اعلان منطقه‌ای', notifyAreaDesc: 'درباره مسافران جستجوکننده در منطقه‌ام آگاه شوم',
    notifyEmail: 'اعلان ایمیل', notifyEmailDesc: 'ایمیل از ایران تور ادوایزر دریافت کنم',
    notifyWhatsapp: 'اعلان واتساپ', notifyWhatsappDesc: 'اعلان رزرو از طریق واتساپ',
    settingsPrivacy: 'تنظیمات — حریم خصوصی', publishProfile: 'انتشار پروفایل',
    publishProfileDesc: 'این را فعال کنید تا پروفایل برای مسافران نمایش داده شود',
    dangerZone: 'منطقه خطر', deactivateDesc: 'غیرفعال کردن حساب، پروفایل شما را از دید همه مسافران پنهان می‌کند.',
    deactivate: 'غیرفعال کردن حساب', deactivateConfirmTitle: 'غیرفعال کردن حساب؟',
    deactivateConfirmDesc: 'پروفایل شما از دید مسافران پنهان می‌شود. هر زمان می‌توانید دوباره فعال کنید.',
    cancel: 'انصراف',
  },
  ar: {
    appName: 'إيران تور أدفايزر',
    guideLabel: 'لوحة المرشد',
    agencyLabel: 'لوحة الوكالة',
    navHome: 'لوحة التحكم', navBookings: 'حجوزاتي', navReviews: 'تقييماتي',
    navGallery: 'معرضي', navProfile: 'الملف الشخصي', navSettings: 'الإعدادات',
    navGeneral: 'عام', navNotifications: 'الإشعارات', navPrivacy: 'الخصوصية',
    navViewProfile: 'عرض الملف العام', navSignOut: 'تسجيل الخروج',
    active: '● نشط', pending: '● قيد الانتظار',
    welcome: 'مرحباً بعودتك', upcomingTours: 'الجولات القادمة', noUpcoming: 'لا توجد جولات قادمة',
    verificationStatus: 'حالة التحقق', verifiedGuide: 'مرشد موثق',
    uploadLicenseHint: 'ارفع ترخيصك للحصول على توثيق أسرع',
    uploadLicense: 'رفع الترخيص', tourRequests: 'طلبات الجولة',
    latestReviews: 'أحدث التقييمات', noReviewsYet: 'لا توجد تقييمات بعد',
    viewAll: 'عرض الكل', seeAllRequests: 'عرض جميع الطلبات',
    earningsTitle: 'أرباحي هذا العام', actualEarnings: 'الأرباح الفعلية',
    futureEarnings: 'الأرباح المستقبلية', bookingServicePct: 'من المسافرين حجزوا',
    yourServices: 'خدماتك', toursCompleted: 'الجولات المكتملة',
    reviewsReceived: 'التقييمات المستلمة', averageRating: 'متوسط التقييم',
    myBookings: 'حجوزاتي', noBookingsYet: 'لا توجد حجوزات بعد',
    noBookingsDesc: 'ستظهر طلبات الحجز من المسافرين هنا.',
    myReviews: 'تقييماتي', noReviews: 'لا توجد تقييمات بعد', noReviewsDesc: 'ستظهر التقييمات هنا بعد اكتمال الجولات.',
    myGallery: 'معرضي', uploadPhoto: 'رفع صورة',
    noPhotosYet: 'لا توجد صور بعد', noPhotosDesc: 'أضف صوراً لجذب المزيد من المسافرين.',
    editProfile: 'تعديل الملف', saveChanges: 'حفظ التغييرات', saving: 'جاري الحفظ...', saved: 'تم الحفظ',
    profilePicture: 'صورة الملف الشخصي', changePhoto: 'تغيير الصورة',
    basicInfo: 'المعلومات الأساسية', fullName: 'الاسم الكامل', phoneNumber: 'رقم الهاتف',
    email: 'البريد الإلكتروني', city: 'المدينة', aboutMe: 'نبذة عني',
    languages: 'اللغات', langPlaceholder: 'مثلاً: الإنجليزية، الفارسية...',
    add: 'إضافة', specialties: 'التخصصات', customSpecialtyPlaceholder: 'تخصص مخصص...',
    changePassword: 'تغيير كلمة المرور', newPassword: 'كلمة مرور جديدة', confirmPassword: 'تأكيد كلمة المرور',
    updatePassword: 'تحديث كلمة المرور', passwordUpdated: 'تم تحديث كلمة المرور',
    profilePreview: 'معاينة الملف', cityNotSet: 'المدينة غير محددة',
    guideLicense: 'ترخيص المرشد', licensePlaceholder: 'ارفع ترخيصك الرسمي للتحقق السريع',
    licenseUpload: 'انقر لرفع الترخيص',
    acceptBookings: 'قبول الحجوزات', acceptBookingsDesc: 'السماح للمسافرين بإرسال طلبات الحجز',
    settingsGeneral: 'الإعدادات — عام', acceptBookingEnquiries: 'قبول استفسارات الحجز',
    acceptBookingEnquiriesDesc: 'السماح للمسافرين بالتواصل معك',
    defaultCurrency: 'العملة الافتراضية', timezone: 'المنطقة الزمنية', saveAll: 'حفظ جميع التغييرات',
    settingsNotifications: 'الإعدادات — الإشعارات',
    notifyRequests: 'إشعارات طلبات الجولة', notifyRequestsDesc: 'إشعار عند استلام طلب جولة جديد',
    notifyArea: 'إشعارات المنطقة', notifyAreaDesc: 'إشعار عن مسافرين يبحثون عن مرشدين في منطقتي',
    notifyEmail: 'إشعارات البريد', notifyEmailDesc: 'استلام رسائل من إيران تور أدفايزر',
    notifyWhatsapp: 'إشعارات واتساب', notifyWhatsappDesc: 'استلام إشعارات الحجز عبر واتساب',
    settingsPrivacy: 'الإعدادات — الخصوصية', publishProfile: 'نشر الملف الشخصي',
    publishProfileDesc: 'فعّل هذا لجعل ملفك مرئياً للمسافرين',
    dangerZone: 'منطقة الخطر', deactivateDesc: 'تعطيل حسابك سيخفي ملفك عن جميع المسافرين.',
    deactivate: 'تعطيل الحساب', deactivateConfirmTitle: 'تعطيل الحساب؟',
    deactivateConfirmDesc: 'سيُخفى ملفك عن المسافرين. يمكنك إعادة التفعيل في أي وقت.',
    cancel: 'إلغاء',
  },
};

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-accent' : 'bg-slate-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function SidebarContent({ activeSection, setActiveSection, profile, logout, navigate, onClose }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [settingsExpanded, setSettingsExpanded] = useState(activeSection.startsWith('settings'));
  const isApproved = profile?.is_verified === true || profile?.is_approved === true;

  function NavItem({ section, icon, label }) {
    const active = activeSection === section;
    return (
      <button
        onClick={() => { setActiveSection(section); onClose?.(); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body rounded-lg transition-all ${
          active
            ? 'bg-accent/20 text-accent border-r-2 border-accent'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-heading font-bold text-white leading-tight">{d.appName}</p>
            <p className="text-[10px] text-slate-400">
              {profile?.role === 'guide' ? d.guideLabel : d.agencyLabel}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <NavItem section="home" icon={<Home className="w-4 h-4" />} label={d.navHome} />
        <NavItem section="bookings" icon={<Calendar className="w-4 h-4" />} label={d.navBookings} />
        <NavItem section="reviews" icon={<Star className="w-4 h-4" />} label={d.navReviews} />
        <NavItem section="gallery" icon={<Image className="w-4 h-4" />} label={d.navGallery} />

        <div className="my-2 border-t border-white/10" />

        <NavItem section="profile" icon={<User className="w-4 h-4" />} label={d.navProfile} />

        <button
          onClick={() => setSettingsExpanded(p => !p)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-body text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            <span>{d.navSettings}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsExpanded ? 'rotate-180' : ''}`} />
        </button>

        {settingsExpanded && (
          <div className="pl-3 space-y-0.5">
            <NavItem section="settings-general" icon={<Globe className="w-3.5 h-3.5" />} label={d.navGeneral} />
            <NavItem section="settings-notifications" icon={<Bell className="w-3.5 h-3.5" />} label={d.navNotifications} />
            <NavItem section="settings-privacy" icon={<Shield className="w-3.5 h-3.5" />} label={d.navPrivacy} />
          </div>
        )}

        <div className="my-2 border-t border-white/10" />

        <button
          onClick={() => { navigate('/guides'); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>{d.navViewProfile}</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{d.navSignOut}</span>
        </button>
      </nav>

      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-9 h-9 object-cover" />
              : <User className="w-4 h-4 text-accent" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-body font-semibold text-white truncate">{profile?.full_name || 'User'}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-body ${
              isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isApproved ? d.active : d.pending}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOME SECTION ──────────────────────────────────────────────────────────────
function HomeSection({ profile, setActiveSection }) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const isApproved = profile?.is_verified === true || profile?.is_approved === true;
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const go = async () => {
      try {
        const { data: b } = await supabase.from('bookings').select('*').eq('guide_id', user.id).limit(10);
        setBookings(b || []);
      } catch {}
      try {
        const { data: r } = await supabase.from('reviews').select('*').eq('guide_id', user.id).limit(5);
        setReviews(r || []);
      } catch {}
      setLoading(false);
    };
    go();
  }, [user]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const pending = bookings.filter(b => b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-lg font-bold text-foreground leading-snug">
            {d.welcome}, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </p>
          <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium ${
            isApproved
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            {isApproved
              ? <><CheckCircle className="w-3.5 h-3.5" /> Profile Active</>
              : <><AlertCircle className="w-3.5 h-3.5" /> Pending Approval</>
            }
          </div>
          <p className="mt-3 text-xs font-body text-muted-foreground leading-relaxed">
            {isApproved
              ? 'Your profile is visible on Iran Tour Advisor.'
              : "Your profile is under review. We'll notify you once approved."}
          </p>
        </div>

        {/* Upcoming */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-3">{d.upcomingTours}</p>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : confirmed.length === 0 ? (
            <div className="flex flex-col items-center py-4 text-center gap-2">
              <Calendar className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs font-body text-muted-foreground">{d.noUpcoming}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmed.slice(0, 2).map(b => (
                <div key={b.id} className="text-xs font-body bg-muted/40 rounded-lg p-2.5">
                  <p className="font-medium text-foreground">{b.tourist_name || 'Traveler'}</p>
                  <p className="text-muted-foreground mt-0.5">{b.tour_date || b.date || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-3">{d.verificationStatus}</p>
          {isApproved ? (
            <div className="flex flex-col items-center py-2 text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-body font-medium text-emerald-600 dark:text-emerald-400">{d.verifiedGuide}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-body text-amber-700 dark:text-amber-400">{d.uploadLicenseHint}</p>
              </div>
              <button
                onClick={() => setActiveSection('profile')}
                className="w-full py-2 rounded-xl bg-accent/10 text-accent text-xs font-body font-medium hover:bg-accent/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> {d.uploadLicense}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3 bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-4">{d.tourRequests}</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <BookOpen className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm font-body text-muted-foreground">{d.noReviewsYet.replace('reviews', 'requests')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">{b.tourist_name || 'Traveler'}</p>
                    <p className="text-xs font-body text-muted-foreground">{b.tour_date || b.date || '—'}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-body font-medium bg-amber-500/10 text-amber-600">Pending</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setActiveSection('bookings')} className="mt-4 text-xs font-body text-accent hover:underline">
            {d.seeAllRequests} →
          </button>
        </div>

        <div className="md:col-span-2 bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-4">{d.latestReviews}</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <Star className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm font-body text-muted-foreground">{d.noReviewsYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 2).map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-muted/40">
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < (r.rating || 0) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <p className="text-xs font-body text-foreground line-clamp-2">{r.comment || '—'}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1">{r.reviewer_name || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setActiveSection('reviews')} className="mt-4 text-xs font-body text-accent hover:underline">
            {d.viewAll} →
          </button>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="font-heading text-sm font-semibold text-foreground">{d.earningsTitle}</p>
          <div className="flex items-center gap-6 text-xs font-body text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
              <span><span className="text-foreground font-medium">$0</span> — {d.actualEarnings}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gold/40 inline-block" />
              <span><span className="text-foreground font-medium">$0</span> — {d.futureEarnings}</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={earningsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
            <Bar dataKey="earnings" name={d.actualEarnings} fill="hsl(var(--accent))" radius={[4,4,0,0]} />
            <Bar dataKey="future" name={d.futureEarnings} fill="hsl(var(--gold))" radius={[4,4,0,0]} opacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '0%', label: d.bookingServicePct, sub: d.yourServices },
          { value: completed.length.toString(), label: d.toursCompleted },
          { value: reviews.length.toString(), label: d.reviewsReceived },
          { value: avgRating || '—', label: d.averageRating },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border/50 p-5 text-center">
            <p className="font-heading text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs font-body text-muted-foreground mt-1">{stat.label}</p>
            {stat.sub && <p className="text-[10px] font-body text-muted-foreground/60">{stat.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BOOKINGS SECTION ──────────────────────────────────────────────────────────
function BookingsSection({ user }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('bookings').select('*').eq('guide_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const statusStyle = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-500',
    completed: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{d.myBookings}</h1>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : bookings.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-16 flex flex-col items-center text-center">
          <Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="font-heading text-xl font-semibold text-foreground mb-2">{d.noBookingsYet}</p>
          <p className="text-sm font-body text-muted-foreground">{d.noBookingsDesc}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {['Tourist', 'Tour', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-body font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? 'bg-muted/10' : ''}`}>
                    <td className="px-5 py-3 text-sm font-body text-foreground whitespace-nowrap">{b.tourist_name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground whitespace-nowrap">{b.tour_name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground whitespace-nowrap">{b.tour_date || b.date || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${statusStyle[b.status] || 'bg-muted text-muted-foreground'}`}>
                        {b.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs font-body text-accent hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REVIEWS SECTION ───────────────────────────────────────────────────────────
function ReviewsSection({ user }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('reviews').select('*').eq('guide_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{d.myReviews}</h1>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 flex items-center gap-8">
            <div className="text-center">
              <p className="font-heading text-5xl font-bold text-foreground">{avg > 0 ? avg.toFixed(1) : '—'}</p>
              <div className="flex items-center gap-1 justify-center mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-xs font-body text-muted-foreground mt-1">{reviews.length} reviews</p>
            </div>
          </div>
          {reviews.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-16 flex flex-col items-center text-center">
              <Star className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="font-heading text-xl font-semibold text-foreground mb-2">{d.noReviews}</p>
              <p className="text-sm font-body text-muted-foreground">{d.noReviewsDesc}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-card rounded-2xl border border-border/50 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{r.reviewer_name || 'Anonymous'}</p>
                      <p className="text-xs font-body text-muted-foreground mt-0.5">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating || 0) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-body text-foreground/80 leading-relaxed">{r.comment || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── GALLERY SECTION ───────────────────────────────────────────────────────────
function GallerySection({ profile, user, refreshProfile }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [uploading, setUploading] = useState(false);
  const images = profile?.gallery_images || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `gallery/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('profiles').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      await supabase.from('profiles').update({ gallery_images: [...images, publicUrl] }).eq('id', user.id);
      refreshProfile?.(user.id);
    } catch (err) {
      console.error('Gallery upload error:', err);
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">{d.myGallery}</h1>
        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-body font-medium cursor-pointer hover:bg-accent/90 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {d.uploadPhoto}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {images.length === 0 ? (
        <div className="bg-card rounded-2xl border-2 border-dashed border-border/50 p-16 flex flex-col items-center text-center">
          <Camera className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="font-heading text-xl font-semibold text-foreground mb-2">{d.noPhotosYet}</p>
          <p className="text-sm font-body text-muted-foreground">{d.noPhotosDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden bg-muted">
              <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PROFILE SECTION ───────────────────────────────────────────────────────────
function ProfileSection({ profile, user, refreshProfile }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-muted-foreground/50';

  const [form, setForm] = useState({ full_name: '', phone: '', bio: '', city: '', languages: [], specialties: [], accept_bookings: false });
  const [langInput, setLangInput] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        city: profile.city || '',
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        specialties: Array.isArray(profile.specialties)
          ? profile.specialties
          : (profile.specialty ? [profile.specialty] : []),
        accept_bookings: profile.accept_bookings ?? false,
      });
    }
  }, [profile]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        full_name: form.full_name, phone: form.phone, bio: form.bio,
        city: form.city, languages: form.languages,
        specialties: form.specialties, accept_bookings: form.accept_bookings,
      }).eq('id', user.id);
      refreshProfile?.(user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addLang = () => {
    const l = langInput.trim();
    if (l && !form.languages.includes(l)) { set('languages', [...form.languages, l]); setLangInput(''); }
  };

  const toggleSpecialty = (s) => {
    set('specialties', form.specialties.includes(s) ? form.specialties.filter(x => x !== s) : [...form.specialties, s]);
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !form.specialties.includes(trimmed)) {
      set('specialties', [...form.specialties, trimmed]);
    }
    setCustomTag('');
  };

  const handlePwChange = async () => {
    setPwError('');
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      setPwForm({ newPw: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) { setPwError(err.message); }
    setPwSaving(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">{d.editProfile}</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? d.saving : saved ? ('✓ ' + d.saved) : d.saveChanges}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Avatar */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-4">{d.profilePicture}</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-accent" />}
              </div>
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-body text-muted-foreground hover:text-foreground hover:border-accent/50 cursor-pointer transition-colors">
                <Camera className="w-4 h-4" /> {d.changePhoto}
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <p className="font-body text-sm font-semibold text-foreground">{d.basicInfo}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs text-muted-foreground mb-1.5">{d.fullName}</label>
                <input className={inputClass} value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div>
                <label className="block font-body text-xs text-muted-foreground mb-1.5">{d.phoneNumber}</label>
                <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+98..." />
              </div>
            </div>
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">{d.email}</label>
              <input className={`${inputClass} opacity-60 cursor-not-allowed`} value={profile?.email || ''} readOnly />
            </div>
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">{d.city}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input className={`${inputClass} pl-9`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Tehran, Isfahan..." />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <label className="block font-body text-sm font-semibold text-foreground mb-3">{d.aboutMe}</label>
            <textarea rows={6} className={`${inputClass} resize-none`} value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>

          {/* Languages */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-3">{d.languages}</p>
            {form.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.languages.map(l => (
                  <span key={l} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">
                    {l}
                    <button onClick={() => set('languages', form.languages.filter(x => x !== l))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1`} value={langInput} onChange={e => setLangInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLang(); } }}
                placeholder={d.langPlaceholder} />
              <button onClick={addLang} className="px-4 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-body hover:bg-accent/20 transition-colors whitespace-nowrap">{d.add}</button>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-3">{d.specialties}</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all border ${
                    form.specialties.includes(s)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-foreground'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            {/* Custom specialty input (Change 1) */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                placeholder={d.customSpecialtyPlaceholder}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button type="button" onClick={addCustomTag}
                className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">
                + {d.add}
              </button>
            </div>
            {/* Show custom (non-preset) tags */}
            {form.specialties.filter(s => !SPECIALTY_OPTIONS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.specialties.filter(s => !SPECIALTY_OPTIONS.includes(s)).map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-body border border-gold/20">
                    {s}
                    <button onClick={() => set('specialties', form.specialties.filter(x => x !== s))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <p className="font-body text-sm font-semibold text-foreground">{d.changePassword}</p>
            {pwError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-body">{pwError}</div>}
            {pwSaved && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-body">✓ {d.passwordUpdated}</div>}
            <input type="password" className={inputClass} value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} placeholder={d.newPassword} />
            <input type="password" className={inputClass} value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder={d.confirmPassword} />
            <button onClick={handlePwChange} disabled={pwSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body hover:bg-muted/80 transition-colors disabled:opacity-60">
              {pwSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {d.updatePassword}
            </button>
          </div>
        </div>

        {/* Right (2/5) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-4">{d.profilePreview}</p>
            <div className="rounded-2xl bg-muted/30 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-accent" />}
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-foreground text-sm truncate">{form.full_name || '—'}</p>
                  <div className="flex items-center gap-1 text-xs font-body text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{form.city || d.cityNotSet}</span>
                  </div>
                </div>
              </div>
              {form.bio && <p className="text-xs font-body text-foreground/70 line-clamp-3 leading-relaxed">{form.bio}</p>}
              {form.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.specialties.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-body">{s}</span>
                  ))}
                  {form.specialties.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-body">+{form.specialties.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-1">{d.guideLicense}</p>
            <p className="text-xs font-body text-muted-foreground mb-4">{d.licensePlaceholder}</p>
            <label className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground/40" />
              <span className="text-xs font-body text-muted-foreground text-center">{d.licenseUpload}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" />
            </label>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-foreground">{d.acceptBookings}</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{d.acceptBookingsDesc}</p>
              </div>
              <Toggle checked={form.accept_bookings} onChange={v => set('accept_bookings', v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS GENERAL ──────────────────────────────────────────────────────────
function SettingsGeneralSection({ profile, user }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [s, setS] = useState({ accept_bookings: false, currency: 'USD', timezone: 'Asia/Tehran' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setS({ accept_bookings: profile.accept_bookings ?? false, currency: profile.currency || 'USD', timezone: profile.timezone || 'Asia/Tehran' });
  }, [profile]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try { await supabase.from('profiles').update(s).eq('id', user.id); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    setSaving(false);
  };

  const selClass = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{d.settingsGeneral}</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-0 divide-y divide-border/50">
        <div className="flex items-center justify-between py-5">
          <div>
            <p className="font-body text-sm font-semibold text-foreground">{d.acceptBookingEnquiries}</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">{d.acceptBookingEnquiriesDesc}</p>
          </div>
          <Toggle checked={s.accept_bookings} onChange={v => setS(p => ({ ...p, accept_bookings: v }))} />
        </div>
        <div className="py-5">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">{d.defaultCurrency}</label>
          <select className={selClass} value={s.currency} onChange={e => setS(p => ({ ...p, currency: e.target.value }))}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="IRR">IRR — Iranian Rial</option>
          </select>
        </div>
        <div className="py-5">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">{d.timezone}</label>
          <select className={selClass} value={s.timezone} onChange={e => setS(p => ({ ...p, timezone: e.target.value }))}>
            <option value="Asia/Tehran">Asia/Tehran (IRST +3:30)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New_York (EST -5)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET +1)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
          </select>
        </div>
        <div className="pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? d.saving : saved ? ('✓ ' + d.saved) : d.saveAll}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS NOTIFICATIONS ────────────────────────────────────────────────────
function SettingsNotificationsSection({ profile, user }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [s, setS] = useState({ notify_requests: true, notify_area: false, notify_email: true, notify_whatsapp: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setS({
      notify_requests: profile.notify_requests ?? true,
      notify_area: profile.notify_area ?? false,
      notify_email: profile.notify_email ?? true,
      notify_whatsapp: profile.notify_whatsapp ?? false,
    });
  }, [profile]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try { await supabase.from('profiles').update(s).eq('id', user.id); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    setSaving(false);
  };

  const rows = [
    { key: 'notify_requests', label: d.notifyRequests, desc: d.notifyRequestsDesc },
    { key: 'notify_area', label: d.notifyArea, desc: d.notifyAreaDesc },
    { key: 'notify_email', label: d.notifyEmail, desc: d.notifyEmailDesc },
    { key: 'notify_whatsapp', label: d.notifyWhatsapp, desc: d.notifyWhatsappDesc },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{d.settingsNotifications}</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-0 divide-y divide-border/50">
        {rows.map(row => (
          <div key={row.key} className="flex items-center justify-between py-5">
            <div>
              <p className="font-body text-sm font-semibold text-foreground">{row.label}</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{row.desc}</p>
            </div>
            <Toggle checked={s[row.key]} onChange={v => setS(p => ({ ...p, [row.key]: v }))} />
          </div>
        ))}
        <div className="pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? d.saving : saved ? ('✓ ' + d.saved) : d.saveAll}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PRIVACY ──────────────────────────────────────────────────────────
function SettingsPrivacySection({ profile, user }) {
  const { lang } = useI18n();
  const d = D[lang] || D.en;
  const [s, setS] = useState({ is_public: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  useEffect(() => {
    if (profile) setS({ is_public: profile.is_public ?? true });
  }, [profile]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try { await supabase.from('profiles').update(s).eq('id', user.id); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{d.settingsPrivacy}</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-0 divide-y divide-border/50">
        <div className="flex items-center justify-between py-5">
          <div>
            <p className="font-body text-sm font-semibold text-foreground">{d.publishProfile}</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">{d.publishProfileDesc}</p>
          </div>
          <Toggle checked={s.is_public} onChange={v => setS(p => ({ ...p, is_public: v }))} />
        </div>
        <div className="py-5">
          <p className="font-body text-sm font-semibold text-red-500 mb-1">{d.dangerZone}</p>
          <p className="text-xs font-body text-muted-foreground mb-3">{d.deactivateDesc}</p>
          <button onClick={() => setShowDeactivate(true)} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-body hover:bg-red-500/10 transition-colors">
            {d.deactivate}
          </button>
        </div>
        <div className="pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? d.saving : saved ? ('✓ ' + d.saved) : d.saveAll}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeactivate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeactivate(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full">
              <p className="font-heading text-lg font-bold text-foreground mb-2">{d.deactivateConfirmTitle}</p>
              <p className="text-sm font-body text-muted-foreground mb-5 leading-relaxed">{d.deactivateConfirmDesc}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeactivate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-body text-foreground hover:bg-muted transition-colors">{d.cancel}</button>
                <button className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-body font-medium hover:bg-red-600 transition-colors">{d.deactivate}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, isAuthenticated, isLoadingAuth, logout, fetchProfile } = useAuth();
  const { lang, dir } = useI18n();
  const d = D[lang] || D.en;
  const navigate = useNavigate();
  const { section: urlSection } = useParams();
  const [activeSection, setActiveSection] = useState(urlSection || 'home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (urlSection) setActiveSection(urlSection);
  }, [urlSection]);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
    if (!isLoadingAuth && isAuthenticated && profile?.role === 'tourist') navigate('/');
  }, [isAuthenticated, isLoadingAuth, profile, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarProps = { activeSection, setActiveSection, profile, logout, navigate };

  const sectionLabel = {
    home: d.navHome, bookings: d.navBookings, reviews: d.navReviews,
    gallery: d.navGallery, profile: d.navProfile,
    'settings-general': d.navSettings, 'settings-notifications': d.navSettings, 'settings-privacy': d.navSettings,
  };

  return (
    <div dir={dir} className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] shrink-0 h-screen flex-col bg-[#0f172a] overflow-y-auto">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay + sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-30 w-[220px] h-screen flex flex-col bg-[#0f172a] lg:hidden overflow-y-auto">
              <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <p className="font-heading text-sm font-semibold text-foreground">{sectionLabel[activeSection]}</p>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              {activeSection === 'home' && <HomeSection profile={profile} setActiveSection={setActiveSection} />}
              {activeSection === 'bookings' && <BookingsSection user={user} />}
              {activeSection === 'reviews' && <ReviewsSection user={user} />}
              {activeSection === 'gallery' && <GallerySection profile={profile} user={user} refreshProfile={fetchProfile} />}
              {activeSection === 'profile' && <ProfileSection profile={profile} user={user} refreshProfile={fetchProfile} />}
              {activeSection === 'settings-general' && <SettingsGeneralSection profile={profile} user={user} />}
              {activeSection === 'settings-notifications' && <SettingsNotificationsSection profile={profile} user={user} />}
              {activeSection === 'settings-privacy' && <SettingsPrivacySection profile={profile} user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
