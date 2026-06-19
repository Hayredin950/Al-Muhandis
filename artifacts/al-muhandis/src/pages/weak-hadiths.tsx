import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldX, Search, ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeakHadith {
  id: string;
  text: string;
  arabicText?: string;
  verdict: "fabricated" | "very-weak" | "weak" | "no-basis";
  grade: string;
  topic: string;
  scholars: string;
  explanation: string;
  correctVersion?: string;
  circulation: "widespread" | "common" | "occasional";
}

const WEAK_HADITHS: WeakHadith[] = [
  {
    id: "china",
    text: "Seek knowledge even unto China.",
    arabicText: "اطلبوا العلم ولو بالصين",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan (Very Weak)",
    topic: "Knowledge", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #416), Ibn al-Jawzi (al-Mawḍūʿāt)",
    explanation: "The chain contains Abū ʿĀṭifah al-Aslami, declared a liar by Imams Ibn Maʿīn, al-Bukhārī, and al-Nasāʾī. Some consider it fabricated. While seeking knowledge is obligatory, this specific phrasing cannot be reliably attributed to the Prophet ﷺ.",
    correctVersion: "Seeking knowledge is an obligation upon every Muslim. (Ibn Majah 224 — Hasan)"
  },
  {
    id: "cleanliness",
    text: "Cleanliness is half of faith.",
    arabicText: "النظافة من الإيمان",
    verdict: "no-basis", grade: "Lā Aṣla Lahu (No basis found)",
    topic: "Purification", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1031)",
    explanation: "This specific wording has no reliable chain of narration. It is a distortion of the authentic hadith below. While cleanliness is indeed important in Islam, attributing this exact phrasing to the Prophet ﷺ is not established.",
    correctVersion: "Purity (al-ṭuhūr) is half of iman. (Muslim 223 — Ṣaḥīḥ)"
  },
  {
    id: "best-of-centuries",
    text: "My companions are like stars — whichever of them you follow, you will be guided.",
    arabicText: "أصحابي كالنجوم بأيهم اقتديتم اهتديتم",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Companions", circulation: "widespread",
    scholars: "Ibn Ḥazm (al-Iḥkām), Ibn al-Jawzi (al-Mawḍūʿāt), Al-Albani (Silsilah al-Ḍaʿīfah #58)",
    explanation: "Al-Albani called this fabricated (mawḍūʿ). The chain contains Sallam ibn Sulayman al-Ṭawīl who is matrūk (abandoned). Imam al-Bazzar investigated every chain for this hadith and found all of them either severed or weak. The content also contradicts the Quran's command to 'obey Allah and the Messenger.'",
    correctVersion: undefined,
  },
  {
    id: "marriage-religion",
    text: "Marriage completes half your religion.",
    arabicText: "إذا تزوج العبد فقد استكمل نصف الدين",
    verdict: "weak", grade: "Ḍaʿīf (Weak chain)",
    topic: "Marriage", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #4802)",
    explanation: "Al-Albani graded its chain weak. Some scholars found the text acceptable through corroborating chains. The meaning itself aligns with Islamic principles but attributing this specific wording confidently to the Prophet ﷺ is disputed.",
    correctVersion: "Marriage is part of my sunnah. Whoever turns away from my sunnah is not of me. (Ibn Majah 1846 — Ṣaḥīḥ)"
  },
  {
    id: "greatest-jihad",
    text: "We have returned from the lesser jihad to the greater jihad — the jihad against one's nafs (self).",
    arabicText: "رجعنا من الجهاد الأصغر إلى الجهاد الأكبر",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan (Very Weak)",
    topic: "Jihad", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #2460), Ibn Ḥajar al-ʿAsqalānī",
    explanation: "This narration appears in Bayhaqi's Zuhd al-Kabīr but only as a statement of Ibrahim ibn Ablah, not traced to the Prophet ﷺ with a reliable chain. Ibn Ḥajar could not verify its attribution. Striving against one's nafs is a genuine Islamic concept found in authentic texts, but this specific hadith is not reliably prophetic.",
    correctVersion: "The mujahid is he who strives against his own nafs in obedience to Allah. (Tirmidhi 1621 — Ḥasan Ṣaḥīḥ)"
  },
  {
    id: "honey-quran",
    text: "The Quran is the best medicine.",
    arabicText: "القرآن أفضل الدواء",
    verdict: "no-basis", grade: "Lā Aṣla Lahu (No established chain)",
    topic: "Medicine", circulation: "common",
    scholars: "Ibn al-Qayyim (Zād al-Maʿād), Scholars of hadith",
    explanation: "This exact phrasing as a prophetic hadith is not established. There are authentic hadiths about the Quran being a healing for the heart (spiritual healing), and about specific surahs having healing properties, but the generalized medical claim in this wording is not attributed to the Prophet ﷺ.",
    correctVersion: "And We send down of the Quran that which is a healing and a mercy for the believers. (Quran 17:82)"
  },
  {
    id: "think-before-speak",
    text: "Think before you speak.",
    arabicText: "فكر قبل أن تتكلم",
    verdict: "no-basis", grade: "Lā Aṣla Lahu",
    topic: "Ethics", circulation: "common",
    scholars: "Scholars of hadith",
    explanation: "This is commonly shared as a hadith but has no reliable chain of transmission from the Prophet ﷺ. It may be a wise saying attributed to others, or a distortion of related authentic teachings.",
    correctVersion: "Whoever believes in Allah and the Last Day should say something good or remain silent. (Bukhari 6018 — Ṣaḥīḥ)"
  },
  {
    id: "dua-weapon",
    text: "Supplication is the weapon of the believer.",
    arabicText: "الدعاء سلاح المؤمن",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Supplication", circulation: "common",
    scholars: "Al-Ḥākim, Al-Albani",
    explanation: "Found in al-Ḥākim's Mustadrak and Abu Yaʿlā's Musnad, but with weak chains. Al-Albani graded it ḍaʿīf. The meaning is sound and aligned with authentic Islamic teachings on duʿāʾ, but it cannot be confidently attributed to the Prophet ﷺ.",
    correctVersion: "Your Lord said: Call upon Me, and I will respond to you. (Quran 40:60)"
  },
  {
    id: "work-live-forever",
    text: "Work as if you will live forever, and worship as if you will die tomorrow.",
    arabicText: "اعمل لدنياك كأنك تعيش أبداً واعمل لآخرتك كأنك تموت غداً",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Ethics", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #5)", 
    explanation: "One of the most famous unauthentic hadiths. Al-Albani listed it as the 5th entry in his Silsilah al-Ḍaʿīfah. The chain is broken and the content — particularly prioritizing worldly work — actually contradicts many authentic hadiths emphasizing the akhirah.",
    correctVersion: "Be in this world as though you are a stranger or a wayfarer. (Bukhari 6416 — Ṣaḥīḥ)"
  },
  {
    id: "smile-charity",
    text: "Smiling in the face of your brother is charity (sadaqah).",
    arabicText: "تبسمك في وجه أخيك صدقة",
    verdict: "weak", grade: "Ḍaʿīf (some scholars: Ḥasan)",
    topic: "Ethics", circulation: "widespread",
    scholars: "Tirmidhi 1956, Al-Albani",
    explanation: "This hadith is found in Tirmidhi and other collections. Al-Albani considered it weak, though some scholars accepted it as Hasan through corroborating narrations. Scholars differ — some reject it completely, others grade it as acceptable. Caution is advised when attributing it definitively.",
    correctVersion: undefined,
  },
  {
    id: "hurt-feelings",
    text: "The ink of the scholar is holier than the blood of the martyr.",
    arabicText: "مداد العلماء أقدس من دماء الشهداء",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Knowledge", circulation: "widespread",
    scholars: "Al-Sakhawi (al-Maqāsid al-Ḥasana), Al-Albani (Silsilah al-Ḍaʿīfah #1)",
    explanation: "Al-Albani listed this as the first entry in his Silsilah al-Ḍaʿīfah, calling it a fabrication. No reliable isnad exists tracing this to the Prophet ﷺ. It first appears in late texts without chains. Though elevating scholarship is noble, this specific superlative comparison to martyrdom blood is unfounded.",
    correctVersion: "Whoever follows a path seeking knowledge, Allah will make easy for him a path to Paradise. (Muslim 2699 — Ṣaḥīḥ)"
  },
  {
    id: "two-rakahs-cure",
    text: "If a matter distresses you, pray two rak'ahs and Allah will resolve it.",
    arabicText: "إذا همّك أمر فصلِّ ركعتين",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Prayer", circulation: "common",
    scholars: "Ibn Ḥajar al-ʿAsqalānī, Al-Albani",
    explanation: "This specific formulation as a prophetic hadith is not established. While turning to prayer in times of difficulty is genuinely Islamic and supported by authentic hadiths, this particular phrasing lacks a reliable attribution chain.",
    correctVersion: "And seek help through patience and prayer. (Quran 2:45)"
  },
  {
    id: "love-for-allah",
    text: "Love for the sake of Allah and hatred for the sake of Allah is the firmest handhold of faith.",
    arabicText: "الحب في الله والبغض في الله من أوثق عرى الإيمان",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Faith", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1688), though some collectors accepted it",
    explanation: "The concept of al-walaa wal-baraa is authentically established, but this specific phrasing with 'hatred' as 'firmest handhold' has weak chains. Do not confuse with the authentic hadith: 'Whoever loves for Allah, hates for Allah, gives for Allah, withholds for Allah has perfected faith.' (Abu Dawud 4681 — Ḥasan)",
    correctVersion: "Whoever loves for Allah, hates for Allah, gives for Allah, withholds for Allah — has completed faith. (Abu Dawud 4681 — Ḥasan)"
  },
  {
    id: "la-lawlaka",
    text: "Were it not for you [O Muhammad], I would not have created the heavens.",
    arabicText: "لولاك لما خلقت الأفلاك",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Prophet ﷺ", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #282), Al-Shawkani (al-Fawāʾid al-Majmūʿah)",
    explanation: "This narration — commonly attributed as a divine statement (hadith qudsi) — has no chain of transmission that reaches the Prophet ﷺ. Al-Albani graded it fabricated. Al-Shawkani also confirmed it has no basis. It first appeared in Sufi devotional literature centuries after the Prophet ﷺ, not in any of the six canonical collections.",
    correctVersion: "I was not sent except as a mercy to the worlds. (Abu Dawud 4807 — Ṣaḥīḥ)"
  },
  {
    id: "hidden-treasure",
    text: "I was a hidden treasure and I wanted to be known, so I created the creation.",
    arabicText: "كنت كنزاً مخفياً فأردت أن أُعرف فخلقت الخلق",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated) / Lā Aṣla Lahu",
    topic: "Theology", circulation: "widespread",
    scholars: "Ibn Taymiyyah (Majmūʿ al-Fatāwā), Al-Albani (Ḍaʿīf al-Jāmiʿ #4348), Al-Zarkashi",
    explanation: "Ibn Taymiyyah explicitly stated this narration has no reliable chain whatsoever. It is often cited in mystical (Sufi) contexts but hadith scholars across all traditions confirm it is not established as a saying of the Prophet ﷺ. The theological implication that creation was created so Allah could be 'known' contradicts mainstream Sunni creed.",
    correctVersion: "Allah was and nothing else existed before Him. His Throne was upon the water and He inscribed all things in the Reminder... (Bukhari 3191 — Ṣaḥīḥ)"
  },
  {
    id: "poverty-pride",
    text: "Poverty is my pride and I boast of it.",
    arabicText: "الفقر فخري وبه أفتخر",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Asceticism", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #5827), Al-Sakhawi (al-Maqāsid al-Ḥasana)",
    explanation: "Al-Albani graded it fabricated with no authentic chain. It contradicts authentic hadiths where the Prophet ﷺ sought refuge in Allah from poverty and praised lawful sustenance. Glorifying poverty as a religious virtue was a later development in ascetic movements, not prophetic teaching.",
    correctVersion: "I seek refuge in Allah from disbelief and from poverty. (Abu Dawud 1544 — Ṣaḥīḥ)"
  },
  {
    id: "learners-prophets",
    text: "The scholars of my nation are like the prophets of Bani Israel.",
    arabicText: "علماء أمتي كأنبياء بني إسرائيل",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Knowledge", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #66), Al-Sakhawi, Al-ʿAjlūni (Kashf al-Khafāʾ)",
    explanation: "No reliable chain exists for this hadith. Al-Albani declared it fabricated. It is also theologically problematic as it equates scholars — who are humans capable of error — with prophets, who are divinely protected. Muslim scholars in the sciences of hadith have consistently warned against its use.",
    correctVersion: "The scholars are the inheritors of the Prophets. (Abu Dawud 3641 — Ṣaḥīḥ)"
  },
  {
    id: "first-light",
    text: "The first thing Allah created was the light of your Prophet, O Jabir.",
    arabicText: "أول ما خلق الله نور نبيك يا جابر",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Prophet ﷺ", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #458), ʿAbd al-Raḥmān al-Muʿallimī",
    explanation: "This narration is attributed to Jabir ibn ʿAbdillah but has no authenticated chain. Al-Albani traced it back to a text with severe chain defects and gaps. Many hadith critics confirm it cannot be established as a saying of the Prophet ﷺ. The authentic hadith says the first creation was the pen, not the Prophet's light.",
    correctVersion: "The first thing Allah created was the pen. He said to it: 'Write!' (Tirmidhi 2155 — Ṣaḥīḥ)"
  },
  {
    id: "die-before-die",
    text: "Die before you die.",
    arabicText: "موتوا قبل أن تموتوا",
    verdict: "no-basis", grade: "Lā Aṣla Lahu (No prophetic basis)",
    topic: "Spirituality", circulation: "common",
    scholars: "Scholars of hadith and spiritual authors",
    explanation: "This saying circulates widely in Islamic spiritual literature and is sometimes cited in Sufi contexts. However, no reliable chain traces it to the Prophet ﷺ as a hadith. It may derive from a Quranic reflection or scholarly wisdom, but attributing it directly to the Prophet ﷺ as a hadith is unfounded.",
    correctVersion: "Whoever loves to meet Allah, Allah loves to meet him. (Bukhari 6507 — Ṣaḥīḥ)"
  },
  {
    id: "knows-himself",
    text: "Whoever knows himself knows his Lord.",
    arabicText: "من عرف نفسه فقد عرف ربه",
    verdict: "no-basis", grade: "Lā Aṣla Lahu (No prophetic basis)",
    topic: "Theology", circulation: "common",
    scholars: "Ibn Taymiyyah (Majmūʿ al-Fatāwā), Al-Nawawi, Al-Albani",
    explanation: "Ibn Taymiyyah and al-Nawawi both investigated this and concluded it has no reliable prophetic chain. It is a philosophical concept found in Greek and Sufi writings that was later attributed to the Prophet ﷺ. While self-knowledge is valuable in Islamic spirituality, this specific attribution to the Prophet ﷺ is not established.",
    correctVersion: undefined
  },
  {
    id: "friday-master",
    text: "Friday is the master (sayyid) of the days, and the greatest of them in the sight of Allah.",
    arabicText: "سيد الأيام يوم الجمعة وأعظمها عند الله",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Worship", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1046)",
    explanation: "Al-Albani graded this specific wording weak. The first part ('Friday is the master of days') is actually established in authentic narrations (Ibn Majah 1084). However, the additional phrase 'and the greatest in the sight of Allah' elevates the claim beyond what is established, and the full phrasing together is weak.",
    correctVersion: "The best day the sun rises on is Friday. On it Adam was created, on it he was admitted to Paradise, and on it he was expelled. (Muslim 854 — Ṣaḥīḥ)"
  },
  {
    id: "rajab-month-allah",
    text: "Rajab is the month of Allah, Sha'ban is my month, and Ramadan is the month of my nation.",
    arabicText: "رجب شهر الله وشعبان شهري ورمضان شهر أمتي",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Worship", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #4400), Ibn Ḥajar al-ʿAsqalānī (Tabyīn al-ʿAjab)",
    explanation: "Ibn Ḥajar wrote an entire treatise (Tabyīn al-ʿAjab) exposing that no authentic hadith establishes any particular merit for Rajab. Al-Albani graded this narration very weak. The special treatment of Rajab with fasting and extra worship was not practiced by the Companions and has no strong prophetic basis.",
    correctVersion: "None of you should single out the night of Friday [alone] for prayer, nor the day of Friday for fasting. (Muslim 1144 — Ṣaḥīḥ)"
  },
  {
    id: "intention-half",
    text: "A firm intention is half of the deed.",
    arabicText: "نية المؤمن أبلغ من عمله",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan / Lā Aṣla Lahu",
    topic: "Ethics", circulation: "common",
    scholars: "Al-Albani, Ibn Ḥajar, Al-Suyūṭī",
    explanation: "Multiple variant wordings of this hadith circulate, none of them with a reliable chain reaching the Prophet ﷺ. Al-Albani and other scholars confirmed the weakness or lack of basis for all these variants. The authentic teaching on intention is found in Bukhari and Muslim in different wordings.",
    correctVersion: "Actions are judged only by intentions. (Bukhari 1, Muslim 1907 — Mutawātir)"
  },
  {
    id: "most-beneficial",
    text: "The best of people is he who is most beneficial to people.",
    arabicText: "خير الناس أنفعهم للناس",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Ethics", circulation: "widespread",
    scholars: "Al-Albani (Ḍaʿīf al-Jāmiʿ #3290), though meaning is sound",
    explanation: "The chain of this narration is weak. Al-Albani graded it ḍaʿīf. Though the meaning is entirely correct and aligns with Islamic ethics, it cannot be attributed reliably to the Prophet ﷺ in this exact wording. Its widespread use without qualification is problematic.",
    correctVersion: "The most beloved of people to Allah are those who are most beneficial to people. (Al-Ṭabarāni, graded Ḥasan by some — but verify chain before citing)"
  },
  {
    id: "neighbor-hungry",
    text: "He is not a true believer who fills his stomach while his neighbor goes to sleep hungry.",
    arabicText: "ليس المؤمن الذي يشبع وجاره جائع إلى جنبه",
    verdict: "weak", grade: "Ḍaʿīf (some: Ḥasan)",
    topic: "Ethics", circulation: "common",
    scholars: "Al-Albani, Shuʿayb al-Arnaʾūṭ",
    explanation: "This hadith appears in Bukhari's al-Adab al-Mufrad (#112) and other collections. Scholars differ: some grade it weak due to chain issues, while others consider it Ḥasan through corroborating narrations. The meaning is sound and Islamic ethics strongly support it, but attributing it as Ṣaḥīḥ is contested.",
    correctVersion: "The one who sleeps full while his neighbor is hungry is not one of us — is a supported meaning, though this exact wording's chain is disputed."
  },
  {
    id: "arabic-love",
    text: "Love Arabic for three reasons: because I am Arab, because the Quran is in Arabic, and because the people of Paradise will speak Arabic.",
    arabicText: "أحبوا العربية لثلاث: لأني عربي والقرآن عربي وكلام أهل الجنة عربي",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Language", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #160), Al-Sakhawi",
    explanation: "Al-Albani declared this hadith fabricated. The chain contains a narrator known for inventing hadiths. No authentic source establishes that the language of Paradise is Arabic, and such a narration promotes tribalism the Prophet ﷺ explicitly condemned. Arabic is honored for the Quran, but this specific hadith is a fabrication.",
    correctVersion: "There is no superiority of an Arab over a non-Arab, nor of a non-Arab over an Arab, except by taqwa. (Ahmad — Ṣaḥīḥ)"
  },
  {
    id: "rose-prophet-sweat",
    text: "The rose was created from the blessed sweat of the Prophet on the night of al-Israʾ.",
    arabicText: "الورد خلق من عرق النبي ﷺ ليلة الإسراء",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Prophet ﷺ", circulation: "occasional",
    scholars: "Ibn al-Jawzi (al-Mawḍūʿāt), Scholars of hadith",
    explanation: "This narration has no basis in any reliable hadith collection. It circulates in popular devotional literature but is entirely fabricated. While love for the Prophet ﷺ is obligatory, inventing hadiths — even to honor him — is explicitly condemned by the Prophet ﷺ himself.",
    correctVersion: "Whoever narrates a hadith from me knowing it to be false, he is one of the liars. (Muslim 1 — Ṣaḥīḥ)"
  },
  {
    id: "73-sects",
    text: "My nation will be divided into 73 sects, all of them in the Fire except one.",
    arabicText: "ستفترق أمتي على ثلاث وسبعين فرقة كلها في النار إلا واحدة",
    verdict: "weak", grade: "Ḍaʿīf (chains disputed; some: Ḥasan)",
    topic: "Theology", circulation: "widespread",
    scholars: "Al-Albani graded some chains Ḥasan; others (Ibn Ḥazm) declared all chains weak",
    explanation: "This hadith appears in Abu Dawud, Tirmidhi, and others with numerous chains. Scholars are deeply divided: Al-Albani accepted some chains as Ḥasan while Ibn Ḥazm and others rejected all chains. Even those who accept it dispute what 'one sect' means. It should not be used to declare other Muslims as hellbound.",
    correctVersion: "Hold fast to the main body of Muslims (al-sawād al-aʿẓam). (Abu Dawud — partially supported)"
  },
  {
    id: "calamity-charity",
    text: "Give charity without delay, for calamity cannot overtake it.",
    arabicText: "بادروا بالصدقة فإن البلاء لا يتخطاها",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Charity", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1908)",
    explanation: "Al-Albani graded this weak. The meaning — that charity protects from calamity — is supported by other authentic hadiths. However, this specific wording lacks a reliable chain and should not be cited as a prophetic hadith without noting it is weak.",
    correctVersion: "Charity extinguishes sin as water extinguishes fire. (Tirmidhi 2616 — Ḥasan Ṣaḥīḥ)"
  },
  {
    id: "silence-wisdom",
    text: "Silence is wisdom, but few practice it.",
    arabicText: "الصمت حكمة وقليل فاعله",
    verdict: "no-basis", grade: "Lā Aṣla Lahu",
    topic: "Ethics", circulation: "common",
    scholars: "Al-ʿAjlūni (Kashf al-Khafāʾ), Al-Albani",
    explanation: "No reliable prophetic chain exists for this narration. It may originate from a wise saying of a Companion or scholar, or from pre-Islamic wisdom traditions, and was later attributed to the Prophet ﷺ. While silence in speech is praised in authentic hadiths, this exact wording is not established.",
    correctVersion: "Whoever believes in Allah and the Last Day should say something good or remain silent. (Bukhari 6018 — Ṣaḥīḥ)"
  },
  {
    id: "three-whites",
    text: "Beware of three whites: sugar, salt, and white flour.",
    arabicText: "احذروا الأبيضين: السكر والملح والدقيق الأبيض",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated) / Lā Aṣla Lahu",
    topic: "Health", circulation: "widespread",
    scholars: "Scholars of hadith — modern fabrication with no classical chain",
    explanation: "This has no basis whatsoever in any hadith collection. It appears to be a modern fabrication that spread through social media and health circles with an Islamic veneer. No classical muhaddith ever recorded or investigated this narration. The Prophet ﷺ ate dates, honey, and other foods without such restrictions.",
    correctVersion: "The son of Adam fills no vessel worse than his stomach. A few morsels that keep his back straight are sufficient... (Tirmidhi 2380 — Ṣaḥīḥ)"
  },
  {
    id: "pray-before-prayed",
    text: "Pray [the funeral prayer] for me before you pray over me.",
    arabicText: "صلوا علي قبل أن تصلوا عليّ",
    verdict: "no-basis", grade: "Lā Aṣla Lahu",
    topic: "Prayer", circulation: "occasional",
    scholars: "Scholars of hadith",
    explanation: "This narration circulates in some Arabic devotional contexts but has no reliable chain. It is sometimes used to encourage sending blessings (ṣalāt) upon the Prophet ﷺ, but the specific prophetic attribution is unestablished.",
    correctVersion: "The most deserving of intercession on the Day of Resurrection is he who sent the most blessings upon me. (Tirmidhi 484 — Ḥasan)"
  },
  {
    id: "dhikr-cure-heart",
    text: "The remembrance of Allah is the cure of the heart.",
    arabicText: "ذكر الله شفاء القلوب",
    verdict: "no-basis", grade: "Lā Aṣla Lahu (as a hadith)",
    topic: "Spirituality", circulation: "common",
    scholars: "Al-Albani and scholars of hadith",
    explanation: "This phrase circulates as a prophetic hadith, but no reliable chain traces it to the Prophet ﷺ. The meaning is strongly supported by the Quran itself ('Verily in the remembrance of Allah do hearts find rest' — 13:28), but attributing this specific wording as a hadith is not established.",
    correctVersion: "Verily in the remembrance of Allah do hearts find rest. (Quran 13:28)"
  },
  {
    id: "shaban-nisf",
    text: "On the middle night of Sha'ban, Allah descends to the lowest heaven and forgives more people than there are hairs on the goats of Banu Kalb.",
    arabicText: "يطلع الله إلى خلقه في ليلة النصف من شعبان",
    verdict: "weak", grade: "Ḍaʿīf (heavily disputed)",
    topic: "Worship", circulation: "widespread",
    scholars: "Ibn Rajab (Laṭāʾif al-Maʿārif), Al-Albani (graded Ḥasan for the general meaning), Ibn al-Jawzi (declared fabricated)",
    explanation: "This is one of the most contested hadiths. Some scholars (including Al-Albani) accepted some chains as Ḥasan for the basic concept of Allah's mercy in Sha'ban's middle night; others like Ibn al-Jawzi declared all chains fabricated. The specific practice of community celebrations, night prayers designated for this night, and unusual rituals have no strong basis.",
    correctVersion: "Allah, Blessed and Exalted, descends every night to the lowest heaven... (Bukhari 1145 — Ṣaḥīḥ — general nightly descent)"
  },
  {
    id: "female-education",
    text: "Whoever educates a daughter will have a barrier against the Fire.",
    arabicText: "من ربى ابنة فأدبها وأحسن إليها كانت له سترا من النار",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Family", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah)",
    explanation: "Multiple similar narrations exist about raising daughters well. Al-Albani graded the chains of various wordings as weak. The meaning itself is established by other authentic hadiths praising those who raise daughters and treat them well. The specific wording about 'barrier from the fire' in this exact form lacks a reliable chain.",
    correctVersion: "Whoever has three daughters and is patient with them... will have Paradise. (Abu Dawud 5147 — Ṣaḥīḥ)"
  },
  {
    id: "clean-courtyard",
    text: "Clean your courtyards, for they are courtyards of your faith.",
    arabicText: "نظفوا أفنيتكم فإنها فناء إيمانكم",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Purification", circulation: "occasional",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1033), Al-Ṣaghānī",
    explanation: "Al-Albani graded this very weak. Al-Ṣaghānī listed it among fabricated narrations. While cleanliness in Islam is a genuine and extensively documented value, this specific hadith about courtyards of faith lacks a reliable chain.",
    correctVersion: "Allah is pure and loves purity; He is clean and loves cleanliness. (Tirmidhi 2799 — Ṣaḥīḥ)"
  },
  {
    id: "black-flag",
    text: "Black flags will come from Khorasan and nothing will turn them back until they are raised in Jerusalem.",
    arabicText: "يخرج من خراسان رايات سود لا يردها شيء حتى تُنصب بإيلياء",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan / Munkar",
    topic: "End Times", circulation: "widespread",
    scholars: "Al-Albani (Ḍaʿīf Sunan al-Tirmidhi), Ibn al-Jawzi, Shuʿayb al-Arnaʾūṭ",
    explanation: "Al-Albani and others graded this narration weak. Various political movements have used it to justify their goals, from historical Abbasid propagandists to modern extremist groups. The chain is problematic, and using this hadith to support any political movement is a grave misuse of a questionable narration.",
    correctVersion: undefined
  },
  {
    id: "travel-piece-of-punishment",
    text: "Travel is a piece of punishment (ʿadhāb).",
    arabicText: "السفر قطعة من العذاب",
    verdict: "weak", grade: "Ḍaʿīf (some scholars: Ḥasan)",
    topic: "Travel", circulation: "common",
    scholars: "Al-Albani noted chains differ",
    explanation: "This hadith appears in Bukhari (#1804) and Muslim (#1927) with a complete chain and is actually considered authentic by the majority of scholars! However, it is often misquoted, misattributed, or taken out of context — the full hadith explains that when a traveler finishes his purpose, he should return home quickly. Many cite only the first part as a standalone statement, which is a form of truncation.",
    correctVersion: "Travel is a piece of punishment that prevents one of you from sleeping, eating, and drinking properly. So when one of you has finished his business, he should hurry back to his family. (Bukhari 1804 — Ṣaḥīḥ)"
  },
  {
    id: "women-awrah",
    text: "A woman is 'awrah.",
    arabicText: "المرأة عورة",
    verdict: "weak", grade: "Ḍaʿīf (debated)",
    topic: "Gender", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah), Tirmidhi, Ibn Khuzaymah",
    explanation: "This appears in Tirmidhi and Ibn Khuzaymah in various forms. Scholars debate the chain's reliability. Even among those who accept it, the meaning is debated — ʿawrah in Arabic can mean 'to be concealed/protected' rather than 'shameful,' referring to women deserving protection and privacy, not reducing them to a body part. Decontextualizing this to justify extreme restrictions goes beyond what Islamic scholars intended.",
    correctVersion: "The believing men and women are protectors of one another. (Quran 9:71)"
  },
  {
    id: "friday-prayer-40",
    text: "Whoever misses three consecutive Friday prayers, Allah places a seal on his heart.",
    arabicText: "من ترك ثلاث جمع تهاوناً طبع الله على قلبه",
    verdict: "weak", grade: "Ḍaʿīf",
    topic: "Worship", circulation: "widespread",
    scholars: "Al-Albani (Irwāʾ al-Ghalīl #592)",
    explanation: "This hadith exists in Abu Dawud, Tirmidhi, Nasa'i, and Ibn Majah, but the chain is weak. Al-Albani graded it ḍaʿīf. However, attending Friday prayer is a clear obligation based on Quranic commandment (62:9); the weakness of this specific hadith does not undermine that obligation.",
    correctVersion: "O you who believe! When the call for Friday prayer is made, hasten to the remembrance of Allah. (Quran 62:9)"
  },
  {
    id: "good-character-half",
    text: "Good character is half of the religion.",
    arabicText: "حسن الخلق نصف الدين",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Ethics", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1232)",
    explanation: "Al-Albani graded this very weak. Good character is deeply embedded in Islamic teachings through numerous authentic hadiths, but this specific phrasing of 'half of the religion' is not established. Authentic hadiths praise good character extensively without using this specific formula.",
    correctVersion: "The most perfect believers in faith are those with the best character. (Tirmidhi 1162 — Ḥasan Ṣaḥīḥ)"
  },
  {
    id: "feed-hungry-paradise",
    text: "Whoever feeds a hungry person, Allah feeds him from the fruits of Paradise.",
    arabicText: "من أطعم جائعا أطعمه الله من فاكهة الجنة",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Charity", circulation: "common",
    scholars: "Al-Albani (Ḍaʿīf al-Jāmiʿ #5470)",
    explanation: "Al-Albani graded this very weak. The general virtue of feeding the hungry is well established in numerous authentic hadiths and Quranic verses. However, this specific reward formulation lacks a reliable chain and cannot be attributed to the Prophet ﷺ.",
    correctVersion: "They feed food, despite their own desire for it, to the poor, the orphan, and the captive. (Quran 76:8)"
  },
  {
    id: "parents-feet",
    text: "Paradise is beneath the feet of mothers.",
    arabicText: "الجنة تحت أقدام الأمهات",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Family", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #593), Ibn ʿAbd al-Hādī",
    explanation: "Al-Albani graded this very weak. The chain contains unreliable narrators. While the honor of mothers in Islam is indisputably established by the Quran and dozens of authentic hadiths, this specific wording cannot be reliably attributed to the Prophet ﷺ. Its emotional appeal has caused it to spread widely despite its weakness.",
    correctVersion: "A man asked: 'Who is most deserving of good companionship?' The Prophet ﷺ said: 'Your mother.' Three times he said this, then 'Your father.' (Bukhari 5971 — Ṣaḥīḥ)"
  },
  {
    id: "hour-not-come",
    text: "The Hour will not come until you fight the Jews, such that a stone will say: 'O Muslim, behind me is a Jew — kill him.'",
    arabicText: "لا تقوم الساعة حتى تقاتلوا اليهود حتى يقول الحجر يا مسلم هذا يهودي ورائي فاقتله",
    verdict: "weak", grade: "Ḍaʿīf (chains debated; in Bukhari but with scholarly reservations)",
    topic: "End Times", circulation: "widespread",
    scholars: "Ibn Ḥajar al-ʿAsqalānī, Al-Albani, Contemporary scholars",
    explanation: "This narration appears in Bukhari and Muslim with chains many consider ṣaḥīḥ. However, leading scholars including Ibn Ḥajar noted ambiguities in the text. Contemporary scholars warn that this is a prophetic description of end-time events — not a license for violence — and that the context is specific eschatological warfare, not a general call to fight Jewish people. It has been catastrophically misused to justify hatred and violence.",
    correctVersion: "This narration, if authentic, refers to eschatological events, not a justification for hatred or violence against Jewish people in the current age."
  },
  {
    id: "make-easy",
    text: "Make things easy and do not make them difficult.",
    arabicText: "يسروا ولا تعسروا",
    verdict: "weak", grade: "Ḍaʿīf (often misquoted as standalone)",
    topic: "Ethics", circulation: "widespread",
    scholars: "Al-Albani — note: partial hadith context often dropped",
    explanation: "This phrase is actually part of an authentic hadith in Bukhari (6125) and Muslim (1734): 'Make things easy, do not make them difficult. Give good tidings and do not repel people.' The issue is not its authenticity but its misuse as a standalone permission to ignore obligations — the Prophet ﷺ said this in the context of teaching and dealing with new Muslims, not as blanket permission for religious laxity.",
    correctVersion: "Make things easy and do not make things difficult; give good tidings and do not repel people. (Bukhari 6125 — Ṣaḥīḥ)"
  },

  // ── BATCH 2: Entries 55–110 ────────────────────────────────────────────────

  {
    id: "friday-prayer-women",
    text: "Friday prayer is obligatory on every Muslim.",
    arabicText: "الجمعة حق واجب على كل مسلم",
    verdict: "weak", grade: "Ḍaʿīf (incomplete citation)",
    topic: "Prayer", circulation: "widespread",
    scholars: "Scholars of hadith — note: often truncated, original includes 'except four'",
    explanation: "The actual hadith states: 'Friday prayer is obligatory on every free adult Muslim except four: a slave, a woman, a child, and one who is sick.' (Abu Dawud 1067, graded Ḥasan). Circulating the truncated version removes the qualifications and leads to incorrect rulings. The hadith itself is not weak, but its common truncated form is misrepresentation.",
    correctVersion: "Friday prayer is an obligatory duty on every Muslim in congregation, except four: a slave, a woman, a child, and someone who is ill. (Abu Dawud 1067 — Ḥasan)"
  },
  {
    id: "month-ramadan-name",
    text: "Do not say 'Ramadan' — say 'the month of Ramadan.'",
    arabicText: "لا تقولوا رمضان فإن رمضان اسم من أسماء الله",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Ramadan", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #6768), Ibn ʿAbd al-Barr",
    explanation: "This narration claims 'Ramadan' is one of the names of Allah and thus should not be used without the prefix 'month of.' Scholars of hadith rejected this as fabricated. The Quran itself uses the word 'Ramaḍān' directly (2:185): 'The month of Ramaḍān in which the Quran was revealed.' The Prophet ﷺ also used 'Ramaḍān' without the prefix in authentic hadiths.",
    correctVersion: "The month of Ramadan is that in which the Quran was revealed — a guidance for people. (Quran 2:185)"
  },
  {
    id: "love-quran",
    text: "Love the Arabs for three reasons: because I am Arab, because the Quran is in Arabic, and because the speech of the people of Paradise is Arabic.",
    arabicText: "أحبوا العرب لثلاث لأني عربي والقرآن عربي وكلام أهل الجنة عربي",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Ethnicity", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #160), Al-Suyūṭī",
    explanation: "This narration has no reliable chain and was declared fabricated by multiple hadith scholars. It contradicts the Quranic principle: 'O people, We created you from a male and female, and made you peoples and tribes that you may know one another. Indeed, the most noble of you in the sight of Allah is the most righteous.' (49:13). Arabic is indeed the language of the Quran, but this hadith promotes ethnic superiority which Islam explicitly rejects.",
    correctVersion: "There is no superiority for an Arab over a non-Arab, nor for a non-Arab over an Arab, nor for a white man over a black man, nor a black man over a white man — except through piety. (Ahmad 22391 — Ṣaḥīḥ)"
  },
  {
    id: "friday-durood",
    text: "Send abundant blessings upon me on Friday, for your salawat reaches me.",
    arabicText: "أكثروا الصلاة علي يوم الجمعة فإن صلاتكم تبلغني",
    verdict: "weak", grade: "Ḍaʿīf (chain issues)",
    topic: "Salawat", circulation: "widespread",
    scholars: "Al-Albani noted chain weakness; other scholars consider it acceptable by corroboration",
    explanation: "This narration has a weak chain. However, scholars like Al-Suyūṭī accepted it through corroborating evidence. The authentic hadith in Abu Dawud (1531) states that deeds are presented to the Prophet ﷺ on Fridays. Sending salawat on the Prophet ﷺ on Friday is established authentically in Sahih collections.",
    correctVersion: "The best of your days is Friday. On that day, increase your prayers (salawat) upon me, for your prayers are presented to me. (Abu Dawud 1531 — Ṣaḥīḥ)"
  },
  {
    id: "dua-death",
    text: "The du'a of a Muslim for his absent brother is answered.",
    arabicText: "دعوة المرء المسلم لأخيه بظهر الغيب مستجابة",
    verdict: "weak", grade: "Ḍaʿīf (misquoted — correct version is ṣaḥīḥ)",
    topic: "Du'a", circulation: "common",
    scholars: "Al-Albani — note on correct form",
    explanation: "The authentic hadith is: 'The du'a of a person for his Muslim brother in his absence is answered. By his head there is an appointed angel; whenever he makes du'a for his brother, the appointed angel says: Ameen, and may you receive the like.' (Muslim 2733). This is often circulated with the words 'is answered' used as an absolute, whereas the original conveys a merit and the angel's ameen — not a guaranteed answer.",
    correctVersion: "The supplication of a Muslim for his brother in his absence is answered. Near his head there is an appointed angel; whenever he makes du'a for good for his brother, the angel says: Ameen, and for you the same. (Muslim 2733 — Ṣaḥīḥ)"
  },
  {
    id: "black-seed-cure",
    text: "Use the black seed, for it contains a cure for every disease except death.",
    arabicText: "عليكم بالحبة السوداء فإن فيها شفاء من كل داء إلا السام",
    verdict: "weak", grade: "Note: Ṣaḥīḥ but often misapplied",
    topic: "Medicine", circulation: "widespread",
    scholars: "Bukhari (5688), Muslim (2215) — authentic, but misapplication is common",
    explanation: "This hadith is actually authentic (Bukhari 5688, Muslim 2215). The issue is its misapplication — people use it to replace medical treatment entirely or claim black seed cures all diseases including cancer, COVID, etc. The hadith uses the word 'shifā' (healing/benefit) in a general sense, as the Arabic linguistic context does not mean a guaranteed cure for every specific disease. It is a prophetic recommendation of a beneficial herb, not a complete medical system.",
    correctVersion: "Use the black seed, for it contains healing for every disease except death. (Bukhari 5688 — Ṣaḥīḥ) — Note: Correct hadith, but do not use to replace medical treatment."
  },
  {
    id: "women-paradise",
    text: "Most of the people of Hell are women.",
    arabicText: "رأيت النار فإذا أكثر أهلها النساء",
    verdict: "weak", grade: "Note: authentic but severely miscontextualized",
    topic: "Gender", circulation: "widespread",
    scholars: "Bukhari (304) — authentic, but requires full context",
    explanation: "This narration is authentic (Bukhari 304) but almost always cited without its critical context. The full hadith is: the Prophet ﷺ explained this was in a vision (ruʾyā), and he saw women were there due to ingratitude toward their husbands and being ungrateful for good done to them. Scholars emphasize: (1) it is a vision, not a theological statement; (2) the reasons given are specific sins, not being female; (3) many authentic hadiths affirm equal spiritual standing for women who are righteous.",
    correctVersion: "Full context: The Prophet ﷺ saw this in a vision and explained the reason as a specific behavioral sin, not gender. Women who are righteous have the same promise of Paradise as men. (Quran 4:124, 16:97)"
  },
  {
    id: "intention-everything",
    text: "The intention is everything.",
    arabicText: "النية أساس العمل",
    verdict: "no-basis", grade: "Lā Aṣla Lahu (Popular paraphrase, not prophetic text)",
    topic: "Intention", circulation: "widespread",
    scholars: "Scholars of hadith",
    explanation: "This exact phrasing is not a hadith. It is a popular paraphrase of the authentic hadith of Umar ibn al-Khattab (ra). The actual prophetic text does not say 'intention is everything' as a standalone statement; rather, it says actions are judged by their intentions and each person gets what they intend.",
    correctVersion: "Actions are judged only by intentions, and every person will have only what they intended. (Bukhari 1 — Ṣaḥīḥ)"
  },
  {
    id: "allah-beautiful",
    text: "Allah is beautiful and loves beauty.",
    arabicText: "إن الله جميل يحب الجمال",
    verdict: "weak", grade: "Note: Ṣaḥīḥ but often misapplied",
    topic: "Ethics", circulation: "widespread",
    scholars: "Muslim (91) — authentic",
    explanation: "This is an authentic hadith in Sahih Muslim (91), but it is frequently misused to justify music, mixed gender entertainment, and immodesty under the label of 'beauty.' The full hadith states: 'He who has in his heart the weight of a mustard seed of pride shall not enter Paradise.' Then the man asked about beautiful clothing and shoes, and the Prophet ﷺ responded with this statement — meaning: appreciating beautiful clothing is not pride. The context is specifically about modest personal appearance, not a blanket endorsement of all things labeled 'beautiful.'",
    correctVersion: "He who has in his heart the weight of a mustard seed of pride shall not enter Paradise. Then the Prophet ﷺ said: Verily Allah is beautiful and loves beauty. (Muslim 91 — Ṣaḥīḥ) — Context: modest attire, not entertainment."
  },
  {
    id: "no-celibacy",
    text: "There is no monasticism (rahbāniyya) in Islam.",
    arabicText: "لا رهبانية في الإسلام",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Asceticism", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1494), Ibn Rajab al-Ḥanbalī",
    explanation: "This phrase is commonly circulated as a prophetic hadith but lacks a reliable chain. However, the concept itself is correct — Islam does not endorse monasticism or celibacy as Christian monastic traditions practice it. The authentic evidence for this principle comes from the Quran (57:27) and various sound hadiths discouraging abandonment of marriage and family life.",
    correctVersion: "Then We caused Our messengers to follow in their footsteps, and We caused Jesus son of Mary to follow, and We gave him the Gospel, and placed compassion and mercy in the hearts of those who followed him. But monasticism, they invented it themselves. (Quran 57:27)"
  },
  {
    id: "heart-qiblah",
    text: "The heart of the believer is the Throne of Allah (ʿArsh al-Raḥmān).",
    arabicText: "قلب المؤمن عرش الرحمن",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Spirituality", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #6), Al-Suyūṭī",
    explanation: "This narration has no reliable chain whatsoever and is considered fabricated. It may derive from Sufi metaphorical expressions that were later misattributed to the Prophet ﷺ. The theological claim that the human heart is the 'Throne of Allah' contradicts Islamic theology, which affirms the Throne of Allah as a specific, immense creation above the heavens.",
    correctVersion: undefined
  },
  {
    id: "laylat-qadr-27",
    text: "Laylat al-Qadr is the 27th night of Ramadan.",
    arabicText: "ليلة القدر ليلة سبع وعشرين",
    verdict: "weak", grade: "Ḍaʿīf Jiddan as a definitive statement",
    topic: "Ramadan", circulation: "widespread",
    scholars: "Al-Albani, Ibn Rajab al-Ḥanbalī, Majority of scholars",
    explanation: "No authentic hadith definitively identifies the 27th as Laylat al-Qadr. The Prophet ﷺ instructed believers to seek it in the last ten odd nights (Bukhari 2020, Muslim 1167). Ibn Masʿūd (ra) and Ubayy ibn Kaʿb (ra) had differing views. The 27th is among the most likely candidates but presenting it as certain is not supported by any ṣaḥīḥ text. Some scholars cite reports from Ubayy but these are not marfūʿ (traced to the Prophet ﷺ).",
    correctVersion: "Seek Laylat al-Qadr in the odd nights of the last ten nights of Ramadan. (Bukhari 2020 — Ṣaḥīḥ)"
  },
  {
    id: "womens-voice-awrah",
    text: "A woman's voice is ʿawrah (must be concealed).",
    arabicText: "صوت المرأة عورة",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan (no prophetic chain)",
    topic: "Gender", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah), Majority of classical scholars",
    explanation: "This is not a prophetic hadith — it has no chain traced to the Prophet ﷺ. It is a juristic opinion (fiqh position) held by some classical scholars — primarily the Shāfiʿī school. However, the majority of scholars do not hold this view, and the Quran itself records women speaking and being heard (28:23, 27:44). Women companions of the Prophet ﷺ narrated hadiths orally. This should be identified as a minority scholarly opinion, not a prophetic statement.",
    correctVersion: "Women narrated hundreds of hadiths directly. Aisha (ra) alone narrated over 2,000. There is no prophetic text prohibiting women from speaking in appropriate contexts."
  },
  {
    id: "father-gate-paradise",
    text: "The father is the middle gate of Paradise.",
    arabicText: "الوالد أوسط أبواب الجنة",
    verdict: "weak", grade: "Ḍaʿīf (chain issues)",
    topic: "Family", circulation: "widespread",
    scholars: "Al-Albani graded it weak; Ibn Majah (3663)",
    explanation: "Al-Albani graded this weak due to a narrator issue in its chain. The full hadith mentions 'the middle gate of Paradise' (awsaṭ abwāb al-jannah) — the best of the gates. While the concept of honouring parents is well-established in sahih hadiths and the Quran, this specific wording has a problematic chain.",
    correctVersion: "Your Lord has decreed that you worship none but Him, and that you be kind to parents. (Quran 17:23)"
  },
  {
    id: "smile-charity",
    text: "Your smile in your brother's face is charity (ṣadaqah).",
    arabicText: "تبسمك في وجه أخيك صدقة",
    verdict: "weak", grade: "Note: authentic in Tirmidhi but often over-cited",
    topic: "Ethics", circulation: "widespread",
    scholars: "Tirmidhi (1956) — Ḥasan; some scholars noted chain weakness",
    explanation: "This hadith is in Tirmidhi and graded Ḥasan by many scholars, though some noted weaknesses in its chain. The issue is not authenticity but misapplication: it is often used to claim that smiling alone fulfills one's obligations of charity, when the full hadith lists many acts as ṣadaqah — smiling, commanding good, forbidding evil, guiding a lost person, removing harm from the road, etc. Smiling is one among many, not a replacement for financial charity.",
    correctVersion: "Your smiling at your brother is ṣadaqah, commanding good is ṣadaqah, forbidding evil is ṣadaqah, guiding the lost is ṣadaqah, removing harm from the road is ṣadaqah. (Tirmidhi 1956 — Ḥasan)"
  },
  {
    id: "seeking-halal",
    text: "Seeking what is lawful (ḥalāl) is an obligation after the obligation (of prayer).",
    arabicText: "طلب الحلال فريضة بعد الفريضة",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Livelihood", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #3542), Al-Mundhirī",
    explanation: "This narration has a severely weak chain with a narrator deemed unreliable. While seeking halal provision is undeniably important in Islam and supported by multiple authentic texts, this specific phrasing cannot reliably be attributed to the Prophet ﷺ.",
    correctVersion: "It is obligatory for every Muslim to seek his provision through lawful means. The Quran states: 'O mankind, eat from whatever is on earth that is lawful and good.' (2:168)"
  },
  {
    id: "rajab-shaaban",
    text: "O Allah, bless us in Rajab and Shaʿbān and let us reach Ramaḍān.",
    arabicText: "اللهم بارك لنا في رجب وشعبان وبلغنا رمضان",
    verdict: "very-weak", grade: "Ḍaʿīf (chain: Ziyad ibn Maysarah, declared matrūk)",
    topic: "Dhikr", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #4400), Ibn Rajab",
    explanation: "This du'a appears in Ahmad's Musnad with a chain containing Ziyad ibn Maysarah who is considered matrūk (abandoned) by hadith scholars. Al-Albani declared it weak. However, many Muslims still recite it since the sentiment — asking Allah to allow one to reach Ramadan — is consistent with Islamic values. Scholars differ on whether a weak du'a may be used in devotional practice.",
    correctVersion: undefined
  },
  {
    id: "shaban-15",
    text: "On the 15th of Shaʿbān, Allah descends and forgives everyone except idolaters and those who harbor enmity.",
    arabicText: "يطلع الله إلى خلقه في ليلة النصف من شعبان فيغفر لجميع خلقه إلا لمشرك أو مشاحن",
    verdict: "weak", grade: "Ḍaʿīf (chains disputed; some scholars accept by corroboration)",
    topic: "Spirituality", circulation: "widespread",
    scholars: "Ibn Rajab al-Ḥanbalī, Al-Albani, Ibn Taymiyya",
    explanation: "Scholars differ significantly on this narration. Al-Albani graded it weak. Ibn Taymiyya also questioned its chains. However, Ibn Rajab and others accepted it through multiple corroborating chains. The night of the 15th of Shaʿbān became a matter of scholarly dispute: some see merit in it as a night of worship, others discourage specifying it with particular devotions not established by the Sunnah.",
    correctVersion: undefined
  },
  {
    id: "beard-fist",
    text: "The beard should be a fistful in length.",
    arabicText: "أن يأخذ من لحيته ما زاد على القبضة",
    verdict: "weak", grade: "Note: practice of companions, not prophetic text",
    topic: "Appearance", circulation: "widespread",
    scholars: "Al-Albani, Ibn Ḥajar",
    explanation: "The authentic prophetic command is simply to 'let the beard grow' (ʾafū al-liḥā) — without specifying a minimum or maximum length. The 'one fistful' practice is reported from ʿAbdullah ibn ʿUmar (ra) as his personal practice — not a direct prophetic command. Scholars differ: the Ḥanafī school accepts one fistful as the minimum, while others say the obligation is simply to grow the beard and not shave it.",
    correctVersion: "Cut the mustaches short and let the beards grow. (Bukhari 5893 — Ṣaḥīḥ)"
  },
  {
    id: "light-eating",
    text: "The stomach is the home of disease, and diet is the chief medicine.",
    arabicText: "المعدة بيت الداء والحمية رأس الدواء",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Medicine", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1), Al-Dhahabī",
    explanation: "Al-Albani placed this at the very beginning of his Silsilah al-Ḍaʿīfah because of how widely it is circulated but how deeply problematic its chain is. Al-Dhahabī also noted it has no reliable chain. While moderation in eating is strongly recommended in authentic texts, this medical maxim cannot be attributed to the Prophet ﷺ.",
    correctVersion: "The son of Adam fills no worse vessel than his stomach. It is sufficient for him to eat a few mouthfuls to keep his back straight. (Tirmidhi 2380 — Ṣaḥīḥ)"
  },
  {
    id: "dua-night-prayer",
    text: "The best prayer after the obligatory is the night prayer (tahajjud).",
    arabicText: "أفضل الصلاة بعد الفريضة صلاة الليل",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Muslim but often miscontextualized",
    topic: "Prayer", circulation: "widespread",
    scholars: "Muslim (1163) — authentic",
    explanation: "This hadith is authentic in Sahih Muslim (1163). However, it is misused in two ways: (1) people claim it means tahajjud is obligatory after every fard, and (2) it is used to claim sunnah prayers are not important compared to tahajjud — which contradicts other sahih hadiths about the importance of rawātib (regular sunnah prayers). The hadith simply notes the special excellence of night prayer.",
    correctVersion: "The best prayer after the prescribed prayer is the prayer in the depth of night. (Muslim 1163 — Ṣaḥīḥ)"
  },
  {
    id: "charity-misfortune",
    text: "Hasten to give charity, for misfortune cannot overtake it.",
    arabicText: "بادروا بالصدقة فإن البلاء لا يتخطاها",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Charity", circulation: "common",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1421)",
    explanation: "Al-Albani declared this very weak. While the broader concept that charity averts calamity is supported by authentic texts, this specific wording lacks a reliable chain.",
    correctVersion: "Give charity without delay, for it stands in the way of calamity. (Tirmidhi 664 — Ḥasan)"
  },
  {
    id: "knowledge-pen",
    text: "The ink of the scholar is more sacred than the blood of the martyr.",
    arabicText: "مداد العلماء أفضل من دم الشهداء",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Knowledge", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1), Ibn al-Jawzi",
    explanation: "This is one of the most famous fabricated hadiths in the Islamic world. Ibn al-Jawzi included it in his al-Mawḍūʿāt. It contradicts authentic hadiths that describe the special status of martyrdom. However, the importance of scholars and knowledge is abundantly established in authentic texts.",
    correctVersion: "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise. (Muslim 2699 — Ṣaḥīḥ)"
  },
  {
    id: "red-death",
    text: "Beware of the red death — meaning: do not be killed in sin.",
    arabicText: "إياكم والموت الأحمر",
    verdict: "fabricated", grade: "Mawḍūʿ",
    topic: "Death", circulation: "occasional",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1367)",
    explanation: "This is fabricated. There is no reliable chain for this narration.",
    correctVersion: undefined
  },
  {
    id: "eat-together",
    text: "Eat together and do not eat separately, for the blessing is in the company.",
    arabicText: "كلوا جميعا ولا تفرقوا فإن البركة مع الجماعة",
    verdict: "weak", grade: "Ḍaʿīf (chain issues)",
    topic: "Food", circulation: "common",
    scholars: "Al-Albani — noted chain weakness; Ibn Majah (3287)",
    explanation: "This hadith has chain issues. While eating together is encouraged in Islam, the specific phrasing here cannot be reliably attributed to the Prophet ﷺ. There are related authentic hadiths about saying Bismillah before eating and eating from what is nearest to you.",
    correctVersion: "Gather around your food, mention the name of Allah over it, and it will be blessed for you. (Abu Dawud 3764 — Ṣaḥīḥ)"
  },
  {
    id: "prayer-witr",
    text: "Make witr your last prayer of the night.",
    arabicText: "اجعلوا آخر صلاتكم بالليل وترا",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Bukhari but often misapplied",
    topic: "Prayer", circulation: "widespread",
    scholars: "Bukhari (998) — authentic",
    explanation: "This hadith is authentic (Bukhari 998). The issue is misapplication: many people interpret it as meaning witr must always come last and refuse to pray tahajjud after witr. The scholars' position is that one who is confident of waking for tahajjud should delay witr; one who is not confident should pray witr before sleeping. The hadith is advice, not an absolute prohibition on praying after witr.",
    correctVersion: "Make witr your last prayer of the night. (Bukhari 998 — Ṣaḥīḥ) — Note: scholars permit praying more rak'ah after witr if doing tahajjud."
  },
  {
    id: "envy-permissible",
    text: "There is no envy except in two cases: a man whom Allah has given wealth and he spends it in the right way, and a man whom Allah has given wisdom and he acts on it and teaches it.",
    arabicText: "لا حسد إلا في اثنتين",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Bukhari — misunderstood term",
    topic: "Ethics", circulation: "widespread",
    scholars: "Bukhari (73) — authentic, but the word 'ḥasad' needs clarification",
    explanation: "This is an authentic hadith. However, it is frequently misunderstood. The word 'ḥasad' here means 'ghibṭah' — a permissible desire to have what another has without wishing they lose it. Real ḥasad (envy wishing the other person would lose their blessing) is a major sin. The hadith uses 'ḥasad' in its colloquial sense of 'desiring the like of.' Circulating this without explanation causes people to confuse permissible desire with sinful envy.",
    correctVersion: "There is no envy (ghibṭah — permissible desire) except in two cases... (Bukhari 73 — Ṣaḥīḥ) — Note: ḥasad (true envy) is prohibited. This hadith refers to ghibṭah (aspiration)."
  },
  {
    id: "love-death",
    text: "Die before you die.",
    arabicText: "موتوا قبل أن تموتوا",
    verdict: "fabricated", grade: "Mawḍūʿ",
    topic: "Spirituality", circulation: "common",
    scholars: "Al-Albani, Scholars of hadith — no chain traced to the Prophet ﷺ",
    explanation: "This mystical-sounding phrase has no prophetic chain. It is widely circulated in Sufi and philosophical circles, sometimes attributed to the Prophet ﷺ. Scholars of hadith found no chain for it in any hadith collection.",
    correctVersion: undefined
  },
  {
    id: "woman-fragrance",
    text: "A woman who wears perfume and passes by men is an adulteress.",
    arabicText: "أيما امرأة استعطرت فمرت على قوم ليجدوا من ريحها فهي زانية",
    verdict: "weak", grade: "Note: found in Tirmidhi and Abu Dawud, but often misapplied",
    topic: "Gender", circulation: "widespread",
    scholars: "Abu Dawud (4173), Tirmidhi (2786) — Ḥasan but requires context",
    explanation: "This hadith is found in Abu Dawud and Tirmidhi and many scholars consider it Ḥasan. However, it is frequently misapplied. The Arabic 'zāniya' in classical usage means 'acting in the manner of an adulteress' — i.e., deliberately attracting men — and the full context is about a woman who specifically goes out wearing perfume intending to attract men's attention, not simply using fragrance at home or for her husband. Many scholars note that women may use perfume in appropriate settings.",
    correctVersion: "Full context: This applies to a woman who specifically goes out in public wearing strong perfume with the intent to attract men — not to all use of fragrance."
  },
  {
    id: "three-types-heart",
    text: "Hearts are of three types: The dead heart, the alive heart, and the ill heart.",
    arabicText: "القلوب ثلاثة: قلب ميت، وقلب حي، وقلب مريض",
    verdict: "very-weak", grade: "Ḍaʿīf (not traceable as hadith)",
    topic: "Spirituality", circulation: "common",
    scholars: "Ibn al-Qayyim — source: his own writings, not a prophetic hadith",
    explanation: "This classification of hearts is widely attributed to the Prophet ﷺ, but it originates from Ibn al-Qayyim's own scholarly writings (Ighāthat al-Lahfān, Madarij al-Salikin). It is a scholarly taxonomy based on Quranic analysis, not a quoted prophetic hadith. Circulating it as a hadith misattributes Ibn al-Qayyim's intellectual contribution to the Prophet ﷺ.",
    correctVersion: "This is a scholarly classification by Ibn al-Qayyim (rh), not a hadith. The Quran speaks of the healthy heart (qalb salīm, 26:89) and diseased heart (fī qulūbihim maraḍ, 2:10)."
  },
  {
    id: "salaat-supplication",
    text: "Prayer is the weapon of the believer (Du'a is the weapon of the believer).",
    arabicText: "الدعاء سلاح المؤمن وعماد الدين ونور السماوات والأرض",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Du'a", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #1438), Al-Ḥākim — declared weak",
    explanation: "Despite al-Ḥākim including it in his Mustadrak, subsequent scholars found its chain severely weak. Al-Albani declared it very weak. While du'a is unquestionably important and highly encouraged in authentic hadith, this particular formulation is unreliable.",
    correctVersion: "Du'a is worship. (Abu Dawud 1479 — Ṣaḥīḥ)"
  },
  {
    id: "best-names-ahmed",
    text: "The best of names to Allah are ʿAbdullah, ʿAbd al-Raḥmān, and then Ḥārith and Hammām.",
    arabicText: "أحب الأسماء إلى الله عبد الله وعبد الرحمن",
    verdict: "weak", grade: "Note: partial text — authentic in Abu Dawud",
    topic: "Names", circulation: "common",
    scholars: "Abu Dawud (4950) — Ḥasan",
    explanation: "The hadith about the names ʿAbdullah and ʿAbd al-Raḥmān is authentic (Abu Dawud 4950). The issue is the common misquotation that includes 'Muḥammad' and 'Aḥmad' as the best names, which has no reliable support in the hadith. The authentic text mentions ʿAbdullah, ʿAbd al-Raḥmān, Ḥārith and Hammām — not Muḥammad or Aḥmad (though naming one's child Muḥammad is clearly praiseworthy from other evidence).",
    correctVersion: "The most beloved names to Allah are ʿAbdullah and ʿAbd al-Raḥmān. (Abu Dawud 4950 — Ḥasan)"
  },
  {
    id: "rajab-holy",
    text: "Rajab is the month of Allah, Shaʿbān is my month, and Ramaḍān is the month of my community.",
    arabicText: "رجب شهر الله وشعبان شهري ورمضان شهر أمتي",
    verdict: "fabricated", grade: "Mawḍūʿ (Fabricated)",
    topic: "Months", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #4400), Ibn al-Jawzi, Ibn Ḥajar",
    explanation: "Ibn Ḥajar al-ʿAsqalānī stated in Tabyīn al-ʿAjab: 'No reliable hadith has been established concerning the virtue of the month of Rajab.' Ibn al-Jawzi included this in his fabrications. This narration is widely circulated, especially on social media during Rajab, despite being unauthentic. The virtues of Ramadan are well established; singling out Rajab as 'Allah's month' has no sound basis.",
    correctVersion: undefined
  },
  {
    id: "takbir-eid",
    text: "Say Allahu Akbar, Allahu Akbar, Lā ilāha illallāh, Allahu Akbar, Allahu Akbar walillāhil-ḥamd.",
    arabicText: "الله أكبر الله أكبر لا إله إلا الله الله أكبر الله أكبر ولله الحمد",
    verdict: "weak", grade: "Note: Practice of companions, not prophetic text",
    topic: "Eid", circulation: "widespread",
    scholars: "Ibn Abi Shaybah — reported as practice of Ibn Masʿūd and others, not from the Prophet ﷺ directly",
    explanation: "The specific formula of the Eid takbīr is reported from companions (ṣaḥābah), not as a direct prophetic hadith with a specified formula. Scholars differ on the exact formula. What is established is that takbīr is recommended during the days of Eid, with various legitimate formulas reported from the companions. Muslims should know that no single formula has a definitive prophetic text.",
    correctVersion: "Magnify Allah for having guided you, that you may be grateful. (Quran 2:185) — The exact formula comes from companions."
  },
  {
    id: "parents-service",
    text: "Paradise lies under the feet of mothers.",
    arabicText: "الجنة تحت أقدام الأمهات",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan (narrators severely criticized)",
    topic: "Family", circulation: "widespread",
    scholars: "Al-Albani (Silsilah al-Ḍaʿīfah #593), Ibn ʿAdī",
    explanation: "This is one of the most widely circulated weak hadiths. Al-Albani graded it very weak due to problems with its chain, including a narrator deemed severely unreliable. However, the concept of honouring mothers is abundantly established in the Quran and authentic hadiths. The famous authentic hadith (Bukhari 5971) establishes the mother's paramount right to kindness three times before the father.",
    correctVersion: "A man came to the Prophet ﷺ and asked: 'Who is most entitled to good companionship from me?' He replied: 'Your mother.' The man asked: 'Then who?' He said: 'Your mother.' The man asked: 'Then who?' He said: 'Your mother.' The man asked: 'Then who?' He said: 'Your father.' (Bukhari 5971 — Ṣaḥīḥ)"
  },
  {
    id: "dhikr-morning",
    text: "Whoever says 'Subḥānallāh' 100 times in the morning, 100 sins are forgiven from him.",
    arabicText: "من قال سبحان الله مائة مرة في الصباح",
    verdict: "weak", grade: "Ḍaʿīf — specific number 100 in morning not established",
    topic: "Dhikr", circulation: "common",
    scholars: "Al-Albani — questioned the specific number/timing",
    explanation: "While the general virtues of saying Subḥānallāh are well-established in authentic hadiths, this specific version with the specific number 100 in the morning with sin erasure is not reliably authenticated. Muslims should be aware that there are many authentic morning adhkār in reliable hadith collections.",
    correctVersion: "Whoever says: 'Subḥān Allāh wa bi-ḥamdihī' one hundred times in a day, his sins are forgiven, even if they be as much as the foam of the sea. (Muslim 2691 — Ṣaḥīḥ)"
  },
  {
    id: "bismillah-cooking",
    text: "Reciting Bismillah before cooking removes the impurity from food.",
    arabicText: "البسملة قبل الطبخ تطهر الطعام",
    verdict: "fabricated", grade: "Mawḍūʿ",
    topic: "Food", circulation: "occasional",
    scholars: "Scholars of hadith — no chain found",
    explanation: "This has no chain of narration whatsoever. Saying Bismillah before eating is recommended in authentic hadiths, but the claim that it 'removes impurity from food' is a fabrication.",
    correctVersion: "When one of you eats, he should mention Allah's name at the start (say Bismillah). If he forgets at the start, he should say 'Bismillāh awwalahu wa ākhirahu.' (Abu Dawud 3767 — Ṣaḥīḥ)"
  },
  {
    id: "wudu-face",
    text: "Wash your face seven times in wudū.",
    arabicText: "اغسل وجهك سبع مرات في الوضوء",
    verdict: "fabricated", grade: "Mawḍūʿ",
    topic: "Purification", circulation: "occasional",
    scholars: "Scholars of hadith — contradicts established sunnah",
    explanation: "This contradicts the established sunnah: wuḍūʾ requires each part to be washed once (as the minimum), with three times being the established sunnah of the Prophet ﷺ (Bukhari 159). No authentic hadith specifies seven washings for any part of wuḍūʾ.",
    correctVersion: "The Prophet ﷺ performed wuḍūʾ washing each part once. (Bukhari 157 — Ṣaḥīḥ). Three times is the recommended sunnah."
  },
  {
    id: "islamic-greeting-salam",
    text: "When you meet a Muslim, greet him even if he owes you something.",
    arabicText: "إذا لقيت المسلم فسلم عليه وإن كان لك عليه دين",
    verdict: "weak", grade: "Ḍaʿīf — no chain established",
    topic: "Ethics", circulation: "occasional",
    scholars: "Scholars of hadith",
    explanation: "No reliable chain has been found for this narration. However, greeting fellow Muslims is well established in the Sunnah through multiple authentic hadiths.",
    correctVersion: "Spread salam among yourselves. (Muslim 54 — Ṣaḥīḥ)"
  },
  {
    id: "travel-dua",
    text: "A traveller's du'a is never rejected.",
    arabicText: "دعاء المسافر مستجاب",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Du'a", circulation: "widespread",
    scholars: "Al-Albani — no reliable chain",
    explanation: "While there is an authentic hadith mentioning that a traveller's du'a is among those that are answered (Tirmidhi 1905 — Ḥasan), the absolute version 'never rejected' as a standalone statement is not from a reliable chain. The authentic text includes this alongside other categories of answered du'a as an encouragement, not an absolute guarantee.",
    correctVersion: "Three du'as are not rejected: the du'a of a father, the du'a of a fasting person, and the du'a of a traveller. (Tirmidhi 1905 — Ḥasan)"
  },
  {
    id: "quranic-arabic-obligation",
    text: "It is obligatory to learn Arabic for every Muslim.",
    arabicText: "تعلم العربية فإنها تثبت العقل وتزيد المروءة",
    verdict: "fabricated", grade: "Mawḍūʿ",
    topic: "Knowledge", circulation: "common",
    scholars: "Al-Albani, Scholars of hadith",
    explanation: "This specific narration making Arabic learning a religious obligation is not from an authentic prophetic source. While learning Arabic to understand the Quran is strongly recommended and considered an obligation by many scholars of fiqh, this is based on juristic derivation — not a prophetic hadith with a reliable chain.",
    correctVersion: "Indeed We have sent it down as an Arabic Quran so that you might understand. (Quran 12:2)"
  },
  {
    id: "shaytan-right-hand",
    text: "Shayṭān eats with his left hand.",
    arabicText: "إن الشيطان يأكل بشماله",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Muslim but often misunderstood",
    topic: "Etiquette", circulation: "widespread",
    scholars: "Muslim (2020) — authentic",
    explanation: "This hadith is authentic in Muslim (2020). The issue is misunderstanding: people often assume that using the left hand for anything at all is 'imitating shaytān.' The hadith is specifically about eating and drinking — classical scholars agreed the left hand is used for cleaning (istinjāʾ) and other purposes. Also, people with physical disabilities or injuries who cannot use the right hand are not sinning.",
    correctVersion: "When any one of you eats, he should eat with his right hand; and when he drinks, he should drink with his right hand; for indeed Shayṭān eats with his left hand and drinks with his left hand. (Muslim 2020 — Ṣaḥīḥ)"
  },
  {
    id: "no-pictures",
    text: "Whoever makes a picture, Allah will punish him on the Day of Resurrection.",
    arabicText: "من صور صورة عذبه الله يوم القيامة",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Bukhari but severely misapplied",
    topic: "Art", circulation: "widespread",
    scholars: "Bukhari (5950), Muslim (2109) — authentic but requires scholarly context",
    explanation: "This authentic hadith applies to sculpted images and hand-drawn depictions of animate beings (taṣwīr) as understood by classical scholars — particularly when done for purposes of worship or veneration. Many contemporary scholars, including Ibn ʿUthaymīn and others, debated extensively whether photography and digital images fall under this category. A ruling of absolute prohibition on all photography/digital images is a minority scholarly position; the majority of contemporary scholars distinguish between hand-crafted 3D statues and photographs.",
    correctVersion: "Those who make these pictures will be punished on the Day of Resurrection and will be told: Make alive what you have created. (Bukhari 5950 — Ṣaḥīḥ) — Application is disputed for photography."
  },
  {
    id: "friday-ghusl",
    text: "Ghusl on Friday is wājib (obligatory).",
    arabicText: "غسل الجمعة واجب على كل محتلم",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Bukhari/Muslim but 'wājib' is debated",
    topic: "Prayer", circulation: "widespread",
    scholars: "Bukhari (879), Muslim (844) — authentic; but scholarly debate on 'wājib'",
    explanation: "This hadith is authentic and contains the word 'wājib'. However, scholars differed on whether this means: (1) strictly obligatory (Ẓāhirī school), or (2) strongly recommended (the majority position — Mālikī, Shāfiʿī, Ḥanbalī). The majority position relies on other authentic hadiths that clarify it as mustaḥabb (recommended). Circulating it as an absolute obligation without scholarly context is problematic.",
    correctVersion: "Ghusl on Friday is wājib (strongly recommended/obligatory) upon every post-pubescent Muslim. (Bukhari 879 — Ṣaḥīḥ) — Most scholars say it is strongly recommended, not strictly obligatory."
  },
  {
    id: "dua-oppressed",
    text: "Fear the du'a of the oppressed, for there is no veil between it and Allah.",
    arabicText: "اتقوا دعوة المظلوم فإنها ليس بينها وبين الله حجاب",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Bukhari — often recited with additions",
    topic: "Du'a", circulation: "widespread",
    scholars: "Bukhari (1496) — authentic",
    explanation: "This hadith is authentic in Bukhari (1496). The issue is additions: people often add 'even if he is a non-Muslim' or 'even if he is a sinner' — phrases not in the original text. Some also use this hadith to imply that cursing an oppressor is always answered, whereas scholars note this is an encouragement to be just, not a theological guarantee that every du'a of every self-identified oppressed person is answered.",
    correctVersion: "Fear the du'a of the oppressed, even if he is a disbeliever, for there is no barrier between it and Allah. (Bukhari 1496 — Ṣaḥīḥ) — Note: The 'disbeliever' addition is found in some narrations; context is about genuine injustice."
  },
  {
    id: "iblees-sujood",
    text: "Iblīs wept when Adam was commanded to prostrate.",
    arabicText: "بكى إبليس حين أمر آدم بالسجود",
    verdict: "fabricated", grade: "Mawḍūʿ",
    topic: "Spirituality", circulation: "occasional",
    scholars: "Scholars of hadith — no chain",
    explanation: "This is not found in any reliable hadith collection with an authentic chain. The Quran clearly states that Iblīs refused to prostrate out of arrogance (2:34, 7:12). A narrative of him weeping contradicts what is Quranic.",
    correctVersion: "And when We said to the angels: Prostrate before Adam — they all prostrated except Iblīs. He refused and was arrogant and became one of the disbelievers. (Quran 2:34)"
  },
  {
    id: "sunnah-beard-length",
    text: "Cutting the beard shorter than a fistful is haram.",
    arabicText: "قص اللحية إلى دون القبضة حرام",
    verdict: "weak", grade: "Juristic opinion, not prophetic hadith",
    topic: "Appearance", circulation: "common",
    scholars: "Scholarly disagreement — Ḥanafī view vs. others",
    explanation: "No hadith uses the word 'ḥarām' (prohibited) for cutting the beard to a specific length. The prophetic command is to let the beard grow and not shave it entirely. The 'one fistful minimum' is an ijtiḥād (juristic deduction) of some scholars — not a direct prophetic text. Presenting this as a definitive prophetic command is inaccurate.",
    correctVersion: "Let the beards grow and trim the mustaches. (Bukhari 5893 — Ṣaḥīḥ)"
  },
  {
    id: "good-deeds-fire",
    text: "Good deeds protect from the Hellfire.",
    arabicText: "الصدقة تطفئ غضب الرب وتدفع ميتة السوء",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Tirmidhi but often paraphrased inaccurately",
    topic: "Charity", circulation: "widespread",
    scholars: "Tirmidhi (664) — authentic",
    explanation: "The authentic hadith says 'Charity extinguishes the anger of the Lord and repels a bad death.' This is authentic and well-established. The issue is paraphrasing: 'good deeds protect from Hellfire' as an absolute is an overgeneralization that contradicts the principle of divine forgiveness, repentance, and God's will. The hadith is specific to charity (ṣadaqah), not all good deeds, and refers to the Lord's anger and bad death — not Hellfire per se.",
    correctVersion: "Charity extinguishes the Lord's anger and repels an evil death. (Tirmidhi 664 — Ṣaḥīḥ)"
  },
  {
    id: "quran-surah-baqarah-protection",
    text: "Whoever reads Surah al-Baqarah in his house, Shayṭān will not enter for three days.",
    arabicText: "اقرأوا سورة البقرة في بيوتكم فإن الشيطان لا يدخل البيت الذي يقرأ فيه سورة البقرة",
    verdict: "weak", grade: "Note: Ṣaḥīḥ but 'three days' addition is disputed",
    topic: "Quran", circulation: "widespread",
    scholars: "Muslim (780), Tirmidhi — authentic with some variation in wording",
    explanation: "The core hadith is authentic in Muslim (780): 'Do not make your houses like graves. Indeed, Shayṭān does not enter a house in which Surah al-Baqarah is recited.' However, the addition 'for three days' and 'three nights' appears in some narrations with varying chain strength. The principle is well established; the specific duration is disputed.",
    correctVersion: "Do not make your houses into graveyards. Shayṭān flees from a house in which Surah al-Baqarah is recited. (Muslim 780 — Ṣaḥīḥ)"
  },
  {
    id: "night-of-power-angels",
    text: "On Laylat al-Qadr, the number of angels on earth exceeds the number of pebbles.",
    arabicText: "في ليلة القدر تنزل الملائكة أكثر من عدد الحصى",
    verdict: "very-weak", grade: "Ḍaʿīf Jiddan",
    topic: "Ramadan", circulation: "common",
    scholars: "Al-Albani — no reliable chain",
    explanation: "This specific addition about pebbles has no reliable chain. The Quran does affirm that angels descend on Laylat al-Qadr (97:4), but this specific numerical comparison is not established.",
    correctVersion: "The night of decree is better than a thousand months. The angels and the Spirit descend therein by permission of their Lord for every matter. (Quran 97:3-4)"
  },
  {
    id: "right-shoe-first",
    text: "Begin with the right shoe when putting on shoes.",
    arabicText: "إذا انتعل أحدكم فليبدأ باليمين",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Abu Dawud — often extended incorrectly",
    topic: "Etiquette", circulation: "widespread",
    scholars: "Abu Dawud (4139), Tirmidhi (1766) — authentic",
    explanation: "This hadith is authentic. The issue is the common extension: 'and enter the bathroom with the left foot and exit with the right' — this extension is not in the authentic hadith about shoes. The bathroom entry du'a and entering with the left foot is established separately. Also, people sometimes present this as a major rule and judge others harshly for putting on the left shoe first.",
    correctVersion: "When one of you puts on shoes, he should start with the right; and when he removes them, he should start with the left. (Abu Dawud 4139 — Ṣaḥīḥ)"
  },
  {
    id: "angels-dont-enter-music",
    text: "Angels do not enter a house in which there is a dog or images.",
    arabicText: "لا تدخل الملائكة بيتا فيه كلب ولا صورة",
    verdict: "weak", grade: "Note: Ṣaḥīḥ in Bukhari but often extended to music",
    topic: "Ethics", circulation: "widespread",
    scholars: "Bukhari (3322), Muslim (2106) — authentic",
    explanation: "This authentic hadith mentions dogs and images (taṣwīr). It is frequently misquoted or extended to include music and other items not in the original text. Scholars note the hadith refers to specific items and has been interpreted with nuance regarding working dogs (permissible) vs. pet dogs, and regarding what constitutes 'images' in the classical vs. modern sense.",
    correctVersion: "The angels do not enter a house in which there is a dog or an image. (Bukhari 3322 — Ṣaḥīḥ) — Note: applies to the specific items mentioned, not extended items."
  },
];


const VERDICT_CONFIG = {
  "fabricated":  { label: "Fabricated (Mawḍūʿ)", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: "🚫" },
  "very-weak":   { label: "Very Weak (Ḍaʿīf Jiddan)", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: "⚠️" },
  "weak":        { label: "Weak (Ḍaʿīf)", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "⚡" },
  "no-basis":    { label: "No Established Basis", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: "❌" },
};

const CIRCULATION_CONFIG = {
  "widespread": { label: "Very Widespread", color: "text-rose-400" },
  "common":     { label: "Commonly Cited", color: "text-amber-400" },
  "occasional": { label: "Occasionally Cited", color: "text-muted-foreground" },
};

export default function WeakHadithsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = WEAK_HADITHS.filter((h) => {
    const matchesSearch = !search || h.text.toLowerCase().includes(search.toLowerCase()) || h.topic.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || h.verdict === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link href="/hadith">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Hadith Collections
        </button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <ShieldX className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Weak Hadith Encyclopedia</h1>
            <p className="text-xs text-muted-foreground">Common unauthentic hadiths in circulation</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/90 leading-relaxed">
              The Prophet ﷺ said: "Whoever narrates a hadith from me knowing it to be false, he is one of the liars." (Muslim). This encyclopedia helps identify commonly circulated weak and fabricated hadiths so Muslims can protect the integrity of the Sunnah.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "all", label: "All" },
          { id: "fabricated", label: "🚫 Fabricated" },
          { id: "very-weak", label: "⚠️ Very Weak" },
          { id: "weak", label: "⚡ Weak" },
          { id: "no-basis", label: "❌ No Basis" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              filter === id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: "Total", count: WEAK_HADITHS.length, color: "text-foreground" },
          { label: "Fabricated", count: WEAK_HADITHS.filter((h) => h.verdict === "fabricated").length, color: "text-rose-400" },
          { label: "Very Weak", count: WEAK_HADITHS.filter((h) => h.verdict === "very-weak").length, color: "text-orange-400" },
          { label: "No Basis", count: WEAK_HADITHS.filter((h) => h.verdict === "no-basis").length, color: "text-red-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card px-3 py-2.5 text-center">
            <p className={`text-xl font-bold ${color}`}>{count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search weak hadiths…"
          className="w-full px-4 py-2.5 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      </div>
      {(search || filter !== "all") && (
        <p className="text-xs text-muted-foreground mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} shown</p>
      )}

      <div className="space-y-3">
        {filtered.map((h, i) => {
          const vc = VERDICT_CONFIG[h.verdict];
          const cc = CIRCULATION_CONFIG[h.circulation];
          const isOpen = expanded === h.id;
          return (
            <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className={cn("rounded-xl border overflow-hidden", vc.bg, vc.border)}>
                <button onClick={() => setExpanded(isOpen ? null : h.id)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm">{vc.icon}</span>
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", vc.bg, vc.border, vc.color)}>
                        {vc.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">{h.topic}</span>
                      <span className={cn("text-[10px] font-medium", cc.color)}>· {cc.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">"{h.text}"</p>
                    {h.arabicText && (
                      <p className="text-xs text-muted-foreground mt-1 text-right" dir="rtl"
                        style={{ fontFamily: "'Amiri Quran', serif" }}>{h.arabicText}</p>
                    )}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {isOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5 border-t border-border/50">
                    <div className="pt-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Scholar Verdicts</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{h.scholars}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why It's Problematic</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{h.explanation}</p>
                      </div>
                      {h.correctVersion && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-1">✓ Use This Authentic Version Instead</p>
                          <p className="text-xs text-emerald-400/90 leading-relaxed">{h.correctVersion}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ShieldX className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No matching entries found.</p>
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl border border-border bg-card">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Important Note</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This encyclopedia covers only a small selection of widely circulated problematic narrations. For comprehensive research, refer to Al-Albani's Silsilah al-Ḍaʿīfah (10 volumes), Ibn al-Jawzi's al-Mawḍūʿāt, and al-Suyuti's al-Laʾali al-Masṇūʿah. Scholars may differ on grades — always cite your source.
        </p>
      </div>
    </div>
  );
}
