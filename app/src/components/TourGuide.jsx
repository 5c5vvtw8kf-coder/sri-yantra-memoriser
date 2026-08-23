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
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> works the other way round from Spot Check — a ' +
      'deity name is shown, and you tap where it lives on the yantra. It builds true ' +
      'spatial recall.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'Drills',
    body:
      'Once a section feels solid, test it further with <strong>Segment</strong>, ' +
      '<strong>Line</strong> and <strong>Triangle Drills</strong>. Each tests recall in ' +
      'a different cross-section of the yantra — one wedge, a line cutting across ' +
      'several circuits, or one of the nine construction triangles.',
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
      'The <strong>Śrī Yantra</strong> tab shows the complete yantra as a reference with ' +
      'the ability to customise the colours.',
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
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> स्पॉट चेक से उल्टा कार्य करता है — एक देवता का नाम दिखाया जाता है, और आप यन्त्र पर उसका स्थान टैप करते हैं। यह वास्तविक स्थानिक स्मृति बनाता है।',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ड्रिल',
    body:
      'जब कोई खण्ड सुदृढ़ लगे, तब सेगमेंट ड्रिल, लाइन ड्रिल और त्रिकोण ड्रिल से और परखें। सेगमेंट ड्रिल श्री यन्त्र के एक खंड के भीतर स्मरण-शक्ति की जाँच करता है, लाइन ड्रिल कई आवरणों को पार करने वाली एक रेखा के साथ, और त्रिकोण ड्रिल यन्त्र के नौ मूल रचनात्मक त्रिकोणों में से एक के भीतर।',
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
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> ಸ್ಪಾಟ್ ಚೆಕ್‌ಗೆ ವಿರುದ್ಧವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ — ಒಂದು ದೇವತೆಯ ಹೆಸರು ತೋರಿಸಲಾಗುತ್ತದೆ, ಮತ್ತು ನೀವು ಯಂತ್ರದಲ್ಲಿ ಅದರ ಸ್ಥಾನವನ್ನು ಟ್ಯಾಪ್ ಮಾಡುತ್ತೀರಿ. ಇದು ನಿಜವಾದ ಸ್ಥಾನಿಕ ಸ್ಮೃತಿಯನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ಡ್ರಿಲ್‌ಗಳು',
    body:
      'ಒಂದು ವಿಭಾಗ ಭದ್ರವೆನಿಸಿದಾಗ, ಸೆಗ್ಮೆಂಟ್ ಡ್ರಿಲ್, ಲೈನ್ ಡ್ರಿಲ್ ಮತ್ತು ತ್ರಿಕೋನ ಡ್ರಿಲ್‌ಗಳಿಂದ ಮತ್ತಷ್ಟು ಪರೀಕ್ಷಿಸಿ. ಸೆಗ್ಮೆಂಟ್ ಡ್ರಿಲ್ ಯಂತ್ರದ ಒಂದು ವಿಭಾಗದೊಳಗೆ ನೆನಪನ್ನು ಪರೀಕ್ಷಿಸುತ್ತದೆ, ಲೈನ್ ಡ್ರಿಲ್ ಹಲವಾರು ಆವರಣಗಳನ್ನು ದಾಟುವ ಗೆರೆಯ ಉದ್ದಕ್ಕೂ, ಮತ್ತು ತ್ರಿಕೋನ ಡ್ರಿಲ್ ಯಂತ್ರದ ಒಂಬತ್ತು ಮೂಲ ರಚನಾ ತ್ರಿಕೋನಗಳಲ್ಲಿ ಒಂದರೊಳಗೆ.',
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
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> സ്പോട്ട് ചെക്കിന് വിപരീതമായി പ്രവർത്തിക്കുന്നു — ഒരു ദേവതയുടെ പേര് കാണിക്കും, നിങ്ങൾ യന്ത്രത്തിൽ അതിന്റെ സ്ഥാനം ടാപ്പ് ചെയ്യുക. ഇത് യഥാർത്ഥ സ്ഥലിക ഓർമ്മ വളർത്തുന്നു.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ഡ്രില്ലുകൾ',
    body:
      'ഒരു വിഭാഗം ഉറച്ചതായി തോന്നുമ്പോൾ, സെഗ്മെന്റ് ഡ്രിൽ, ലൈൻ ഡ്രിൽ, ത്രികോണ ഡ്രിൽ എന്നിവയിലൂടെ കൂടുതൽ പരിശോധിക്കുക. സെഗ്മെന്റ് ഡ്രിൽ യന്ത്രത്തിന്റെ ഒരു ഭാഗത്തിനുള്ളിൽ ഓർമ്മ പരിശോധിക്കുന്നു, ലൈൻ ഡ്രിൽ പല ആവരണങ്ങളും മുറിച്ചുകടക്കുന്ന ഒരു രേഖയിലൂടെ, ത്രികോണ ഡ്രിൽ യന്ത്രത്തിന്റെ ഒൻപത് അടിസ്ഥാന നിർമ്മാണ ത്രികോണങ്ങളിൽ ഒന്നിനുള്ളിൽ.',
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
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> ஸ்பாட் செக்கிற்கு நேர்மாறாக செயல்படுகிறது — ஒரு தேவதையின் பெயர் காட்டப்படும், நீங்கள் யந்த்ரத்தில் அதன் இடத்தை தட்டவும். இது உண்மையான இட நினைவை உருவாக்குகிறது.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'டிரில்கள்',
    body:
      'ஒரு பிரிவு உறுதியாக உணரும்போது, செக்மென்ட் டிரில், லைன் டிரில் மற்றும் முக்கோண டிரில் மூலம் மேலும் சோதிக்கவும். செக்மென்ட் டிரில் யந்த்ரத்தின் ஒரு பிரிவுக்குள் நினைவை சோதிக்கிறது, லைன் டிரில் பல ஆவரணங்களைக் கடக்கும் ஒரு கோட்டின் வழியே, முக்கோண டிரில் யந்த்ரத்தின் ஒன்பது அடிப்படை கட்டமைப்பு முக்கோணங்களில் ஒன்றுக்குள்.',
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
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> స్పాట్ చెక్‌కు వ్యతిరేకంగా పనిచేస్తుంది — ఒక దేవత పేరు చూపబడుతుంది, మీరు యన్త్రంలో దాని స్థానాన్ని నొక్కాలి. ఇది నిజమైన స్థానిక జ్ఞాపకాన్ని పెంపొందిస్తుంది.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'డ్రిల్స్',
    body:
      'ఒక విభాగం స్థిరంగా అనిపించినప్పుడు, సెగ్మెంట్ డ్రిల్, లైన్ డ్రిల్, త్రికోణ డ్రిల్‌లతో మరింత పరీక్షించండి. సెగ్మెంట్ డ్రిల్ యంత్రంలోని ఒక విభాగంలో జ్ఞాపకశక్తిని పరీక్షిస్తుంది, లైన్ డ్రిల్ అనేక ఆవరణలను దాటే లైన్ వెంట, త్రికోణ డ్రిల్ యంత్రంలోని తొమ్మిది మూల నిర్మాణ త్రికోణాలలో ఒకదానిలో.',
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


const STEPS_MR = [
  {
    title: 'श्री यन्त्र स्मरण सहायकामध्ये स्वागत आहे',
    body:
      '<p>हे अ‍ॅप <em>खड्गमाला स्तोत्र</em>ातील सुमारे 180 देवतानामे श्री यन्त्राच्या भौमितिक स्थानिक स्मृतीद्वारे शिकण्यास मदत करते.</p>' +
      '<p>शब्दांची यादी पाठ करण्याऐवजी, प्रत्येक देवता यन्त्रात <em>कुठे</em> वास करते हे शिकता. स्थानिक स्मृती क्रमिक पाठ सहज करते.</p>',
  },
  {
    title: 'नेव्हिगेशन',
    body:
      'डेस्कटॉपवर साइडबार डावीकडे नेहमी दिसतो. मोबाइलवर उघडण्यासाठी <strong>☰</strong> बटण दाबा.<br><br>' +
      'यात प्रत्येक जप विभाग — न्यास देवताः, गुरू, सर्व नऊ आवरणे — तसेच स्पॉट चेक आणि स्मृती नकाशा साधने सूचीबद्ध आहेत. कोणत्याही आयटमवर टॅप करून ते उघडा.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'अन्वेषण आणि पाठ',
    body:
      'प्रत्येक विभागात दोन मोड असतात:<br><br>' +
      '<strong>अन्वेषण</strong> — टॅप केल्यावर नावे प्रकट होतात.<br>' +
      '<strong>पाठ</strong> — नावे लपलेली असतात; आधी आठवा, मग प्रकट करा आणि चिन्हांकित करा.<br><br>' +
      'प्रत्येक आवरण बाहेरून आतपर्यंत पूर्ण करा.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'नऊ आवरणे',
    body:
      'प्रत्येक आवरणाचा स्वतःचा विभाग आहे. सर्वात बाह्य भूपुरापासून सुरू करा आणि बिंदूकडे जा. विभाग पूर्ण झाल्यावर प्रगती बिंदू दिसतात.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'स्पॉट चेक',
    body:
      '<strong>स्पॉट चेक</strong> यन्त्रावर एक यादृच्छिक स्थान निवडतो आणि तेथील देवतेचे नाव विचारतो. हे लवचिक स्मृती निर्माण करते, केवळ क्रमिक पाठ नाही.',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> स्पॉट चेकच्या उलट कार्य करतो — एक देवतेचे नाव दाखवले जाते, आणि तुम्ही यन्त्रावर त्याचे स्थान टॅप करता. हे खरी स्थानिक स्मृती निर्माण करते.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ड्रिल',
    body:
      'एखादा विभाग पक्का वाटू लागल्यावर, सेगमेंट ड्रिल, लाइन ड्रिल आणि त्रिकोण ड्रिलने अधिक तपासा. सेगमेंट ड्रिल यंत्राच्या एका विभागातील स्मरणशक्ती तपासते, लाइन ड्रिल अनेक आवरणे ओलांडणाऱ्या एका रेषेवरील, आणि त्रिकोण ड्रिल यंत्राच्या नऊ मूळ रचनात्मक त्रिकोणांपैकी एकामधील.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'स्मृती नकाशा',
    body:
      '<strong>स्मृती नकाशा</strong> संपूर्ण यन्त्रात तुमची प्रगती एका नजरेत दाखवतो — <span class="syt-tour-green">✓ हिरवा</span> पाठासाठी, <span class="syt-tour-amber">~ पिवळा</span> अंशतः, <span class="syt-tour-red">✗ लाल</span> अजून न शिकलेल्यांसाठी.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'श्री यन्त्र',
    body:
      '<strong>श्री यन्त्र</strong> टॅब संपूर्ण आकृती संदर्भ म्हणून दाखवतो — भूपुरापासून बिंदूपर्यंत सर्व नऊ आवरणे.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'तुम्ही तयार आहात',
    body:
      'हे <strong>✈</strong> बटण कधीही दाबून हा दौरा पुन्हा पाहा.<br><br>' +
      '<em>स्वागत आणि परिचय</em> पासून सुरुवात करा, मग आवरणे क्रमाने पूर्ण करा. वेळ घ्या — ही साधना आहे, स्पर्धा नाही. 🙏',
  },
]

const STEPS_FR = [
  {
    title: "Bienvenue dans le Śrī Yantra Memoriser",
    body:
      "<p>Cette application vous aide à apprendre le <em>Khadgamalā Stotram</em>, environ 180 noms de divinités, en construisant une mémoire spatiale de la géométrie du Śrī Yantra.</p>" +
      "<p>Plutôt que de mémoriser une liste de mots, vous apprenez <em>où</em> chaque divinité réside dans le yantra. La mémoire spatiale rend le rappel séquentiel naturel.</p>",
  },
  {
    title: "Navigation",
    body:
      "Sur ordinateur, la barre latérale est toujours visible à gauche. Sur mobile, appuyez sur le bouton <strong>☰</strong> pour l'ouvrir.<br><br>" +
      "Elle répertorie chaque section — Nyāsa Devatāḥ, Gurus, les neuf āvaraṇas jusqu'au bindu — ainsi que les outils Contrôle Rapide et Carte Mémoire. Appuyez sur n'importe quel élément pour l'ouvrir.",
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: "Explorer et Mémoriser",
    body:
      "Chaque section propose deux modes :<br><br>" +
      "<strong>Explorer</strong> — les noms se révèlent au fur et à mesure.<br>" +
      "<strong>Mémoriser</strong> — les noms sont cachés ; rappelez-les mentalement avant de révéler, puis marquez chacun mémorisé ou non.<br><br>" +
      "Parcourez chaque āvaraṇa de l'extérieur vers l'intérieur.",
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: "Les neuf Āvaraṇas",
    body:
      "Chaque āvaraṇa est sa propre section. Commencez par le Bhūpura extérieur et progressez vers le bindu. Des points de progression apparaissent à côté des sections complétées.",
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: "Contrôle Rapide",
    body:
      "Le <strong>Contrôle Rapide</strong> choisit une position aléatoire sur le yantra et vous demande de nommer la divinité. Cela construit un rappel flexible, pas seulement la séquence par cœur.",
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: "Location Match",
    body:
      "<strong>Location Match</strong> fonctionne à l'inverse du Contrôle Rapide — le nom d'une divinité est affiché, et vous touchez l'endroit où elle réside sur le yantra. Cela construit un véritable rappel spatial.",
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: "Exercices",
    body:
      "Une fois qu'une section semble bien maîtrisée, testez-la davantage avec les Exercices de Segment, de Ligne et de Triangle. Les Exercices de Segment testent la mémorisation au sein d'un seul segment du yantra, les Exercices de Ligne le long d'une ligne traversant plusieurs cercles, et les Exercices de Triangle au sein de l'un des neuf triangles fondamentaux de construction.",
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: "Carte Mémoire",
    body:
      "La <strong>Carte Mémoire</strong> montre votre progression sur l'ensemble du yantra en un coup d'œil — <span class=\"syt-tour-green\">✓ vert</span> pour mémorisé, <span class=\"syt-tour-amber\">~ ambre</span> pour partiellement correct, <span class=\"syt-tour-red\">✗ rouge</span> pour pas encore mémorisé.",
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: "Śrī Yantra",
    body:
      "L'onglet <strong>Śrī Yantra</strong> montre le diagramme complet en référence — les neuf āvaraṇas du Bhūpura jusqu'au bindu.",
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: "Vous êtes prêt",
    body:
      "Cliquez sur le bouton <strong>✈</strong> ici à tout moment pour revoir cette visite.<br><br>" +
      "Commencez par <em>Bienvenue et Introduction</em>, puis parcourez les āvaraṇas dans l'ordre. Prenez votre temps — c'est une pratique, pas une course. 🙏",
  },
]

const STEPS_ES = [
  {
    title: 'Bienvenido al Śrī Yantra Memoriser',
    body:
      '<p>Esta aplicación te ayuda a aprender el <em>Khadgamalā Stotram</em>, alrededor de 180 nombres de deidades, construyendo memoria espacial de la geometría del Śrī Yantra.</p>' +
      '<p>En lugar de memorizar una lista de palabras, aprendes <em>dónde</em> vive cada deidad en el yantra. La memoria espacial hace que el recuerdo secuencial sea natural.</p>',
  },
  {
    title: 'Navegación',
    body:
      'En el ordenador, la barra lateral siempre está visible a la izquierda. En el móvil, pulsa el botón <strong>☰</strong> para abrirla.<br><br>' +
      'Enumera cada sección — Nyāsa Devatāḥ, Gurus, las nueve āvaraṇas hasta el bindu — además de herramientas como Comprobación Rápida y Mapa de Memoria. Pulsa cualquier elemento para abrirlo.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'Explorar y Memorizar',
    body:
      'Cada sección tiene dos modos:<br><br>' +
      '<strong>Explorar</strong> — los nombres se revelan al ir avanzando.<br>' +
      '<strong>Memorizar</strong> — los nombres están ocultos; recuérdalos mentalmente antes de revelarlos, luego marca cada uno.<br><br>' +
      'Trabaja cada āvaraṇa de afuera hacia adentro.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'Las nueve Āvaraṇas',
    body:
      'Cada āvaraṇa es su propia sección. Comienza con el Bhūpura exterior y avanza hacia el bindu. Los puntos de progreso aparecen junto a las secciones completadas.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'Comprobación Rápida',
    body:
      'La <strong>Comprobación Rápida</strong> elige una posición aleatoria en el yantra y te pide que nombres la deidad. Esto construye un recuerdo flexible, no solo secuencial.',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> funciona al revés que la Comprobación Rápida — se muestra el nombre de una deidad, y tú tocas dónde vive en el yantra. Esto construye un recuerdo espacial real.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'Ejercicios',
    body:
      'Cuando una sección se sienta sólida, ponla más a prueba con los Ejercicios de Segmento, de Línea y de Triángulo. Los Ejercicios de Segmento comprueban la memorización dentro de un único segmento del yantra, los Ejercicios de Línea a lo largo de una línea que atraviesa varios círculos, y los Ejercicios de Triángulo dentro de uno de los nueve triángulos fundamentales de construcción.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'Mapa de Memoria',
    body:
      'El <strong>Mapa de Memoria</strong> muestra tu progreso en todo el yantra de un vistazo — <span class="syt-tour-green">✓ verde</span> para memorizado, <span class="syt-tour-amber">~ ámbar</span> para parcialmente correcto, <span class="syt-tour-red">✗ rojo</span> para no memorizado aún.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'Śrī Yantra',
    body:
      'La pestaña <strong>Śrī Yantra</strong> muestra el diagrama completo como referencia — las nueve āvaraṇas del Bhūpura al bindu.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'Todo listo',
    body:
      'Haz clic en el botón <strong>✈</strong> aquí en cualquier momento para volver a ver este recorrido.<br><br>' +
      'Comienza con <em>Bienvenida e Introducción</em>, luego trabaja los āvaraṇas en orden. Tómate tu tiempo — esto es una práctica, no una carrera. 🙏',
  },
]

const STEPS_IT = [
  {
    title: "Benvenuto nello Śrī Yantra Memoriser",
    body:
      "<p>Questa app ti aiuta a imparare il <em>Khadgamalā Stotram</em>, circa 180 nomi di divinità, costruendo una memoria spaziale della geometria dello Śrī Yantra.</p>" +
      "<p>Invece di memorizzare un elenco di parole, impari <em>dove</em> vive ogni divinità nel yantra. La memoria spaziale rende il ricordo sequenziale naturale.</p>",
  },
  {
    title: "Navigazione",
    body:
      "Su desktop la barra laterale è sempre visibile a sinistra. Su mobile, tocca il pulsante <strong>☰</strong> per aprirla.<br><br>" +
      "Elenca ogni sezione del canto — Nyāsa Devatāḥ, Guru, tutte le nove āvaraṇas fino al bindu — oltre agli strumenti Controllo Rapido e Mappa della Memoria. Tocca qualsiasi elemento per aprirlo.",
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: "Esplora e Memorizza",
    body:
      "Ogni sezione ha due modalità:<br><br>" +
      "<strong>Esplora</strong> — i nomi si rivelano man mano che avanza.<br>" +
      "<strong>Memorizza</strong> — i nomi sono nascosti; ricordali mentalmente prima di rivelare, poi segna ognuno.<br><br>" +
      "Percorri ogni āvaraṇa dall'esterno verso l'interno.",
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: "Le nove Āvaraṇas",
    body:
      "Ogni āvaraṇa è una propria sezione. Inizia con il Bhūpura esterno e procedi verso il bindu. I punti di progresso appaiono accanto alle sezioni completate.",
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: "Controllo Rapido",
    body:
      "Il <strong>Controllo Rapido</strong> sceglie una posizione casuale sul yantra e ti chiede di nominare la divinità. Questo costruisce un ricordo flessibile, non solo sequenziale.",
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: "Location Match",
    body:
      "<strong>Location Match</strong> funziona al contrario rispetto al Controllo Rapido — viene mostrato il nome di una divinità, e tu tocchi dove vive nel yantra. Questo costruisce un vero ricordo spaziale.",
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: "Esercizi",
    body:
      "Quando una sezione appare solida, mettila ulteriormente alla prova con gli Esercizi di Segmento, di Linea e di Triangolo. Gli Esercizi di Segmento verificano la memorizzazione all'interno di un singolo segmento dello yantra, gli Esercizi di Linea lungo una linea che attraversa più cerchi, e gli Esercizi di Triangolo all'interno di uno dei nove triangoli fondamentali di costruzione.",
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: "Mappa della Memoria",
    body:
      "La <strong>Mappa della Memoria</strong> mostra il tuo progresso sull'intero yantra in un colpo d'occhio — <span class=\"syt-tour-green\">✓ verde</span> per memorizzato, <span class=\"syt-tour-amber\">~ ambra</span> per parzialmente corretto, <span class=\"syt-tour-red\">✗ rosso</span> per non ancora memorizzato.",
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: "Śrī Yantra",
    body:
      "La scheda <strong>Śrī Yantra</strong> mostra il diagramma completo come riferimento — tutte e nove le āvaraṇas dal Bhūpura al bindu.",
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: "Sei pronto",
    body:
      "Clicca il pulsante <strong>✈</strong> qui in qualsiasi momento per rivedere questo tour.<br><br>" +
      "Inizia con <em>Benvenuto e Introduzione</em>, poi percorri le āvaraṇas in ordine. Prenditi il tuo tempo — questa è una pratica, non una gara. 🙏",
  },
]

const STEPS_PT = [
  {
    title: 'Bem-vindo ao Śrī Yantra Memoriser',
    body:
      '<p>Esta aplicação ajuda-o a aprender o <em>Khadgamalā Stotram</em>, cerca de 180 nomes de divindades, construindo memória espacial da geometria do Śrī Yantra.</p>' +
      '<p>Em vez de memorizar uma lista de palavras, aprende <em>onde</em> cada divindade vive no yantra. A memória espacial torna a recordação sequencial natural.</p>',
  },
  {
    title: 'Navegação',
    body:
      'No computador, a barra lateral está sempre visível à esquerda. No telemóvel, toque no botão <strong>☰</strong> para a abrir.<br><br>' +
      'Lista cada secção — Nyāsa Devatāḥ, Gurus, as nove āvaraṇas até ao bindu — além das ferramentas Verificação Rápida e Mapa de Memória. Toque em qualquer item para abri-lo.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'Explorar e Memorizar',
    body:
      'Cada secção tem dois modos:<br><br>' +
      '<strong>Explorar</strong> — os nomes revelam-se à medida que avança.<br>' +
      '<strong>Memorizar</strong> — os nomes estão escondidos; recorde-os mentalmente antes de revelar, depois assinale cada um.<br><br>' +
      'Percorra cada āvaraṇa de fora para dentro.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'As nove Āvaraṇas',
    body:
      'Cada āvaraṇa é a sua própria secção. Comece pelo Bhūpura exterior e avance em direção ao bindu. Os pontos de progresso aparecem junto às secções concluídas.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'Verificação Rápida',
    body:
      'A <strong>Verificação Rápida</strong> escolhe uma posição aleatória no yantra e pede-lhe que nomeie a divindade. Isto constrói uma recordação flexível, não apenas sequencial.',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      'O <strong>Location Match</strong> funciona ao contrário da Verificação Rápida — é mostrado o nome de uma divindade, e você toca onde ela vive no yantra. Isto constrói uma recordação espacial verdadeira.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'Exercícios',
    body:
      'Quando uma secção já parece sólida, teste-a ainda mais com os Exercícios de Segmento, de Linha e de Triângulo. Os Exercícios de Segmento testam a memorização dentro de um único segmento do yantra, os Exercícios de Linha ao longo de uma linha que atravessa vários círculos, e os Exercícios de Triângulo dentro de um dos nove triângulos fundamentais de construção.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'Mapa de Memória',
    body:
      'O <strong>Mapa de Memória</strong> mostra o seu progresso em todo o yantra num relance — <span class="syt-tour-green">✓ verde</span> para memorizado, <span class="syt-tour-amber">~ âmbar</span> para parcialmente correto, <span class="syt-tour-red">✗ vermelho</span> para ainda não memorizado.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'Śrī Yantra',
    body:
      'O separador <strong>Śrī Yantra</strong> mostra o diagrama completo como referência — as nove āvaraṇas do Bhūpura ao bindu.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'Está tudo pronto',
    body:
      'Clique no botão <strong>✈</strong> aqui em qualquer altura para rever este tour.<br><br>' +
      'Comece com <em>Boas-vindas e Introdução</em>, depois percorra as āvaraṇas por ordem. Leve o seu tempo — esta é uma prática, não uma corrida. 🙏',
  },
]

const STEPS_DE = [
  {
    title: 'Willkommen beim Śrī Yantra Memoriser',
    body:
      '<p>Diese App hilft dir, den <em>Khadgamalā Stotram</em>, etwa 180 Götternamen, durch den Aufbau eines räumlichen Gedächtnisses der Śrī Yantra-Geometrie zu lernen.</p>' +
      '<p>Statt einer Wortliste auswendig zu lernen, lernst du, <em>wo</em> jede Gottheit im Yantra wohnt. Räumliches Gedächtnis macht sequenzielles Erinnern natürlich.</p>',
  },
  {
    title: 'Navigation',
    body:
      'Auf dem Desktop ist die Seitenleiste links immer sichtbar. Auf dem Handy tippst du auf die <strong>☰</strong>-Schaltfläche, um sie zu öffnen.<br><br>' +
      'Sie listet jeden Abschnitt auf — Nyāsa Devatāḥ, Gurus, alle neun Āvaraṇas bis zum Bindu — sowie Werkzeuge wie Schnelltest und Gedächtniskarte. Tippe auf einen Eintrag, um ihn zu öffnen.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'Erkunden und Einprägen',
    body:
      'Jeder Abschnitt hat zwei Modi:<br><br>' +
      '<strong>Erkunden</strong> — Namen werden beim Durchgehen aufgedeckt.<br>' +
      '<strong>Einprägen</strong> — Namen sind verborgen; erinnere dich zuerst, dann aufdecken und markieren.<br><br>' +
      'Arbeite jede Āvaraṇa von außen nach innen durch.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'Die neun Āvaraṇas',
    body:
      'Jede Āvaraṇa ist ein eigener Abschnitt. Beginne mit dem äußersten Bhūpura und arbeite dich zum Bindu vor. Fortschrittsmarkierungen erscheinen neben abgeschlossenen Abschnitten.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'Schnelltest',
    body:
      'Der <strong>Schnelltest</strong> wählt eine zufällige Position im Yantra aus und fragt dich nach der Gottheit dort. Das baut flexibles Erinnern auf, nicht nur Reihenfolge.',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> funktioniert umgekehrt zum Schnelltest — der Name einer Gottheit wird angezeigt, und du tippst darauf, wo sie im Yantra wohnt. Das baut echtes räumliches Erinnern auf.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'Übungen',
    body:
      'Sobald ein Abschnitt sicher sitzt, teste ihn weiter mit Segment-, Linien- und Dreiecksübungen. Segmentübungen prüfen das Erinnerungsvermögen innerhalb eines einzelnen Segments des Yantra, Linienübungen entlang einer Linie, die mehrere Kreise durchquert, und Dreiecksübungen innerhalb eines der neun grundlegenden Konstruktionsdreiecke.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'Gedächtniskarte',
    body:
      'Die <strong>Gedächtniskarte</strong> zeigt deinen Fortschritt über das gesamte Yantra auf einen Blick — <span class="syt-tour-green">✓ grün</span> für eingeprägt, <span class="syt-tour-amber">~ amber</span> für teilweise richtig, <span class="syt-tour-red">✗ rot</span> für noch nicht eingeprägt.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'Śrī Yantra',
    body:
      'Der Tab <strong>Śrī Yantra</strong> zeigt das vollständige Diagramm als Referenz — alle neun Āvaraṇas vom Bhūpura bis zum Bindu.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'Du bist bereit',
    body:
      'Klicke jederzeit auf die <strong>✈</strong>-Schaltfläche hier, um diese Tour erneut anzusehen.<br><br>' +
      'Beginne mit <em>Willkommen und Einführung</em>, dann arbeite die Āvaraṇas der Reihe nach durch. Lass dir Zeit — das ist eine Übung, kein Wettrennen. 🙏',
  },
]


// ── Japanese tour steps ───────────────────────────────────────────────────────
const STEPS_JA = [
  {
    title: 'シュリー・ヤントラ記憶アプリへようこそ',
    body:
      '<p>このアプリは、シュリー・ヤントラの幾何学的な空間記憶を構築することで、' +
      '<em>カドガマーラー・ストートラム</em>（約180の神格名）を学ぶためのツールです。</p>' +
      '<p>単語リストを暗記するのではなく、各神格がヤントラのどこに宿るかを学びます。' +
      '空間記憶によって、順序通りの想起が自然に身につきます。</p>',
  },
  {
    title: 'ナビゲーション',
    body:
      'デスクトップでは、サイドバーが常に左側に表示されます。モバイルでは、<strong>☰</strong>ボタンをタップして開いてください。<br><br>' +
      '各セクション（ニャーサ・デーヴァターハ、グル、九つのアーヴァラナからビンドゥまで）と' +
      'スポットチェック・記憶マップが一覧表示されます。任意の項目をタップして開きます。',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: '探索と記憶',
    body:
      '各セクションには二つのモードがあります：<br><br>' +
      '<strong>探索</strong> — タップすると名前が表示されます。<br>' +
      '<strong>記憶</strong> — 名前は非表示です。表示前に思い出し、記憶済みか未記憶かをマークします。<br><br>' +
      '各アーヴァラナを外側から内側へ順番に進めます。',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: '九つのアーヴァラナ',
    body:
      '各アーヴァラナは独立したセクションです。最外部のブープラから始め、' +
      'ビンドゥへと進みます。完了したセクションの横に進捗マークが表示されます。',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'スポットチェック',
    body:
      '<strong>スポットチェック</strong>は、ヤントラ上のランダムな位置を選び、' +
      'その神格の名前を問います。単なる順序の暗記ではなく、柔軟な想起力を養います。',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong>はスポットチェックの逆で、神格の名前が表示され、' +
      'それがヤントラのどこに宿るかをタップします。真の空間的想起力を養います。',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ドリル',
    body:
      'セクションが定着してきたら、セグメントドリル、ラインドリル、三角形ドリルでさらに試してください。' +
      'セグメントドリルはヤントラの一つのセグメント内での記憶を確認し、ラインドリルは複数の輪を横切るライン沿いで、' +
      '三角形ドリルはヤントラの9つの基礎構成三角形のうちの一つの中で確認します。',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: '記憶マップ',
    body:
      '<strong>記憶マップ</strong>は、ヤントラ全体の進捗を一目で表示します — ' +
      '<span class=\"syt-tour-green\">✓ 緑</span>は記憶済み、' +
      '<span class=\"syt-tour-amber\">~ 黄</span>は部分的、' +
      '<span class=\"syt-tour-red\">✗ 赤</span>は未記憶です。',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'シュリー・ヤントラ',
    body:
      '<strong>シュリー・ヤントラ</strong>タブには、ブープラからビンドゥまで' +
      '九つのアーヴァラナを含む完全な図が表示されます。',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: '準備完了',
    body:
      'ここの<strong>✈</strong>ボタンをいつでもクリックして、このツアーを再表示できます。<br><br>' +
      '<em>はじめに</em>から始め、アーヴァラナを順に進めてください。焦らず、これは練習です。🙏',
  },
]
const STEPS_RU = [
  {
    title: 'Добро пожаловать в Śrī Yantra Memoriser',
    body:
      '<p>Это приложение поможет вам выучить <em>Кхадгамала Стотрам</em> — около 180 имён ' +
      'божеств — через пространственную память о геометрии Шри Янтры.</p>' +
      '<p>Вместо зубрёжки списка слов вы учитесь, <em>где</em> обитает каждое ' +
      'божество на янтре. Пространственная память делает последовательное вспоминание естественным.</p>',
  },
  {
    title: 'Навигация',
    body:
      'На компьютере боковая панель всегда видна слева. На мобильном нажмите кнопку ' +
      '<strong>☰</strong> для открытия.<br><br>' +
      'В ней перечислены все разделы — Ньяса Деватах, Гуру, девять аваран вплоть до бинду — ' +
      'а также инструменты «Проверка» и «Карта памяти». Нажмите на любой пункт, чтобы открыть его.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'Исследование и запоминание',
    body:
      'В каждом разделе два режима:<br><br>' +
      '<strong>Исследование</strong> — имена открываются по мере продвижения.<br>' +
      '<strong>Запоминание</strong> — имена скрыты; вспомните, затем откройте и отметьте.<br><br>' +
      'Проходите каждую авараṇу снаружи внутрь.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'Девять аваран',
    body:
      'Каждая аварана — отдельный раздел. Начните с внешней Бхупуры и двигайтесь к бинду. ' +
      'По мере завершения разделов появляются маркеры прогресса.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'Проверка',
    body:
      '<strong>Проверка</strong> выбирает случайную позицию на янтре и спрашивает имя ' +
      'божества. Это развивает гибкое запоминание, а не только последовательное.',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> работает наоборот по сравнению с «Проверкой» — ' +
      'показывается имя божества, а вы нажимаете на его место на янтре. Это развивает ' +
      'настоящую пространственную память.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'Тренировки',
    body:
      'Когда раздел кажется уверенно усвоенным, проверьте его дальше с помощью ' +
      'Сегментных, Линейных и Треугольных тренировок. Сегментные тренировки проверяют ' +
      'запоминание в пределах одного сегмента янтры, Линейные — вдоль линии, ' +
      'пересекающей несколько кругов, а Треугольные — внутри одного из девяти основных ' +
      'треугольников построения.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'Карта памяти',
    body:
      '<strong>Карта памяти</strong> показывает ваш прогресс по всей янтре — ' +
      '<span class="syt-tour-green">✓ зелёный</span> для выученных, ' +
      '<span class="syt-tour-amber">~ жёлтый</span> для частично верных, ' +
      '<span class="syt-tour-red">✗ красный</span> для невыученных.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'Шри Янтра',
    body:
      'Вкладка <strong>Шри Янтра</strong> показывает полную диаграмму — все девять аваран ' +
      'от Бхупуры до бинду.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'Всё готово',
    body:
      'Нажмите кнопку <strong>✈</strong> в любое время, чтобы снова пройти этот тур.<br><br>' +
      'Начните с раздела <em>Добро пожаловать и Введение</em>, затем проходите аваранам по порядку. ' +
      'Не спешите — это практика, не соревнование. 🙏',
  },
]

const STEPS_NE = [
  {
    title: 'श्री यन्त्र स्मरण सहायकमा स्वागत छ',
    body:
      '<p>यो एप <em>खड्गमाला स्तोत्र</em>का लगभग १८० देवताका नामहरू श्री यन्त्रको ' +
      'ज्यामितिक स्थानीय स्मृतिद्वारा सिक्न मदत गर्छ।</p>' +
      '<p>शब्दसूची रटनुभन्दा बरु प्रत्येक देवता यन्त्रमा <em>कहाँ</em> विराजमान छन् ' +
      'भनी सिक्नुहोस्। स्थानीय स्मृतिले क्रमिक स्मरण सहज बनाउँछ।</p>',
  },
  {
    title: 'नेभिगेसन',
    body:
      'डेस्कटपमा साइडबार बायाँ तर्फ सधैँ देखिन्छ। मोबाइलमा <strong>☰</strong> बटन ' +
      'थिचेर खोल्नुहोस्।<br><br>' +
      'यसमा प्रत्येक जप खण्ड — न्यासांगदेवताः, गुरुहरू, सबै नौ आवरण बिन्दुसम्म — ' +
      'साथै स्पट चेक र स्मृति नक्सा औजारहरू सूचीबद्ध छन्।',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'अन्वेषण र कण्ठस्थ',
    body:
      'प्रत्येक खण्डमा दुई मोडहरू छन्:<br><br>' +
      '<strong>अन्वेषण</strong> — ट्याप गर्दा नामहरू प्रकट हुन्छन्।<br>' +
      '<strong>कण्ठस्थ</strong> — नामहरू लुकेका हुन्छन्; पहिले सम्झनुहोस्, ' +
      'त्यसपछि प्रकट गरी चिह्नित गर्नुहोस्।<br><br>' +
      'प्रत्येक आवरण बाहिरबाट भित्रतर्फ पूरा गर्नुहोस्।',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'नौ आवरणहरू',
    body:
      'प्रत्येक आवरणको आफ्नो खण्ड छ। सबैभन्दा बाहिरी भूपुरबाट सुरु गरी बिन्दुतर्फ ' +
      'बढ्नुहोस्। खण्ड पूरा हुँदा प्रगति बिन्दुहरू देखिन्छन्।',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'स्पट चेक',
    body:
      '<strong>स्पट चेक</strong>ले यन्त्रमा एउटा अनियमित स्थान छान्छ र त्यहाँको ' +
      'देवताको नाम सोध्छ। यसले लचिलो स्मृति निर्माण गर्छ, केवल क्रमिक पाठ नभई।',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong>ले स्पट चेकको उल्टो काम गर्छ — एउटा देवताको नाम ' +
      'देखाइन्छ, र तपाईंले यन्त्रमा त्यसको स्थान ट्याप गर्नुहुन्छ। यसले साँचो स्थानीय ' +
      'स्मृति निर्माण गर्छ।',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ड्रिलहरू',
    body:
      'कुनै खण्ड बलियो महसुस भएपछि, सेग्मेन्ट ड्रिल, लाइन ड्रिल र त्रिकोण ड्रिलले ' +
      'थप जाँच्नुहोस्। सेग्मेन्ट ड्रिलले यन्त्रको एउटा खण्डभित्र सम्झना जाँच्छ, ' +
      'लाइन ड्रिलले धेरै आवरणहरू छिचोल्ने रेखाको साथमा, र त्रिकोण ड्रिलले यन्त्रका ' +
      'नौ मूल रचनात्मक त्रिकोणहरूमध्ये एउटाभित्र।',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'स्मृति नक्सा',
    body:
      '<strong>स्मृति नक्सा</strong>ले सम्पूर्ण यन्त्रमा तपाईंको प्रगति एकै दृष्टिमा ' +
      'देखाउँछ — <span class="syt-tour-green">✓ हरियो</span> कण्ठस्थका लागि, ' +
      '<span class="syt-tour-amber">~ पहेँलो</span> आंशिकका लागि, ' +
      '<span class="syt-tour-red">✗ रातो</span> नसिकेकाका लागि।',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'श्री यन्त्र',
    body:
      '<strong>श्री यन्त्र</strong> ट्याबले सम्पूर्ण चित्र सन्दर्भका रूपमा देखाउँछ — ' +
      'भूपुरबाट बिन्दुसम्म सबै नौ आवरणहरू।',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'तपाईं तयार हुनुहुन्छ',
    body:
      'यो <strong>✈</strong> बटन जुनसुकै समयमा थिचेर यो भ्रमण पुनः हेर्न सकिन्छ।<br><br>' +
      '<em>स्वागत र परिचय</em>बाट सुरु गर्नुहोस्, त्यसपछि आवरणहरू क्रममा पूरा गर्नुहोस्। ' +
      'समय लिनुहोस् — यो साधना हो, दौड होइन। 🙏',
  },
]

const STEPS_BN = [
  {
    title: 'শ্রী যন্ত্র মেমোরাইজারে স্বাগতম',
    body:
      '<p>এই অ্যাপটি <em>খড়্গমালা স্তোত্র</em>-এর প্রায় ১৮০টি দেবতার নাম শ্রী যন্ত্রের ' +
      'জ্যামিতিক স্থানিক স্মৃতির মাধ্যমে শিখতে সাহায্য করে।</p>' +
      '<p>শব্দের তালিকা মুখস্থ করার পরিবর্তে, প্রতিটি দেবতা যন্ত্রে <em>কোথায়</em> ' +
      'অবস্থান করেন তা শিখুন। স্থানিক স্মৃতি ক্রমিক স্মরণকে স্বাভাবিক করে তোলে।</p>',
  },
  {
    title: 'নেভিগেশন',
    body:
      'ডেস্কটপে সাইডবার সর্বদা বাম দিকে দৃশ্যমান। মোবাইলে <strong>☰</strong> বোতাম ' +
      'ট্যাপ করে খুলুন।<br><br>' +
      'এতে প্রতিটি জপ বিভাগ — ন্যাসাঙ্গদেবতাঃ, গুরুগণ, বিন্দু পর্যন্ত নয়টি আবরণ — ' +
      'এবং স্পট চেক ও স্মৃতি মানচিত্র সরঞ্জাম তালিকাভুক্ত আছে।',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'অন্বেষণ ও কণ্ঠস্থ',
    body:
      'প্রতিটি বিভাগে দুটি মোড রয়েছে:<br><br>' +
      '<strong>অন্বেষণ</strong> — ট্যাপ করলে নামগুলি প্রকাশিত হয়।<br>' +
      '<strong>কণ্ঠস্থ</strong> — নামগুলি লুকানো থাকে; আগে মনে করুন, তারপর প্রকাশ করুন ও চিহ্নিত করুন।<br><br>' +
      'প্রতিটি আবরণ বাইরে থেকে ভেতরের দিকে সম্পন্ন করুন।',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'নয়টি আবরণ',
    body:
      'প্রতিটি আবরণের নিজস্ব বিভাগ রয়েছে। সবচেয়ে বাইরের ভূপুর থেকে শুরু করে বিন্দুর দিকে ' +
      'এগিয়ে যান। বিভাগ সম্পন্ন হলে অগ্রগতি বিন্দু দেখা যায়।',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'স্পট চেক',
    body:
      '<strong>স্পট চেক</strong> যন্ত্রে একটি এলোমেলো অবস্থান বেছে নেয় এবং সেখানকার ' +
      'দেবতার নাম জিজ্ঞেস করে। এটি নমনীয় স্মরণশক্তি তৈরি করে।',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body:
      '<strong>Location Match</strong> স্পট চেকের উল্টো কাজ করে — একটি দেবতার নাম ' +
      'দেখানো হয়, আর আপনি যন্ত্রে তার অবস্থান ট্যাপ করেন। এটি প্রকৃত স্থানিক ' +
      'স্মরণশক্তি তৈরি করে।',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ড্রিল',
    body:
      'কোনো অংশ দৃঢ় মনে হলে, সেগমেন্ট ড্রিল, লাইন ড্রিল এবং ত্রিভুজ ড্রিল দিয়ে আরও ' +
      'পরীক্ষা করুন। সেগমেন্ট ড্রিল যন্ত্রের একটি অংশের মধ্যে স্মৃতি পরীক্ষা করে, ' +
      'লাইন ড্রিল একাধিক আবরণ অতিক্রমকারী একটি রেখা বরাবর, এবং ত্রিভুজ ড্রিল যন্ত্রের ' +
      'নয়টি মৌলিক গঠনমূলক ত্রিভুজের একটির মধ্যে।',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'স্মৃতি মানচিত্র',
    body:
      '<strong>স্মৃতি মানচিত্র</strong> সম্পূর্ণ যন্ত্র জুড়ে আপনার অগ্রগতি এক নজরে দেখায় — ' +
      '<span class="syt-tour-green">✓ সবুজ</span> কণ্ঠস্থের জন্য, ' +
      '<span class="syt-tour-amber">~ হলুদ</span> আংশিকের জন্য, ' +
      '<span class="syt-tour-red">✗ লাল</span> এখনো শেখা হয়নি এমনের জন্য।',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'শ্রী যন্ত্র',
    body:
      '<strong>শ্রী যন্ত্র</strong> ট্যাব সম্পূর্ণ চিত্র রেফারেন্স হিসেবে দেখায় — ' +
      'ভূপুর থেকে বিন্দু পর্যন্ত সব নয়টি আবরণ।',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'আপনি প্রস্তুত',
    body:
      'এই <strong>✈</strong> বোতামটি যেকোনো সময় ক্লিক করে এই ট্যুর আবার দেখুন।<br><br>' +
      '<em>স্বাগত ও পরিচয়</em> দিয়ে শুরু করুন, তারপর আবরণগুলি ক্রমানুসারে সম্পন্ন করুন। ' +
      'সময় নিন — এটি একটি সাধনা, প্রতিযোগিতা নয়। 🙏',
  },
]

const STEPS_GU = [
  {
    title: 'શ્રી યન્ત્ર સ્મૃતિસાધનમાં સ્વાગતમ',
    body: '<p>આ App ‘ખડ્ગમાલા સ્તોત્ર’ ના આશરે 180 દેવી નામો શ્રી યન્ત્રની સ્થાનિક સ્મૃતિ દ્વારા યાદ કરવા મદદ કરે છે.</p><p>યાદી ઘૂંટવાને બદલે, દરેક દેવી યન્ત્રમાં ‘ક્યાં’ છે તે જાણો. સ્થાનિક સ્મૃતિ ક્રમિક સમરણને બનાવે છે.</p>',
  },
  {
    title: 'નેવિગેશન',
    body: 'ડેસ્કટોપ પર સાઇડબાર ડાબી તરફ સતત દેખાય છે. મોબાઇલ પર <strong>☰</strong> ટેપ કરી ખોલો.<br><br>તેમાં દરેક ભાગ — ન્યાસાંગ દેવતા, ગુરુઓ, નવ આવરણો — તેમજ સ્પોટ ચેક અને મેમોરી મેપ સૂચિબદ્ધ છે.',
  },
  {
    selector: '[data-tour="heading-explore"]',
    title: 'અન્વેષણ અને કણ્ઠસ્થ',
    body: 'દરેક ભાગમાં બે રીતો છે:<br><br><strong>અન્વેષણ</strong> — ટેપ કરતાં નામો ઉઘડે છે.<br><strong>કણ્ઠસ્થ</strong> — નામો છુપાયેલા રહે છે; પહેલા યાદ કરો, પછી ઉઘાડો અને ચિહ્નિત કરો.<br><br>દરેક આવરણ બાહરથી અંદરતરફ પૂરો કરો.',
  },
  {
    selector: '[data-tour="nav-bhupura"]',
    title: 'નવ આવરણો',
    body: 'દરેક આવરણનો પોતાનો ભાગ છે. સૌથી બહારના ભૂપુરથી શરૂ કરી બિંદુ સુધી આગળ વધો. ભાગ સંપૂર્ણ થતાં પ્રગતિનો ડોટ દેખાય છે.',
  },
  {
    selector: '[data-tour="nav-spotcheck"]',
    title: 'સ્પોટ ચેક',
    body: '<strong>સ્પોટ ચેક</strong> યન્ત્રમાં યાદૃચ્છ સ્થળ બતાવે છે — તે સ્થળની દેવીનું નામ યાદ કરો. નમનીય સ્મૃતિ કેળવે છે.',
  },
  {
    selector: '[data-tour="nav-locate"]',
    title: 'Location Match',
    body: '<strong>Location Match</strong> સ્પોટ ચેકથી ઊલટું કામ કરે છે — એક દેવીનું નામ બતાવાય છે, અને તમે યન્ત્ર પર તેનું સ્થાન ટેપ કરો છો. આ સાચી સ્થાનિક સ્મૃતિ કેળવે છે.',
  },
  {
    selector: '[data-tour="nav-triangledrill"]',
    title: 'ડ્રિલ',
    body: 'કોઈ ભાગ મજબૂત લાગે ત્યારે, સેગમેન્ટ ડ્રિલ, લાઇન ડ્રિલ અને ત્રિકોણ ડ્રિલથી વધુ ચકાસો. સેગમેન્ટ ડ્રિલ યન્ત્રના એક ખંડમાં સ્મરણશક્તિ ચકાસે છે, લાઇન ડ્રિલ અનેક આવરણોને ઓળંગતી એક રેખા પર, અને ત્રિકોણ ડ્રિલ યન્ત્રના નવ મૂળભૂત રચનાત્મક ત્રિકોણોમાંથી એકમાં.',
  },
  {
    selector: '[data-tour="nav-memomap"]',
    title: 'મેમોરી મેપ',
    body: '<strong>મેમોરી મેપ</strong> સંપૂર્ણ યન્ત્રમાં તમારી પ્રગતિ એક નજરે બતાવે છે — <span class="syt-tour-green">✓ લીલો</span> કણ્ઠસ્થ માટે, <span class="syt-tour-amber">~ પીળો</span> આંશિક માટે, <span class="syt-tour-red">✗ લાલો</span> હજુ નથી શીખ્યેલ માટે.',
  },
  {
    selector: '[data-tour="nav-yantra"]',
    title: 'શ્રી યન્ત્ર',
    body: '<strong>શ્રી યન્ત્ર</strong> ટેબ સંપૂર્ણ ચિત્ર સંદર્ભ તરીકે દેખાડે છે — ભૂપુર થી બિંદુ સુધી તમામ નવ આવરણો.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'તમે તૈયાર છો',
    body: 'આ <strong>✈</strong> બટન કોઈ પણ સમયે ક્લિક કરી આ દોરો ફરી જોવો.<br><br>તમે ‘સ્વાગત અને પરિચય’ થી શરૂ કરો, પછી આવરણો ક્રમમાં પૂરા કરો. સમય લો — આ સાધના છે, સ્પર્ધા નથી. 🙏',
  }
]

const STEPS_BY_LANG = { en: STEPS_EN, hi: STEPS_HI, kn: STEPS_KN, ml: STEPS_ML, mr: STEPS_MR, ta: STEPS_TA, te: STEPS_TE, fr: STEPS_FR, es: STEPS_ES, it: STEPS_IT, pt: STEPS_PT, de: STEPS_DE, ja: STEPS_JA, ru: STEPS_RU, ne: STEPS_NE, bn: STEPS_BN, gu: STEPS_GU }

// ── Language options shown in the first tour step ─────────────────────────────
const TOUR_LANG_OPTIONS = [
  { code: 'en', label: 'English'   },
  { code: 'bn', label: 'বাংলা'    },
  { code: 'de', label: 'Deutsch'   },
  { code: 'es', label: 'Español'   },
  { code: 'fr', label: 'Français'  },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'hi', label: 'हिन्दी'    },
  { code: 'it', label: 'Italiano'  },
  { code: 'ja', label: '日本語'    },
  { code: 'kn', label: 'ಕನ್ನಡ'    },
  { code: 'ml', label: 'മലയാളം'   },
  { code: 'mr', label: 'मराठी'    },
  { code: 'ne', label: 'नेपाली'   },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский'  },
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
function TourOverlay({ onDone, script = 'iast', uiLang = 'en', onLanguageChange, usEnglish = false, onUsEnglishChange }) {
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
          className={['en','fr','es','it','pt','de','ja','ru'].includes(uiLang) ? 'iast' : ''}
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
                  onClick={() => {
                    if (code === 'en' && uiLang === 'en' && usEnglish && onUsEnglishChange) onUsEnglishChange(false)
                    onLanguageChange(code)
                  }}
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
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {code === 'en' && uiLang === 'en' && usEnglish ? 'American English' : label}
                  {code === 'en' && uiLang === 'en' && onUsEnglishChange && (
                    <span
                      onClick={e => { e.stopPropagation(); onUsEnglishChange(u => !u) }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 9, fontFamily: 'monospace',
                        padding: '2px 5px', borderRadius: 3, cursor: 'pointer',
                        border: usEnglish ? '1px solid #c9a84c' : '1px solid #4a3a2a',
                        background: usEnglish ? 'rgba(201,168,76,0.15)' : 'transparent',
                        color: usEnglish ? '#d4b96a' : '#5a4a3a',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: 2, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        border: usEnglish ? '1px solid #c9a84c' : '1px solid #4a3a2a',
                        background: usEnglish ? '#c9a84c' : 'transparent',
                        color: '#0f0a05', fontSize: 7, lineHeight: 1,
                      }}>
                        {usEnglish && '✓'}
                      </span>
                      US
                    </span>
                  )}
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

export function useTour({ onBeforeStart, script = 'iast', uiLang = 'en', onLanguageChange, usEnglish = false, onUsEnglishChange } = {}) {
  const [active, setActive] = useState(false)
  const cbRef = useRef(onBeforeStart)
  useEffect(() => { cbRef.current = onBeforeStart })

  const startTour = useCallback(() => {
    cbRef.current?.()
    setTimeout(() => setActive(true), 150)
    localStorage.setItem(TOUR_KEY, '1')
  }, [])

  const endTour = useCallback(() => setActive(false), [])

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      startTour()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    startTour,
    tourElement: active ? <TourOverlay onDone={endTour} script={script} uiLang={uiLang} onLanguageChange={onLanguageChange} usEnglish={usEnglish} onUsEnglishChange={onUsEnglishChange} /> : null,
  }
}
