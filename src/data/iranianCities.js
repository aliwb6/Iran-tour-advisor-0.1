// One shared catalogue for every destination selector. English names are the
// stable values stored in the database; Persian and Arabic are display labels.
const rows = [
  ['Tehran','تهران','طهران','city'], ['Rey','ری','الري','city'], ['Shemiran','شمیران','شميران','city'], ['Varamin','ورامین','ورامين','city'], ['Damavand','دماوند','دماوند','city'], ['Firuzkuh','فیروزکوه','فيروزكوه','city'],
  ['Isfahan','اصفهان','أصفهان','city'], ['Kashan','کاشان','كاشان','city'], ['Natanz','نطنز','نطنز','city'], ['Nain','نائین','نائين','city'], ['Ardestan','اردستان','أردستان','city'], ['Shahreza','شهرضا','شهرضا','city'], ['Abyaneh','ابیانه','أبيانه','village'], ['Qamsar','قمصر','قمصر','city'], ['Niasar','نیاسر','نياسر','city'],
  ['Shiraz','شیراز','شيراز','city'], ['Marvdasht','مرودشت','مرودشت','city'], ['Pasargadae','پاسارگاد','باسارغاد','city'], ['Kazerun','کازرون','كازرون','city'], ['Firuzabad','فیروزآباد','فيروز آباد','city'], ['Lar','لار','لار','city'], ['Sepidan','سپیدان','سبيدان','city'], ['Qalat','قلات','قلات','village'], ['Meymand (Fars)','میمند فارس','ميمند فارس','city'],
  ['Yazd','یزد','يزد','city'], ['Meybod','میبد','ميبد','city'], ['Ardakan','اردکان','أردكان','city'], ['Taft','تفت','تفت','city'], ['Mehriz','مهریز','مهريز','city'], ['Kharanaq','خرانق','خرانق','village'], ['Saryazd','سریزد','سريزد','village'], ['Cham','چم','چم','village'],
  ['Kerman','کرمان','كرمان','city'], ['Bam','بم','بم','city'], ['Rafsanjan','رفسنجان','رفسنجان','city'], ['Mahan','ماهان','ماهان','city'], ['Shahdad','شهداد','شهداد','city'], ['Rayen','راین','راين','city'], ['Sirjan','سیرجان','سيرجان','city'], ['Meymand (Kerman)','میمند کرمان','ميمند كرمان','village'], ['Shafiabad','شفیع‌آباد','شفيع آباد','village'],
  ['Tabriz','تبریز','تبريز','city'], ['Kandovan','کندوان','كندوان','village'], ['Jolfa','جلفا','جلفا','city'], ['Maragheh','مراغه','مراغة','city'], ['Ahar','اهر','أهر','city'], ['Kaleybar','کلیبر','كليبر','city'], ['Oshtobin','اشتبین','اشتبين','village'],
  ['Urmia','ارومیه','أورمية','city'], ['Khoy','خوی','خوي','city'], ['Maku','ماکو','ماكو','city'], ['Takab','تکاب','تكاب','city'], ['Mahabad','مهاباد','مهاباد','city'], ['Piranshahr','پیرانشهر','بيرانشهر','city'],
  ['Rasht','رشت','رشت','city'], ['Bandar Anzali','بندر انزلی','بندر أنزلي','city'], ['Lahijan','لاهیجان','لاهيجان','city'], ['Astara','آستارا','آستارا','city'], ['Fuman','فومن','فومن','city'], ['Masal','ماسال','ماسال','city'], ['Masuleh','ماسوله','ماسوله','city'], ['Siahkal','سیاهکل','سياهكل','city'], ['Deylaman','دیلمان','ديلمان','city'], ['Javaherdeh','جواهرده','جواهرده','village'],
  ['Sari','ساری','ساري','city'], ['Ramsar','رامسر','رامسر','city'], ['Chalus','چالوس','چالوس','city'], ['Nowshahr','نوشهر','نوشهر','city'], ['Babolsar','بابلسر','بابلسر','city'], ['Amol','آمل','آمل','city'], ['Behshahr','بهشهر','بهشهر','city'], ['Kelardasht','کلاردشت','كلاردشت','city'], ['Filband','فیلبند','فيلبند','village'], ['Kandelus','کندلوس','كندلوس','village'],
  ['Gorgan','گرگان','جرجان','city'], ['Gonbad-e Kavus','گنبد کاووس','غنبد قابوس','city'], ['Bandar Torkaman','بندر ترکمن','بندر تركمان','city'], ['Kordkuy','کردکوی','كردكوي','city'], ['Ziarat','زیارت','زيارت','village'], ['Radkan','رادکان','رادكان','village'],
  ['Mashhad','مشهد','مشهد','city'], ['Neyshabur','نیشابور','نيسابور','city'], ['Tus','طوس','طوس','city'], ['Sabzevar','سبزوار','سبزوار','city'], ['Torbat-e Heydarieh','تربت حیدریه','تربت حيدرية','city'], ['Kalat','کلات','كلات','city'], ['Kang','کنگ','كنغ','village'],
  ['Birjand','بیرجند','بيرجند','city'], ['Ferdows','فردوس','فردوس','city'], ['Tabas','طبس','طبس','city'], ['Qaen','قائن','قائن','city'], ['Esfahak','اصفهک','اصفهك','village'],
  ['Bojnord','بجنورد','بجنورد','city'], ['Shirvan','شیروان','شيروان','city'], ['Esfarayen','اسفراین','اسفراين','city'], ['Ruyeen','روئین','روئين','village'],
  ['Qom','قم','قم','city'], ['Kahak','کهک','كهك','city'], ['Qazvin','قزوین','قزوين','city'], ['Alamut','الموت','ألموت','region'], ['Abyek','آبیک','آبيك','city'],
  ['Zanjan','زنجان','زنجان','city'], ['Soltaniyeh','سلطانیه','سلطانية','city'], ['Mahneshan','ماهنشان','ماهنشان','city'],
  ['Ardabil','اردبیل','أردبيل','city'], ['Sareyn','سرعین','سرعين','city'], ['Meshgin Shahr','مشگین‌شهر','مشگين شهر','city'], ['Khalkhal','خلخال','خلخال','city'],
  ['Sanandaj','سنندج','سنندج','city'], ['Marivan','مریوان','مريوان','city'], ['Baneh','بانه','بانه','city'], ['Kamyaran','کامیاران','كامياران','city'], ['Palangan','پالنگان','بالنغان','village'], ['Uraman Takht','اورامان تخت','أورامان تخت','village'],
  ['Kermanshah','کرمانشاه','كرمانشاه','city'], ['Paveh','پاوه','باوه','city'], ['Kangavar','کنگاور','كنغاور','city'], ['Bisotun','بیستون','بيستون','city'], ['Qasr-e Shirin','قصر شیرین','قصر شيرين','city'],
  ['Hamadan','همدان','همدان','city'], ['Lalejin','لالجین','لالجين','city'], ['Malayer','ملایر','ملاير','city'], ['Nahavand','نهاوند','نهاوند','city'], ['Tuyserkan','تویسرکان','تويسركان','city'],
  ['Arak','اراک','أراك','city'], ['Mahallat','محلات','محلات','city'], ['Khomein','خمین','خمين','city'], ['Saveh','ساوه','ساوة','city'],
  ['Ilam','ایلام','إيلام','city'], ['Darreh Shahr','دره‌شهر','دره شهر','city'], ['Dehloran','دهلران','دهلران','city'],
  ['Khorramabad','خرم‌آباد','خرم آباد','city'], ['Borujerd','بروجرد','بروجرد','city'], ['Dorud','دورود','دورود','city'], ['Aligudarz','الیگودرز','اليغودرز','city'], ['Bisheh','بیشه','بيشه','village'],
  ['Shahr-e Kord','شهرکرد','شهركرد','city'], ['Chelgerd','چلگرد','چلگرد','city'], ['Borujen','بروجن','بروجن','city'], ['Sar Aqa Seyyed','سرآقاسید','سر آقا سيد','village'],
  ['Yasuj','یاسوج','ياسوج','city'], ['Sisakht','سی‌سخت','سي سخت','city'], ['Dehdasht','دهدشت','دهدشت','city'], ['Kakan','کاکان','كاكان','village'],
  ['Ahvaz','اهواز','الأهواز','city'], ['Shushtar','شوشتر','شوشتر','city'], ['Dezful','دزفول','دزفول','city'], ['Susa','شوش','شوش','city'], ['Abadan','آبادان','عبادان','city'], ['Khorramshahr','خرمشهر','المحمرة','city'], ['Izeh','ایذه','إيذه','city'], ['Masjed Soleiman','مسجدسلیمان','مسجد سليمان','city'],
  ['Bushehr','بوشهر','بوشهر','city'], ['Bandar Ganaveh','بندر گناوه','بندر جنابة','city'], ['Bandar Deylam','بندر دیلم','بندر ديلم','city'], ['Kangan','کنگان','كنغان','city'], ['Siraf','سیراف','سيراف','city'],
  ['Bandar Abbas','بندرعباس','بندر عباس','city'], ['Qeshm Island','جزیره قشم','جزيرة قشم','island'], ['Kish Island','جزیره کیش','جزيرة كيش','island'], ['Hormuz Island','جزیره هرمز','جزيرة هرمز','island'], ['Hengam Island','جزیره هنگام','جزيرة هنگام','island'], ['Larak Island','جزیره لارک','جزيرة لارك','island'], ['Bandar Lengeh','بندر لنگه','بندر لنجة','city'], ['Minab','میناب','ميناب','city'], ['Laft','لافت','لافت','village'],
  ['Semnan','سمنان','سمنان','city'], ['Shahroud','شاهرود','شاهرود','city'], ['Damghan','دامغان','دامغان','city'], ['Garmsar','گرمسار','غرمسار','city'], ['Bastam','بسطام','بسطام','city'], ['Abr','ابر','أبر','village'],
  ['Zahedan','زاهدان','زاهدان','city'], ['Chabahar','چابهار','تشابهار','city'], ['Zabol','زابل','زابل','city'], ['Iranshahr','ایرانشهر','إيرانشهر','city'], ['Saravan','سراوان','سراوان','city'], ['Konarak','کنارک','كنارك','city'], ['Tis','تیس','تيس','village'],
  ['Karaj','کرج','كرج','city'], ['Taleqan','طالقان','طالقان','city'], ['Baraghan','برغان','برغان','village'],
];

export const iranianDestinations = rows.map(([en, fa, ar, type]) => ({ en, fa, ar, type }));
export const iranianCities = iranianDestinations.map(({ en }) => en);
export const iranianDestinationOptions = iranianDestinations.map((item) => ({ ...item, key: item.en }));
export const popularIranianDestinations = iranianDestinations.filter(({ en }) =>
  ['Shiraz', 'Isfahan', 'Yazd', 'Hamadan'].includes(en)
);
export const destinationLabel = (item, lang = 'en') => item?.[lang] || item?.en || '';
