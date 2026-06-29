/**
 * IntroView.jsx
 *
 * Welcome and Introduction page.
 * The full Sri Yantra is rendered as a faint watermark behind the text,
 * matching the low-opacity geometry style used in GuravaView.
 * Responds to the `script` prop for Sanskrit display (IAST / Devanagari).
 * Responds to the `uiLang` prop for UI language (en / hi / kn / ml / ta / te).
 */

import SriYantraSVG from './SriYantraSVG'

// ── Per-language content ──────────────────────────────────────────────────────
// Each entry has: mantra, salut, sections (p1…), headings, tour link text.
// 'en' is the canonical source; others are AI-generated and need native review.

const CONTENT = {
  en: {
    mantra: 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ',
    salut:  'Namastripurasundari',
    fontClass: 'iast',
    welcome1: 'Namaskaram and welcome to the Śrī Yantra Memoriser, a tool for learning and internalising the Khadgamala Stotram through the sacred geometry of the Śrī Yantra.',
    welcome2: 'This is a memorisation and internalisation tool, not a guide to the philosophy or theology of the Śrī Yantra or the Khadgamala Stotram. Many other excellent resources exist for that.',
    welcome2_en: 'This is a memorisation and internalisation tool, not a guide to the philosophy or theology of the Śrī Yantra or the Khadgamala Stotram. Many excellent resources exist for that, some are listed in the References page of the Resources section.',
    h_yantra: 'The Śrī Yantra',
    yantra: 'The Śrī Yantra (also called the Śrī Cakra) is one of the most revered sacred geometric mandalas in Hindu, especially within the Śrī Vidyā school, and Buddhist tantric traditions. Nine interlocking triangles, four pointing upward and five pointing downward, radiate from a central point, the Bindu, surrounded by lotus petals and an outer square enclosure with four gates. Together they form nine enclosures or \'veils\' (āvaraṇas), progressing from the outermost expression of manifest reality inward to the point of pure awareness.',
    h_stotram: 'The Khadgamala Stotram',
    stotram: 'The Khadgamala Stotram, or \'the Garland of Swords\', invokes by name the deities residing in each of the nine āvaraṇas, moving from the outermost Bhūpura inward, with increasing secrecy, to the Bindu. The nine āvaraṇas contain 102 deity names. The full stotram also includes the Nyāsa Devatāḥ, the Tithi Nitya Devatāḥ, the Divyaugha, Siddaugha and Mānavaugha gurus, the Nava (nine) Cakreśvarī, and closing epithets, around 160 names in total, varying slightly by lineage. Chanting the complete stotram with the Śrī Yantra clearly in mind is considered equivalent to a full Śrī Cakra pūjā.',
    h_how: 'How this app works',
    how1: 'Most approaches to memorising the Khadgamala Stotram rely on rote sequential repetition. This app offers a different approach as an aid. The foundation is spatial memory, learning not just the order of the names, but where each deity lives within the geometry of the Śrī Yantra. When the geometry is genuinely internalised, the sequential chant follows naturally.',
    how2: 'Work through the Explore and Memorise section level by level. Explore mode is there to review the content and Memorise mode to recall the focus object in your mind before hovering over it to reveal the deity and recording whether it is memorised or not, by clicking or double-clicking respectively. Then further test your recall with the random Spot Check feature. The Memory Map exists to map out your strengths and weaknesses and where to focus further efforts.',
    how3_pre:  'Before you begin, it is worth listening to a full chanting of the Khadgamala Stotram to familiarise yourself with the sound and rhythm of the names. You may find that ',
    how3_link: 'this recording',
    how3_post: ' is a good starting point. We hope you enjoy this app and find it useful.',
    tour_pre:  'New to the app? ',
    tour_link: 'Take the guided tour',
    tour_post: ' for a quick introduction to all the features.',
  },
  hi: {
    mantra: 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः',
    salut:  'नमस्त्रिपुरसुन्दरि',
    fontClass: '',
    welcome1: 'नमस्कारम् और श्री यन्त्र स्मरण-सहायक में आपका स्वागत है — यह श्री यन्त्र की पवित्र ज्यामिति के माध्यम से खड्गमाला स्तोत्र को सीखने और आत्मसात् करने का एक साधन है।',
    welcome2: 'यह एक स्मरण और आत्मसात्करण साधन है, न कि श्री यन्त्र या खड्गमाला स्तोत्र के दर्शन अथवा धर्मशास्त्र का मार्गदर्शन। इसके लिए अन्य अनेक उत्कृष्ट संसाधन उपलब्ध हैं।',
    h_yantra: 'श्री यन्त्र',
    yantra: 'श्री यन्त्र (जिसे श्री चक्र भी कहा जाता है) हिन्दू, विशेषतः श्री विद्या सम्प्रदाय में, और बौद्ध तान्त्रिक परम्पराओं में सर्वाधिक पूजित पवित्र ज्यामितीय मण्डलों में से एक है। नौ अन्तर्संबद्ध त्रिभुज — चार ऊर्ध्वमुखी और पाँच अधोमुखी — एक केन्द्रीय बिन्दु से विकीर्ण होते हैं, जो कमल दल और चार द्वारों वाले बाह्य वर्गाकार परिवेष्टन से घिरे हैं। ये मिलकर नौ आवरण बनाते हैं जो बाह्यतम व्यक्त वास्तविकता से शुद्ध चेतना के बिन्दु की ओर अग्रसर होते हैं।',
    h_stotram: 'खड्गमाला स्तोत्र',
    stotram: 'खड्गमाला स्तोत्र, अर्थात् \'तलवारों की माला\', नौ आवरणों में निवास करने वाले देवताओं का नाम-सहित आह्वान करता है — बाह्यतम भूपुर से आरम्भ होकर, बढ़ती गोपनीयता के साथ, बिन्दु तक। नौ आवरणों में 102 देवता नाम हैं। पूर्ण स्तोत्र में न्यास देवताः, तिथिनित्य देवताः, दिव्यौघ, सिद्धौघ और मानवौघ गुरु, नव चक्रेश्वरी, तथा समापन विशेषण भी सम्मिलित हैं — कुल लगभग 160 नाम, जो परम्परा के अनुसार कुछ भिन्न होते हैं। श्री यन्त्र को स्मरण में रखते हुए पूर्ण स्तोत्र का पाठ श्री चक्र पूजा के तुल्य माना जाता है।',
    h_how: 'यह ऐप कैसे कार्य करता है',
    how1: 'खड्गमाला स्तोत्र को कंठस्थ करने के अधिकांश उपाय क्रमिक पुनरावृत्ति पर आधारित हैं। यह ऐप एक भिन्न दृष्टिकोण प्रस्तुत करता है — स्थानिक स्मृति का आधार लेते हुए। केवल नामों का क्रम नहीं, अपितु यह भी सीखना है कि श्री यन्त्र की ज्यामिति में प्रत्येक देवता कहाँ विराजमान है। जब ज्यामिति सच्चे अर्थों में आत्मसात् हो जाती है, तो क्रमिक पाठ स्वाभाविक रूप से आता है।',
    how2: 'अन्वेषण और कंठस्थ अनुभाग में स्तर-दर-स्तर कार्य करें। अन्वेषण मोड सामग्री की समीक्षा के लिए है और कंठस्थ मोड में आप देवता के नाम को मन में स्मरण करें और फिर प्रकट करें — सही होने पर क्लिक और गलत होने पर डबल-क्लिक करें। स्पॉट चेक से यादृच्छिक पुनरावृत्ति करें। स्मृति मानचित्र आपकी शक्तियों और कमजोरियों को प्रदर्शित करता है।',
    how3_pre:  'आरम्भ करने से पूर्व, नामों की ध्वनि और लय से परिचित होने के लिए खड्गमाला स्तोत्र का पूर्ण पाठ सुनना उपयोगी है। ',
    how3_link: 'यह रिकॉर्डिंग',
    how3_post: ' एक अच्छा प्रारम्भिक बिन्दु हो सकती है। हमें आशा है कि यह ऐप आपके लिए उपयोगी और आनन्ददायक सिद्ध होगा।',
    tour_pre:  'ऐप में नए हैं? ',
    tour_link: 'निर्देशित भ्रमण करें',
    tour_post: ' — सभी सुविधाओं का त्वरित परिचय।',
  },
  kn: {
    mantra: 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः',
    salut:  'ನಮಸ್ತ್ರಿಪುರಸುಂದರಿ',
    fontClass: '',
    welcome1: 'ನಮಸ್ಕಾರಂ ಮತ್ತು ಶ್ರೀ ಯಂತ್ರ ಸ್ಮರಣ ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ — ಶ್ರೀ ಯಂತ್ರದ ಪವಿತ್ರ ಜ್ಯಾಮಿತಿಯ ಮೂಲಕ ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರವನ್ನು ಕಲಿಯಲು ಮತ್ತು ಆಂತರಿಕಗೊಳಿಸಲು ಇದು ಒಂದು ಸಾಧನ.',
    welcome2: 'ಇದು ಒಂದು ಸ್ಮರಣ ಮತ್ತು ಆಂತರಿಕೀಕರಣ ಸಾಧನ — ಶ್ರೀ ಯಂತ್ರ ಅಥವಾ ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರದ ತತ್ತ್ವಶಾಸ್ತ್ರ ಅಥವಾ ಧರ್ಮಶಾಸ್ತ್ರಕ್ಕೆ ಮಾರ್ಗದರ್ಶಿ ಅಲ್ಲ. ಅದಕ್ಕಾಗಿ ಇತರ ಅನೇಕ ಉತ್ತಮ ಸಂಪನ್ಮೂಲಗಳಿವೆ.',
    h_yantra: 'ಶ್ರೀ ಯಂತ್ರ',
    yantra: 'ಶ್ರೀ ಯಂತ್ರ (ಶ್ರೀ ಚಕ್ರ ಎಂದೂ ಕರೆಯುತ್ತಾರೆ) ಹಿಂದೂ ಸಂಪ್ರದಾಯದಲ್ಲಿ, ವಿಶೇಷವಾಗಿ ಶ್ರೀ ವಿದ್ಯಾ ಪಂಥದಲ್ಲಿ ಮತ್ತು ಬೌದ್ಧ ತಾಂತ್ರಿಕ ಪರಂಪರೆಗಳಲ್ಲಿ ಅತ್ಯಂತ ಪೂಜನೀಯ ಪವಿತ್ರ ಜ್ಯಾಮಿತೀಯ ಮಂಡಲಗಳಲ್ಲಿ ಒಂದು. ಒಂಬತ್ತು ಅಂತರ್ ಸಂಬಂಧಿತ ತ್ರಿಭುಜಗಳು — ನಾಲ್ಕು ಮೇಲ್ಮುಖ ಮತ್ತು ಐದು ಕೆಳಮುಖ — ಕೇಂದ್ರ ಬಿಂದುವಿನಿಂದ ವಿಕಿರಣಗೊಳ್ಳುತ್ತವೆ, ಕಮಲದ ದಳಗಳಿಂದ ಮತ್ತು ನಾಲ್ಕು ದ್ವಾರಗಳ ಬಾಹ್ಯ ಚೌಕದಿಂದ ಸುತ್ತುವರೆದಿರುತ್ತದೆ. ಒಟ್ಟಾಗಿ ಅವು ಒಂಬತ್ತು ಆವರಣಗಳನ್ನು ರಚಿಸುತ್ತವೆ — ಬಾಹ್ಯ ವ್ಯಕ್ತ ವಾಸ್ತವದಿಂದ ಶುದ್ಧ ಪ್ರಜ್ಞೆಯ ಬಿಂದುವಿನೆಡೆಗೆ.',
    h_stotram: 'ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರ',
    stotram: 'ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರ, ಅಥವಾ \'ಖಡ್ಗಗಳ ಮಾಲೆ\', ಒಂಬತ್ತು ಆವರಣಗಳಲ್ಲಿ ನೆಲೆಸಿರುವ ದೇವತೆಗಳನ್ನು ಹೆಸರಿನಿಂದ ಆಹ್ವಾನಿಸುತ್ತದೆ — ಬಾಹ್ಯ ಭೂಪುರದಿಂದ ಆರಂಭಿಸಿ, ಹೆಚ್ಚುತ್ತಿರುವ ರಹಸ್ಯತೆಯೊಂದಿಗೆ, ಬಿಂದುವಿನವರೆಗೆ. ಒಂಬತ್ತು ಆವರಣಗಳಲ್ಲಿ 102 ದೇವತಾ ನಾಮಗಳಿವೆ. ಪೂರ್ಣ ಸ್ತೋತ್ರದಲ್ಲಿ ನ್ಯಾಸ ದೇವತಾಃ, ತಿಥಿ ನಿತ್ಯ ದೇವತಾಃ, ದಿವ್ಯೌಘ, ಸಿದ್ಧೌಘ ಮತ್ತು ಮಾನವೌಘ ಗುರುಗಳು, ನವ ಚಕ್ರೇಶ್ವರಿ, ಮತ್ತು ಸಮಾಪನ ವಿಶೇಷಣಗಳೂ ಸೇರಿವೆ — ಒಟ್ಟು ಸುಮಾರು 160 ನಾಮಗಳು, ಸಂಪ್ರದಾಯದಿಂದ ಸ್ವಲ್ಪ ಭಿನ್ನ. ಶ್ರೀ ಯಂತ್ರವನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಇಟ್ಟುಕೊಂಡು ಪೂರ್ಣ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಶ್ರೀ ಚಕ್ರ ಪೂಜೆಗೆ ಸಮಾನ ಎಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ.',
    h_how: 'ಈ ಆ್ಯಪ್ ಹೇಗೆ ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತದೆ',
    how1: 'ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರ ಕಂಠಸ್ಥ ಮಾಡುವ ಹೆಚ್ಚಿನ ವಿಧಾನಗಳು ಕ್ರಮ ಪುನರಾವರ್ತನೆಯನ್ನು ಅವಲಂಬಿಸುತ್ತವೆ. ಈ ಆ್ಯಪ್ ಸ್ಥಾನಿಕ ಸ್ಮೃತಿಯ ಆಧಾರದ ಮೇಲೆ ಭಿನ್ನ ವಿಧಾನ ಒದಗಿಸುತ್ತದೆ — ಕೇವಲ ನಾಮಗಳ ಕ್ರಮ ಅಲ್ಲ, ಬದಲಿಗೆ ಶ್ರೀ ಯಂತ್ರದ ಜ್ಯಾಮಿತಿಯಲ್ಲಿ ಪ್ರತಿ ದೇವತೆ ಎಲ್ಲಿ ನೆಲೆಸಿದ್ದಾರೆ ಎಂಬುದನ್ನು ಕಲಿಯುವುದು. ಜ್ಯಾಮಿತಿ ನಿಜವಾಗಿ ಆಂತರಿಕಗೊಂಡಾಗ, ಕ್ರಮ ಪಾಠ ಸ್ವಾಭಾವಿಕವಾಗಿ ಅನುಸರಿಸುತ್ತದೆ.',
    how2: 'ಅನ್ವೇಷಣ ಮತ್ತು ಕಂಠಸ್ಥ ವಿಭಾಗವನ್ನು ಹಂತ ಹಂತವಾಗಿ ಕೆಲಸ ಮಾಡಿ. ಅನ್ವೇಷಣ ಮೋಡ್ ಪರಿಶೀಲನೆಗೆ, ಕಂಠಸ್ಥ ಮೋಡ್‌ನಲ್ಲಿ ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ಮರಿಸಿ ನಂತರ ದೇವತೆ ಹೆಸರು ಬಹಿರಂಗಪಡಿಸಿ — ಸರಿ ಇದ್ದರೆ ಕ್ಲಿಕ್, ತಪ್ಪಾದರೆ ಡಬಲ್-ಕ್ಲಿಕ್. ಸ್ಪಾಟ್ ಚೆಕ್ ಯಾದೃಚ್ಛಿಕ ಪುನರಾವರ್ತನೆ ಒದಗಿಸುತ್ತದೆ. ಸ್ಮೃತಿ ಪಟ ನಿಮ್ಮ ಶಕ್ತಿ ಮತ್ತು ದೌರ್ಬಲ್ಯಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.',
    how3_pre:  'ಆರಂಭಿಸುವ ಮೊದಲು, ನಾಮಗಳ ಶಬ್ದ ಮತ್ತು ಲಯಕ್ಕೆ ಪರಿಚಿತರಾಗಲು ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರದ ಪೂರ್ಣ ಪಠಣ ಕೇಳುವುದು ಉಪಯುಕ್ತ. ',
    how3_link: 'ಈ ರೆಕಾರ್ಡಿಂಗ್',
    how3_post: ' ಒಂದು ಉತ್ತಮ ಪ್ರಾರಂಭ ಬಿಂದು ಆಗಬಹುದು. ಈ ಆ್ಯಪ್ ನಿಮಗೆ ಉಪಯುಕ್ತ ಮತ್ತು ಆನಂದದಾಯಕವಾಗಲಿ ಎಂದು ಆಶಿಸುತ್ತೇವೆ.',
    tour_pre:  'ಆ್ಯಪ್‌ಗೆ ಹೊಸಬರೇ? ',
    tour_link: 'ಮಾರ್ಗದರ್ಶಿ ಪ್ರವಾಸ ತೆಗೆದುಕೊಳ್ಳಿ',
    tour_post: ' — ಎಲ್ಲ ವೈಶಿಷ್ಟ್ಯಗಳ ತ್ವರಿತ ಪರಿಚಯ.',
  },
  ml: {
    mantra: 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः',
    salut:  'നമസ്ത്രിപുരസുന്ദരി',
    fontClass: '',
    welcome1: 'നമസ്‌കാരം, ശ്രീ യന്ത്ര മനഃപ്പാഠ സഹായകത്തിലേക്ക് സ്വാഗതം — ശ്രീ യന്ത്രത്തിന്റെ പവിത്ര ജ്യാമിതിയിലൂടെ ഖഡ്ഗമാലാ സ്തോത്രം പഠിക്കാനും ഉൾക്കൊള്ളാനുമുള്ള ഒരു ഉപകരണം.',
    welcome2: 'ഇത് ഒരു മനഃപ്പാഠ-ആന്തരീകരണ ഉപകരണമാണ് — ശ്രീ യന്ത്രത്തിന്റെ അല്ലെങ്കിൽ ഖഡ്ഗമാലാ സ്തോത്രത്തിന്റെ തത്ത്വചിന്ത അല്ലെങ്കിൽ ദൈവശാസ്ത്രത്തിലേക്കുള്ള ഒരു ഗൈഡ് അല്ല. അതിനായി മറ്റ് നിരവധി മികച്ച വിഭവങ്ങൾ ലഭ്യമാണ്.',
    h_yantra: 'ശ്രീ യന്ത്രം',
    yantra: 'ശ്രീ യന്ത്രം (ശ്രീ ചക്രം എന്നും അറിയപ്പെടുന്നു) ഹിന്ദു, പ്രത്യേകിച്ച് ശ്രീ വിദ്യാ സ്കൂളിലും ബൗദ്ധ താന്ത്രിക പാരമ്പര്യങ്ങളിലും ഏറ്റവും ആദരണീയമായ പവിത്ര ജ്യാമിതീയ മണ്ഡലങ്ങളിൽ ഒന്നാണ്. ഒൻപത് ഇന്റർലോക്കിംഗ് ത്രികോണങ്ങൾ — നാല് മേൽദിശയും അഞ്ച് കീഴ്ദിശയും — ഒരു കേന്ദ്ര ബിന്ദുവിൽ നിന്ന് പ്രസരിക്കുന്നു, താമര ഇതളുകളും നാല് കവാടങ്ങളുള്ള ബാഹ്യ ചതുരസ്ർ ആവരണവും ചൂഴ്ന്നിരിക്കുന്നു. ഒരുമിച്ച് അവ ഒൻപത് ആവരണങ്ങൾ രൂപപ്പെടുത്തുന്നു — പ്രകടമായ യാഥാർഥ്യത്തിന്റെ ബാഹ്യ ഭാവത്തിൽ നിന്ന് ശുദ്ധ അവബോധത്തിന്റെ ബിന്ദുവിലേക്ക്.',
    h_stotram: 'ഖഡ്ഗമാലാ സ്തോത്രം',
    stotram: 'ഖഡ്ഗമാലാ സ്തോത്രം, അഥവാ \'വാളുകളുടെ മാല\', ഒൻപത് ആവരണങ്ങളിൽ വസിക്കുന്ന ദേവതകളെ നാമം ചൊല്ലി ആഹ്വാനം ചെയ്യുന്നു — ഏറ്റവും പുറത്തെ ഭൂപുരയിൽ തുടങ്ങി, ക്രമേണ വർദ്ധിക്കുന്ന രഹസ്യതയോടെ, ബിന്ദുവരെ. ഒൻപത് ആവരണങ്ങളിൽ 102 ദേവതാ നാമങ്ങളുണ്ട്. പൂർണ്ണ സ്തോത്രത്തിൽ ന്യാസ ദേവതാഃ, തിഥി നിത്യ ദേവതാഃ, ദിവ്യൗഘ, സിദ്ധൗഘ, മാനവൗഘ ഗുരുക്കൾ, നവ ചക്രേശ്വരി, അവസാന വിശേഷണങ്ങൾ എന്നിവ ഉൾപ്പെടുന്നു — ആകെ ഏകദേശം 160 നാമങ്ങൾ, പരമ്പരകൾക്കനുസരിച്ച് ചെറിയ വ്യത്യാസമുണ്ട്. ശ്രീ യന്ത്രം മനസ്സിൽ വ്യക്തമായി ഉൾക്കൊണ്ട് പൂർണ്ണ സ്തോത്രം ജപിക്കുന്നത് ഒരു ശ്രീ ചക്ര പൂജയ്ക്ക് തുല്യമെന്ന് കരുതപ്പെടുന്നു.',
    h_how: 'ഈ ആപ്പ് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    how1: 'ഖഡ്ഗമാലാ സ്തോത്രം മനഃപ്പാഠം ചെയ്യുന്നതിനുള്ള മിക്ക സമീപനങ്ങളും ക്രമ ആവർത്തനത്തെ ആശ്രയിക്കുന്നു. ഈ ആപ്പ് സ്ഥലിക സ്മൃതിയെ ആധാരമാക്കി ഒരു വ്യത്യസ്ത സമീപനം നൽകുന്നു — വെറും നാമ ക്രമം മാത്രമല്ല, ശ്രീ യന്ത്ര ജ്യാമിതിയിൽ ഓരോ ദേവത എവിടെ വസിക്കുന്നു എന്ന് കൂടി പഠിക്കുന്നു. ജ്യാമിതി ശരിക്കും ഉൾക്കൊണ്ടാൽ, ക്രമ ജപം സ്വാഭാവികമായി പിന്തുടരുന്നു.',
    how2: 'പര്യവേഷണ-മനഃപ്പാഠ വിഭാഗം ഘട്ടം ഘട്ടമായി ചെയ്യുക. പര്യവേഷണ മോഡ് ഉള്ളടക്കം അവലോകനത്തിന്, മനഃപ്പാഠ മോഡിൽ ദേവതാ നാമം മനസ്സിൽ ഓർക്കുക, പിന്നെ വെളിപ്പെടുത്തുക — ശരിയാണെങ്കിൽ ക്ലിക്ക്, തെറ്റാണെങ്കിൽ ഡബ്ൾ-ക്ലിക്ക്. സ്പോട്ട് ചെക്ക് ക്രമരഹിത ആവർത്തനം നൽകുന്നു. ഓർമ്മ മാപ്പ് നിങ്ങളുടെ ശക്തിഭേദങ്ങൾ കാണിക്കുന്നു.',
    how3_pre:  'ആരംഭിക്കുന്നതിനുമുമ്പ്, നാമങ്ങളുടെ ശബ്ദവും താളവും പരിചയപ്പെടാൻ ഖഡ്ഗമാലാ സ്തോത്രത്തിന്റെ പൂർണ്ണ ജപം ശ്രവിക്കുന്നത് ഉപകാരപ്രദമാണ്. ',
    how3_link: 'ഈ റെക്കോർഡിംഗ്',
    how3_post: ' ഒരു നല്ല ആരംഭ ബിന്ദുവാകാം. ഈ ആപ്പ് നിങ്ങൾക്ക് ഉപകാരപ്രദവും ആനന്ദദായകവുമാകട്ടെ എന്ന് ആശിക്കുന്നു.',
    tour_pre:  'ആപ്പ് പുതിയതാണോ? ',
    tour_link: 'ഗൈഡഡ് ടൂർ ആരംഭിക്കുക',
    tour_post: ' — എല്ലാ സവിശേഷതകളുടെയും ദ്രുത പരിചയം.',
  },
  ta: {
    mantra: 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः',
    salut:  'நமஸ்த்ரிபுரஸுந்தரி',
    fontClass: '',
    welcome1: 'நமஸ்காரம், ஶ்ரீ யந்த்ர மனனப் பயிற்சி உதவியில் உங்களை வரவேற்கிறோம் — ஶ்ரீ யந்த்ரத்தின் புனிதமான வடிவியலின் வழியாக கட்கமாலா ஸ்தோத்ரத்தை கற்று உள்வாங்க உதவும் ஒரு கருவி.',
    welcome2: 'இது ஒரு மனன மற்றும் உட்கொள்ளல் கருவி — ஶ்ரீ யந்த்ரம் அல்லது கட்கமாலா ஸ்தோத்ரத்தின் தத்துவம் அல்லது இறையியலுக்கான வழிகாட்டி அல்ல. அதற்காக வேறு பல சிறந்த வளங்கள் உள்ளன.',
    h_yantra: 'ஶ்ரீ யந்த்ரம்',
    yantra: 'ஶ்ரீ யந்த்ரம் (ஶ்ரீ சக்ரம் என்றும் அழைக்கப்படுகிறது) இந்து மதத்தில், குறிப்பாக ஶ்ரீ வித்யா பள்ளியிலும் பௌத்த தந்த்ர மரபுகளிலும் மிகவும் மரியாதைக்குரிய புனித வடிவியல் மண்டலங்களில் ஒன்றாகும். ஒன்பது பின்னிணைந்த முக்கோணங்கள் — நான்கு மேல்நோக்கியும் ஐந்து கீழ்நோக்கியும் — ஒரு மையப் புள்ளியிலிருந்து பரவுகின்றன, தாமரை இதழ்களாலும் நான்கு வாயில்களுடன் கூடிய வெளிப்புற சதுர சுற்றிணைப்பாலும் சூழப்பட்டிருக்கின்றன. அவை ஒன்பது ஆவரணங்களை உருவாக்குகின்றன — வெளிப்படையான உண்மையின் வெளிப்புற வெளிப்பாட்டிலிருந்து தூய விழிப்புணர்வின் புள்ளி வரை.',
    h_stotram: 'கட்கமாலா ஸ்தோத்ரம்',
    stotram: 'கட்கமாலா ஸ்தோத்ரம், அல்லது \'வாட்கள் மாலை\', ஒன்பது ஆவரணங்களில் வசிக்கும் தேவதைகளை பெயரால் வணங்குகிறது — மிக வெளிப்புற பூபுரத்திலிருந்து தொடங்கி, அதிகரிக்கும் இரகசியத்துடன், பிந்துவரை. ஒன்பது ஆவரணங்களில் 102 தேவதை நாமங்கள் உள்ளன. முழு ஸ்தோத்ரத்தில் ந்யாஸ தேவதாஃ, திதி நித்ய தேவதாஃ, திவ்யௌக, சித்தௌக, மானவௌக குருக்கள், நவ சக்ரேஶ்வரி மற்றும் நிறைவு விஶேஷணங்களும் அடங்கும் — மொத்தம் சுமார் 160 நாமங்கள், பரம்பரையால் சற்று மாறுபடலாம். ஶ்ரீ யந்த்ரத்தை மனதில் தெளிவாக வைத்துக்கொண்டு முழு ஸ்தோத்ரம் ஜபிப்பது ஶ்ரீ சக்ர பூஜைக்கு சமம் என்று கருதப்படுகிறது.',
    h_how: 'இந்த ஆப் எப்படி செயல்படுகிறது',
    how1: 'கட்கமாலா ஸ்தோத்ரத்தை மனப்பாடம் செய்வதற்கான பெரும்பாலான அணுகுமுறைகள் வரிசை மீண்டும் மீண்டும் சொல்வதை நம்பியிருக்கின்றன. இந்த ஆப் இடவியல் நினைவின் அடிப்படையில் வேறுபட்ட அணுகுமுறையை வழங்குகிறது — வெறும் நாமங்களின் வரிசை மட்டுமல்ல, ஶ்ரீ யந்த்ர வடிவியலில் ஒவ்வொரு தேவதையும் எங்கு வசிக்கிறார் என்பதையும் கற்றுக்கொள்கிறோம். வடிவியல் உண்மையிலேயே உட்கொள்ளப்பட்டால், வரிசை ஜபம் இயல்பாகவே பின்தொடரும்.',
    how2: 'ஆராய்ந்து மனப்பாடம் செய்யும் பிரிவில் நிலை நிலையாக செயல்படுங்கள். ஆராய்வு முறை உள்ளடக்க மதிப்பாய்வுக்கும், மனப்பாட முறையில் தேவதை பெயரை மனதில் நினைத்துப் பார்த்து வெளிப்படுத்துங்கள் — சரியெனில் கிளிக், தவறெனில் இருமுறை கிளிக். ஸ்பாட் செக் தோராயமான மதிப்பாய்வை வழங்குகிறது. நினைவு வரைபடம் உங்கள் வலிமை மற்றும் பலவீனங்களை காட்டுகிறது.',
    how3_pre:  'தொடங்கும் முன், நாமங்களின் ஒலி மற்றும் தாளத்தை பரிச்சயப்படுத்திக்கொள்ள கட்கமாலா ஸ்தோத்ரத்தின் முழு ஜபம் கேட்பது பயனுள்ளது. ',
    how3_link: 'இந்த பதிவு',
    how3_post: ' ஒரு நல்ல தொடக்க புள்ளியாக இருக்கலாம். இந்த ஆப் உங்களுக்கு பயனுள்ளதாகவும் மகிழ்ச்சியாகவும் இருக்கட்டும்.',
    tour_pre:  'ஆப்பில் புதியவரா? ',
    tour_link: 'வழிகாட்டப்பட்ட சுற்றுப்பயணத்தை மேற்கொள்ளுங்கள்',
    tour_post: ' — அனைத்து அம்சங்களையும் விரைவாக அறிய.',
  },
  te: {
    mantra: 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः',
    salut:  'నమస్త్రిపురసుందరి',
    fontClass: '',
    welcome1: 'నమస్కారం, శ్రీ యన్త్ర మననప్ పయిఱ్చి ఉతవియిల్ శ్రీ యన్త్ర స్మరణ సహాయకంలోకి స్వాగతం — శ్రీ యన్త్రం యొక్క పవిత్ర జ్యామితి ద్వారా ఖడ్గమాలా స్తోత్రాన్ని నేర్చుకుని అంతర్గతం చేసుకోవడానికి ఒక సాధనం.',
    welcome2: 'ఇది ఒక స్మరణ మరియు అంతర్గతీకరణ సాధనం — శ్రీ యన్త్రం లేదా ఖడ్గమాలా స్తోత్రం యొక్క తత్వశాస్త్రం లేదా ధర్మశాస్త్రానికి మార్గదర్శి కాదు. అందుకు ఇతర అనేక ఉత్తమ వనరులు అందుబాటులో ఉన్నాయి.',
    h_yantra: 'శ్రీ యన్త్రం',
    yantra: 'శ్రీ యన్త్రం (శ్రీ చక్రం అని కూడా పిలుస్తారు) హిందూ మతంలో, ముఖ్యంగా శ్రీ విద్యా పాఠశాలలో మరియు బౌద్ధ తాంత్రిక సంప్రదాయాలలో అత్యంత పవిత్రమైన జ్యామితీయ మండలాలలో ఒకటి. తొమ్మిది అంతర్ సంబంధిత త్రిభుజాలు — నాలుగు పైకి మరియు అయిదు కిందికి — కేంద్ర బిందువు నుండి వ్యాపిస్తాయి, కమల దళాలతో మరియు నాలుగు ద్వారాలతో కూడిన బాహ్య చతుర్భుజ ఆవరణతో చుట్టబడి ఉంటాయి. కలిసి అవి తొమ్మిది ఆవరణలు ఏర్పరుస్తాయి — బాహ్య వ్యక్త వాస్తవికత నుండి శుద్ధ అవగాహన బిందువు వరకు.',
    h_stotram: 'ఖడ్గమాలా స్తోత్రం',
    stotram: 'ఖడ్గమాలా స్తోత్రం, లేదా \'ఖడ్గాల మాల\', తొమ్మిది ఆవరణలలో నివసించే దేవతలను నామంతో ఆహ్వానిస్తుంది — బాహ్యమైన భూపురం నుండి ప్రారంభించి, పెరుగుతున్న రహస్యంతో, బిందువు వరకు. తొమ్మిది ఆవరణలలో 102 దేవతా నామాలు ఉన్నాయి. పూర్ణ స్తోత్రంలో న్యాస దేవతాః, తిథి నిత్య దేవతాః, దివ్యౌఘ, సిద్ధౌఘ మరియు మానవౌఘ గురువులు, నవ చక్రేశ్వరి మరియు ముగింపు విశేషణాలు కూడా ఉంటాయి — మొత్తం దాదాపు 160 నామాలు, సంప్రదాయం ప్రకారం కొద్దిగా మారవచ్చు. శ్రీ యన్త్రాన్ని మనసులో స్పష్టంగా ఉంచుకుని పూర్ణ స్తోత్రం జపించడం శ్రీ చక్ర పూజతో సమానమని పరిగణించబడుతుంది.',
    h_how: 'ఈ యాప్ ఎలా పని చేస్తుంది',
    how1: 'ఖడ్గమాలా స్తోత్రాన్ని కంఠస్థం చేయడానికి చాలా విధానాలు క్రమ పునరావృత్తిపై ఆధారపడతాయి. ఈ యాప్ స్థానిక స్మృతి ఆధారంగా భిన్నమైన విధానాన్ని అందిస్తుంది — కేవలం నామాల క్రమం మాత్రమే కాదు, శ్రీ యన్త్రం యొక్క జ్యామితిలో ప్రతి దేవత ఎక్కడ నివసిస్తుందో కూడా నేర్చుకుంటాం. జ్యామితి నిజంగా అంతర్గతమైనప్పుడు, క్రమ జపం సహజంగా అనుసరిస్తుంది.',
    how2: 'అన్వేషణ మరియు కంఠస్థం విభాగంలో స్థాయి స్థాయిగా పని చేయండి. అన్వేషణ మోడ్ సమీక్షకు, కంఠస్థం మోడ్‌లో దేవతా నామం మనసులో స్మరించి బహిర్గతం చేయండి — సరైతే క్లిక్, తప్పైతే డబుల్-క్లిక్. స్పాట్ చెక్ యాదృచ్ఛిక పునరావృత్తి అందిస్తుంది. జ్ఞాపక పటం మీ బలాలు మరియు బలహీనతలు చూపిస్తుంది.',
    how3_pre:  'ప్రారంభించే ముందు, నామాల ధ్వని మరియు లయతో పరిచయం పెంచుకోవడానికి ఖడ్గమాలా స్తోత్రం యొక్క పూర్ణ జపం వినడం ఉపయోగకరం. ',
    how3_link: 'ఈ రికార్డింగ్',
    how3_post: ' ఒక మంచి ప్రారంభ బిందువు కావచ్చు. ఈ యాప్ మీకు ఉపయోగకరంగా మరియు ఆనందదాయకంగా ఉండాలని ఆశిస్తున్నాం.',
    tour_pre:  'యాప్‌లో కొత్తగా చేరారా? ',
    tour_link: 'మార్గదర్శిత పర్యటన చేయండి',
    tour_post: ' — అన్ని లక్షణాల త్వరిత పరిచయానికి.',
  },
  mr: {
    mantra: 'ॐ ऐं ह्रीं श्रीं ऐं क्लीं सौः',
    salut:  'नमस्त्रिपुरसुन्दरि',
    fontClass: '',
    welcome1: 'नमस्कारम् आणि श्री यन्त्र स्मरण सहायकामध्ये आपले स्वागत आहे — श्री यन्त्राच्या पवित्र भूमितीद्वारे खड्गमाला स्तोत्र शिकण्याचे आणि आत्मसात करण्याचे एक साधन.',
    welcome2: 'हे एक स्मरण आणि आत्मसातीकरण साधन आहे — श्री यन्त्र किंवा खड्गमाला स्तोत्राच्या तत्त्वज्ञान अथवा धर्मशास्त्राचे मार्गदर्शन नाही. त्यासाठी इतर अनेक उत्कृष्ट संसाधने उपलब्ध आहेत.',
    h_yantra: 'श्री यन्त्र',
    yantra: 'श्री यन्त्र (श्री चक्र असेही म्हणतात) हिंदू, विशेषतः श्री विद्या संप्रदायात, आणि बौद्ध तांत्रिक परंपरांमधील सर्वाधिक पूजनीय पवित्र भौमितिक मंडलांपैकी एक आहे. नऊ परस्परसंबंधित त्रिकोण — चार ऊर्ध्वमुखी आणि पाच अधोमुखी — एका केंद्रीय बिंदूपासून विकिरण पावतात, कमळाच्या दलांनी आणि चार द्वारांसह बाह्य चौरस आवरणाने वेढलेले. एकत्रितपणे ते नऊ आवरणे निर्माण करतात — सर्वात बाहेरच्या व्यक्त वास्तवापासून शुद्ध जाणिवेच्या बिंदूपर्यंत.',
    h_stotram: 'खड्गमाला स्तोत्र',
    stotram: 'खड्गमाला स्तोत्र, म्हणजे 'तलवारांची माळ', नऊ आवरणांमध्ये वास करणाऱ्या देवतांना नावाने आवाहन करते — सर्वात बाहेरच्या भूपुरापासून सुरू होऊन, वाढत्या गोपनीयतेसह, बिंदूपर्यंत. नऊ आवरणांमध्ये 102 देवतानामे आहेत. पूर्ण स्तोत्रात न्यास देवताः, तिथी नित्य देवताः, दिव्यौघ, सिद्धौघ आणि मानवौघ गुरू, नव चक्रेश्वरी, तथा समापन विशेषणे यांचाही समावेश होतो — एकूण सुमारे 160 नामे, परंपरेनुसार किंचित भिन्न. श्री यन्त्र स्पष्टपणे मनात ठेवून संपूर्ण स्तोत्र जपणे श्री चक्र पूजेसमान मानले जाते.',
    h_how: 'हे अ‍ॅप कसे कार्य करते',
    how1: 'खड्गमाला स्तोत्र पाठ करण्याचे बहुतेक उपाय क्रमिक पुनरावृत्तीवर अवलंबून असतात. हे अ‍ॅप स्थानिक स्मृतीच्या आधारावर वेगळा दृष्टिकोन देते — केवळ नामांचा क्रम नाही, तर श्री यन्त्राच्या भूमितीत प्रत्येक देवता कुठे वास करते हेही शिकायचे आहे. भूमिती खऱ्या अर्थाने आत्मसात झाली की क्रमिक पाठ आपोआप येतो.',
    how2: 'अन्वेषण आणि पाठ विभागात स्तर-दर-स्तर कार्य करा. अन्वेषण मोड सामग्रीच्या आढाव्यासाठी आहे आणि पाठ मोडमध्ये देवतेचे नाव मनात आठवा, नंतर प्रकट करा — बरोबर असल्यास क्लिक, चुकीचे असल्यास दुहेरी-क्लिक. स्पॉट चेक यादृच्छिक पुनरावृत्ती देते. स्मृती नकाशा तुमची बलस्थाने आणि कमकुवत बाजू दाखवतो.',
    how3_pre:  'सुरुवात करण्यापूर्वी, नामांचे ध्वनी आणि ताल यांशी परिचित होण्यासाठी खड्गमाला स्तोत्राचे संपूर्ण पठण ऐकणे उपयुक्त आहे. ',
    how3_link: 'ही रेकॉर्डिंग',
    how3_post: ' एक चांगला प्रारंभबिंदू असू शकते. हे अ‍ॅप तुम्हाला उपयुक्त आणि आनंददायक ठरो अशी आमची इच्छा आहे.',
    tour_pre:  'अ‍ॅपमध्ये नवीन आहात? ',
    tour_link: 'मार्गदर्शित भ्रमण करा',
    tour_post: ' — सर्व वैशिष्ट्यांचा त्वरित परिचय.',
  },
  fr: {
    mantra: 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ',
    salut:  'Namastripurasundarī',
    fontClass: 'iast',
    welcome1: 'Namaskāram et bienvenue dans le Śrī Yantra Memoriser, un outil pour apprendre et intérioriser le Khadgamalā Stotram à travers la géométrie sacrée du Śrī Yantra.',
    welcome2: "Cet outil est conçu pour la mémorisation et l'intériorisation — ce n'est pas un guide sur la philosophie ou la théologie du Śrī Yantra ou du Khadgamalā Stotram. De nombreuses autres excellentes ressources existent à cet effet, dont certaines sont répertoriées dans la page Références.",
    h_yantra: 'Le Śrī Yantra',
    yantra: "Le Śrī Yantra (également appelé Śrī Cakra) est l'un des mandalas géométriques sacrés les plus vénérés dans les traditions hindoues, notamment au sein de l'école Śrī Vidyā, et dans les traditions tantriques bouddhistes. Neuf triangles entrelacés, quatre pointant vers le haut et cinq vers le bas, rayonnent depuis un point central, le Bindu, entourés de pétales de lotus et d'une enceinte extérieure carrée à quatre portails. Ensemble, ils forment neuf enceintes ou 'voiles' (āvaraṇas), progressant de l'expression la plus extérieure de la réalité manifestée jusqu'au point de pure conscience.",
    h_stotram: 'Le Khadgamalā Stotram',
    stotram: "Le Khadgamalā Stotram, ou 'le Collier d'épées', invoque par leur nom les divinités résidant dans chacune des neuf āvaraṇas, en progressant du Bhūpura extérieur vers l'intérieur, avec un secret croissant, jusqu'au Bindu. Les neuf āvaraṇas contiennent 102 noms de divinités. Le stotram complet inclut également les Nyāsa Devatāḥ, les Tithi Nitya Devatāḥ, les gourous Divyaugha, Siddhaugha et Mānavaugha, les Nava Cakreśvarī, et des épithètes finaux — environ 160 noms au total, variant légèrement selon la lignée. Réciter le stotram complet en ayant clairement le Śrī Yantra à l'esprit est considéré comme équivalent à une pūjā du Śrī Cakra.",
    h_how: "Fonctionnement de l'application",
    how1: "La plupart des approches pour mémoriser le Khadgamalā Stotram reposent sur la répétition séquentielle par cœur. Cette application propose une approche différente : la mémoire spatiale — apprendre non seulement l'ordre des noms, mais aussi où chaque divinité réside dans la géométrie du Śrī Yantra. Lorsque la géométrie est véritablement intériorisée, le chant séquentiel suit naturellement.",
    how2: "Parcourez les sections Explorer et Mémoriser niveau par niveau. Le mode Explorer permet de réviser le contenu, tandis que le mode Mémoriser invite à rappeler mentalement la divinité avant de survoler pour la révéler, puis d'enregistrer si elle est mémorisée ou non par un clic ou double-clic. Testez ensuite votre mémorisation avec la fonction aléatoire Contrôle Rapide. La Carte Mémoire permet de visualiser vos points forts et vos lacunes.",
    how3_pre:  "Avant de commencer, il est utile d'écouter une récitation complète du Khadgamalā Stotram pour se familiariser avec les sons et le rythme des noms. Vous trouverez peut-être que ",
    how3_link: 'cet enregistrement',
    how3_post: " est un bon point de départ. Nous espérons que vous apprécierez cette application et la trouverez utile.",
    tour_pre:  "Nouveau sur l'application ? ",
    tour_link: 'Faites la visite guidée',
    tour_post: ' pour une introduction rapide à toutes les fonctionnalités.',
  },
  es: {
    mantra: 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ',
    salut:  'Namastripurasundarī',
    fontClass: 'iast',
    welcome1: 'Namaskāram y bienvenido al Śrī Yantra Memoriser, una herramienta para aprender e interiorizar el Khadgamalā Stotram a través de la geometría sagrada del Śrī Yantra.',
    welcome2: 'Esta es una herramienta de memorización e interiorización, no una guía sobre la filosofía o la teología del Śrī Yantra o el Khadgamalā Stotram. Existen muchos otros excelentes recursos para ello, algunos de los cuales se encuentran en la página de Referencias.',
    h_yantra: 'El Śrī Yantra',
    yantra: "El Śrī Yantra (también llamado Śrī Cakra) es uno de los mandalas geométricos sagrados más venerados en las tradiciones hindúes, especialmente dentro de la escuela Śrī Vidyā, y en las tradiciones tántricas budistas. Nueve triángulos entrelazados, cuatro apuntando hacia arriba y cinco hacia abajo, irradian desde un punto central, el Bindu, rodeados de pétalos de loto y un recinto cuadrado exterior con cuatro portales. Juntos forman nueve recintos o 'velos' (āvaraṇas), progresando desde la expresión más externa de la realidad manifestada hasta el punto de pura conciencia.",
    h_stotram: 'El Khadgamalā Stotram',
    stotram: "El Khadgamalā Stotram, o 'el Collar de Espadas', invoca por nombre a las deidades que residen en cada una de las nueve āvaraṇas, avanzando desde el Bhūpura más exterior hacia adentro, con creciente secreto, hasta el Bindu. Las nueve āvaraṇas contienen 102 nombres de deidades. El stotram completo también incluye los Nyāsa Devatāḥ, los Tithi Nitya Devatāḥ, los gurús Divyaugha, Siddhaugha y Mānavaugha, los Nava Cakreśvarī, y epítetos finales — alrededor de 160 nombres en total, variando ligeramente según el linaje. Recitar el stotram completo con el Śrī Yantra claramente en mente se considera equivalente a una pūjā del Śrī Cakra.",
    h_how: 'Cómo funciona esta aplicación',
    how1: 'La mayoría de los enfoques para memorizar el Khadgamalā Stotram se basan en la repetición secuencial mecánica. Esta aplicación ofrece un enfoque diferente: la memoria espacial — aprender no solo el orden de los nombres, sino dónde reside cada deidad dentro de la geometría del Śrī Yantra. Cuando la geometría se interioriza genuinamente, el canto secuencial sigue de manera natural.',
    how2: 'Trabaja las secciones de Explorar y Memorizar nivel por nivel. El modo Explorar sirve para revisar el contenido y el modo Memorizar para recordar la deidad en tu mente antes de revelarla pasando el cursor, registrando si está memorizada o no con un clic o doble clic. Luego comprueba tu memorización con la función aleatoria de Comprobación Rápida. El Mapa de Memoria permite visualizar tus fortalezas y debilidades.',
    how3_pre:  'Antes de comenzar, es útil escuchar una recitación completa del Khadgamalā Stotram para familiarizarse con el sonido y el ritmo de los nombres. Puede que encuentres que ',
    how3_link: 'esta grabación',
    how3_post: ' es un buen punto de partida. Esperamos que disfrutes de esta aplicación y la encuentres útil.',
    tour_pre:  '¿Nuevo en la aplicación? ',
    tour_link: 'Haz el recorrido guiado',
    tour_post: ' para una introducción rápida a todas las funciones.',
  },
  it: {
    mantra: 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ',
    salut:  'Namastripurasundarī',
    fontClass: 'iast',
    welcome1: 'Namaskāram e benvenuto nello Śrī Yantra Memoriser, uno strumento per imparare e interiorizzare il Khadgamalā Stotram attraverso la geometria sacra dello Śrī Yantra.',
    welcome2: "Questo è uno strumento di memorizzazione e interiorizzazione, non una guida alla filosofia o alla teologia dello Śrī Yantra o del Khadgamalā Stotram. Esistono molte altre ottime risorse per questo scopo, alcune delle quali sono elencate nella pagina Riferimenti.",
    h_yantra: 'Lo Śrī Yantra',
    yantra: "Lo Śrī Yantra (chiamato anche Śrī Cakra) è uno dei mandala geometrici sacri più venerati nelle tradizioni indù, specialmente all'interno della scuola Śrī Vidyā, e nelle tradizioni tantriche buddhiste. Nove triangoli intrecciati, quattro rivolti verso l'alto e cinque verso il basso, irradiano da un punto centrale, il Bindu, circondati da petali di loto e da un recinto quadrato esterno con quattro portali. Insieme formano nove recinti o 'veli' (āvaraṇas), progredendo dall'espressione più esterna della realtà manifestata fino al punto di pura consapevolezza.",
    h_stotram: 'Il Khadgamalā Stotram',
    stotram: "Il Khadgamalā Stotram, ovvero 'la Ghirlanda di Spade', invoca per nome le divinità che risiedono in ciascuna delle nove āvaraṇas, procedendo dal Bhūpura più esterno verso l'interno, con crescente segretezza, fino al Bindu. Le nove āvaraṇas contengono 102 nomi di divinità. Lo stotram completo include anche i Nyāsa Devatāḥ, i Tithi Nitya Devatāḥ, i guru Divyaugha, Siddhaugha e Mānavaugha, i Nava Cakreśvarī, ed epiteti finali — circa 160 nomi in totale, variando leggermente secondo il lignaggio. Recitare lo stotram completo con lo Śrī Yantra chiaramente in mente è considerato equivalente a una pūjā dello Śrī Cakra.",
    h_how: "Come funziona questa applicazione",
    how1: "La maggior parte degli approcci per memorizzare il Khadgamalā Stotram si basa sulla ripetizione sequenziale meccanica. Questa applicazione offre un approccio diverso: la memoria spaziale — imparare non solo l'ordine dei nomi, ma dove ogni divinità risiede nella geometria dello Śrī Yantra. Quando la geometria viene genuinamente interiorizzata, il canto sequenziale segue naturalmente.",
    how2: "Lavora le sezioni Esplora e Memorizza livello per livello. La modalità Esplora serve per ripassare il contenuto, mentre la modalità Memorizza invita a richiamare mentalmente la divinità prima di rivelare il nome passando il cursore, registrando se è memorizzata o meno con un clic o doppio clic. Poi metti alla prova la tua memorizzazione con la funzione casuale Controllo Rapido. La Mappa della Memoria permette di visualizzare i tuoi punti di forza e di debolezza.",
    how3_pre:  "Prima di iniziare, è utile ascoltare una recitazione completa del Khadgamalā Stotram per familiarizzarsi con il suono e il ritmo dei nomi. Potresti trovare che ",
    how3_link: 'questa registrazione',
    how3_post: ' sia un buon punto di partenza. Speriamo che tu possa apprezzare questa applicazione e trovarla utile.',
    tour_pre:  "Nuovo nell'applicazione? ",
    tour_link: 'Fai il tour guidato',
    tour_post: ' per una rapida introduzione a tutte le funzioni.',
  },
  pt: {
    mantra: 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ',
    salut:  'Namastripurasundarī',
    fontClass: 'iast',
    welcome1: 'Namaskāram e bem-vindo ao Śrī Yantra Memoriser, uma ferramenta para aprender e interiorizar o Khadgamalā Stotram através da geometria sagrada do Śrī Yantra.',
    welcome2: 'Esta é uma ferramenta de memorização e interiorização, não um guia sobre a filosofia ou a teologia do Śrī Yantra ou do Khadgamalā Stotram. Existem muitos outros excelentes recursos para esse fim, alguns dos quais estão listados na página de Referências.',
    h_yantra: 'O Śrī Yantra',
    yantra: "O Śrī Yantra (também chamado de Śrī Cakra) é um dos mandalas geométricos sagrados mais venerados nas tradições hindus, especialmente dentro da escola Śrī Vidyā, e nas tradições tântricas budistas. Nove triângulos entrelaçados, quatro apontando para cima e cinco para baixo, irradiam de um ponto central, o Bindu, rodeados por pétalas de lótus e um recinto quadrado exterior com quatro portais. Juntos formam nove recintos ou 'véus' (āvaraṇas), progredindo da expressão mais externa da realidade manifestada até ao ponto de pura consciência.",
    h_stotram: 'O Khadgamalā Stotram',
    stotram: "O Khadgamalā Stotram, ou 'o Colar de Espadas', invoca pelo nome as divindades que residem em cada uma das nove āvaraṇas, avançando desde o Bhūpura mais externo para o interior, com crescente sigilo, até ao Bindu. As nove āvaraṇas contêm 102 nomes de divindades. O stotram completo inclui também os Nyāsa Devatāḥ, os Tithi Nitya Devatāḥ, os gurus Divyaugha, Siddhaugha e Mānavaugha, os Nava Cakreśvarī, e epítetos finais — cerca de 160 nomes no total, variando ligeiramente consoante a linhagem. Recitar o stotram completo com o Śrī Yantra claramente em mente é considerado equivalente a uma pūjā do Śrī Cakra.",
    h_how: 'Como funciona esta aplicação',
    how1: 'A maioria das abordagens para memorizar o Khadgamalā Stotram baseia-se na repetição sequencial mecânica. Esta aplicação oferece uma abordagem diferente: a memória espacial — aprender não apenas a ordem dos nomes, mas onde cada divindade reside na geometria do Śrī Yantra. Quando a geometria é genuinamente interiorizada, o canto sequencial segue naturalmente.',
    how2: 'Trabalhe as secções de Explorar e Memorizar nível a nível. O modo Explorar serve para rever o conteúdo e o modo Memorizar convida a recordar mentalmente a divindade antes de revelar o nome passando o cursor, registando se está memorizada ou não com um clique ou duplo clique. Depois teste a sua memorização com a função aleatória de Verificação Rápida. O Mapa de Memória permite visualizar os seus pontos fortes e fracos.',
    how3_pre:  'Antes de começar, é útil ouvir uma recitação completa do Khadgamalā Stotram para se familiarizar com o som e o ritmo dos nomes. Pode descobrir que ',
    how3_link: 'esta gravação',
    how3_post: ' é um bom ponto de partida. Esperamos que aprecie esta aplicação e a encontre útil.',
    tour_pre:  'Novo na aplicação? ',
    tour_link: 'Faça a visita guiada',
    tour_post: ' para uma introdução rápida a todas as funcionalidades.',
  },
  de: {
    mantra: 'Oṃ Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ',
    salut:  'Namastripurasundarī',
    fontClass: 'iast',
    welcome1: 'Namaskāram und willkommen beim Śrī Yantra Memoriser — einem Werkzeug, um den Khadgamalā Stotram durch die heilige Geometrie des Śrī Yantra zu lernen und zu verinnerlichen.',
    welcome2: 'Dies ist ein Werkzeug zur Memorierung und Verinnerlichung, kein Leitfaden zur Philosophie oder Theologie des Śrī Yantra oder des Khadgamalā Stotram. Dafür gibt es viele andere hervorragende Quellen, einige davon sind auf der Seite Referenzen aufgeführt.',
    h_yantra: 'Das Śrī Yantra',
    yantra: "Das Śrī Yantra (auch Śrī Cakra genannt) ist eines der verehrtesten heiligen geometrischen Mandalas in hinduistischen Traditionen, besonders innerhalb der Śrī Vidyā-Schule, sowie in buddhistischen Tantra-Traditionen. Neun ineinandergreifende Dreiecke — vier nach oben und fünf nach unten weisend — strahlen von einem zentralen Punkt, dem Bindu, aus, umgeben von Lotusblütenblättern und einem äußeren quadratischen Gehege mit vier Toren. Zusammen bilden sie neun Umhüllungen oder 'Schleier' (āvaraṇas), die von der äußersten Ausdrucksform der manifestierten Wirklichkeit bis zum Punkt reinen Bewusstseins fortschreiten.",
    h_stotram: 'Der Khadgamalā Stotram',
    stotram: "Der Khadgamalā Stotram, oder 'das Schwerterkollier', ruft namentlich die Gottheiten an, die in jeder der neun āvaraṇas wohnen — vom äußersten Bhūpura nach innen, mit zunehmender Geheimhaltung, bis zum Bindu. Die neun āvaraṇas enthalten 102 Götternamen. Der vollständige Stotram umfasst auch die Nyāsa Devatāḥ, die Tithi Nitya Devatāḥ, die Divyaugha-, Siddhaugha- und Mānavaugha-Gurus, die Nava Cakreśvarī sowie abschließende Beinamen — insgesamt etwa 160 Namen, je nach Überlieferungslinie leicht variierend. Das vollständige Stotram mit dem Śrī Yantra klar vor Augen zu rezitieren gilt als gleichwertig mit einer Śrī Cakra-Pūjā.",
    h_how: 'Wie diese App funktioniert',
    how1: 'Die meisten Ansätze zur Memorierung des Khadgamalā Stotram beruhen auf sequenzieller Wiederholung. Diese App bietet einen anderen Ansatz: räumliches Gedächtnis — nicht nur die Reihenfolge der Namen zu lernen, sondern auch wo jede Gottheit innerhalb der Geometrie des Śrī Yantra wohnt. Wenn die Geometrie wirklich verinnerlicht ist, folgt der sequenzielle Gesang auf natürliche Weise.',
    how2: 'Arbeite die Abschnitte Erkunden und Einprägen Ebene für Ebene durch. Der Erkunden-Modus dient zur Wiederholung des Inhalts, während der Einprägen-Modus dazu einlädt, die Gottheit gedanklich zu erinnern, bevor man über sie fährt, um sie zu enthüllen, und dann durch Klick oder Doppelklick festzuhalten, ob sie eingeprägt wurde. Teste deine Memorierung anschließend mit der zufälligen Schnelltest-Funktion. Die Gedächtniskarte zeigt deine Stärken und Schwächen.',
    how3_pre:  'Bevor du beginnst, ist es hilfreich, eine vollständige Rezitation des Khadgamalā Stotram zu hören, um sich mit dem Klang und dem Rhythmus der Namen vertraut zu machen. Vielleicht findest du, dass ',
    how3_link: 'diese Aufnahme',
    how3_post: ' ein guter Ausgangspunkt ist. Wir hoffen, dass dir diese App gefällt und du sie nützlich findest.',
    tour_pre:  'Neu in der App? ',
    tour_link: 'Mache die geführte Tour',
    tour_post: ' für eine schnelle Einführung in alle Funktionen.',
  },
}

export default function IntroView({ script = 'iast', uiLang = 'en', onStartTour }) {
  const c = CONTENT[uiLang] ?? CONTENT.en
  const isLatinScript = ['en','fr','es','it','pt','de'].includes(uiLang)
  const isEnglish = uiLang === 'en'

  // For Sanskrit inline spans: use iast class when rendering IAST/English UI
  const skt = isLatinScript ? 'iast' : ''

  return (
    <div className="relative w-full overflow-x-hidden overflow-y-auto">

      {/* ── Watermark — full Sri Yantra at low opacity ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.07 }}
        aria-hidden="true"
      >
        <div style={{ width: '160%', position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)' }}>
          <SriYantraSVG
            showTriangles={true}
            showLabels={false}
            showNumbers={false}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative max-w-xl md:max-w-none mx-auto px-6 py-10 space-y-8">

        {/* Opening invocation */}
        <div className="text-center space-y-2 pb-6 border-b border-surface-800">
          <p
            className={`${isLatinScript ? 'iast' : ''} text-gold-300 leading-relaxed tracking-wide`}
            style={{ fontSize: '22px' }}
          >
            {c.mantra}
          </p>
          <p className={`${isLatinScript ? 'iast' : ''} text-gold-600 text-lg`}>
            {c.salut}
          </p>
        </div>

        {/* Welcome */}
        <section className="space-y-3">
          <p className={`${skt} text-gold-400 text-sm leading-relaxed`}>
            {c.welcome1}
          </p>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            {isEnglish ? c.welcome2_en : c.welcome2}
          </p>
        </section>

        {/* The Śrī Yantra */}
        <section className="space-y-2">
          <h2 className={`${skt} text-gold-700 text-xs font-mono uppercase tracking-widest`}>
            {c.h_yantra}
          </h2>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            {c.yantra}
          </p>
        </section>

        {/* The Khadgamala Stotram */}
        <section className="space-y-2">
          <h2 className={`${skt} text-gold-700 text-xs font-mono uppercase tracking-widest`}>
            {c.h_stotram}
          </h2>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            {c.stotram}
          </p>
        </section>

        {/* How this app works */}
        <section className="space-y-2">
          <h2 className={`${skt} text-gold-700 text-xs font-mono uppercase tracking-widest`}>
            {c.h_how}
          </h2>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            {c.how1}
          </p>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            {c.how2}
          </p>
          <p className={`${skt} text-muted text-sm leading-relaxed`}>
            {c.how3_pre}
            <a
              href="https://youtu.be/Ro701GJzg4c?si=YPV1Uwy-B8VFCHoD"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
            >
              {c.how3_link}
            </a>
            {c.how3_post}
          </p>
          {onStartTour && (
            <p className={`${skt} text-muted text-sm leading-relaxed`}>
              {c.tour_pre}
              <button
                onClick={onStartTour}
                className="text-gold-400 hover:text-gold-300 underline underline-offset-2 cursor-pointer"
              >
                {c.tour_link}
              </button>
              {c.tour_post}
            </p>
          )}
        </section>

        <div className="h-4" />
      </div>
    </div>
  )
}
