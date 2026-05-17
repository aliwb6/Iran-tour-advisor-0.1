Make the following 3 improvements to the existing Dashboard and auth pages:

---

## CHANGE 1: Custom Specialty Input (Tag Input with free-text)

In the Dashboard Profile section, find the Specialties/Skills input area.
Currently it only shows predefined chips to click.

Add a text input below the chips so users can TYPE a custom specialty and press Enter or click "Add" to add it as a new tag.

Implementation:
```jsx
const [customTag, setCustomTag] = useState('');

const addCustomTag = () => {
  const trimmed = customTag.trim();
  if (trimmed && !selectedSpecialties.includes(trimmed)) {
    setSelectedSpecialties(prev => [...prev, trimmed]);
  }
  setCustomTag('');
};

// In JSX, after the predefined chips:
<div className="flex gap-2 mt-3">
  <input
    type="text"
    value={customTag}
    onChange={e => setCustomTag(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
    placeholder="Add custom specialty..."
    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
  />
  <button
    type="button"
    onClick={addCustomTag}
    className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition"
  >
    + Add
  </button>
</div>
```

---

## CHANGE 2: Dashboard Full i18n Support (FA/AR/EN)

In Dashboard.jsx, add i18n support using the existing i18n context.

At the top of the component add:
```jsx
import { useI18n } from '@/lib/i18n.jsx';
// inside component:
const { lang, dir } = useI18n();
```

Then add `dir={dir}` to the outermost div:
```jsx
<div dir={dir} className="flex h-screen overflow-hidden bg-[#0f172a]">
```

Replace ALL hardcoded English text in the sidebar and section headings with this translation object. Add this INSIDE the Dashboard component (not exported):

```jsx
const d = {
  en: {
    dashboard: 'Dashboard', myTours: 'My Tours', addTour: 'Add New Tour',
    requests: 'Tour Requests', messages: 'Messages', profile: 'Profile',
    bookings: 'Bookings', payment: 'Payment', reviews: 'My Reviews',
    settings: 'Settings', signOut: 'Sign Out',
    welcome: 'Welcome back', noTours: 'No upcoming tours',
    noRequests: 'No tour requests yet', noMessages: 'No messages yet',
    earnings: 'My Earnings This Year', actual: 'Actual Earnings',
    future: 'Future Earnings', newRequests: 'New Requests',
    invitations: 'Invitations', latestChat: 'Latest Chat',
    myLicense: 'My License', noLicense: 'No license uploaded',
    uploadLicense: 'Upload License', addNewTour: '+ Add New Tour',
    // Add Tour form
    tourTitle: 'Title', tourSlug: 'Slug (auto-generated)', tourDesc: 'Description',
    tourDuration: 'Duration (days)', tourPrice: 'Price (USD)', tourLocation: 'Location',
    tourCity: 'City', tourCities: 'Cities Covered (comma separated)',
    tourPurpose: 'Purpose', tourTheme: 'Theme', tourHighlights: 'Highlights (one per line)',
    tourItinerary: 'Day-by-Day Itinerary', saveTour: 'Save Tour',
    editProfile: 'Edit Profile', fullName: 'Full Name', bio: 'Bio',
    city: 'City', specialties: 'Specialties', languages: 'Languages',
    saveChanges: 'Save Changes', addCustom: 'Add',
  },
  fa: {
    dashboard: 'داشبورد', myTours: 'تورهای من', addTour: 'افزودن تور جدید',
    requests: 'درخواست‌های تور', messages: 'پیام‌ها', profile: 'پروفایل',
    bookings: 'رزروها', payment: 'پرداخت', reviews: 'نظرات من',
    settings: 'تنظیمات', signOut: 'خروج',
    welcome: 'خوش آمدید', noTours: 'تور آینده‌ای وجود ندارد',
    noRequests: 'درخواست توری وجود ندارد', noMessages: 'پیامی وجود ندارد',
    earnings: 'درآمد امسال من', actual: 'درآمد واقعی',
    future: 'درآمد آینده', newRequests: 'درخواست‌های جدید',
    invitations: 'دعوت‌نامه‌ها', latestChat: 'آخرین چت',
    myLicense: 'مجوز من', noLicense: 'مجوزی آپلود نشده',
    uploadLicense: 'آپلود مجوز', addNewTour: '+ افزودن تور',
    tourTitle: 'عنوان', tourSlug: 'اسلاگ', tourDesc: 'توضیحات',
    tourDuration: 'مدت (روز)', tourPrice: 'قیمت (دلار)', tourLocation: 'مکان',
    tourCity: 'شهر', tourCities: 'شهرهای مسیر (با کاما)',
    tourPurpose: 'هدف سفر', tourTheme: 'تم', tourHighlights: 'نکات برجسته',
    tourItinerary: 'برنامه روز به روز', saveTour: 'ذخیره تور',
    editProfile: 'ویرایش پروفایل', fullName: 'نام کامل', bio: 'بیوگرافی',
    city: 'شهر', specialties: 'تخصص‌ها', languages: 'زبان‌ها',
    saveChanges: 'ذخیره تغییرات', addCustom: 'افزودن',
  },
  ar: {
    dashboard: 'لوحة التحكم', myTours: 'جولاتي', addTour: 'إضافة جولة جديدة',
    requests: 'طلبات الجولة', messages: 'الرسائل', profile: 'الملف الشخصي',
    bookings: 'الحجوزات', payment: 'الدفع', reviews: 'تقييماتي',
    settings: 'الإعدادات', signOut: 'تسجيل الخروج',
    welcome: 'مرحباً بعودتك', noTours: 'لا توجد جولات قادمة',
    noRequests: 'لا توجد طلبات جولة', noMessages: 'لا توجد رسائل',
    earnings: 'أرباحي هذا العام', actual: 'الأرباح الفعلية',
    future: 'الأرباح المستقبلية', newRequests: 'طلبات جديدة',
    invitations: 'الدعوات', latestChat: 'آخر محادثة',
    myLicense: 'رخصتي', noLicense: 'لم يتم رفع رخصة',
    uploadLicense: 'رفع الرخصة', addNewTour: '+ إضافة جولة',
    tourTitle: 'العنوان', tourSlug: 'الرابط', tourDesc: 'الوصف',
    tourDuration: 'المدة (أيام)', tourPrice: 'السعر (دولار)', tourLocation: 'الموقع',
    tourCity: 'المدينة', tourCities: 'المدن (مفصولة بفاصلة)',
    tourPurpose: 'الغرض', tourTheme: 'الموضوع', tourHighlights: 'أبرز النقاط',
    tourItinerary: 'البرنامج اليومي', saveTour: 'حفظ الجولة',
    editProfile: 'تعديل الملف', fullName: 'الاسم الكامل', bio: 'السيرة الذاتية',
    city: 'المدينة', specialties: 'التخصصات', languages: 'اللغات',
    saveChanges: 'حفظ التغييرات', addCustom: 'إضافة',
  },
}[lang] || {};
```

Then replace every hardcoded English string with `{d.keyName}`.
Example: `"Dashboard"` → `{d.dashboard}`, `"Sign Out"` → `{d.signOut}`, etc.

---

## CHANGE 3: Replace Login and Signup pages with provided code

### For src/pages/Login.jsx (the /login route):
Replace the ENTIRE file content with the Login component code provided in document index 3 
(the one with the dark left panel showing "Welcome Back" + benefits list + sign in form on right).

Make sure this is saved as `src/pages/Login.jsx`.

### For src/pages/Signup.jsx (the /signup and /register routes):  
Replace the ENTIRE file content with the Signup component code provided in document index 2
(the one with "Create Account" form + Traveler/Guide/Agency tabs).

BUT update Signup.jsx to also have the same dark left panel layout as Login.jsx.
Left panel content for signup:
- Title: "A Journey" + gold "Unforgettable"  
- Subtitle: "Join thousands of travellers who discovered Iran with us"
- 3 benefit items:
  1. Compass icon — "Explore Iran" / "Curated journeys through ancient Persia's living heritage"
  2. User icon — "Find Your Guide" / "Connect with verified local experts who bring every story to life"
  3. Shield icon — "Travel with Confidence" / "Transparent pricing, authentic experiences, total peace of mind"
- Bottom quote: "Iran is a land that must be seen with fresh eyes each time"

### Update src/App.jsx routes:
Make sure these routes exist:
```jsx
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
// ...
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/register" element={<Signup />} />
```

Remove any old Login/Signup references that conflict.

### Update Login.jsx redirect after successful login:
After successful sign in, check the profile role from Supabase:
```js
const { data: profileData } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', data.user.id)
  .single();

const role = profileData?.role;
if (role === 'guide' || role === 'agency') navigate('/dashboard');
else navigate('/');
```

---

## FINAL STEP:
```bash
npm run build
```
Fix any import errors. The build must succeed with 0 errors.