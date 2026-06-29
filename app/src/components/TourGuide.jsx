import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { iastToEnglish } from '../translations.js'

// ── Tour state key ────────────────────────────────────────────────────────────
const TOUR_KEY = 'sriYantra_tourSeen_v1'

// ── Layout constants ──────────────────────────────────────────────────────────
const PAD   = 8   // padding around the highlighted element (px)
const GAP   = 16  // gap between element edge and popover (px)
const POP_W = 290 // popover width (px)

// ── Tour step definitions (per language) ─────────────────────────────────────
// Step 8 (Full Stotram Text) is included in 'en' only; getSteps() filters by uiLang.

const STEPS_EN = [
  {
    title: 'Welcome to Śrī Yantra Memoriser',
    body:
      '<p>This app helps you learn the <em>Khadgamala Stotram</em>, around 180 deity ' +
      'names, by building spatial memory of the Śrī Yantra geometry.</p>' +
      '<p>Rather than drilling a word list, you learn <em>where</em> each deity lives ' +
      'in the yantra. Spatial memory makes sequential recall natural.</p>',
  },
  {
    title: 'Navigation',
    body:
      'On desktop the sidebar is always visible on the left. On mobile, tap the ' +
      '<strong>☰</strong> button to open it.<br><br>' +
      'It lists every chant section — Nyāsa Deities, Gurus, all nine āvaraṇas through ' +
      'to the bindu — plus tools like Spot Check and Memory Map. Tap any item to open it.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'Explore and Memorise',
    body:
      'Every section has two modes:<br><br>' +
      '<strong>Explore</strong> — names are revealed as you tap through.<br>' +
      '<strong>Memorise</strong> — names are hidden; recall the name before hovering ' +
      'over then mark each one memorised or not.<br><br>' +
      'Work through each circuit from outer to inner.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'The Nine Āvaraṇas',
    body:
      'Each of the nine āvaraṇas is its own section. Start with the outermost, ' +
      'the Bhūpura square, and work inward toward the bindu. Progress dots appear next ' +
      'to sections as you complete them.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'Spot Check',
    body:
      '<strong>Spot Check</strong> picks a random position on the yantra and asks you ' +
      'to name the deity there. This builds flexible recall, not just rote sequence.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'Memory Map',
    body:
      'The <strong>Memory Map</strong> shows your progress across the entire yantra at a ' +
      'glance — <span class="syt-tour-green">✓ green</span> for memorised, ' +
      '<span class="syt-tour-amber">~ amber</span> for partially correct, ' +
      '<span class="syt-tour-red">✗ red</span> for not yet memorised.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'Śrī Yantra',
    body:
      'The <strong>Śrī Yantra</strong> tab shows the complete diagram as a reference — ' +
      'all nine circuits from the Bhūpura to the bindu.',
  },
  {
    // English only — hidden for other languages
    selector: '[data-tour="nav-browser"]',
    title: 'Full Stotram Text',
    body:
      'The <strong>Khadgamala Stotram</strong> page has the complete chant with ' +
      'transliteration, Devanāgarī and English translation, for reading and reference.',
    englishOnly: true,
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: "You're all set",
    body:
      'Click the <strong>✈</strong> button here any time to revisit this tour.<br><br>' +
      'Begin with <em>Welcome and Introduction</em>, then work through the circuits in ' +
      'order. Take your time — this is a practice, not a race. 🙏',
  },
]

const STEPS_HI = [
  {
    title: 'श्री यन्त्र स्मरण-सहायक में आपका स्वागत है',
    body:
      '<p>यह ऐप <em>खड्गमाला स्तोत्र</em> के लगभग 180 देवता नामों को श्री यन्त्र की स्थानिक स्मृति के माध्यम से सीखने में मदद करता है।</p>' +
      '<p>शब्दों की सूची को रटने के बजाय, आप सीखते हैं कि प्रत्येक देवता यन्त्र में <em>कहाँ</em> विराजमान हैं। स्थानिक स्मृति से क्रमिक स्मरण सहज हो जाता है।</p>',
  },
  {
    title: 'नेविगेशन',
    body:
      'डेस्कटॉप पर साइडबार बाईं ओर सदैव दृश्य रहता है। मोबाइल पर इसे खोलने के लिए <strong>☰</strong> बटन दबाएँ।<br><br>' +
      'इसमें प्रत्येक पाठ खण्ड सूचीबद्ध है — न्यास देवताः, गुरु, सभी नौ आवरण बिन्दु तक — साथ ही स्पॉट चेक और स्मृति मानचित्र जैसे उपकरण। किसी भी आइटम को खोलने के लिए उस पर टैप करें।',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'अन्वेषण और कंठस्थ',
    body:
      'प्रत्येक खण्ड में दो मोड होते हैं:<br><br>' +
      '<strong>अन्वेषण</strong> — टैप करने पर नाम प्रकट होते हैं।<br>' +
      '<strong>कंठस्थ</strong> — नाम छिपे होते हैं; पहले स्मरण करें, फिर प्रकट करें और चिह्नित करें।<br><br>' +
      'प्रत्येक आवरण को बाहर से भीतर की ओर पूर्ण करें।',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'नौ आवरण',
    body:
      'प्रत्येक आवरण का अपना खण्ड है। सबसे बाहरी भूपुर से प्रारम्भ करें और बिन्दु की ओर बढ़ें। खण्ड पूर्ण होने पर प्रगति बिन्दु प्रकट होते हैं।',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'स्पॉट चेक',
    body:
      '<strong>स्पॉट चेक</strong> यन्त्र पर एक यादृच्छिक स्थान चुनता है और आपसे वहाँ की देवता का नाम पूछता है। यह लचीली स्मृति बनाता है, न केवल क्रमिक पाठ।',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'स्मृति मानचित्र',
    body:
      '<strong>स्मृति मानचित्र</strong> पूरे यन्त्र में आपकी प्रगति एक दृष्टि में दिखाता है — <span class="syt-tour-green">✓ हरा</span> कंठस्थ के लिए, <span class="syt-tour-amber">~ पीला</span> आंशिक के लिए, <span class="syt-tour-red">✗ लाल</span> अभी तक नहीं के लिए।',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'श्री यन्त्र',
    body:
      '<strong>श्री यन्त्र</strong> टैब सम्पूर्ण चित्र को सन्दर्भ के रूप में दिखाता है — भूपुर से बिन्दु तक सभी नौ आवरण।',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'आप तैयार हैं',
    body:
      'इस <strong>✈</strong> बटन को किसी भी समय दबाकर यह भ्रमण पुनः देखें।<br><br>' +
      '<em>स्वागत और परिचय</em> से आरम्भ करें, फिर आवरणों को क्रम में पूर्ण करें। समय लें — यह साधना है, दौड़ नहीं। 🙏',
  },
]

const STEPS_KN = [
  {
    title: 'ಶ್ರೀ ಯಂತ್ರ ಸ್ಮರಣ ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ',
    body:
      '<p>ಈ ಆ್ಯಪ್ <em>ಖಡ್ಗಮಾಲಾ ಸ್ತೋತ್ರ</em>ದ ಸುಮಾರು 180 ದೇವತಾ ನಾಮಗಳನ್ನು ಶ್ರೀ ಯಂತ್ರ ಜ್ಯಾಮಿತಿಯ ಸ್ಥಾನಿಕ ಸ್ಮೃತಿ ಮೂಲಕ ಕಲಿಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.</p>' +
      '<p>ಶಬ್ದ ಪಟ್ಟಿ ರಟ್ಟು ಮಾಡುವ ಬದಲು, ಪ್ರತಿ ದೇವತೆ ಯಂತ್ರದಲ್ಲಿ <em>ಎಲ್ಲಿ</em> ನೆಲೆಸಿದ್ದಾರೆ ಎಂದು ಕಲಿಯುತ್ತೀರಿ. ಸ್ಥಾನಿಕ ಸ್ಮೃತಿ ಕ್ರಮ ಸ್ಮರಣವನ್ನು ಸ್ವಾಭಾವಿಕಗೊಳಿಸುತ್ತದೆ.</p>',
  },
  {
    title: 'ನ್ಯಾವಿಗೇಶನ್',
    body:
      'ಡೆಸ್ಕ್‌ಟಾಪ್‌ನಲ್ಲಿ ಸೈಡ್‌ಬಾರ್ ಎಡಭಾಗದಲ್ಲಿ ಯಾವಾಗಲೂ ಗೋಚರಿಸುತ್ತದೆ. ಮೊಬೈಲ್‌ನಲ್ಲಿ ತೆರೆಯಲು <strong>☰</strong> ಬಟನ್ ಒತ್ತಿ.<br><br>' +
      'ಇದು ಪ್ರತಿ ಪಾಠ ವಿಭಾಗ — ನ್ಯಾಸ ದೇವತಾಃ, ಗುರುಗಳು, ಎಲ್ಲ ಒಂಬತ್ತು ಆವರಣಗಳು — ಜೊತೆಗೆ ಸ್ಪಾಟ್ ಚೆಕ್ ಮತ್ತು ಸ್ಮೃತಿ ಪಟ ಉಪಕರಣಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡುತ್ತದೆ.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'ಅನ್ವೇಷಣ ಮತ್ತು ಕಂಠಸ್ಥ',
    body:
      'ಪ್ರತಿ ವಿಭಾಗದಲ್ಲಿ ಎರಡು ಮೋಡ್‌ಗಳಿವೆ:<br><br>' +
      '<strong>ಅನ್ವೇಷಣ</strong> — ಟ್ಯಾಪ್ ಮಾಡಿದಾಗ ನಾಮಗಳು ಬಹಿರಂಗವಾಗುತ್ತವೆ.<br>' +
      '<strong>ಕಂಠಸ್ಥ</strong> — ನಾಮಗಳು ಮರೆಯಾಗಿರುತ್ತವೆ; ಮೊದಲು ಸ್ಮರಿಸಿ, ನಂತರ ಬಹಿರಂಗಪಡಿಸಿ.<br><br>' +
      'ಪ್ರತಿ ಆವರಣವನ್ನು ಹೊರಗಿನಿಂದ ಒಳಗಿನವರೆಗೆ ಪೂರ್ಣಗೊಳಿಸಿ.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'ಒಂಬತ್ತು ಆವರಣಗಳು',
    body:
      'ಪ್ರತಿ ಆವರಣ ತನ್ನದೇ ವಿಭಾಗ. ಬಾಹ್ಯ ಭೂಪುರದಿಂದ ಆರಂಭಿಸಿ ಬಿಂದುವಿನೆಡೆಗೆ ಸಾಗಿ. ವಿಭಾಗ ಪೂರ್ಣಗೊಂಡಂತೆ ಪ್ರಗತಿ ಬಿಂದುಗಳು ಕಾಣಿಸುತ್ತವೆ.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'ಸ್ಪಾಟ್ ಚೆಕ್',
    body:
      '<strong>ಸ್ಪಾಟ್ ಚೆಕ್</strong> ಯಂತ್ರದ ಯಾದೃಚ್ಛಿಕ ಸ್ಥಾನ ಆಯ್ಕೆ ಮಾಡಿ ಅಲ್ಲಿನ ದೇವತೆ ಯಾರು ಎಂದು ಕೇಳುತ್ತದೆ. ಇದು ಹೊಂದಿಕೊಳ್ಳುವ ಸ್ಮೃತಿ ನಿರ್ಮಿಸುತ್ತದೆ.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'ಸ್ಮೃತಿ ಪಟ',
    body:
      '<strong>ಸ್ಮೃತಿ ಪಟ</strong> ಇಡೀ ಯಂತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಗತಿ ಒಂದು ನೋಟದಲ್ಲಿ ತೋರಿಸುತ್ತದೆ — <span class="syt-tour-green">✓ ಹಸಿರು</span> ಕಂಠಸ್ಥಕ್ಕೆ, <span class="syt-tour-amber">~ ಅಂಬರ್</span> ಭಾಗಶಃ, <span class="syt-tour-red">✗ ಕೆಂಪು</span> ಇನ್ನೂ ಕಲಿಯದ ನಾಮಗಳಿಗೆ.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'ಶ್ರೀ ಯಂತ್ರ',
    body:
      '<strong>ಶ್ರೀ ಯಂತ್ರ</strong> ಟ್ಯಾಬ್ ಸಂಪೂರ್ಣ ರೇಖಾಚಿತ್ರವನ್ನು ಸಂದರ್ಭ ಉಲ್ಲೇಖವಾಗಿ ತೋರಿಸುತ್ತದೆ — ಭೂಪುರದಿಂದ ಬಿಂದುವರೆಗೆ ಎಲ್ಲ ಒಂಬತ್ತು ಆವರಣಗಳು.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'ನೀವು ಸಿದ್ಧರಾಗಿದ್ದೀರಿ',
    body:
      'ಈ <strong>✈</strong> ಬಟನ್ ಯಾವಾಗಲಾದರೂ ಒತ್ತಿ ಈ ಪ್ರವಾಸ ಮತ್ತೆ ನೋಡಿ.<br><br>' +
      '<em>ಸ್ವಾಗತ ಮತ್ತು ಪರಿಚಯ</em>ದಿಂದ ಪ್ರಾರಂಭಿಸಿ, ನಂತರ ಆವರಣಗಳನ್ನು ಕ್ರಮವಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿ. ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ — ಇದು ಸಾಧನ, ಸ್ಪರ್ಧೆ ಅಲ್ಲ. 🙏',
  },
]

const STEPS_ML = [
  {
    title: 'ശ്രീ യന്ത്ര മനഃപ്പാഠ സഹായകത്തിലേക്ക് സ്വാഗതം',
    body:
      '<p>ഈ ആപ്പ് <em>ഖഡ്ഗമാലാ സ്തോത്ര</em>ത്തിലെ ഏകദേശം 180 ദേവതാ നാമങ്ങൾ ശ്രീ യന്ത്ര ജ്യാമിതിയുടെ സ്ഥലിക സ്മൃതി വഴി പഠിക്കാൻ സഹായിക്കുന്നു.</p>' +
      '<p>പദ പട്ടിക ആവർത്തിക്കുന്നതിനു പകരം, ഓരോ ദേവത യന്ത്രത്തിൽ <em>എവിടെ</em> ഉണ്ട് എന്ന് പഠിക്കുന്നു. സ്ഥലിക സ്മൃതി ക്രമ ഓർമ്മ സ്വാഭാവികമാക്കുന്നു.</p>',
  },
  {
    title: 'നാവിഗേഷൻ',
    body:
      'ഡെസ്ക്ടോപ്പിൽ സൈഡ്ബാർ ഇടതുഭാഗത്ത് എപ്പോഴും ദൃശ്യമാണ്. മൊബൈലിൽ തുറക്കാൻ <strong>☰</strong> ബട്ടൺ ടാപ്പ് ചെയ്യുക.<br><br>' +
      'ഇത് ഓരോ ജപ വിഭാഗം — ന്യാസ ദേവതാഃ, ഗുരുക്കൾ, ഒൻപത് ആവരണങ്ങൾ — കൂടാതെ സ്പോട്ട് ചെക്ക്, ഓർമ്മ മാപ്പ് ഉപകരണങ്ങൾ എന്നിവ പട്ടികപ്പെടുത്തുന്നു.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'പര്യവേഷണം & മനഃപ്പാഠം',
    body:
      'ഓരോ വിഭാഗത്തിനും രണ്ട് മോഡ് ഉണ്ട്:<br><br>' +
      '<strong>പര്യവേഷണം</strong> — ടാപ്പ് ചെയ്യുമ്പോൾ നാമങ്ങൾ വെളിപ്പെടുന്നു.<br>' +
      '<strong>മനഃപ്പാഠം</strong> — നാമങ്ങൾ മറഞ്ഞിരിക്കും; ആദ്യം ഓർക്കുക, പിന്നെ വെളിപ്പെടുത്തുക.<br><br>' +
      'ഓരോ ആവരണവും പുറത്ത് നിന്ന് അകത്തേക്ക് പൂർത്തിയാക്കുക.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'ഒൻപത് ആവരണങ്ങൾ',
    body:
      'ഓരോ ആവരണവും അതിന്റേതായ വിഭാഗമാണ്. ഏറ്റവും പുറത്തെ ഭൂപുരത്തിൽ ആരംഭിച്ച് ബിന്ദുവിലേക്ക് നീങ്ങുക. വിഭാഗം പൂർത്തിയാകുമ്പോൾ പ്രോഗ്രസ് ഡോട്ടുകൾ കാണിക്കും.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'സ്പോട്ട് ചെക്ക്',
    body:
      '<strong>സ്പോട്ട് ചെക്ക്</strong> യന്ത്രത്തിൽ ഒരു ക്രമരഹിത സ്ഥാനം തിരഞ്ഞെടുത്ത് ആ ദേവതയുടെ പേര് ചോദിക്കുന്നു. ഇത് വഴക്കമുള്ള ഓർമ്മ നിർമ്മിക്കുന്നു.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'ഓർമ്മ മാപ്പ്',
    body:
      '<strong>ഓർമ്മ മാപ്പ്</strong> മുഴുവൻ യന്ത്രത്തിലും നിങ്ങളുടെ പുരോഗതി ഒറ്റ നോട്ടത്തിൽ കാണിക്കുന്നു — <span class="syt-tour-green">✓ പച്ച</span> മനഃപ്പാഠം ചെയ്തതിന്, <span class="syt-tour-amber">~ ആംബർ</span> ഭാഗികമായി, <span class="syt-tour-red">✗ ചുവപ്പ്</span> ഇനിയും ചെയ്യാത്തതിന്.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'ശ്രീ യന്ത്രം',
    body:
      '<strong>ശ്രീ യന്ത്രം</strong> ടാബ് സമ്പൂർണ്ണ ഡയഗ്രം റഫറൻസായി കാണിക്കുന്നു — ഭൂപുരത്തിൽ നിന്ന് ബിന്ദുവരെ ഒൻപത് ആവരണങ്ങൾ.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'നിങ്ങൾ തയ്യാർ',
    body:
      'ഈ <strong>✈</strong> ബട്ടൺ ഏത് സമയത്തും ടാപ്പ് ചെയ്ത് ഈ ടൂർ വീണ്ടും കാണുക.<br><br>' +
      '<em>സ്വാഗതം & പരിചയം</em> തൊട്ടു തുടങ്ങി ആവരണങ്ങൾ ക്രമത്തിൽ പൂർത്തിയാക്കുക. ധൃതി വേണ്ട — ഇത് ഒരു സാധന, ഓട്ടമത്സരം അല്ല. 🙏',
  },
]

const STEPS_TA = [
  {
    title: 'ஶ்ரீ யந்த்ர மனன உதவியில் உங்களை வரவேற்கிறோம்',
    body:
      '<p>இந்த ஆப் <em>கட்கமாலா ஸ்தோத்ர</em>த்தின் சுமார் 180 தேவதை நாமங்களை ஶ்ரீ யந்த்ர ஜ்யாமிதியின் இட நினைவு மூலம் கற்க உதவுகிறது.</p>' +
      '<p>சொல்பட்டியல் மனனத்திற்கு பதிலாக, ஒவ்வொரு தேவதையும் யந்த்ரத்தில் <em>எங்கு</em> உள்ளார் என்பதை கற்கிறீர்கள். இட நினைவு வரிசை ஞாபகத்தை இயல்பாக்குகிறது.</p>',
  },
  {
    title: 'வழிசெலுத்தல்',
    body:
      'டெஸ்க்டாப்பில் பக்கப்பட்டி இடதுபக்கம் எப்போதும் தெரியும். மொபைலில் திறக்க <strong>☰</strong> பொத்தானை தட்டுங்கள்.<br><br>' +
      'இது ஒவ்வொரு ஜப பிரிவையும் — ந்யாஸ தேவதாஃ, குருக்கள், ஒன்பது ஆவரணங்கள் — மற்றும் ஸ்பாட் செக்க், நினைவு வரைபடம் கருவிகளை பட்டியலிடுகிறது.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'ஆராய்வு & மனப்பாடம்',
    body:
      'ஒவ்வொரு பிரிவிலும் இரண்டு முறைகள் உள்ளன:<br><br>' +
      '<strong>ஆராய்வு</strong> — தட்டும்போது பெயர்கள் வெளிப்படுகின்றன.<br>' +
      '<strong>மனப்பாடம்</strong> — பெயர்கள் மறைக்கப்பட்டிருக்கும்; முதலில் நினைவுகூருங்கள், பிறகு வெளிப்படுத்துங்கள்.<br><br>' +
      'ஒவ்வொரு ஆவரணத்தையும் வெளியிலிருந்து உள்ளே நோக்கி பூர்த்தி செய்யுங்கள்.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'ஒன்பது ஆவரணங்கள்',
    body:
      'ஒவ்வொரு ஆவரணமும் அதன் சொந்த பிரிவு. மிக வெளிப்புற பூபுரத்திலிருந்து தொடங்கி பிந்துவை நோக்கி பயணியுங்கள். பிரிவு முடிந்தவுடன் முன்னேற்ற புள்ளிகள் தெரியும்.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'ஸ்பாட் செக்',
    body:
      '<strong>ஸ்பாட் செக்</strong> யந்த்ரத்தில் ஒரு தோராய இடத்தை தேர்ந்தெடுத்து அங்குள்ள தேவதையின் பெயர் கேட்கிறது. இது நெகிழ்வான நினைவை உருவாக்குகிறது.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'நினைவு வரைபடம்',
    body:
      '<strong>நினைவு வரைபடம்</strong> முழு யந்த்ரத்திலும் உங்கள் முன்னேற்றத்தை ஒரே பார்வையில் காட்டுகிறது — <span class="syt-tour-green">✓ பச்சை</span> மனப்பாடம் செய்தவை, <span class="syt-tour-amber">~ ஆம்பர்</span> பகுதியாக, <span class="syt-tour-red">✗ சிவப்பு</span> இன்னும் கற்காதவை.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'ஶ்ரீ யந்த்ரம்',
    body:
      '<strong>ஶ்ரீ யந்த்ரம்</strong> தாவல் முழு வரைபடத்தை குறிப்பாக காட்டுகிறது — பூபுரத்திலிருந்து பிந்துவரை ஒன்பது ஆவரணங்கள்.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'நீங்கள் தயாராக இருக்கிறீர்கள்',
    body:
      'இந்த <strong>✈</strong> பொத்தானை எப்போது வேண்டுமானாலும் தட்டி இந்த சுற்றுப்பயணத்தை மீண்டும் காணலாம்.<br><br>' +
      '<em>வரவேற்பு & அறிமுகம்</em> முதல் தொடங்கி ஆவரணங்களை வரிசையாக பூர்த்தி செய்யுங்கள். நேரம் எடுத்துக்கொள்ளுங்கள் — இது ஒரு சாதனை, போட்டி அல்ல. 🙏',
  },
]

const STEPS_TE = [
  {
    title: 'శ్రీ యన్త్ర స్మరణ సహాయకంలో స్వాగతం',
    body:
      '<p>ఈ యాప్ <em>ఖడ్గమాలా స్తోత్రం</em>లోని సుమారు 180 దేవతా నామాలను శ్రీ యన్త్రం యొక్క జ్యామితి స్థానిక స్మృతి ద్వారా నేర్చుకోవడంలో సహాయపడుతుంది.</p>' +
      '<p>పదాల జాబితా వల్ల బట్టీ పట్టే బదులు, ప్రతి దేవత యన్త్రంలో <em>ఎక్కడ</em> ఉంటుందో నేర్చుకుంటారు. స్థానిక స్మృతి వరుస జ్ఞాపకాన్ని సహజంగా చేస్తుంది.</p>',
  },
  {
    title: 'నావిగేషన్',
    body:
      'డెస్క్‌టాప్‌లో సైడ్‌బార్ ఎడమ వైపు ఎప్పుడూ కనిపిస్తుంది. మొబైల్‌లో తెరవడానికి <strong>☰</strong> బటన్ నొక్కండి.<br><br>' +
      'ఇది ప్రతి జప విభాగం — న్యాస దేవతాః, గురువులు, అన్ని తొమ్మిది ఆవరణలు — అలాగే స్పాట్ చెక్, జ్ఞాపక పటం సాధనాలు జాబితా చేస్తుంది.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'అన్వేషణ & కంఠస్థం',
    body:
      'ప్రతి విభాగంలో రెండు మోడ్‌లు ఉంటాయి:<br><br>' +
      '<strong>అన్వేషణ</strong> — నొక్కినప్పుడు నామాలు వెల్లడవుతాయి.<br>' +
      '<strong>కంఠస్థం</strong> — నామాలు దాగి ఉంటాయి; ముందు స్మరించి, తర్వాత వెల్లడించండి.<br><br>' +
      'ప్రతి ఆవరణను బయట నుండి లోపలికి పూర్తి చేయండి.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'తొమ్మిది ఆవరణలు',
    body:
      'ప్రతి ఆవరణ దానికే ఒక విభాగం. అత్యంత బాహ్యమైన భూపురం నుండి ప్రారంభించి బిందువు వైపు సాగండి. విభాగం పూర్తయినప్పుడు పురోగతి గుర్తులు కనిపిస్తాయి.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'స్పాట్ చెక్',
    body:
      '<strong>స్పాట్ చెక్</strong> యన్త్రంలో ఒక యాదృచ్ఛిక స్థానం ఎంచుకుని అక్కడి దేవత పేరు అడుగుతుంది. ఇది సౌలభ్య జ్ఞాపకాన్ని పెంచుతుంది.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'జ్ఞాపక పటం',
    body:
      '<strong>జ్ఞాపక పటం</strong> మొత్తం యన్త్రంలో మీ పురోగతిని ఒక చూపులో చూపిస్తుంది — <span class="syt-tour-green">✓ పచ్చ</span> కంఠస్థానికి, <span class="syt-tour-amber">~ ఆంబర్</span> పాక్షికానికి, <span class="syt-tour-red">✗ ఎరుపు</span> ఇంకా నేర్చుకోనివాటికి.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'శ్రీ యన్త్రం',
    body:
      '<strong>శ్రీ యన్త్రం</strong> ట్యాబ్ సమగ్ర చిత్రాన్ని సూచనగా చూపిస్తుంది — భూపురం నుండి బిందువు వరకు అన్ని తొమ్మిది ఆవరణలు.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'మీరు సిద్ధంగా ఉన్నారు',
    body:
      'ఈ <strong>✈</strong> బటన్‌ను ఎప్పుడైనా నొక్కి ఈ పర్యటనను మళ్ళీ చూడవచ్చు.<br><br>' +
      '<em>స్వాగతం & పరిచయం</em> నుండి ప్రారంభించి ఆవరణలు వరుసగా పూర్తి చేయండి. తీరిగ్గా చేయండి — ఇది సాధన, పోటీ కాదు. 🙏',
  },
]

const STEPS_BY_LANG = { en: STEPS_EN, hi: STEPS_HI, kn: STEPS_KN, ml: STEPS_ML, ta: STEPS_TA, te: STEPS_TE }

// ── Language options shown in the first tour step ─────────────────────────────
const TOUR_LANG_OPTIONS = [
  { code: 'en', label: 'English'   },
  { code: 'de', label: 'Deutsch'   },
  { code: 'es', label: 'Español'   },
  { code: 'fr', label: 'Français'  },
  { code: 'hi', label: 'हिन्दी'    },
  { code: 'it', label: 'Italiano'  },
  { code: 'kn', label: 'ಕನ್ನಡ'    },
  { code: 'ml', label: 'മലയാളം'   },
  { code: 'mr', label: 'मराठी'    },
  { code: 'pt', label: 'Português' },
  { code: 'ta', label: 'தமிழ்'    },
  { code: 'te', label: 'తెలుగు'   },
]

function getSteps(uiLang) {
  const base = STEPS_BY_LANG[uiLang] ?? STEPS_EN
  // For English, include all steps; for others, filter out englishOnly steps
  if (uiLang === 'en') return base
  return base.filter(s => !s.englishOnly)
}

// ── Button styles ─────────────────────────────────────────────────────────────
const btnBase = {
  fontSize: 11,
  padding: '5px 14px',
  borderRadius: 5,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
  lineHeight: 1,
}

const btnSecondary = {
  ...btnBase,
  background: '#0f0a05',
  border: '1px solid #352415',
  color: '#8a7560',
}

const btnPrimary = {
  ...btnBase,
  background: '#251810',
  border: '1px solid #9a7820',
  color: '#d4b96a',
}

// ── Overlay + popover component ───────────────────────────────────────────────
function TourOverlay({ onDone, script = 'iast', uiLang = 'en', onLanguageChange }) {
  const STEPS = getSteps(uiLang)
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect]   = useState(null)

  const rawStep = STEPS[stepIndex]
  const step = (script === 'english' && uiLang === 'en')
    ? { ...rawStep, title: iastToEnglish(rawStep.title), body: iastToEnglish(rawStep.body) }
    : rawStep
  const isLast  = stepIndex === STEPS.length - 1
  const isFirst = stepIndex === 0

  // Recompute the highlighted element's bounding rect whenever the step changes
  const updateRect = useCallback(() => {
    if (!step.selector) { setRect(null); return }
    // On mobile the sidebar is hidden — skip highlighting, use centred modal for all steps
    if (window.innerWidth < 768) { setRect(null); return }
    const el = document.querySelector(step.selector)
    if (!el) { setRect(null); return }
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    const r = el.getBoundingClientRect()
    if (r.right <= 0 || r.left >= window.innerWidth || r.bottom <= 0 || r.top >= window.innerHeight) {
      setRect(null); return
    }
    setRect(r)
  }, [step.selector])

  useEffect(() => {
    updateRect()
    // Recompute once more after the scroll settles
    const t = setTimeout(updateRect, 320)
    return () => clearTimeout(t)
  }, [updateRect])

  useEffect(() => {
    const h = () => updateRect()
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [updateRect])

  // Navigation
  const goNext = () => stepIndex < STEPS.length - 1 ? setStepIndex(i => i + 1) : onDone()
  const goPrev = () => stepIndex > 0 && setStepIndex(i => i - 1)

  // Padded rect around the highlighted element
  const r = rect ? {
    t: rect.top    - PAD,
    l: rect.left   - PAD,
    r: rect.right  + PAD,
    b: rect.bottom + PAD,
  } : null

  // Shared overlay strip style
  const S = {
    position: 'fixed',
    zIndex: 9997,
    background: 'rgba(0,0,0,0.80)',
    pointerEvents: 'all',
  }

  // Popover position — always to the right of the element; fall back to centred
  const popStyle = (() => {
    const base = { position: 'fixed', zIndex: 9999, width: POP_W }
    if (!r) return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const vH   = window.innerHeight
    const vW   = window.innerWidth
    const top  = Math.max(8, Math.min(r.t, vH - 360))
    const left = r.r + GAP

    // If popover would bleed off the right edge, place it to the left instead
    if (left + POP_W > vW - 8) {
      return { ...base, top, right: vW - r.l + GAP }
    }
    return { ...base, top, left }
  })()

  return createPortal(
    <>
      {/* ── Dark overlay with rectangular hole for the highlighted element ── */}
      {r ? (
        <>
          {/* Top strip */}
          <div style={{ ...S, top: 0, left: 0, right: 0, height: Math.max(0, r.t) }} />
          {/* Left strip */}
          <div style={{ ...S, top: Math.max(0, r.t), left: 0, width: Math.max(0, r.l), height: r.b - Math.max(0, r.t) }} />
          {/* Right strip */}
          <div style={{ ...S, top: Math.max(0, r.t), left: r.r, right: 0, height: r.b - Math.max(0, r.t) }} />
          {/* Bottom strip */}
          <div style={{ ...S, top: r.b, left: 0, right: 0, bottom: 0 }} />
          {/* Gold focus ring */}
          <div style={{
            position: 'fixed',
            zIndex: 9998,
            pointerEvents: 'none',
            top: r.t, left: r.l,
            width: r.r - r.l,
            height: r.b - r.t,
            borderRadius: 6,
            outline: '2px solid rgba(201,168,76,0.85)',
            outlineOffset: 0,
            boxShadow: '0 0 20px rgba(201,168,76,0.30)',
          }} />
        </>
      ) : (
        /* Full-screen overlay for centred steps */
        <div style={{ ...S, inset: 0 }} />
      )}

      {/* ── Popover ─────────────────────────────────────────────────────── */}
      <div style={{
        ...popStyle,
        background: '#1a1008',
        border: '1px solid #352415',
        borderRadius: 8,
        padding: '16px 18px',
        boxShadow: '0 10px 48px rgba(0,0,0,0.75)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* Close (×) button */}
        <button
          onClick={onDone}
          aria-label="Close tour"
          style={{
            position: 'absolute', top: 9, right: 12,
            background: 'none', border: 'none',
            color: '#4a3420', fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Step counter */}
        <p style={{
          fontSize: 10, color: '#c8600a',
          fontFamily: 'monospace', textTransform: 'uppercase',
          letterSpacing: '0.10em', marginBottom: 10,
        }}>
          Step {stepIndex + 1} of {STEPS.length}
        </p>

        {/* Title — use IAST serif font for English; system font for Indic */}
        <h3
          className={['en','fr','es','it','pt','de'].includes(uiLang) ? 'iast' : ''}
          style={{
            fontSize: 14, fontWeight: 600, color: '#d4b96a',
            marginBottom: 10, lineHeight: 1.35, paddingRight: 18,
          }}
        >
          {step.title}
        </h3>

        {/* Body — HTML allowed for <strong>, <em>, <br> */}
        <div
          className="syt-tour-body"
          style={{ fontSize: 12.5, color: '#c8bca8', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: step.body }}
        />

        {/* Language picker — shown on first step only */}
        {isFirst && onLanguageChange && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #2a1a0a' }}>
            <p style={{
              fontSize: 10, color: '#c8600a', fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8,
            }}>
              Language
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {TOUR_LANG_OPTIONS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => onLanguageChange(code)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    lineHeight: 1.3,
                    border: uiLang === code ? '1px solid #c9a84c' : '1px solid #352415',
                    background: uiLang === code ? '#2a1c08' : '#0f0a05',
                    color: uiLang === code ? '#d4b96a' : '#7a6a52',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 16,
          justifyContent: isFirst ? 'flex-end' : 'space-between',
          alignItems: 'center',
        }}>
          {!isFirst && (
            <button onClick={goPrev} style={btnSecondary}>
              ← Back
            </button>
          )}
          <button onClick={goNext} style={isLast ? btnPrimary : btnSecondary}>
            {isLast ? 'Done ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Hook — call this once in App ──────────────────────────────────────────────
/**
 * useTour({ onBeforeStart, script, uiLang })
 *
 * Returns:
 *   startTour   — call to launch the tour manually (e.g. from a "?" button)
 *   tourElement — JSX to render anywhere in the component tree (uses createPortal)
 *
 * Auto-triggers once on first visit (checks localStorage).
 * onBeforeStart fires before the overlay mounts — use it to ensure all nav
 * sections are open so every data-tour element is present in the DOM.
 */
export function useTour({ onBeforeStart, script = 'iast', uiLang = 'en', onLanguageChange } = {}) {
  const [active, setActive] = useState(false)
  const cbRef = useRef(onBeforeStart)
  useEffect(() => { cbRef.current = onBeforeStart })

  const startTour = useCallback(() => {
    cbRef.current?.()
    // Brief delay lets any state changes (e.g. opening sections) settle
    setTimeout(() => setActive(true), 150)
    localStorage.setItem(TOUR_KEY, '1')
  }, [])

  const endTour = useCallback(() => setActive(false), [])

  // Auto-trigger on first visit
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      startTour()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    startTour,
    tourElement: active ? <TourOverlay onDone={endTour} script={script} uiLang={uiLang} onLanguageChange={onLanguageChange} /> : null,
  }
}
