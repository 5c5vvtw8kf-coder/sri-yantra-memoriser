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
}

export default function IntroView({ script = 'iast', uiLang = 'en', onStartTour }) {
  const c = CONTENT[uiLang] ?? CONTENT.en
  const isEnglish = uiLang === 'en'

  // For Sanskrit inline spans: use iast class when rendering IAST/English UI
  const skt = isEnglish ? 'iast' : ''

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
            className={`${isEnglish ? 'iast' : ''} text-gold-300 leading-relaxed tracking-wide`}
            style={{ fontSize: '22px' }}
          >
            {c.mantra}
          </p>
          <p className={`${isEnglish ? 'iast' : ''} text-gold-600 text-lg`}>
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
