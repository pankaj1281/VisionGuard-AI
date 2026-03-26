/**
 * Internationalisation (i18n) module
 * Supports English (en) and Hindi (hi)
 */

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'hero.badge': 'Powered by Sightengine AI API',
    'hero.title1': 'Detect',
    'hero.title2': 'AI-Generated',
    'hero.title3': 'Images Instantly',
    'hero.subtitle': 'Upload any image and our AI will determine whether it\'s real or machine-generated — with a confidence score and detailed analysis.',
    'upload.title': 'Upload Image',
    'upload.dragText': 'Drag & drop your image here',
    'upload.orText': 'or click to browse files',
    'upload.supportedFormats': 'Supports JPEG, PNG, WebP, GIF · Max 10 MB',
    'upload.removeFile': 'Remove',
    'upload.analyseBtn': 'Analyse Image',
    'loading.title': 'Analysing Image…',
    'loading.subtitle': 'Sending to AI detection engine',
    'result.title': 'Detection Result',
    'result.newAnalysis': 'New Analysis',
    'result.confidence': 'Confidence Score',
    'result.aiScore': 'AI-Generated Score',
    'result.realScore': 'Real Image Score',
    'result.signals': 'Detected Signals',
    'result.aiLabel': '🤖 AI Generated',
    'result.realLabel': '✅ Real Image',
    'features.title': 'Why VisionGuard AI?',
    'features.accuracy': 'Real AI API',
    'features.accuracyDesc': 'Powered by Sightengine\'s production-grade AI model — not a mock or demo.',
    'features.fast': 'Instant Results',
    'features.fastDesc': 'Get a confidence score and detailed signals within seconds of uploading.',
    'features.secure': 'Secure & Private',
    'features.secureDesc': 'API keys hidden in backend. Files processed in memory — never stored on disk.',
    'features.history': 'History & Dashboard',
    'features.historyDesc': 'Registered users can view, filter and manage their full analysis history.',
    'features.responsive': 'Fully Responsive',
    'features.responsiveDesc': 'Works beautifully on desktop, tablet, and mobile devices.',
    'features.multilang': 'Multi-Language',
    'features.multilangDesc': 'Interface available in English and Hindi (हिन्दी).',
    'auth.loginTitle': 'Log In',
    'auth.registerTitle': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.loginBtn': 'Log In',
    'auth.registerBtn': 'Create Account',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.register': 'Register',
    'auth.login': 'Log In',
    'toast.fileTooLarge': 'File is too large. Maximum size is 10 MB.',
    'toast.invalidType': 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.',
    'toast.uploadSuccess': 'Image analysed successfully!',
    'toast.uploadError': 'Analysis failed. Please try again.',
    'toast.loginSuccess': 'Logged in successfully!',
    'toast.logoutSuccess': 'Logged out.',
    'toast.registerSuccess': 'Account created! Welcome aboard.',
    // Dashboard
    'dash.title': 'My Dashboard',
    'dash.welcome': 'Welcome back',
    'dash.totalAnalyses': 'Total Analyses',
    'dash.aiDetected': 'AI Detected',
    'dash.realImages': 'Real Images',
    'dash.avgConfidence': 'Avg. Confidence',
    'dash.historyTitle': 'Analysis History',
    'dash.filterAll': 'All',
    'dash.filterAI': 'AI Generated',
    'dash.filterReal': 'Real Images',
    'dash.noHistory': 'No analyses yet. Go analyse some images!',
    'dash.delete': 'Delete',
    'dash.loadMore': 'Load More',
    // Admin
    'admin.title': 'Admin Panel',
    'admin.users': 'Users',
    'admin.detections': 'Detections',
    'admin.stats': 'Platform Stats',
    'admin.ban': 'Ban',
    'admin.unban': 'Unban',
    'admin.banned': 'Banned',
    'admin.active': 'Active',
  },
  hi: {
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.login': 'लॉग इन',
    'nav.signup': 'साइन अप',
    'nav.logout': 'लॉगआउट',
    'hero.badge': 'Sightengine AI API द्वारा संचालित',
    'hero.title1': 'पहचानें',
    'hero.title2': 'AI-जनित',
    'hero.title3': 'तस्वीरें तुरंत',
    'hero.subtitle': 'कोई भी तस्वीर अपलोड करें और हमारा AI बताएगा कि यह असली है या मशीन-जनित — विश्वास स्कोर और विस्तृत विश्लेषण के साथ।',
    'upload.title': 'तस्वीर अपलोड करें',
    'upload.dragText': 'यहाँ खींचें और छोड़ें',
    'upload.orText': 'या फ़ाइल चुनने के लिए क्लिक करें',
    'upload.supportedFormats': 'JPEG, PNG, WebP, GIF समर्थित · अधिकतम 10 MB',
    'upload.removeFile': 'हटाएं',
    'upload.analyseBtn': 'तस्वीर विश्लेषण करें',
    'loading.title': 'तस्वीर का विश्लेषण हो रहा है…',
    'loading.subtitle': 'AI इंजन को भेजा जा रहा है',
    'result.title': 'पहचान परिणाम',
    'result.newAnalysis': 'नया विश्लेषण',
    'result.confidence': 'विश्वास स्कोर',
    'result.aiScore': 'AI-जनित स्कोर',
    'result.realScore': 'असली तस्वीर स्कोर',
    'result.signals': 'पहचाने गए संकेत',
    'result.aiLabel': '🤖 AI जनित',
    'result.realLabel': '✅ असली तस्वीर',
    'features.title': 'VisionGuard AI क्यों चुनें?',
    'features.accuracy': 'असली AI API',
    'features.accuracyDesc': 'Sightengine के प्रोडक्शन-ग्रेड AI मॉडल द्वारा संचालित।',
    'features.fast': 'तत्काल परिणाम',
    'features.fastDesc': 'अपलोड के कुछ सेकंड में विश्वास स्कोर प्राप्त करें।',
    'features.secure': 'सुरक्षित और निजी',
    'features.secureDesc': 'API keys बैकएंड में छिपी हैं। फ़ाइलें मेमोरी में प्रोसेस होती हैं।',
    'features.history': 'इतिहास और डैशबोर्ड',
    'features.historyDesc': 'पंजीकृत उपयोगकर्ता अपना पूरा विश्लेषण इतिहास देख सकते हैं।',
    'features.responsive': 'पूरी तरह से रिस्पॉन्सिव',
    'features.responsiveDesc': 'डेस्कटॉप, टैबलेट और मोबाइल पर सुंदर दिखता है।',
    'features.multilang': 'बहु-भाषा',
    'features.multilangDesc': 'अंग्रेजी और हिन्दी में उपलब्ध।',
    'auth.loginTitle': 'लॉग इन',
    'auth.registerTitle': 'खाता बनाएं',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.name': 'नाम',
    'auth.loginBtn': 'लॉग इन',
    'auth.registerBtn': 'खाता बनाएं',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.register': 'पंजीकरण करें',
    'auth.login': 'लॉग इन',
    'toast.fileTooLarge': 'फ़ाइल बहुत बड़ी है। अधिकतम आकार 10 MB है।',
    'toast.invalidType': 'अमान्य फ़ाइल प्रकार। कृपया JPEG, PNG, WebP, या GIF अपलोड करें।',
    'toast.uploadSuccess': 'तस्वीर का सफलतापूर्वक विश्लेषण किया गया!',
    'toast.uploadError': 'विश्लेषण विफल। कृपया पुनः प्रयास करें।',
    'toast.loginSuccess': 'सफलतापूर्वक लॉग इन किया!',
    'toast.logoutSuccess': 'लॉग आउट हो गए।',
    'toast.registerSuccess': 'खाता बनाया गया! आपका स्वागत है।',
    'dash.title': 'मेरा डैशबोर्ड',
    'dash.welcome': 'वापसी पर स्वागत है',
    'dash.totalAnalyses': 'कुल विश्लेषण',
    'dash.aiDetected': 'AI पहचाने गए',
    'dash.realImages': 'असली तस्वीरें',
    'dash.avgConfidence': 'औसत विश्वास',
    'dash.historyTitle': 'विश्लेषण इतिहास',
    'dash.filterAll': 'सभी',
    'dash.filterAI': 'AI जनित',
    'dash.filterReal': 'असली तस्वीरें',
    'dash.noHistory': 'अभी तक कोई विश्लेषण नहीं।',
    'dash.delete': 'हटाएं',
    'dash.loadMore': 'और लोड करें',
    'admin.title': 'एडमिन पैनल',
    'admin.users': 'उपयोगकर्ता',
    'admin.detections': 'पहचान',
    'admin.stats': 'प्लेटफ़ॉर्म आँकड़े',
    'admin.ban': 'प्रतिबंधित करें',
    'admin.unban': 'प्रतिबंध हटाएं',
    'admin.banned': 'प्रतिबंधित',
    'admin.active': 'सक्रिय',
  }
};

let currentLang = localStorage.getItem('vg_lang') || 'en';

/**
 * Translate a key in the current language
 */
function t(key) {
  return translations[currentLang]?.[key] ?? translations['en']?.[key] ?? key;
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

/**
 * Toggle language between English and Hindi
 */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  localStorage.setItem('vg_lang', currentLang);
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = currentLang === 'en' ? 'EN' : 'HI';
  applyTranslations();
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.textContent = currentLang === 'en' ? 'EN' : 'HI';
    btn.addEventListener('click', toggleLanguage);
  }
  applyTranslations();
});
