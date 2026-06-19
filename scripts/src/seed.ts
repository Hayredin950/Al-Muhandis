import {
  db, surahsTable, ayahsTable, ayahWordsTable, tafseerTable,
  hadithCollectionsTable, hadithsTable, narratorsTable, hadithIsnadTable, ayahHadithLinksTable,
} from "@workspace/db";

async function main() {
  console.log("🌙 Seeding Al-Muhandis database...");

  // ─── ALL 114 SURAHS ──────────────────────────────────────────────────────────
  const surahs = [
    { number: 1, nameArabic: "الْفَاتِحَة", nameTransliterated: "Al-Fatihah", nameEnglish: "The Opening", revelation: "Meccan" as const, ayahCount: 7, juzNumber: 1, description: "The Opening chapter recited in every unit of prayer. Called 'Umm al-Quran' (Mother of the Quran), it encapsulates the essence of the entire Quran." },
    { number: 2, nameArabic: "الْبَقَرَة", nameTransliterated: "Al-Baqarah", nameEnglish: "The Cow", revelation: "Medinan" as const, ayahCount: 286, juzNumber: 1, description: "The longest surah in the Quran, containing Ayat al-Kursi (2:255) and the greatest verse on Islamic law." },
    { number: 3, nameArabic: "آلِ عِمْرَان", nameTransliterated: "Ali 'Imran", nameEnglish: "Family of Imran", revelation: "Medinan" as const, ayahCount: 200, juzNumber: 3, description: "Named after the family of Imran, discusses the Battle of Uhud and key theological matters." },
    { number: 4, nameArabic: "النِّسَاء", nameTransliterated: "An-Nisa", nameEnglish: "The Women", revelation: "Medinan" as const, ayahCount: 176, juzNumber: 4, description: "Deals extensively with laws concerning women, family, inheritance, and social justice." },
    { number: 5, nameArabic: "الْمَائِدَة", nameTransliterated: "Al-Ma'idah", nameEnglish: "The Table Spread", revelation: "Medinan" as const, ayahCount: 120, juzNumber: 6, description: "One of the last surahs revealed, containing important rulings on food, contracts, and interfaith relations." },
    { number: 6, nameArabic: "الْأَنْعَام", nameTransliterated: "Al-An'am", nameEnglish: "The Cattle", revelation: "Meccan" as const, ayahCount: 165, juzNumber: 7, description: "A Meccan surah addressing the fundamentals of monotheism and refuting polytheism." },
    { number: 7, nameArabic: "الْأَعْرَاف", nameTransliterated: "Al-A'raf", nameEnglish: "The Heights", revelation: "Meccan" as const, ayahCount: 206, juzNumber: 8, description: "Named after the elevated place between Heaven and Hell, recounts the stories of previous prophets." },
    { number: 8, nameArabic: "الْأَنْفَال", nameTransliterated: "Al-Anfal", nameEnglish: "The Spoils of War", revelation: "Medinan" as const, ayahCount: 75, juzNumber: 9, description: "Revealed after the Battle of Badr, addressing divine victory and the distribution of war spoils." },
    { number: 9, nameArabic: "التَّوْبَة", nameTransliterated: "At-Tawbah", nameEnglish: "The Repentance", revelation: "Medinan" as const, ayahCount: 129, juzNumber: 10, description: "The only surah without Bismillah, dealing with breaking treaties with polytheists and hypocrites." },
    { number: 10, nameArabic: "يُونُس", nameTransliterated: "Yunus", nameEnglish: "Jonah", revelation: "Meccan" as const, ayahCount: 109, juzNumber: 11, description: "Named after Prophet Yunus (Jonah), emphasizing divine mercy and the universal call to monotheism." },
    { number: 11, nameArabic: "هُود", nameTransliterated: "Hud", nameEnglish: "Hud", revelation: "Meccan" as const, ayahCount: 123, juzNumber: 11, description: "Named after Prophet Hud, one of the five great Arab prophets, sent to the people of 'Ad." },
    { number: 12, nameArabic: "يُوسُف", nameTransliterated: "Yusuf", nameEnglish: "Joseph", revelation: "Meccan" as const, ayahCount: 111, juzNumber: 12, description: "The 'best of stories', telling the complete narrative of Prophet Yusuf (Joseph) in one surah." },
    { number: 13, nameArabic: "الرَّعْد", nameTransliterated: "Ar-Ra'd", nameEnglish: "The Thunder", revelation: "Medinan" as const, ayahCount: 43, juzNumber: 13, description: "Contains the verse: 'Verily, with the remembrance of Allah do hearts find rest.' (13:28)" },
    { number: 14, nameArabic: "إِبْرَاهِيم", nameTransliterated: "Ibrahim", nameEnglish: "Abraham", revelation: "Meccan" as const, ayahCount: 52, juzNumber: 13, description: "Named after Prophet Ibrahim, the father of monotheism and the Friend of Allah." },
    { number: 15, nameArabic: "الْحِجْر", nameTransliterated: "Al-Hijr", nameEnglish: "The Rocky Tract", revelation: "Meccan" as const, ayahCount: 99, juzNumber: 14, description: "Contains the story of Thamud and emphasizes divine protection of the Quran from corruption." },
    { number: 16, nameArabic: "النَّحْل", nameTransliterated: "An-Nahl", nameEnglish: "The Bees", revelation: "Meccan" as const, ayahCount: 128, juzNumber: 14, description: "Known as 'the chapter of blessings', enumerating countless divine favors upon humanity." },
    { number: 17, nameArabic: "الْإِسْرَاء", nameTransliterated: "Al-Isra", nameEnglish: "The Night Journey", revelation: "Meccan" as const, ayahCount: 111, juzNumber: 15, description: "Opens with the miraculous Night Journey (Isra') and Mi'raj of the Prophet ﷺ." },
    { number: 18, nameArabic: "الْكَهْف", nameTransliterated: "Al-Kahf", nameEnglish: "The Cave", revelation: "Meccan" as const, ayahCount: 110, juzNumber: 15, description: "Contains four profound stories. Reciting it on Fridays provides light between the two Fridays." },
    { number: 19, nameArabic: "مَرْيَم", nameTransliterated: "Maryam", nameEnglish: "Mary", revelation: "Meccan" as const, ayahCount: 98, juzNumber: 16, description: "Named after Mary (Maryam), mother of Jesus. Narrates the miraculous birth of Prophet Isa." },
    { number: 20, nameArabic: "طه", nameTransliterated: "Ta-Ha", nameEnglish: "Ta-Ha", revelation: "Meccan" as const, ayahCount: 135, juzNumber: 16, description: "Begins with the mysterious letters Ta-Ha. Contains a detailed account of Prophet Musa's mission." },
    { number: 21, nameArabic: "الْأَنبِيَاء", nameTransliterated: "Al-Anbiya", nameEnglish: "The Prophets", revelation: "Meccan" as const, ayahCount: 112, juzNumber: 17, description: "Narrates the stories of 18 prophets and their missions, emphasizing the unity of prophethood." },
    { number: 22, nameArabic: "الْحَجّ", nameTransliterated: "Al-Hajj", nameEnglish: "The Pilgrimage", revelation: "Medinan" as const, ayahCount: 78, juzNumber: 17, description: "Contains legislation about Hajj and discusses the resurrection, describing divine power." },
    { number: 23, nameArabic: "الْمُؤْمِنُون", nameTransliterated: "Al-Mu'minun", nameEnglish: "The Believers", revelation: "Meccan" as const, ayahCount: 118, juzNumber: 18, description: "Opens with the qualities of successful believers and discusses the creation of human beings." },
    { number: 24, nameArabic: "النُّور", nameTransliterated: "An-Nur", nameEnglish: "The Light", revelation: "Medinan" as const, ayahCount: 64, juzNumber: 18, description: "Contains legislation on chastity, the famous 'Light Verse' (24:35), and rules of conduct." },
    { number: 25, nameArabic: "الْفُرْقَان", nameTransliterated: "Al-Furqan", nameEnglish: "The Criterion", revelation: "Meccan" as const, ayahCount: 77, juzNumber: 18, description: "The Criterion refers to the Quran as the standard separating truth from falsehood." },
    { number: 26, nameArabic: "الشُّعَرَاء", nameTransliterated: "Ash-Shu'ara", nameEnglish: "The Poets", revelation: "Meccan" as const, ayahCount: 227, juzNumber: 19, description: "Discusses the stories of several prophets and compares the Quran to mere poetry." },
    { number: 27, nameArabic: "النَّمْل", nameTransliterated: "An-Naml", nameEnglish: "The Ant", revelation: "Meccan" as const, ayahCount: 93, juzNumber: 19, description: "Named after the famous incident when Prophet Sulayman heard the speech of an ant." },
    { number: 28, nameArabic: "الْقَصَص", nameTransliterated: "Al-Qasas", nameEnglish: "The Stories", revelation: "Meccan" as const, ayahCount: 88, juzNumber: 20, description: "Contains the most detailed account of Prophet Musa's life from birth to prophethood." },
    { number: 29, nameArabic: "الْعَنكَبُوت", nameTransliterated: "Al-'Ankabut", nameEnglish: "The Spider", revelation: "Meccan" as const, ayahCount: 69, juzNumber: 20, description: "Uses the spider's web as a metaphor for the fragility of those who take protectors besides Allah." },
    { number: 30, nameArabic: "الرُّوم", nameTransliterated: "Ar-Rum", nameEnglish: "The Romans", revelation: "Meccan" as const, ayahCount: 60, juzNumber: 21, description: "Prophecies the Byzantine victory over Persia, which was fulfilled within the predicted timeframe." },
    { number: 31, nameArabic: "لُقْمَان", nameTransliterated: "Luqman", nameEnglish: "Luqman", revelation: "Meccan" as const, ayahCount: 34, juzNumber: 21, description: "Named after the wise man Luqman, containing his timeless advice to his son." },
    { number: 32, nameArabic: "السَّجْدَة", nameTransliterated: "As-Sajdah", nameEnglish: "The Prostration", revelation: "Meccan" as const, ayahCount: 30, juzNumber: 21, description: "Contains a verse of prostration (sajdah), affirming Allah's creation of the heavens and earth." },
    { number: 33, nameArabic: "الْأَحْزَاب", nameTransliterated: "Al-Ahzab", nameEnglish: "The Combined Forces", revelation: "Medinan" as const, ayahCount: 73, juzNumber: 21, description: "Covers the Battle of the Trench and important rulings about the Prophet's household." },
    { number: 34, nameArabic: "سَبَإ", nameTransliterated: "Saba", nameEnglish: "Sheba", revelation: "Meccan" as const, ayahCount: 54, juzNumber: 22, description: "Named after the ancient Sabaean civilization of Yemen, emphasizing gratitude for Allah's blessings." },
    { number: 35, nameArabic: "فَاطِر", nameTransliterated: "Fatir", nameEnglish: "Originator", revelation: "Meccan" as const, ayahCount: 45, juzNumber: 22, description: "Named after Allah as the Originator of creation, emphasizing His unique creative power." },
    { number: 36, nameArabic: "يس", nameTransliterated: "Ya-Sin", nameEnglish: "Ya-Sin", revelation: "Meccan" as const, ayahCount: 83, juzNumber: 22, description: "Called the 'heart of the Quran'. The Prophet ﷺ said: 'Everything has a heart, and the heart of the Quran is Ya-Sin.'" },
    { number: 37, nameArabic: "الصَّافَّات", nameTransliterated: "As-Saffat", nameEnglish: "Those Ranged in Rows", revelation: "Meccan" as const, ayahCount: 182, juzNumber: 23, description: "Opens with an oath by the angels ranked in rows before Allah, emphasizing divine unity." },
    { number: 38, nameArabic: "ص", nameTransliterated: "Sad", nameEnglish: "The Letter Sad", revelation: "Meccan" as const, ayahCount: 88, juzNumber: 23, description: "Contains the story of the testing of Prophet Dawud and Sulayman and their response to trials." },
    { number: 39, nameArabic: "الزُّمَر", nameTransliterated: "Az-Zumar", nameEnglish: "The Troops", revelation: "Meccan" as const, ayahCount: 75, juzNumber: 23, description: "Describes the Day of Judgment when people will be led in troops to Hell or Paradise." },
    { number: 40, nameArabic: "غَافِر", nameTransliterated: "Ghafir", nameEnglish: "The Forgiver", revelation: "Meccan" as const, ayahCount: 85, juzNumber: 24, description: "Named after one of Allah's Names, 'The Forgiver of sin'. Contains the speech of the believing man of Pharaoh's people." },
    { number: 41, nameArabic: "فُصِّلَت", nameTransliterated: "Fussilat", nameEnglish: "Explained in Detail", revelation: "Meccan" as const, ayahCount: 54, juzNumber: 24, description: "The Quran's verses are described as 'explained in detail', affirming their clarity and guidance." },
    { number: 42, nameArabic: "الشُّورَى", nameTransliterated: "Ash-Shura", nameEnglish: "The Consultation", revelation: "Meccan" as const, ayahCount: 53, juzNumber: 25, description: "Emphasizes shura (consultation) as a principle of Islamic governance and community affairs." },
    { number: 43, nameArabic: "الزُّخْرُف", nameTransliterated: "Az-Zukhruf", nameEnglish: "The Gold Adornments", revelation: "Meccan" as const, ayahCount: 89, juzNumber: 25, description: "Criticizes the materialistic mindset that valued gold over prophetic guidance." },
    { number: 44, nameArabic: "الدُّخَان", nameTransliterated: "Ad-Dukhan", nameEnglish: "The Smoke", revelation: "Meccan" as const, ayahCount: 59, juzNumber: 25, description: "Mentions the 'smoke' (Dukhan) as one of the signs before the Day of Judgment." },
    { number: 45, nameArabic: "الْجَاثِيَة", nameTransliterated: "Al-Jathiyah", nameEnglish: "The Crouching", revelation: "Meccan" as const, ayahCount: 37, juzNumber: 25, description: "Describes all people crouching on their knees before Allah on the Day of Judgment." },
    { number: 46, nameArabic: "الْأَحْقَاف", nameTransliterated: "Al-Ahqaf", nameEnglish: "The Wind-Curved Sandhills", revelation: "Meccan" as const, ayahCount: 35, juzNumber: 26, description: "Named after the sand dunes of the 'Ad people, who were destroyed for rejecting Prophet Hud." },
    { number: 47, nameArabic: "مُحَمَّد", nameTransliterated: "Muhammad", nameEnglish: "Muhammad", revelation: "Medinan" as const, ayahCount: 38, juzNumber: 26, description: "Named after the Prophet ﷺ, it guides believers in war and peace and emphasizes following the Prophet." },
    { number: 48, nameArabic: "الْفَتْح", nameTransliterated: "Al-Fath", nameEnglish: "The Victory", revelation: "Medinan" as const, ayahCount: 29, juzNumber: 26, description: "Refers to the Treaty of Hudaybiyyah, which Allah called 'a clear victory' (Fath Mubeen)." },
    { number: 49, nameArabic: "الْحُجُرَات", nameTransliterated: "Al-Hujurat", nameEnglish: "The Rooms", revelation: "Medinan" as const, ayahCount: 18, juzNumber: 26, description: "Contains essential principles of Islamic social ethics: respect, verification, brotherhood, and avoiding suspicion." },
    { number: 50, nameArabic: "ق", nameTransliterated: "Qaf", nameEnglish: "The Letter Qaf", revelation: "Meccan" as const, ayahCount: 45, juzNumber: 26, description: "Opens with the mysterious letter Qaf. Emphasizes resurrection and Allah's knowledge of every person." },
    { number: 51, nameArabic: "الذَّارِيَات", nameTransliterated: "Adh-Dhariyat", nameEnglish: "The Winnowing Winds", revelation: "Meccan" as const, ayahCount: 60, juzNumber: 26, description: "Takes an oath by the winds, emphasizing that creation and resurrection are both acts of Allah." },
    { number: 52, nameArabic: "الطُّور", nameTransliterated: "At-Tur", nameEnglish: "The Mount", revelation: "Meccan" as const, ayahCount: 49, juzNumber: 27, description: "Takes an oath by Mount Sinai (Tur Sina) and describes the rewards of the pious in Paradise." },
    { number: 53, nameArabic: "النَّجْم", nameTransliterated: "An-Najm", nameEnglish: "The Star", revelation: "Meccan" as const, ayahCount: 62, juzNumber: 27, description: "Describes the Mi'raj and confirms that the Prophet ﷺ was taught by the powerful angel Jibreel." },
    { number: 54, nameArabic: "الْقَمَر", nameTransliterated: "Al-Qamar", nameEnglish: "The Moon", revelation: "Meccan" as const, ayahCount: 55, juzNumber: 27, description: "Opens with the miracle of the splitting of the moon and describes the punishments of past nations." },
    { number: 55, nameArabic: "الرَّحْمَن", nameTransliterated: "Ar-Rahman", nameEnglish: "The Most Merciful", revelation: "Medinan" as const, ayahCount: 78, juzNumber: 27, description: "Celebrates the countless blessings of Allah with the recurring refrain 'Which of the favors of your Lord would you deny?'" },
    { number: 56, nameArabic: "الْوَاقِعَة", nameTransliterated: "Al-Waqi'ah", nameEnglish: "The Inevitable", revelation: "Meccan" as const, ayahCount: 96, juzNumber: 27, description: "Describes the Day of Resurrection and the three categories: the forerunners, the people of the right, and the people of the left." },
    { number: 57, nameArabic: "الْحَدِيد", nameTransliterated: "Al-Hadid", nameEnglish: "The Iron", revelation: "Medinan" as const, ayahCount: 29, juzNumber: 27, description: "Uses the imagery of iron to emphasize strength and the importance of spending in Allah's cause." },
    { number: 58, nameArabic: "الْمُجَادِلَة", nameTransliterated: "Al-Mujadila", nameEnglish: "The Pleading Woman", revelation: "Medinan" as const, ayahCount: 22, juzNumber: 28, description: "Begins with the story of a woman who disputed with the Prophet ﷺ about a pre-Islamic practice of divorce." },
    { number: 59, nameArabic: "الْحَشْر", nameTransliterated: "Al-Hashr", nameEnglish: "The Exile", revelation: "Medinan" as const, ayahCount: 24, juzNumber: 28, description: "Describes the expulsion of the Banu Nadhir Jews from Medina. Contains the beautiful Names of Allah at its end." },
    { number: 60, nameArabic: "الْمُمْتَحَنَة", nameTransliterated: "Al-Mumtahanah", nameEnglish: "She that is Examined", revelation: "Medinan" as const, ayahCount: 13, juzNumber: 28, description: "Gives guidance on relationships with non-Muslims and the testing of female emigrants' faith." },
    { number: 61, nameArabic: "الصَّفّ", nameTransliterated: "As-Saf", nameEnglish: "The Ranks", revelation: "Medinan" as const, ayahCount: 14, juzNumber: 28, description: "Urges believers to strive for Allah in ranks like a solid structure, and mentions the prophecy of Prophet Muhammad by Jesus." },
    { number: 62, nameArabic: "الْجُمُعَة", nameTransliterated: "Al-Jumu'ah", nameEnglish: "Friday", revelation: "Medinan" as const, ayahCount: 11, juzNumber: 28, description: "Establishes the obligation of Friday prayer and addresses the careless attitude of some believers." },
    { number: 63, nameArabic: "الْمُنَافِقُون", nameTransliterated: "Al-Munafiqun", nameEnglish: "The Hypocrites", revelation: "Medinan" as const, ayahCount: 11, juzNumber: 28, description: "Exposes the characteristics of the hypocrites (munafiqun) who outwardly professed Islam." },
    { number: 64, nameArabic: "التَّغَابُن", nameTransliterated: "At-Taghabun", nameEnglish: "Mutual Disillusion", revelation: "Medinan" as const, ayahCount: 18, juzNumber: 28, description: "Warns against letting wealth and family distract from Allah, describing the Day of Mutual Disillusion." },
    { number: 65, nameArabic: "الطَّلَاق", nameTransliterated: "At-Talaq", nameEnglish: "Divorce", revelation: "Medinan" as const, ayahCount: 12, juzNumber: 28, description: "Provides detailed guidance on Islamic divorce procedures and the proper treatment of divorced women." },
    { number: 66, nameArabic: "التَّحْرِيم", nameTransliterated: "At-Tahrim", nameEnglish: "The Prohibition", revelation: "Medinan" as const, ayahCount: 12, juzNumber: 28, description: "Addresses an incident involving the Prophet ﷺ and his wives, providing general guidance on household matters." },
    { number: 67, nameArabic: "الْمُلْك", nameTransliterated: "Al-Mulk", nameEnglish: "The Sovereignty", revelation: "Meccan" as const, ayahCount: 30, juzNumber: 29, description: "The Prophet ﷺ said: 'This surah intercedes for its reciter until they are forgiven.' Reciting it nightly is sunnah." },
    { number: 68, nameArabic: "الْقَلَم", nameTransliterated: "Al-Qalam", nameEnglish: "The Pen", revelation: "Meccan" as const, ayahCount: 52, juzNumber: 29, description: "One of the earliest revelations. Opens with an oath by the pen, defending the Prophet's noble character." },
    { number: 69, nameArabic: "الْحَاقَّة", nameTransliterated: "Al-Haqqah", nameEnglish: "The Reality", revelation: "Meccan" as const, ayahCount: 52, juzNumber: 29, description: "The 'Reality' refers to the Day of Judgment, describing the fates of past nations who denied it." },
    { number: 70, nameArabic: "الْمَعَارِج", nameTransliterated: "Al-Ma'arij", nameEnglish: "The Ascending Stairways", revelation: "Meccan" as const, ayahCount: 44, juzNumber: 29, description: "Describes the angels ascending to Allah, the Day of Judgment, and the qualities of the true believers." },
    { number: 71, nameArabic: "نُوح", nameTransliterated: "Nuh", nameEnglish: "Noah", revelation: "Meccan" as const, ayahCount: 28, juzNumber: 29, description: "Prophet Nuh (Noah) narrates his own story — his 950-year mission and his people's persistent rejection." },
    { number: 72, nameArabic: "الْجِنّ", nameTransliterated: "Al-Jinn", nameEnglish: "The Jinn", revelation: "Meccan" as const, ayahCount: 28, juzNumber: 29, description: "Narrates the story of a group of jinn who listened to the Quran and accepted Islam." },
    { number: 73, nameArabic: "الْمُزَّمِّل", nameTransliterated: "Al-Muzzammil", nameEnglish: "The Enshrouded One", revelation: "Meccan" as const, ayahCount: 20, juzNumber: 29, description: "Addresses the Prophet ﷺ as 'the wrapped one', commanding him to rise for night prayer." },
    { number: 74, nameArabic: "الْمُدَّثِّر", nameTransliterated: "Al-Muddaththir", nameEnglish: "The Cloaked One", revelation: "Meccan" as const, ayahCount: 56, juzNumber: 29, description: "Commands the Prophet to arise and warn mankind. Describes the guardian of Hellfire and its nineteen keepers." },
    { number: 75, nameArabic: "الْقِيَامَة", nameTransliterated: "Al-Qiyamah", nameEnglish: "The Resurrection", revelation: "Meccan" as const, ayahCount: 40, juzNumber: 29, description: "Powerfully describes the Day of Resurrection and the certainty of human accountability." },
    { number: 76, nameArabic: "الْإِنسَان", nameTransliterated: "Al-Insan", nameEnglish: "Man", revelation: "Medinan" as const, ayahCount: 31, juzNumber: 29, description: "Describes the creation of humanity, the righteous who give their food to the poor, and their reward in Paradise." },
    { number: 77, nameArabic: "الْمُرْسَلَات", nameTransliterated: "Al-Mursalat", nameEnglish: "Those Sent Forth", revelation: "Meccan" as const, ayahCount: 50, juzNumber: 29, description: "Takes oaths by the winds sent forth, repeatedly warning: 'Woe that Day to the deniers!'" },
    { number: 78, nameArabic: "النَّبَإ", nameTransliterated: "An-Naba", nameEnglish: "The Tidings", revelation: "Meccan" as const, ayahCount: 40, juzNumber: 30, description: "Opens with questions about the Great News (resurrection), then answers with descriptions of the Last Day." },
    { number: 79, nameArabic: "النَّازِعَات", nameTransliterated: "An-Nazi'at", nameEnglish: "Those who Drag Forth", revelation: "Meccan" as const, ayahCount: 46, juzNumber: 30, description: "Takes oaths by the angels who violently seize souls, describing the Day of Judgment and Musa's mission." },
    { number: 80, nameArabic: "عَبَسَ", nameTransliterated: "Abasa", nameEnglish: "He Frowned", revelation: "Meccan" as const, ayahCount: 42, juzNumber: 30, description: "Gently corrects the Prophet for turning away from a blind man (Ibn Umm Maktum) to address tribal leaders." },
    { number: 81, nameArabic: "التَّكْوِير", nameTransliterated: "At-Takwir", nameEnglish: "The Overthrowing", revelation: "Meccan" as const, ayahCount: 29, juzNumber: 30, description: "Describes the terrifying cosmic events of the Last Day when the sun is wrapped up and stars fall." },
    { number: 82, nameArabic: "الْإِنفِطَار", nameTransliterated: "Al-Infitar", nameEnglish: "The Cleaving", revelation: "Meccan" as const, ayahCount: 19, juzNumber: 30, description: "Describes the sky cleft asunder, the seas bursting forth, and the opening of the graves." },
    { number: 83, nameArabic: "الْمُطَفِّفِين", nameTransliterated: "Al-Mutaffifin", nameEnglish: "The Defrauding", revelation: "Meccan" as const, ayahCount: 36, juzNumber: 30, description: "Condemns those who give less than due measure when weighing or measuring for others." },
    { number: 84, nameArabic: "الِانشِقَاق", nameTransliterated: "Al-Inshiqaq", nameEnglish: "The Sundering", revelation: "Meccan" as const, ayahCount: 25, juzNumber: 30, description: "Describes the sky splitting apart on the Day of Judgment. Contains a verse of prostration." },
    { number: 85, nameArabic: "الْبُرُوج", nameTransliterated: "Al-Buruj", nameEnglish: "The Constellations", revelation: "Meccan" as const, ayahCount: 22, juzNumber: 30, description: "Named after the constellations, it tells the story of 'the People of the Ditch' (Ashabul Ukhdood)." },
    { number: 86, nameArabic: "الطَّارِق", nameTransliterated: "At-Tariq", nameEnglish: "The Morning Star", revelation: "Meccan" as const, ayahCount: 17, juzNumber: 30, description: "Takes an oath by the night-piercing star, reflecting on human creation from gushing fluid." },
    { number: 87, nameArabic: "الْأَعْلَى", nameTransliterated: "Al-A'la", nameEnglish: "The Most High", revelation: "Meccan" as const, ayahCount: 19, juzNumber: 30, description: "Commands glorification of the Most High Allah. The Prophet ﷺ would recite it in Friday prayers." },
    { number: 88, nameArabic: "الْغَاشِيَة", nameTransliterated: "Al-Ghashiyah", nameEnglish: "The Overwhelming", revelation: "Meccan" as const, ayahCount: 26, juzNumber: 30, description: "Describes the overwhelming events of the Last Day, the faces of the humiliated and the blessed." },
    { number: 89, nameArabic: "الْفَجْر", nameTransliterated: "Al-Fajr", nameEnglish: "The Dawn", revelation: "Meccan" as const, ayahCount: 30, juzNumber: 30, description: "Takes oaths by the dawn and ten nights. Mentions 'Ad, Thamud, and Pharaoh as examples of the arrogant." },
    { number: 90, nameArabic: "الْبَلَد", nameTransliterated: "Al-Balad", nameEnglish: "The City", revelation: "Meccan" as const, ayahCount: 20, juzNumber: 30, description: "Takes an oath by the blessed city of Makkah, discussing the difficult path of righteousness." },
    { number: 91, nameArabic: "الشَّمْس", nameTransliterated: "Ash-Shams", nameEnglish: "The Sun", revelation: "Meccan" as const, ayahCount: 15, juzNumber: 30, description: "Takes eleven oaths by cosmic phenomena, emphasizing that success comes from purifying the soul." },
    { number: 92, nameArabic: "اللَّيْل", nameTransliterated: "Al-Layl", nameEnglish: "The Night", revelation: "Meccan" as const, ayahCount: 21, juzNumber: 30, description: "Contrasts two types of people: the generous who give and are mindful of Allah, and the miserly." },
    { number: 93, nameArabic: "الضُّحَى", nameTransliterated: "Ad-Duha", nameEnglish: "The Morning Hours", revelation: "Meccan" as const, ayahCount: 11, juzNumber: 30, description: "Comforts the Prophet ﷺ during a pause in revelation, reminding him of Allah's care and guidance." },
    { number: 94, nameArabic: "الشَّرْح", nameTransliterated: "Ash-Sharh", nameEnglish: "The Opening Up", revelation: "Meccan" as const, ayahCount: 8, juzNumber: 30, description: "Allah reminds the Prophet of His bounties: expanding his chest and lifting his burden. 'With hardship comes ease.'" },
    { number: 95, nameArabic: "التِّين", nameTransliterated: "At-Tin", nameEnglish: "The Fig", revelation: "Meccan" as const, ayahCount: 8, juzNumber: 30, description: "Takes an oath by the fig, olive, Mount Sinai, and Makkah, affirming the creation of man 'in the best stature.'" },
    { number: 96, nameArabic: "الْعَلَق", nameTransliterated: "Al-'Alaq", nameEnglish: "The Clot", revelation: "Meccan" as const, ayahCount: 19, juzNumber: 30, description: "The first revelation received by Prophet Muhammad ﷺ: 'Read! In the name of your Lord who created...'" },
    { number: 97, nameArabic: "الْقَدْر", nameTransliterated: "Al-Qadr", nameEnglish: "The Power", revelation: "Meccan" as const, ayahCount: 5, juzNumber: 30, description: "Describes Laylat al-Qadr (the Night of Power), better than a thousand months, when the Quran was revealed." },
    { number: 98, nameArabic: "الْبَيِّنَة", nameTransliterated: "Al-Bayyinah", nameEnglish: "The Clear Proof", revelation: "Medinan" as const, ayahCount: 8, juzNumber: 30, description: "Refers to the Prophet Muhammad ﷺ as the 'clear proof' sent to clarify truth from falsehood." },
    { number: 99, nameArabic: "الزَّلْزَلَة", nameTransliterated: "Az-Zalzalah", nameEnglish: "The Earthquake", revelation: "Medinan" as const, ayahCount: 8, juzNumber: 30, description: "Describes the earth shaking violently on the Last Day, disclosing all that was done upon it. Worth half the Quran." },
    { number: 100, nameArabic: "الْعَادِيَات", nameTransliterated: "Al-'Adiyat", nameEnglish: "The Chargers", revelation: "Meccan" as const, ayahCount: 11, juzNumber: 30, description: "Takes an oath by warhorses charging, reflecting on human ingratitude to Allah despite His many blessings." },
    { number: 101, nameArabic: "الْقَارِعَة", nameTransliterated: "Al-Qari'ah", nameEnglish: "The Striking Hour", revelation: "Meccan" as const, ayahCount: 11, juzNumber: 30, description: "Describes the terrifying striking blow of the Day of Judgment when deeds are weighed on a scale." },
    { number: 102, nameArabic: "التَّكَاثُر", nameTransliterated: "At-Takathur", nameEnglish: "The Rivalry in Worldly Increase", revelation: "Meccan" as const, ayahCount: 8, juzNumber: 30, description: "Warns against the distraction of rivalry in worldly increase until one visits the graves." },
    { number: 103, nameArabic: "الْعَصْر", nameTransliterated: "Al-'Asr", nameEnglish: "The Declining Day", revelation: "Meccan" as const, ayahCount: 3, juzNumber: 30, description: "One of the shortest yet most comprehensive surahs. Imam Shafi'i said it would suffice as the only surah." },
    { number: 104, nameArabic: "الْهُمَزَة", nameTransliterated: "Al-Humazah", nameEnglish: "The Traducer", revelation: "Meccan" as const, ayahCount: 9, juzNumber: 30, description: "Condemns the slanderer and backbiter who thinks that wealth makes him immortal." },
    { number: 105, nameArabic: "الْفِيل", nameTransliterated: "Al-Fil", nameEnglish: "The Elephant", revelation: "Meccan" as const, ayahCount: 5, juzNumber: 30, description: "Recalls the miraculous destruction of Abraha's army of elephants that marched on Makkah in 570 CE." },
    { number: 106, nameArabic: "قُرَيْش", nameTransliterated: "Quraish", nameEnglish: "Quraysh", revelation: "Meccan" as const, ayahCount: 4, juzNumber: 30, description: "Reminds the Quraysh of Allah's blessings: the safe winter and summer trading journeys He facilitated for them." },
    { number: 107, nameArabic: "الْمَاعُون", nameTransliterated: "Al-Ma'un", nameEnglish: "Small Kindnesses", revelation: "Meccan" as const, ayahCount: 7, juzNumber: 30, description: "Defines the one who denies the religion as one who repulses the orphan and neglects the poor." },
    { number: 108, nameArabic: "الْكَوْثَر", nameTransliterated: "Al-Kawthar", nameEnglish: "Abundance", revelation: "Meccan" as const, ayahCount: 3, juzNumber: 30, description: "The shortest surah in the Quran. Allah grants the Prophet the abundant good (Kawthar) including a heavenly river." },
    { number: 109, nameArabic: "الْكَافِرُون", nameTransliterated: "Al-Kafirun", nameEnglish: "The Disbelievers", revelation: "Meccan" as const, ayahCount: 6, juzNumber: 30, description: "A declaration of religious freedom: 'To you your religion, and to me mine.' Equal to one-quarter of the Quran." },
    { number: 110, nameArabic: "النَّصْر", nameTransliterated: "An-Nasr", nameEnglish: "The Divine Support", revelation: "Medinan" as const, ayahCount: 3, juzNumber: 30, description: "The last complete surah revealed, signaling the completion of the Prophet's mission and the conquest of Makkah." },
    { number: 111, nameArabic: "الْمَسَد", nameTransliterated: "Al-Masad", nameEnglish: "The Palm Fiber", revelation: "Meccan" as const, ayahCount: 5, juzNumber: 30, description: "Condemns Abu Lahab, the Prophet's uncle and fierce opponent, and his wife who spread thorns in his path." },
    { number: 112, nameArabic: "الْإِخْلَاص", nameTransliterated: "Al-Ikhlas", nameEnglish: "Sincerity", revelation: "Meccan" as const, ayahCount: 4, juzNumber: 30, description: "Equivalent to one-third of the Quran in reward. Declares Allah's absolute Oneness, eternity, and incomparability." },
    { number: 113, nameArabic: "الْفَلَق", nameTransliterated: "Al-Falaq", nameEnglish: "The Daybreak", revelation: "Meccan" as const, ayahCount: 5, juzNumber: 30, description: "One of the two protective surahs (Al-Mu'awwidhatain). Seeks refuge from external evil and envy." },
    { number: 114, nameArabic: "النَّاس", nameTransliterated: "An-Nas", nameEnglish: "Mankind", revelation: "Meccan" as const, ayahCount: 6, juzNumber: 30, description: "The final surah. Seeks refuge in Allah — Lord, King, and God of mankind — from whispering evil." },
  ];

  await db.delete(surahsTable);
  for (const s of surahs) {
    await db.insert(surahsTable).values(s).onConflictDoNothing();
  }
  console.log(`✓ ${surahs.length} surahs seeded`);

  const allSurahs = await db.select().from(surahsTable);
  const surahMap: Record<number, number> = {};
  for (const s of allSurahs) surahMap[s.number] = s.id;

  // ─── KEY AYAHS ───────────────────────────────────────────────────────────────
  const ayahsData = [
    // Al-Fatihah (1) — COMPLETE
    { sn: 1, n: 1, ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tr: "Bismi Allāhi r-raḥmāni r-raḥīm", en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", j: 1, p: 1 },
    { sn: 1, n: 2, ar: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", tr: "Al-ḥamdu lillāhi rabbi l-ʿālamīn", en: "All praise is due to Allah, Lord of the worlds —", j: 1, p: 1 },
    { sn: 1, n: 3, ar: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tr: "Ar-raḥmāni r-raḥīm", en: "The Entirely Merciful, the Especially Merciful,", j: 1, p: 1 },
    { sn: 1, n: 4, ar: "مَٰلِكِ يَوْمِ ٱلدِّينِ", tr: "Māliki yawmi d-dīn", en: "Sovereign of the Day of Recompense.", j: 1, p: 1 },
    { sn: 1, n: 5, ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", tr: "Iyyāka naʿbudu wa-iyyāka nastaʿīn", en: "It is You we worship and You we ask for help.", j: 1, p: 1 },
    { sn: 1, n: 6, ar: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", tr: "Ihdinā ṣ-ṣirāṭa l-mustaqīm", en: "Guide us to the straight path —", j: 1, p: 1 },
    { sn: 1, n: 7, ar: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", tr: "Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn", en: "The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.", j: 1, p: 1 },
    // Al-Baqarah — key verses
    { sn: 2, n: 1, ar: "الم", tr: "Alif-Lām-Mīm", en: "Alif, Lam, Meem.", j: 1, p: 2 },
    { sn: 2, n: 2, ar: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", tr: "Dhālika l-kitābu lā rayba fīh hudal-lil-muttaqīn", en: "This is the Book about which there is no doubt, a guidance for those conscious of Allah —", j: 1, p: 2 },
    { sn: 2, n: 255, ar: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ", tr: "Allāhu lā ilāha illā huwa l-ḥayyu l-qayyūm", en: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.", j: 3, p: 42 },
    { sn: 2, n: 256, ar: "لَآ إِكْرَاهَ فِى ٱلدِّينِ ۖ قَد تَّبَيَّنَ ٱلرُّشْدُ مِنَ ٱلْغَىِّ", tr: "Lā ikrāha fī d-dīn qad tabayyana r-rushdu mina l-ghayy", en: "There shall be no compulsion in religion. The right course has become clear from the wrong.", j: 3, p: 42 },
    { sn: 2, n: 285, ar: "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ", tr: "Āmana r-rasūlu bimā unzila ilayhi min rabbihi wa-l-muʾminūn", en: "The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them have believed in Allah and His angels and His books and His messengers, saying: 'We make no distinction between any of His messengers.' And they say, 'We hear and we obey. Grant us Your forgiveness, our Lord, and to You is the final destination.'", j: 3, p: 49 },
    { sn: 2, n: 286, ar: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ", tr: "Lā yukallifu llāhu nafsan illā wusʿahā lahā mā kasabat wa-ʿalayhā ma ktasabat", en: "Allah does not burden a soul beyond that it can bear. It will have what it earned, and it will bear what it has committed.", j: 3, p: 49 },
    // Ali Imran
    { sn: 3, n: 185, ar: "كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ ٱلْقِيَٰمَةِ", tr: "Kullu nafsin dhāʾiqatu l-mawt wa-innamā tuwaffawna ujūrakum yawma l-qiyāmah", en: "Every soul will taste death, and you will only be given your full compensation on the Day of Resurrection.", j: 4, p: 73 },
    // Ar-Ra'd
    { sn: 13, n: 28, ar: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", tr: "Alā bi-dhikri llāhi taṭmaʾinnu l-qulūb", en: "Verily, in the remembrance of Allah do hearts find rest.", j: 13, p: 252 },
    // Al-Kahf
    { sn: 18, n: 1, ar: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجًا", tr: "Al-ḥamdu lillāhi lladhī anzala ʿalā ʿabdihi l-kitāba wa-lam yajʿal lahu ʿiwajā", en: "Praise be to Allah who has sent down upon His servant the Book and has not made therein any deviance.", j: 15, p: 293 },
    // Ya-Sin — key verses
    { sn: 36, n: 1, ar: "يس", tr: "Yā-Sīn", en: "Ya, Sin.", j: 22, p: 440 },
    { sn: 36, n: 2, ar: "وَٱلْقُرْءَانِ ٱلْحَكِيمِ", tr: "Wa-l-qurʾāni l-ḥakīm", en: "By the wise Quran.", j: 22, p: 440 },
    { sn: 36, n: 82, ar: "إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ", tr: "Innamā amruhu idhā arāda shayʾan an yaqūla lahu kun fayakūn", en: "His command is only when He intends a thing that He says to it, 'Be,' and it is.", j: 22, p: 445 },
    // Ar-Rahman
    { sn: 55, n: 1, ar: "ٱلرَّحْمَٰنُ", tr: "Ar-raḥmān", en: "The Most Merciful", j: 27, p: 531 },
    { sn: 55, n: 2, ar: "عَلَّمَ ٱلْقُرْءَانَ", tr: "ʿAllama l-qurʾān", en: "Taught the Quran,", j: 27, p: 531 },
    { sn: 55, n: 3, ar: "خَلَقَ ٱلْإِنسَٰنَ", tr: "Khalaqa l-insān", en: "Created man,", j: 27, p: 531 },
    { sn: 55, n: 13, ar: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ", tr: "Fa-bi-ayyi ālāʾi rabbikumā tukadhdhbān", en: "So which of the favors of your Lord would you deny?", j: 27, p: 531 },
    // Al-Mulk
    { sn: 67, n: 1, ar: "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ", tr: "Tabāraka lladhī bi-yadihi l-mulku wa-huwa ʿalā kulli shayʾin qadīr", en: "Blessed is He in whose hand is dominion, and He is over all things competent —", j: 29, p: 562 },
    { sn: 67, n: 2, ar: "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ", tr: "Alladhī khalaqa l-mawta wa-l-ḥayāta liyabluwakum ayyukum aḥsanu ʿamalā", en: "He who created death and life to test you as to which of you is best in deed — and He is the Exalted in Might, the Forgiving —", j: 29, p: 562 },
    // Al-Qadr
    { sn: 97, n: 1, ar: "إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ", tr: "Innā anzalnāhu fī laylati l-qadr", en: "Indeed, We sent the Quran down during the Night of Decree.", j: 30, p: 598 },
    { sn: 97, n: 3, ar: "لَيْلَةُ ٱلْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ", tr: "Laylatu l-qadri khayrun min alfi shahr", en: "The Night of Decree is better than a thousand months.", j: 30, p: 598 },
    // Al-Asr — COMPLETE
    { sn: 103, n: 1, ar: "وَٱلْعَصْرِ", tr: "Wa-l-ʿaṣr", en: "By time,", j: 30, p: 601 },
    { sn: 103, n: 2, ar: "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ", tr: "Inna l-insāna lafī khusr", en: "Indeed, mankind is in loss,", j: 30, p: 601 },
    { sn: 103, n: 3, ar: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ", tr: "Illā lladhīna āmanū wa-ʿamilū ṣ-ṣāliḥāti wa-tawāṣaw bi-l-ḥaqqi wa-tawāṣaw bi-ṣ-ṣabr", en: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.", j: 30, p: 601 },
    // Al-Kawthar — COMPLETE
    { sn: 108, n: 1, ar: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ", tr: "Innā aʿṭaynāka l-kawthar", en: "Indeed, We have granted you al-Kawthar.", j: 30, p: 602 },
    { sn: 108, n: 2, ar: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ", tr: "Fa-ṣalli li-rabbika wa-nḥar", en: "So pray to your Lord and sacrifice.", j: 30, p: 602 },
    { sn: 108, n: 3, ar: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", tr: "Inna shāniʾaka huwa l-abtar", en: "Indeed, your enemy is the one cut off.", j: 30, p: 602 },
    // Al-Kafirun — COMPLETE
    { sn: 109, n: 1, ar: "قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ", tr: "Qul yā-ayyuhā l-kāfirūn", en: "Say: O disbelievers!", j: 30, p: 603 },
    { sn: 109, n: 2, ar: "لَآ أَعْبُدُ مَا تَعْبُدُونَ", tr: "Lā aʿbudu mā taʿbudūn", en: "I do not worship what you worship.", j: 30, p: 603 },
    { sn: 109, n: 3, ar: "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ", tr: "Wa-lā antum ʿābidūna mā aʿbud", en: "Nor are you worshippers of what I worship.", j: 30, p: 603 },
    { sn: 109, n: 4, ar: "وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ", tr: "Wa-lā ana ʿābidun mā ʿabadtum", en: "Nor will I be a worshipper of what you worship.", j: 30, p: 603 },
    { sn: 109, n: 5, ar: "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ", tr: "Wa-lā antum ʿābidūna mā aʿbud", en: "Nor will you be worshippers of what I worship.", j: 30, p: 603 },
    { sn: 109, n: 6, ar: "لَكُمْ دِينُكُمْ وَلِىَ دِينِ", tr: "Lakum dīnukum wa-liya dīn", en: "For you is your religion, and for me is my religion.", j: 30, p: 603 },
    // An-Nasr — COMPLETE
    { sn: 110, n: 1, ar: "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ", tr: "Idhā jāʾa naṣru llāhi wa-l-fatḥ", en: "When the victory of Allah has come and the conquest,", j: 30, p: 603 },
    { sn: 110, n: 2, ar: "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا", tr: "Wa-raʾayta n-nāsa yadkhulūna fī dīni llāhi afwājā", en: "And you see the people entering into the religion of Allah in multitudes,", j: 30, p: 603 },
    { sn: 110, n: 3, ar: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًا", tr: "Fa-sabbiḥ bi-ḥamdi rabbika wa-staghfirhu innahu kāna tawwābā", en: "Then exalt Him with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of Repentance.", j: 30, p: 603 },
    // Al-Ikhlas — COMPLETE
    { sn: 112, n: 1, ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", tr: "Qul huwa llāhu aḥad", en: "Say, 'He is Allah, [who is] One,", j: 30, p: 604 },
    { sn: 112, n: 2, ar: "ٱللَّهُ ٱلصَّمَدُ", tr: "Allāhu ṣ-ṣamad", en: "Allah, the Eternal Refuge.", j: 30, p: 604 },
    { sn: 112, n: 3, ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ", tr: "Lam yalid wa-lam yūlad", en: "He neither begets nor is born,", j: 30, p: 604 },
    { sn: 112, n: 4, ar: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", tr: "Wa-lam yakun lahu kufuwan aḥad", en: "Nor is there to Him any equivalent.'", j: 30, p: 604 },
    // Al-Falaq — COMPLETE
    { sn: 113, n: 1, ar: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", tr: "Qul aʿūdhu bi-rabbi l-falaq", en: "Say, 'I seek refuge in the Lord of daybreak", j: 30, p: 604 },
    { sn: 113, n: 2, ar: "مِن شَرِّ مَا خَلَقَ", tr: "Min sharri mā khalaq", en: "From the evil of that which He created", j: 30, p: 604 },
    { sn: 113, n: 3, ar: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", tr: "Wa-min sharri ghāsiqin idhā waqab", en: "And from the evil of darkness when it settles", j: 30, p: 604 },
    { sn: 113, n: 4, ar: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ", tr: "Wa-min sharri n-naffāthāti fī l-ʿuqad", en: "And from the evil of the blowers in knots", j: 30, p: 604 },
    { sn: 113, n: 5, ar: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", tr: "Wa-min sharri ḥāsidin idhā ḥasad", en: "And from the evil of an envier when he envies.'", j: 30, p: 604 },
    // An-Nas — COMPLETE
    { sn: 114, n: 1, ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", tr: "Qul aʿūdhu bi-rabbi n-nās", en: "Say, 'I seek refuge in the Lord of mankind,", j: 30, p: 604 },
    { sn: 114, n: 2, ar: "مَلِكِ ٱلنَّاسِ", tr: "Maliki n-nās", en: "The Sovereign of mankind.", j: 30, p: 604 },
    { sn: 114, n: 3, ar: "إِلَٰهِ ٱلنَّاسِ", tr: "Ilāhi n-nās", en: "The God of mankind,", j: 30, p: 604 },
    { sn: 114, n: 4, ar: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", tr: "Min sharri l-waswāsi l-khannās", en: "From the evil of the retreating whisperer", j: 30, p: 604 },
    { sn: 114, n: 5, ar: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", tr: "Alladhī yuwaswisu fī ṣudūri n-nās", en: "Who whispers evil into the breasts of mankind —", j: 30, p: 604 },
    { sn: 114, n: 6, ar: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", tr: "Mina l-jinnati wa-n-nās", en: "From among the jinn and mankind.'", j: 30, p: 604 },
  ];

  await db.delete(ayahsTable);
  for (const a of ayahsData) {
    const surahId = surahMap[a.sn];
    if (!surahId) continue;
    await db.insert(ayahsTable).values({
      surahId, ayahNumber: a.n, arabicText: a.ar, transliteration: a.tr,
      translation: a.en, juzNumber: a.j, pageNumber: a.p,
    }).onConflictDoNothing();
  }
  console.log(`✓ ${ayahsData.length} ayahs seeded`);

  const allAyahs = await db.select().from(ayahsTable);

  // ─── WORD-BY-WORD (Al-Fatihah) ───────────────────────────────────────────────
  const getAyahId = (sn: number, n: number) => allAyahs.find(a => a.surahId === surahMap[sn] && a.ayahNumber === n)?.id;

  await db.delete(ayahWordsTable);
  const wordData: { ayahId: number; position: number; arabicText: string; transliteration: string; translation: string; rootWord: string; grammar: string }[] = [];

  const bismillahId = getAyahId(1, 1);
  if (bismillahId) {
    wordData.push(
      { ayahId: bismillahId, position: 1, arabicText: "بِسْمِ", transliteration: "bismi", translation: "In the name", rootWord: "س م و", grammar: "Preposition + Noun (Genitive)" },
      { ayahId: bismillahId, position: 2, arabicText: "ٱللَّهِ", transliteration: "Allāhi", translation: "of Allah", rootWord: "أ ل ه", grammar: "Proper Noun (Genitive)" },
      { ayahId: bismillahId, position: 3, arabicText: "ٱلرَّحْمَٰنِ", transliteration: "ar-raḥmāni", translation: "the Most Gracious", rootWord: "ر ح م", grammar: "Divine Attribute (Genitive)" },
      { ayahId: bismillahId, position: 4, arabicText: "ٱلرَّحِيمِ", transliteration: "ar-raḥīmi", translation: "the Most Merciful", rootWord: "ر ح م", grammar: "Divine Attribute (Genitive)" }
    );
  }
  const alhamdId = getAyahId(1, 2);
  if (alhamdId) {
    wordData.push(
      { ayahId: alhamdId, position: 1, arabicText: "ٱلْحَمْدُ", transliteration: "al-ḥamdu", translation: "Praise", rootWord: "ح م د", grammar: "Noun (Nominative, Definite)" },
      { ayahId: alhamdId, position: 2, arabicText: "لِلَّهِ", transliteration: "lillāhi", translation: "to Allah", rootWord: "أ ل ه", grammar: "Preposition + Proper Noun (Genitive)" },
      { ayahId: alhamdId, position: 3, arabicText: "رَبِّ", transliteration: "rabbi", translation: "Lord", rootWord: "ر ب ب", grammar: "Noun (Genitive, Construct State)" },
      { ayahId: alhamdId, position: 4, arabicText: "ٱلْعَٰلَمِينَ", transliteration: "l-ʿālamīn", translation: "of the worlds", rootWord: "ع ل م", grammar: "Noun (Genitive, Masculine Plural)" }
    );
  }
  const iyyakaId = getAyahId(1, 5);
  if (iyyakaId) {
    wordData.push(
      { ayahId: iyyakaId, position: 1, arabicText: "إِيَّاكَ", transliteration: "iyyāka", translation: "You alone", rootWord: "إ ي ي", grammar: "Emphatic Personal Pronoun (Accusative)" },
      { ayahId: iyyakaId, position: 2, arabicText: "نَعْبُدُ", transliteration: "naʿbudu", translation: "we worship", rootWord: "ع ب د", grammar: "Verb (1st person plural imperfect)" },
      { ayahId: iyyakaId, position: 3, arabicText: "وَإِيَّاكَ", transliteration: "wa-iyyāka", translation: "and You alone", rootWord: "إ ي ي", grammar: "Conjunction + Emphatic Pronoun" },
      { ayahId: iyyakaId, position: 4, arabicText: "نَسْتَعِينُ", transliteration: "nastaʿīnu", translation: "we ask for help", rootWord: "ع و ن", grammar: "Verb (1st person plural imperfect, Form X)" }
    );
  }
  // Al-Ikhlas words
  const ikhlas1Id = getAyahId(112, 1);
  if (ikhlas1Id) {
    wordData.push(
      { ayahId: ikhlas1Id, position: 1, arabicText: "قُلْ", transliteration: "qul", translation: "Say", rootWord: "ق و ل", grammar: "Verb (Imperative, 2nd person singular)" },
      { ayahId: ikhlas1Id, position: 2, arabicText: "هُوَ", transliteration: "huwa", translation: "He", rootWord: "ه و", grammar: "Personal Pronoun (3rd person singular masculine)" },
      { ayahId: ikhlas1Id, position: 3, arabicText: "ٱللَّهُ", transliteration: "llāhu", translation: "is Allah", rootWord: "أ ل ه", grammar: "Proper Noun (Nominative)" },
      { ayahId: ikhlas1Id, position: 4, arabicText: "أَحَدٌ", transliteration: "aḥad", translation: "One", rootWord: "أ ح د", grammar: "Adjective (Nominative, Indefinite)" }
    );
  }
  if (wordData.length > 0) {
    await db.insert(ayahWordsTable).values(wordData);
  }
  console.log(`✓ ${wordData.length} ayah words seeded`);

  // ─── TAFSEER ─────────────────────────────────────────────────────────────────
  const tafseerData = [
    { sn: 1, n: 1, source: "ibn-kathir", scholar: "Ibn Kathir", text: "The Bismillah is the opening key to every significant matter. 'Al-Rahman' (Most Gracious) refers to the vastness of Allah's mercy encompassing all creation — believer and disbeliever alike — in this world. 'Al-Rahim' (Most Merciful) refers to His special mercy reserved specifically for the believers in the Hereafter. Ibn Kathir explains that beginning with Allah's name sanctifies every action and invokes His blessing upon it." },
    { sn: 1, n: 5, source: "ibn-kathir", scholar: "Ibn Kathir", text: "This is the central verse of Al-Fatihah and indeed of the entire Quran. The transition from the third person ('Lord of the worlds') to the second person ('You we worship') indicates the believer's direct, intimate relationship with Allah in prayer. 'Ibadah' (worship) encompasses all acts done in obedience to and for Allah. 'Isti'anah' (seeking help) acknowledges complete dependence on Allah. Al-Fatihah is called Umm al-Quran (Mother of the Quran) because it contains all its themes: theology, worship, guidance, and the three categories of people." },
    { sn: 2, n: 255, source: "ibn-kathir", scholar: "Ibn Kathir", text: "Ayat al-Kursi is the greatest verse in the Quran, as confirmed by the Prophet ﷺ himself (Sahih Muslim). It contains ten divine attributes: (1) La ilaha illa Hu — absolute monotheism, (2) Al-Hayy — the Ever-Living with perfect life, (3) Al-Qayyum — the Self-Subsisting Sustainer of all creation, (4) Neither drowsiness nor sleep affects Him, (5) Absolute ownership of heavens and earth, (6) None intercedes except by His explicit permission, (7) His knowledge encompasses all — past, present, future, (8) His created beings cannot grasp any of His knowledge except what He chooses to reveal, (9) His Kursi (footstool of His knowledge, or the actual footstool) extends over both heavens and earth, (10) Preserving the entire creation does not burden or fatigue Him. Reciting Ayat al-Kursi after every obligatory prayer is among the greatest acts of worship." },
    { sn: 2, n: 256, source: "ibn-kathir", scholar: "Ibn Kathir", text: "La ikraha fi d-din — There is no compulsion in religion. This verse was revealed to address the Ansar who had Jewish children and wished to force them into Islam. Allah declared that compulsion in matters of faith is invalid. True iman (faith) must come from the heart's conviction, not external force. The verse continues by affirming that truth (rushd) has been clearly distinguished from falsehood (ghayy) through clear proofs, making compulsion unnecessary — the evidence for Islam is overwhelming for those who reflect." },
    { sn: 1, n: 1, source: "al-tabari", scholar: "Imam al-Tabari", text: "Imam al-Tabari states in his Jami al-Bayan that 'Bismillah' serves as an invocation of blessing before undertaking any matter. The three divine names — Allah, Al-Rahman, Al-Rahim — represent a progression: 'Allah' is the proper name of the Divine Essence; 'Al-Rahman' describes the attribute of mercy in this world that is broad and general; 'Al-Rahim' is specific and intensive mercy for the believers in the Hereafter." },
    { sn: 112, n: 1, source: "ibn-kathir", scholar: "Ibn Kathir", text: "Al-Ikhlas was revealed in response to the polytheists and People of the Book who asked the Prophet ﷺ to describe his Lord's lineage. This surah is equal in reward to one-third of the Quran because the Quran covers three main subjects: divine stories, legal rulings, and the Names and Attributes of Allah — and this surah covers the last category entirely. The word 'Ahad' (uniquely one) is stronger than 'Wahid' in denoting absolute uniqueness — He is One in His Essence, Attributes, and Actions, without any partner, equal, comparable, or opposite entity." },
    { sn: 97, n: 3, source: "ibn-kathir", scholar: "Ibn Kathir", text: "Laylat al-Qadr (Night of Power/Decree) is better than a thousand months — that is, 83 years and 4 months of worship. It falls in the last ten nights of Ramadan, most likely on one of the odd-numbered nights (21st, 23rd, 25th, 27th, or 29th), with scholars giving particular weight to the 27th night. On this blessed night, the angels and Ruh (Jibreel) descend with every matter decreed for the coming year. It is a night of peace and safety from all evil until the break of dawn." },
    { sn: 103, n: 3, source: "ibn-kathir", scholar: "Ibn Kathir", text: "Imam al-Shafi'i said: 'If people were to reflect deeply on Surah Al-Asr, it would be sufficient for them.' The exception after 'Indeed mankind is in loss' defines the four pillars of salvation: (1) Iman — correct belief in Allah, His angels, books, messengers, the Last Day, and divine decree; (2) Righteous deeds — all actions commanded by Allah; (3) Mutual counsel toward truth (haqq) — calling to monotheism, opposing falsehood; and (4) Mutual counsel toward patience (sabr) — steadfastness in obedience, away from sin, and under trials." },
  ];

  await db.delete(tafseerTable);
  for (const t of tafseerData) {
    const surahId = surahMap[t.sn];
    if (!surahId) continue;
    const ayah = allAyahs.find(a => a.surahId === surahId && a.ayahNumber === t.n);
    if (!ayah) continue;
    await db.insert(tafseerTable).values({
      ayahId: ayah.id, source: t.source, scholarName: t.scholar, arabicText: "", englishText: t.text,
    }).onConflictDoNothing();
  }
  console.log("✓ Tafseer seeded");

  // ─── HADITH COLLECTIONS ──────────────────────────────────────────────────────
  const collections = [
    { id: "bukhari", name: "Sahih al-Bukhari", nameArabic: "صحيح البخاري", author: "Imam Muhammad al-Bukhari", totalHadiths: 7563, description: "Considered the most authentic book after the Quran. Compiled after 16 years of research with strict criteria — Bukhari would pray two rak'ahs before recording each hadith.", era: "3rd Century AH" },
    { id: "muslim", name: "Sahih Muslim", nameArabic: "صحيح مسلم", author: "Imam Muslim ibn al-Hajjaj", totalHadiths: 7500, description: "The second most authentic hadith collection. Imam Muslim was a student of Imam al-Bukhari. Known for its superior organization and continuous chains.", era: "3rd Century AH" },
    { id: "abu-dawud", name: "Sunan Abu Dawud", nameArabic: "سنن أبي داود", author: "Imam Abu Dawud al-Sijistani", totalHadiths: 5274, description: "One of the Kutub al-Sittah. Focuses heavily on hadiths related to Islamic law (fiqh) and jurisprudence.", era: "3rd Century AH" },
    { id: "tirmidhi", name: "Jami' at-Tirmidhi", nameArabic: "جامع الترمذي", author: "Imam Muhammad at-Tirmidhi", totalHadiths: 3956, description: "A comprehensive collection known for its careful grading of hadiths and noting different scholarly positions.", era: "3rd Century AH" },
    { id: "nasai", name: "Sunan an-Nasa'i", nameArabic: "سنن النسائي", author: "Imam Ahmad an-Nasa'i", totalHadiths: 5761, description: "Known for its exceptionally strict criteria in hadith selection, particularly in matters of ritual purity and prayer.", era: "3rd Century AH" },
    { id: "ibn-majah", name: "Sunan Ibn Majah", nameArabic: "سنن ابن ماجه", author: "Imam Ibn Majah al-Qazwini", totalHadiths: 4341, description: "The sixth of the Kutub al-Sittah, containing many unique hadiths not found in the other five collections.", era: "3rd Century AH" },
    { id: "malik", name: "Muwatta Imam Malik", nameArabic: "موطأ الإمام مالك", author: "Imam Malik ibn Anas", totalHadiths: 1720, description: "The earliest surviving major hadith collection, blending prophetic traditions with the practice of the people of Madinah.", era: "2nd Century AH" },
    { id: "ahmad", name: "Musnad Ahmad", nameArabic: "مسند أحمد", author: "Imam Ahmad ibn Hanbal", totalHadiths: 27647, description: "The largest known hadith collection, organized by Companion. Imam Ahmad compiled it during a time of severe persecution.", era: "3rd Century AH" },
    { id: "nawawi-40", name: "The Forty Hadith of Imam Nawawi", nameArabic: "الأربعون النووية", author: "Imam Yahya ibn Sharaf an-Nawawi", totalHadiths: 42, description: "Forty-two comprehensive hadiths that cover the fundamental principles of Islam. Imam Nawawi said these hadiths encompass the entire religion.", era: "7th Century AH" },
  ];

  await db.delete(hadithCollectionsTable);
  for (const c of collections) {
    await db.insert(hadithCollectionsTable).values(c).onConflictDoNothing();
  }
  console.log(`✓ ${collections.length} hadith collections seeded`);

  // ─── THE FORTY HADITH (NAWAWI) — ALL 42 ──────────────────────────────────────
  const nawawi40: Array<{ num: string; ar: string; en: string; narrator: string; grade: string; gradeReason: string; topics: string[]; sharh: string }> = [
    {
      num: "1", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Umar ibn al-Khattab (ra)",
      topics: ["intention", "niyyah", "actions", "foundations"],
      ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
      en: "Actions are judged by intentions; every person will get what they intended. Thus, he whose migration was for the sake of Allah and His Messenger, his migration was for the sake of Allah and His Messenger. And he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that which he migrated.",
      sharh: "This hadith is one of the foundational principles of Islamic jurisprudence. Imam al-Nawawi stated that many scholars considered it to be one-third of Islam. It establishes that the validity and reward of every action depends entirely on the intention behind it. Niyyah (intention) must be sincere and directed toward Allah to earn spiritual reward.",
    },
    {
      num: "2", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Umar ibn al-Khattab (ra)",
      topics: ["iman", "islam", "ihsan", "pillars", "jibril", "foundations"],
      ar: "الإِسْلامُ أَنْ تَشْهَدَ أَنْ لا إِلهَ إِلَّا اللهُ وَأَنَّ مُحَمَّداً رَسُولُ اللهِ، وَتُقِيمَ الصَّلاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ البَيْتَ إنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً",
      en: "Islam is to testify that there is no god but Allah and that Muhammad is the Messenger of Allah, to establish the prayer, to give the obligatory charity (zakat), to fast in Ramadan, and to make the pilgrimage to the House (Ka'bah) if you are able. Iman is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine decree — both the good and the evil thereof. Ihsan is to worship Allah as if you see Him, and if you see Him not, yet truly He sees you.",
      sharh: "This is the Hadith of Jibreel — the greatest hadith defining the three levels of the religion: Islam (submission through outer acts), Iman (belief in the six articles of faith), and Ihsan (excellence — worshipping with full awareness of Allah's presence). These three levels represent a hierarchy of spiritual development.",
    },
    {
      num: "3", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Umar (ra)",
      topics: ["pillars", "islam", "foundations", "shahadah", "prayer", "zakat", "fasting", "hajj"],
      ar: "بُنِيَ الإِسْلامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لا إِلهَ إِلَّا اللهُ وَأَنَّ مُحَمَّداً رَسُولُ اللهِ، وَإِقَامِ الصَّلاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ",
      en: "Islam has been built on five [pillars]: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, paying the zakat (obligatory charity), making the pilgrimage to the House, and fasting in Ramadan.",
      sharh: "The Five Pillars of Islam form the structural framework of Muslim practice. The word 'buni' (built) likens Islam to a magnificent building: the shahadah is the foundation, while salah, zakat, hajj, and sawm are the four main pillars. Each pillar has an outer dimension of physical action and an inner dimension of sincere devotion.",
    },
    {
      num: "4", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Abdirrahman Abdullah ibn Masud (ra)",
      topics: ["creation", "soul", "qadar", "destiny", "death"],
      ar: "إِنَّ أَحَدَكُمْ يُجمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ وَأَجَلِهِ وَعَمَلِهِ وَشَقِيٌّ أَوْ سَعِيدٌ",
      en: "Each one of you is formed in your mother's womb for forty days as a drop of fluid, then it becomes a clinging clot for the same period, then a morsel of flesh for the same period. Then an angel is sent to him and breathes the soul into him, and is commanded to write four words: his provision, his appointed term, his deeds, and whether he will be wretched or happy. By the One besides Whom there is no other god, one of you may do the deeds of the people of Paradise until there is only a cubit between him and it, then the decree overtakes him and he does the deeds of the people of Hell and enters it.",
      sharh: "This hadith describes the three stages of embryonic development known to modern science — nutfah (sperm/ovum), alaqah (leech-like clot), mudghah (chewed-like lump) — each lasting 40 days. At 120 days, the soul is breathed in and four decrees are written. It also addresses the profound theological question of predestination (qadar) and free will.",
    },
    {
      num: "5", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Aisha bint Abi Bakr (ra)",
      topics: ["innovation", "bid'ah", "sunnah", "religion", "rejection"],
      ar: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ",
      en: "Whoever introduces anything into this matter of ours that is not part of it will have it rejected.",
      sharh: "This foundational hadith establishes the principle that religious innovations (bid'ah) in worship are rejected regardless of good intentions. 'Our matter' refers to the religion of Islam. The Prophet ﷺ said in another narration: 'Every innovation is a going astray, and every going astray leads to the Fire.' This does not apply to worldly matters — only religious rituals and acts of worship.",
    },
    {
      num: "6", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Abdullah al-Nu'man ibn Bashir (ra)",
      topics: ["halal", "haram", "doubtful", "heart", "caution"],
      ar: "إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ فَقَدِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ، وَمَنْ وَقَعَ فِي الشُّبُهَاتِ وَقَعَ فِي الْحَرَامِ، كَالرَّاعِي يَرْعَى حَوْلَ الْحِمَى يُوشِكُ أَنْ يَرْتَعَ فِيهِ. أَلَا وَإِنَّ لِكُلِّ مَلِكٍ حِمىً",
      en: "Verily the halal is clear and the haram is clear, and between the two are doubtful matters about which many people do not know. Whoever avoids the doubtful matters has protected his religion and his honor. And whoever falls into the doubtful matters falls into the haram, like a shepherd who grazes his flock around a sanctuary — he is likely to enter it. Beware! Every king has a sanctuary, and the sanctuary of Allah is His prohibitions.",
      sharh: "This hadith divides actions into three categories: clearly permitted (halal), clearly prohibited (haram), and doubtful (mutashabihat). The wise approach is to avoid the doubtful — this is one of the key principles of Islamic jurisprudence. The hadith also affirms that the heart is the seat of moral purity: 'Beware! In the body there is a piece of flesh; if it is sound, the whole body is sound, and if it is corrupt, the whole body is corrupt. Verily, it is the heart.'",
    },
    {
      num: "7", grade: "Sahih", gradeReason: "Recorded by Muslim",
      narrator: "Abu Ruqayyah Tamim ibn Aus al-Dari (ra)",
      topics: ["sincerity", "nasihah", "advice", "duty", "honesty"],
      ar: "الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
      en: "The religion is sincere counsel (nasihah). We said: 'To whom?' He said: 'To Allah, to His Book, to His Messenger, to the leaders of the Muslims, and to their common people.'",
      sharh: "This concise hadith defines the entire religion as 'nasihah' — a comprehensive word meaning sincerity, genuine counsel, loyalty, and purity of purpose. Nasihah to Allah means believing in His oneness, worshipping Him sincerely, being grateful for His blessings. Nasihah to the Quran means reciting it with reverence, following its commands, and teaching it. Nasihah to the Prophet means following his Sunnah. Nasihah to leaders means advising them to rule justly. Nasihah to the common people means wishing for them what you wish for yourself.",
    },
    {
      num: "8", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Umar (ra)",
      topics: ["jihad", "shahadah", "prayer", "zakat", "fighting"],
      ar: "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ، وَيُقِيمُوا الصَّلَاةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إِلَّا بِحَقِّ الْإِسْلَامِ، وَحِسَابُهُمْ عَلَى اللَّهِ",
      en: "I have been commanded to fight the people until they testify that there is no god but Allah and that Muhammad is the Messenger of Allah, and establish the prayer and pay the zakat. If they do that, their blood and property are safe from me — except for the rights of Islam — and their account is with Allah.",
      sharh: "This hadith refers to the historical context of fighting the Arab polytheists who were actively at war with the Muslim community. It defines when a combatant's life and property become protected under Islamic law. It does not apply to non-combatants, peaceful non-Muslims, or those under treaty (dhimmis). The scholars emphasize this hadith must be read in its full historical, legal, and contextual framework.",
    },
    {
      num: "9", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["obedience", "commands", "prohibition", "limits"],
      ar: "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَافْعَلُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلَافُهُمْ عَلَى أَنْبِيَائِهِمْ",
      en: "Whatever I have prohibited to you, avoid it. And whatever I have commanded you, do it to the best of your ability. Verily, those before you were destroyed by their excessive questioning and their differing from their prophets.",
      sharh: "This hadith establishes two principles: absolute avoidance of prohibitions (with no relaxation), and proportional fulfillment of commands according to one's capacity (the principle of 'la yukallifu llahu nafsan illa wusaha'). It also warns against excessive hypothetical questioning that leads to making the religion burdensome.",
    },
    {
      num: "10", grade: "Sahih", gradeReason: "Recorded by Muslim",
      narrator: "Abu Hurairah (ra)",
      topics: ["halal", "food", "provision", "purity", "tayyib"],
      ar: "إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ فَقَالَ تَعَالَى: يَا أَيُّهَا الرُّسُلُ كُلُوا مِنَ الطَّيِّبَاتِ وَاعْمَلُوا صَالِحًا",
      en: "Allah is good and accepts only what is good. Allah commanded the believers with what He commanded the Messengers: 'O Messengers, eat of the pure things and act righteously.' And He said: 'O you who believe, eat of the pure things We have provided you.' Then he mentioned a man who has traveled far, disheveled and covered in dust, and he raises his hands to heaven: 'O Lord! O Lord!' But his food is unlawful, his drink is unlawful, his clothing is unlawful, and he has been nourished with unlawful things. How then could his supplication be answered?",
      sharh: "This hadith establishes that purity (tayyib) is a prerequisite for the acceptance of deeds. Allah Himself is pure (tayyib) and only accepts what is pure. The powerful imagery at the end — a man calling desperately in du'a but whose every provision is haram — drives home that unlawfully earned income blocks the acceptance of worship and supplication.",
    },
    {
      num: "11", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Muhammad al-Hasan ibn Ali ibn Abi Talib (ra)",
      topics: ["halal", "haram", "doubt", "caution", "heart"],
      ar: "دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ، فَإِنَّ الصِّدْقَ طُمَأْنِينَةٌ، وَإِنَّ الْكَذِبَ رِيبَةٌ",
      en: "Leave that which makes you doubt for that which does not make you doubt. Indeed, truthfulness is certainty and tranquility, while lying is doubt and disturbance.",
      sharh: "This succinct hadith provides a practical criterion for ethical decision-making: when in doubt, choose the safer option. The heart's innate sense of unease about something doubtful is a God-given warning system. Truthfulness brings the heart to rest; dishonesty creates inner turmoil and anxiety.",
    },
    {
      num: "12", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["ethics", "manners", "others", "harm", "Islam"],
      ar: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
      en: "Part of the excellence of a person's Islam is his leaving alone that which does not concern him.",
      sharh: "This brief but profound hadith establishes a key principle of Islamic character: not interfering in matters that do not concern you. This encompasses avoiding gossip, unnecessary questions about others' private affairs, meddling in disputes that are not your responsibility, and pursuing irrelevant religious matters. It is a call to focused, purposeful living.",
    },
    {
      num: "13", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hamzah Anas ibn Malik (ra)",
      topics: ["love", "brotherhood", "iman", "faith", "neighbor"],
      ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      en: "None of you truly believes until he loves for his brother what he loves for himself.",
      sharh: "The Golden Rule of Islam. This hadith defines the minimum threshold of true faith (iman) — not just wishing well for others in a passive sense, but actively desiring for your Muslim brother what you desire for yourself: good health, wealth, knowledge, guidance, and happiness. The brotherhood referred to includes all Muslims, and some scholars extend its spirit to all of humanity.",
    },
    {
      num: "14", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Masud (ra)",
      topics: ["blood", "life", "sanctity", "shahadah", "murder", "adultery"],
      ar: "لَا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ يَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنِّي رَسُولُ اللَّهِ إِلَّا بِإِحْدَى ثَلَاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ",
      en: "The blood of a Muslim who testifies that there is no god but Allah and that I am the Messenger of Allah is not lawful to shed except in one of three cases: the previously married person who commits adultery, a life for a life, and one who abandons his religion and leaves the community.",
      sharh: "This hadith establishes the sanctity of Muslim life (haram al-dam). Capital punishment in Islam is restricted to three serious offenses adjudicated by a legitimate Islamic court: (1) adultery by a married person (zina al-muhsan), (2) intentional murder (qisas), and (3) high treason combined with apostasy that threatens community security. These require strict judicial processes — they are not carried out by individuals.",
    },
    {
      num: "15", grade: "Sahih", gradeReason: "Recorded by Muslim",
      narrator: "Abu Hurairah (ra)",
      topics: ["generosity", "charity", "sadaqah", "spending", "wealth"],
      ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
      en: "Whoever believes in Allah and the Last Day should say something good or keep silent. Whoever believes in Allah and the Last Day should honor his neighbor. Whoever believes in Allah and the Last Day should honor his guest.",
      sharh: "This hadith links three major social obligations to the foundation of iman (faith): (1) guarding the tongue — speech must be beneficial or silence is better, (2) honoring neighbors — a key Islamic social responsibility (Jibreel emphasized the rights of neighbors so often that the Prophet thought inheritance might be established for them), and (3) generosity to guests — a sign of noble character inherited from the tradition of Ibrahim.",
    },
    {
      num: "16", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["anger", "character", "self-control", "strength"],
      ar: "لَا تَغْضَبْ",
      en: "A man asked the Prophet ﷺ: 'Counsel me.' He said: 'Do not get angry.' He repeated his question several times, and he kept saying: 'Do not get angry.'",
      sharh: "Despite its brevity, this is one of the most comprehensive pieces of advice in Islamic ethics. Controlling anger is the gateway to controlling all other negative traits. The Prophet ﷺ said: 'The strong man is not the one who overcomes people by strength, but the strong man is the one who controls himself while in anger.' This hadith prescribes several remedies: seeking refuge in Allah from Shaytan, performing wudu (ablution), sitting or lying down, and remaining silent.",
    },
    {
      num: "17", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Ya'la Shaddad ibn Aws (ra)",
      topics: ["ihsan", "excellence", "animals", "mercy", "slaughter"],
      ar: "إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ، وَلْيُحِدَّ أَحَدُكُمْ شَفْرَتَهُ، وَلْيُرِحْ ذَبِيحَتَهُ",
      en: "Allah has prescribed excellence (ihsan) in all things. So if you kill, kill well; and if you slaughter, slaughter well. Let each one of you sharpen his blade and let him spare suffering to the animal he slaughters.",
      sharh: "This profound hadith establishes ihsan (excellence, perfection of action) as an Islamic obligation in every sphere of life. It encompasses excellence in worship, dealings with people, craftsmanship, and even in unavoidable acts like killing in battle or slaughtering animals for food. Minimizing pain to animals is a divine obligation. Islam was the first civilization to mandate animal welfare in law.",
    },
    {
      num: "18", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Dharr al-Ghifari (ra)",
      topics: ["taqwa", "piety", "character", "deeds", "manners"],
      ar: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
      en: "Have taqwa (fear/consciousness) of Allah wherever you are. Follow a bad deed with a good deed and it will efface it. And treat people with good character (akhlaq).",
      sharh: "This hadith contains three comprehensive directives that form the backbone of Islamic personal ethics: (1) Taqwa — consciousness of Allah in public and private, (2) Immediate repentance and expiation following any sin, following bad deeds with good deeds before they accumulate, and (3) Good character (husn al-khuluq) with people — the Prophet said this is the heaviest thing on the scale on the Day of Judgment.",
    },
    {
      num: "19", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Abbas (ra)",
      topics: ["help", "trust", "allah", "qadar", "tawakkul"],
      ar: "احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ",
      en: "Guard Allah's rights, and He will guard you. Guard Allah's rights, and you will find Him before you. If you ask, ask only Allah. If you seek help, seek help only from Allah. And know that if the entire nation were to gather together to benefit you with something, they would not be able to benefit you except with something that Allah has already decreed for you. And if they gathered to harm you, they would not harm you except with something Allah has already decreed against you.",
      sharh: "This remarkable hadith was given by the Prophet ﷺ to the young Ibn Abbas. It teaches two foundational principles: (1) the mutual relationship of protection — guard Allah's commands and He will protect you, and (2) complete reliance on Allah (tawakkul) combined with using means. The passage on the nation being unable to benefit or harm beyond Allah's decree addresses the reality of divine qadar and liberates the believer from fear of any created being.",
    },
    {
      num: "20", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Masud Uqbah ibn Amr al-Ansari (ra)",
      topics: ["modesty", "hayaa", "character", "ethics"],
      ar: "إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلَامِ النُّبُوَّةِ الْأُولَى: إِذَا لَمْ تَسْتَحِيِ فَاصْنَعْ مَا شِئْتَ",
      en: "Among the words people have found from the earlier prophetic teachings is: If you feel no shame, then do whatever you wish.",
      sharh: "Hayaa (modesty, shyness, shame) is one of the defining characteristics of Islam. This hadith presents two interpretations: (1) as a command — 'do whatever you wish knowing that Allah sees you' (implying you should act as if you have shame before Allah), or (2) as a consequence — 'when a person has no shame, nothing stops them from any evil.' The Prophet ﷺ said: 'Hayaa is a branch of iman' and 'Hayaa brings nothing but good.'",
    },
    {
      num: "21", grade: "Sahih", gradeReason: "Recorded by Muslim",
      narrator: "Abu Amr Sufyan ibn Abdullah al-Thaqafi (ra)",
      topics: ["istiqamah", "steadfastness", "iman", "simplicity"],
      ar: "قُلْ: آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ",
      en: "I asked: 'O Messenger of Allah, tell me something about Islam which I will not ask anyone else about.' He said: 'Say: I believe in Allah, then be steadfast (istiqamah).'",
      sharh: "This comprehensive hadith condenses Islam to its two essential elements: declaration of faith (iman) and steadfastness (istiqamah). Istiqamah — remaining firm and upright on the straight path — is mentioned three times in the Quran as a direct divine command. Ibn Rajab noted that this hadith, along with the hadith of actions by intentions, encompasses the entire religion.",
    },
    {
      num: "22", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Abdullah Jabir ibn Abdullah al-Ansari (ra)",
      topics: ["paradise", "hellfire", "deeds", "hope"],
      ar: "لَا يُدْخِلُ أَحَدَكُمْ عَمَلُهُ الْجَنَّةَ، وَلَا يُنَجِّيهِ مِنَ النَّارِ، وَلَا أَنَا إِلَّا بِرَحْمَةٍ مِنَ اللَّهِ",
      en: "No one's actions will admit him into Paradise, nor will they save him from Hell — not even me, unless Allah envelops me in His mercy. So be regular and moderate, and in the morning and evening and in part of the night engage in deeds that draw you near to Allah. And observe the right mean, and you will reach your goal.",
      sharh: "This hadith corrects a misunderstanding about deeds. Entering Paradise is ultimately by Allah's mercy, not solely by the arithmetic of deeds. However, good deeds are the means (asbab) through which Allah bestows His mercy. The Prophet's saying 'not even me' demonstrates his profound humility. The emphasis on the 'right mean' (qasd) means consistency in moderate acts rather than occasional bursts of intense worship.",
    },
    {
      num: "23", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Malik al-Harith ibn Asim al-Ash'ari (ra)",
      topics: ["purification", "tahara", "prayer", "quran", "charity"],
      ar: "الطَّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآَنِ أَوْ تَمْلَأُ مَا بَيْنَ السَّمَاوَاتِ وَالْأَرْضِ",
      en: "Purification (taharah) is half of iman. 'Al-hamdulillah' fills the scale. 'SubhanAllah and Alhamdulillah' fills what is between heaven and earth. Prayer is a light. Charity is a proof. Patience is a brightness. The Quran is either an argument in your favor or against you. Every person goes out in the morning and is a merchant of their own soul, either freeing it or destroying it.",
      sharh: "This hadith of profound wisdom describes the nature and function of key Islamic acts: (1) Purification as foundational to faith, (2) The immense weight of dhikr (remembrance) on the divine scale, (3) Salah as spiritual illumination — the believer's face glows with its light, (4) Sadaqah as proof of iman — one who gives is sincere, (5) Sabr (patience) as a brilliant light that strengthens the believer, and (6) The Quran as either an intercessor or a prosecutor — depending on one's relationship with it.",
    },
    {
      num: "24", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Dharr al-Ghifari (ra)",
      topics: ["harming others", "oppression", "justice", "good deeds"],
      ar: "يَا عِبَادِي، إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلَا تَظَالَمُوا",
      en: "Allah says: 'O My servants, I have forbidden oppression upon Myself and I have made it forbidden among you, so do not oppress one another. O My servants, all of you are hungry except those I have fed, so seek food from Me and I will feed you. O My servants, all of you are naked except those I have clothed, so seek clothing from Me and I will clothe you. O My servants, you commit sins by day and night and I forgive all sins, so seek forgiveness from Me and I will forgive you.' (Hadith Qudsi)",
      sharh: "This Hadith Qudsi (divine narration) is one of the most remarkable in Islamic literature. It begins with Allah declaring that He has prohibited injustice upon Himself — affirming divine justice as the highest principle. It then describes Allah's comprehensive providence and boundless forgiveness. Ibn Rajab said this hadith encompasses all the goals of human existence: sustenance, protection, forgiveness of sins, and guidance.",
    },
    {
      num: "25", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["sadaqah", "charity", "every good deed", "tasbih"],
      ar: "كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ",
      en: "For every joint in a person's body there is a charity for every day upon which the sun rises. To judge justly between two people is a charity. To help a man with his beast, lifting him onto it or hoisting up his belongings, is a charity. A good word is a charity. Every step you take toward the prayer is a charity. And removing a harmful thing from the road is a charity.",
      sharh: "This hadith reveals the expansive nature of sadaqah in Islam. The human body has 360 joints, so 360 acts of gratitude — that is, charity — are required daily. This makes every beneficial act of service an act of worship. Charity is not limited to financial giving; it includes all acts that benefit people or the community. The Prophet concluded by saying that the two rak'ahs of Duha prayer suffices as this daily gratitude.",
    },
    {
      num: "26", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["rights", "enmity", "ghiba", "backbiting", "brotherhood"],
      ar: "كُلُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ حَرَامٌ: دَمُهُ وَمَالُهُ وَعِرْضُهُ",
      en: "Every Muslim's blood, property, and honor are inviolable to another Muslim. Taqwa (consciousness of Allah) is here — and he pointed to his chest three times. It is sufficient evil for a man to hold his fellow Muslim in contempt. (And he said: 'Do not envy one another, do not harbor malice against one another, do not cut off relations with one another, do not turn away from one another. Be brothers as Allah has commanded you.')",
      sharh: "This fundamental hadith establishes three inviolable rights every Muslim has over another: (1) haram al-dam — life cannot be taken, (2) haram al-mal — property cannot be seized or damaged, and (3) haram al-'ird — honor cannot be attacked through backbiting, slander, or ridicule. The Prophet pointed to his chest three times when mentioning taqwa, emphasizing that moral virtue is a matter of the heart, not outward appearance.",
    },
    {
      num: "27", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Al-Nawwas ibn Sam'an (ra)",
      topics: ["birr", "righteousness", "ithm", "sin", "conscience"],
      ar: "الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ",
      en: "Righteousness (birr) is good character. Sin (ithm) is that which disturbs your soul and which you dislike people knowing about.",
      sharh: "This powerful hadith reduces righteousness to one thing: good character (husn al-khuluq). And it defines sin through the universal moral compass of the conscience. The heart naturally recognizes sin by the unease and discomfort it creates. This inner sense of moral discomfort — disliking others to know what you are doing — is a God-given indicator of wrong action.",
    },
    {
      num: "28", grade: "Sahih", gradeReason: "Recorded by Muslim",
      narrator: "Abu Najih al-Irbad ibn Sariyah (ra)",
      topics: ["sunnah", "innovation", "taqwa", "companions", "community"],
      ar: "عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ، تَمَسَّكُوا بِهَا وَعَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الْأُمُورِ",
      en: "I urge you to follow my Sunnah and the sunnah of the Rightly-Guided Caliphs after me. Hold fast to it and bite onto it with your back teeth. Beware of newly invented matters, for every innovation is a going astray.",
      sharh: "After a moving farewell speech that moved the Companions to tears, the Prophet gave this critical guidance on preserving the religion. It commands adherence to the Prophetic Sunnah and the practice of the four Rightly-Guided Caliphs (Abu Bakr, Umar, Uthman, Ali). It also warns against religious innovations (bid'ah), connecting every innovation to misguidance — regardless of the inventor's good intentions.",
    },
    {
      num: "29", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Muadh ibn Jabal (ra)",
      topics: ["jihad", "prayer", "fasting", "charity", "dhikr", "iman"],
      ar: "رَأْسُ الْأَمْرِ الْإِسْلَامُ، وَعَمُودُهُ الصَّلَاةُ، وَذِرْوَةُ سَنَامِهِ الْجِهَادُ فِي سَبِيلِ اللَّهِ",
      en: "The head of the matter is Islam, its pillar is the prayer, and the peak of its hump is striving in the way of Allah (jihad). Shall I not tell you of what controls all of that? He held his tongue and said: 'Restrain this.' I said: 'O Prophet of Allah, will we be held accountable for what we say?' He said: 'May your mother be bereaved of you, O Muadh! Is there anything that causes people to be thrown into the Fire on their faces other than the harvests of their tongues?'",
      sharh: "The Prophet uses the metaphor of a camel's body to describe Islam: the head (Islam), the central pillar (salah), and the highest point (jihad fi sabilillah). But then he emphatically points to the tongue as the root cause of most hellfire entries. This profound conclusion redirects our attention to controlling speech — the gateway to all moral failures.",
    },
    {
      num: "30", grade: "Sahih", gradeReason: "Recorded by Muslim",
      narrator: "Abu Thalabah al-Khushani (ra)",
      topics: ["limits", "halal", "haram", "commands", "religion"],
      ar: "إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلَا تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلَا تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلَا تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلَا تَبْحَثُوا عَنْهَا",
      en: "Verily, Allah has prescribed certain obligations — do not neglect them. He has set certain boundaries — do not transgress them. He has forbidden certain things — do not violate them. And He has kept silent about certain things out of mercy for you, not out of forgetfulness — do not inquire into them.",
      sharh: "This hadith establishes the comprehensive framework of Islamic law: (1) Faraid (obligatory duties) — prayer, fasting, zakat, hajj — must be fulfilled, (2) Hudud (divine limits) — the boundaries set by Allah around the haram must not be crossed, (3) Muharramat (prohibitions) — explicitly forbidden things must be avoided, and (4) The large sphere of silence (mubah) — what Allah chose not to regulate should not be made into a burden. This prevents over-restriction and over-permissiveness.",
    },
    {
      num: "31", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu al-Abbas Sahl ibn Saad al-Saidi (ra)",
      topics: ["zuhd", "asceticism", "dunya", "world", "contentment"],
      ar: "ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ",
      en: "A man came to the Prophet ﷺ and said: 'O Messenger of Allah, direct me to an act which if I do it Allah will love me and people will love me.' He said: 'Have no desire for this world (zuhd) and Allah will love you. Have no desire for what people have and people will love you.'",
      sharh: "This profound hadith prescribes zuhd — detachment from the dunya (worldly life) — as the path to earning both Allah's love and people's love. Zuhd does not mean poverty or neglecting one's needs; it means not letting the world fill your heart and become your primary concern. When a person is not competing for worldly gain, people trust them and love them. When they prioritize the akhirah, Allah loves them.",
    },
    {
      num: "32", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Sad al-Harith ibn Hisham ibn al-Makhzumi (ra)",
      topics: ["harm", "harming others", "justice", "rights"],
      ar: "لَا ضَرَرَ وَلَا ضِرَارَ",
      en: "Do not cause harm or reciprocate harm.",
      sharh: "Despite its extreme brevity, this hadith is one of the five foundational axioms of Islamic jurisprudence. 'La darar' means do not initiate harm against another. 'La dirar' means do not reciprocate harm with harm (i.e., revenge should be through legitimate legal channels). This principle governs vast areas of Islamic law: property rights, contracts, public health, environmental law, and more.",
    },
    {
      num: "33", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Abbas (ra)",
      topics: ["burden of proof", "oath", "justice", "courts", "claims"],
      ar: "لَوْ يُعْطَى النَّاسُ بِدَعْوَاهُمْ لَادَّعَى نَاسٌ دِمَاءَ رِجَالٍ وَأَمْوَالَهُمْ، وَلَكِنَّ الْبَيِّنَةَ عَلَى الْمُدَّعِي وَالْيَمِينَ عَلَى مَنْ أَنْكَرَ",
      en: "If people were given based on their claims, some would claim the blood and wealth of others. But the burden of proof is upon the claimant, and the oath is upon the one who denies.",
      sharh: "This hadith establishes one of the most important principles of Islamic judiciary: al-bayyinah (burden of proof) falls on the one making a claim, not on the accused. This principle mirrors the presumption of innocence found in modern legal systems. Imam Ahmad cited this hadith as one of the core pillars of Islamic law.",
    },
    {
      num: "34", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Said al-Khudri (ra)",
      topics: ["evil", "enjoining good", "forbidding evil", "heart", "iman"],
      ar: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
      en: "Whoever among you sees an evil, let him change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart — and that is the weakest of faith.",
      sharh: "This fundamental hadith establishes the Islamic obligation of 'amr bil ma'ruf wa nahy 'an al-munkar' (enjoining good and forbidding evil) with three levels corresponding to one's capacity: (1) physical action (rulers, police, guardians in their domain), (2) speech (scholars, community leaders, educators), and (3) heart (private individuals with no authority). Rejecting evil only in the heart is the absolute minimum — scholars call it the floor of faith, not the ceiling.",
    },
    {
      num: "35", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["brotherhood", "envy", "hatred", "unity", "akhlaq"],
      ar: "لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا، وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا، الْمُسْلِمُ أَخُو الْمُسْلِمِ، لَا يَظْلِمُهُ وَلَا يَخْذُلُهُ وَلَا يَكْذِبُهُ وَلَا يَحْقِرُهُ",
      en: "Do not envy one another; do not artificially inflate prices; do not hate one another; do not turn away from one another; do not undercut one another in trade; be servants of Allah who are brothers. A Muslim is the brother of a Muslim: he does not wrong him, he does not let him down, he does not lie to him, and he does not show contempt for him.",
      sharh: "This comprehensive hadith of social ethics prohibits six destructive behaviors: hasad (envy — wishing others lose their blessings), najsh (bid rigging — deceptive inflation of prices), baghda (hatred in hearts), tadabur (turning away from other Muslims), and undercutting others in trade. It then defines the Islamic brotherhood through four positive obligations.",
    },
    {
      num: "36", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["charity", "sadaqah", "wealth", "obligations", "prayer"],
      ar: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
      en: "Whoever relieves a believer's distress of the distressing aspects of this world, Allah will rescue him from a difficulty of the difficulties of the Hereafter. Whoever alleviates the situation of a needy person, Allah will alleviate his situation in this world and the next. Whoever shields a Muslim, Allah will shield him in this world and the next. Allah is in the aid of His servant as long as His servant is in the aid of his brother.",
      sharh: "This magnificent hadith establishes the principle of divine reciprocity in social service: the measure with which you serve others is the measure with which Allah serves you. Three specific acts are highlighted: (1) tafris — relieving distress and worry, (2) taysir — facilitating ease for the needy, and (3) sitr — protecting the dignity of fellow Muslims by covering their faults.",
    },
    {
      num: "37", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Abbas (ra)",
      topics: ["writing", "good deeds", "sin", "recording", "angels"],
      ar: "إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ",
      en: "Indeed, Allah has recorded good deeds and evil deeds. Then He clarified: Whoever intends a good deed but does not do it, Allah records it as one complete good deed. If he intends it and does it, Allah records it as ten to seven hundred good deeds or even more. If he intends an evil deed but does not do it, Allah records it as one complete good deed. If he intends it and does it, Allah records it as just one evil deed.",
      sharh: "This extraordinary hadith reveals Allah's infinite mercy in the divine accounting system. The asymmetry is breathtaking: good deeds are multiplied 10-700 times or more, while evil deeds are recorded at just one. A mere intention to do good earns a full reward; an unacted evil intention earns a good deed. This is the divine generosity of 'al-Rahman al-Rahim' translated into the mathematics of divine justice.",
    },
    {
      num: "38", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["wali", "friends of Allah", "awliya", "enmity", "dhikr"],
      ar: "إِنَّ اللَّهَ قَالَ: مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ",
      en: "Allah said: 'Whoever shows enmity to a wali (friend) of Mine, I have declared war on them. My servant does not draw near to Me with anything more beloved to Me than the religious duties I have obligated. My servant continues to draw near to Me with voluntary acts until I love him. When I love him, I become the hearing with which he hears, the sight with which he sees, the hand with which he strikes, and the foot with which he walks.' (Hadith Qudsi)",
      sharh: "This Hadith Qudsi reveals the highest station a believer can reach: wilayah (closeness to Allah). It describes two paths to it: fulfilling obligatory duties (which are most beloved to Allah) and then adding voluntary acts until Allah's love is attained. The beautiful metaphor of Allah 'becoming' the believer's senses means He guides, sharpens, and blesses their faculties — their hearing, sight, and actions all become aligned with divine will.",
    },
    {
      num: "39", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Ibn Abbas (ra)",
      topics: ["forgiveness", "mistakes", "forgetfulness", "coercion", "accountability"],
      ar: "إِنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ وَالنِّسْيَانَ وَمَا اسْتُكْرِهُوا عَلَيْهِ",
      en: "Indeed, Allah has forgiven my Ummah for mistakes (done unintentionally), forgetfulness, and for actions done under coercion.",
      sharh: "This hadith of great mercy establishes three categories of non-accountability in Islamic law: (1) Khata (unintentional mistake) — an action done in good faith without intent to commit the prohibited act, (2) Nisyan (forgetfulness) — e.g., forgetting one is fasting and eating, or forgetting a prayer, and (3) Ikrah (coercion) — being forced under threat to one's life to say or do something prohibited. Allah's mercy lifts the legal and moral burden of sin in all three cases.",
    },
    {
      num: "40", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Hurairah (ra)",
      topics: ["dunya", "world", "stranger", "traveler", "akhirah"],
      ar: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ",
      en: "Be in this world as though you are a stranger or a wayfarer. Ibn Umar would say: 'If you wake in the morning, do not wait for the evening. If you are at evening, do not wait for the morning. Take from your health for your illness, and from your life for your death.'",
      sharh: "This metaphor is one of the most evocative in Islamic spirituality. A stranger in a foreign land does not invest their entire heart in that place — they remember they are passing through to their true home. A wayfarer on a journey does not burden themselves with what they cannot carry. The dunya should be treated as a temporary passage, not a permanent dwelling. Ibn Umar's commentary adds urgency: seize the present moment for good deeds before illness, death, or the passage of time prevents it.",
    },
    {
      num: "41", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Abu Muhammad Abdullah ibn Amr ibn al-As (ra)",
      topics: ["desires", "sunnah", "following", "ittiba"],
      ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يَكُونَ هَوَاهُ تَبَعًا لِمَا جِئْتُ بِهِ",
      en: "None of you truly believes until his desires are aligned with what I have brought.",
      sharh: "This hadith defines the complete surrender (Islam) of the self: true faith requires that a person's hawa (desires, inclinations, and personal preferences) become subordinate to and aligned with the Sunnah of the Prophet ﷺ. This is the inner dimension of following the Prophet, beyond mere outward compliance. It requires ongoing spiritual work to align the nafs (ego) with prophetic guidance.",
    },
    {
      num: "42", grade: "Sahih", gradeReason: "Agreed upon (Bukhari & Muslim)",
      narrator: "Anas ibn Malik (ra)",
      topics: ["forgiveness", "hope", "mercy", "repentance", "despair"],
      ar: "قَالَ اللَّهُ تَعَالَى: يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلَا أُبَالِي",
      en: "Allah said: 'O son of Adam! As long as you call upon Me and hope in Me, I forgive you for what you have done and I do not mind. O son of Adam! If your sins were to reach the clouds of the sky and then you sought forgiveness from Me, I would forgive you. O son of Adam! If you came to Me with sins nearly as great as the earth, and then you met Me not associating anything with Me, I would come to you with forgiveness nearly as great as the earth.' (Hadith Qudsi)",
      sharh: "This extraordinary Hadith Qudsi — the final hadith of Imam Nawawi's collection — is a resounding declaration of divine mercy and forgiveness. It ends the collection on the highest note of hope. Three magnificent promises are given: (1) ongoing forgiveness for those who call and hope, regardless of sins committed, (2) forgiveness even for sins that reach the clouds, and (3) forgiveness 'as great as the earth' for those who die without shirk. Imam Nawawi chose this as the seal of his collection to leave believers with hope and faith in Allah's boundless mercy.",
    },
  ];

  await db.delete(hadithsTable);
  let hadithInsertCount = 0;
  for (const h of nawawi40) {
    await db.insert(hadithsTable).values({
      collectionId: "nawawi-40",
      hadithNumber: h.num,
      arabicText: h.ar,
      translation: h.en,
      grade: h.grade as "Sahih",
      gradeReason: h.gradeReason,
      narrator: h.narrator,
      topics: h.topics,
      sharh: h.sharh,
    }).onConflictDoNothing();
    hadithInsertCount++;
  }

  // ─── KEY BUKHARI HADITHS ─────────────────────────────────────────────────────
  const bukhariHadiths = [
    {
      num: "1", narrator: "Umar ibn al-Khattab (ra)", grade: "Sahih" as const,
      topics: ["intention", "niyyah", "hijrah"],
      ar: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
      en: "Actions are judged by intentions. He whose migration was for Allah and His Messenger, his migration was for Allah and His Messenger.",
      sharh: "The first hadith of Sahih al-Bukhari. Bukhari began with this hadith deliberately — to establish that every deed requires proper intention to be valid in the sight of Allah.",
    },
    {
      num: "6", narrator: "Abdullah ibn Amr (ra)", grade: "Sahih" as const,
      topics: ["islam", "character", "tongue", "food", "harm"],
      ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ",
      en: "The Muslim is the one from whose tongue and hand other Muslims are safe. The emigrant (muhajir) is the one who abandons what Allah has forbidden.",
      sharh: "This powerful definition of a Muslim focuses not on rituals but on social behavior — the harm one causes through speech (backbiting, slander, lies) and actions. True emigration is abandoning sins, not merely physical relocation.",
    },
    {
      num: "8", narrator: "Ibn Umar (ra)", grade: "Sahih" as const,
      topics: ["prayer", "pillars", "zakat", "fasting", "hajj"],
      ar: "بُنِيَ الإِسْلَامُ عَلَى خَمْسَةٍ: عَلَى أَنْ يُوَحَّدَ اللَّهُ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَصِيَامِ رَمَضَانَ، وَالْحَجِّ",
      en: "Islam is built on five: the unification of Allah, establishing the prayer, giving the zakat, the fast of Ramadan, and the Hajj.",
      sharh: "The Five Pillars in the wording of al-Bukhari's Sahih. The foundation of the building is tawhid (unification of Allah) — without it, no other pillar stands.",
    },
    {
      num: "13", narrator: "Anas ibn Malik (ra)", grade: "Sahih" as const,
      topics: ["iman", "love", "prophet", "brotherhood"],
      ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى أَكُونَ أَحَبَّ إِلَيْهِ مِنْ وَالِدِهِ وَوَلَدِهِ وَالنَّاسِ أَجْمَعِينَ",
      en: "None of you truly believes until I am more beloved to him than his father, his child, and all of humanity.",
      sharh: "Love of the Prophet ﷺ is an article of faith. This love is not mere sentiment but is demonstrated through following his Sunnah, defending his honor, and prioritizing his guidance over personal inclinations.",
    },
    {
      num: "73", narrator: "Abdurrahman ibn Abi Bakra (ra)", grade: "Sahih" as const,
      topics: ["major sins", "shirk", "parents", "testimony", "lying"],
      ar: "أَلَا أُنَبِّئُكُمْ بِأَكْبَرِ الْكَبَائِرِ ثَلَاثًا: الإِشْرَاكُ بِاللَّهِ، وَعُقُوقُ الْوَالِدَيْنِ، وَشَهَادَةُ الزُّورِ",
      en: "Shall I not inform you of the three greatest major sins? Associating partners with Allah, disobeying parents, and bearing false witness.",
      sharh: "The Prophet ﷺ was reclining and sat up straight when saying this, indicating its extreme importance. These three sins have severe consequences: shirk corrupts the foundation of religion, disobeying parents destroys family and community, and false testimony corrupts justice.",
    },
    {
      num: "2462", narrator: "Abu Hurairah (ra)", grade: "Sahih" as const,
      topics: ["generosity", "sadaqah", "wealth", "decrease"],
      ar: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
      en: "Charity never decreases wealth. Allah increases in honor the one who forgives. And Allah raises the rank of the one who shows humility for His sake.",
      sharh: "This hadith addresses a common psychological barrier to giving: the fear of wealth decreasing. Allah promises that charity does not decrease wealth — either materially through divine increase, or through the barakah (blessing) that remains in what is left.",
    },
    {
      num: "5764", narrator: "Abu Hurairah (ra)", grade: "Sahih" as const,
      topics: ["prayer", "night prayer", "best prayer", "fasting"],
      ar: "أَفْضَلُ الصَّلَاةِ بَعْدَ الصَّلَاةِ الْمَكْتُوبَةِ الصَّلَاةُ فِي جَوْفِ اللَّيْلِ",
      en: "The best prayer after the obligatory prayers is the night prayer. The best fast after Ramadan is the fast of Allah's month of Muharram.",
      sharh: "This hadith establishes the hierarchy of voluntary worship. Tahajjud (night prayer) is the highest voluntary prayer because it requires the greatest sacrifice — giving up sleep at the most peaceful time of the night to stand before Allah alone.",
    },
  ];

  for (const h of bukhariHadiths) {
    await db.insert(hadithsTable).values({
      collectionId: "bukhari",
      hadithNumber: h.num,
      arabicText: h.ar,
      translation: h.en,
      grade: h.grade,
      gradeReason: "Imam al-Bukhari verified the chain with his strictest criteria",
      narrator: h.narrator,
      topics: h.topics,
      sharh: h.sharh,
    }).onConflictDoNothing();
    hadithInsertCount++;
  }

  // ─── KEY MUSLIM HADITHS ──────────────────────────────────────────────────────
  const muslimHadiths = [
    {
      num: "2564", narrator: "Abu Hurairah (ra)", grade: "Sahih" as const,
      topics: ["akhlaq", "character", "manners", "ethics"],
      ar: "إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الأَخْلَاقِ",
      en: "I was sent to complete and perfect good character (makarim al-akhlaq).",
      sharh: "This is the mission statement of the Prophet ﷺ. Islam did not abolish pre-Islamic ethics entirely — it confirmed what was good and elevated it to its highest form, guided by divine revelation.",
    },
    {
      num: "4673", narrator: "Jabir ibn Abdullah (ra)", grade: "Sahih" as const,
      topics: ["prayer", "believers", "kufr", "shirk", "difference"],
      ar: "بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ",
      en: "The boundary between a man and shirk and kufr is the abandonment of the prayer.",
      sharh: "This hadith places prayer as the most critical visible marker of faith. Abandoning the prayer deliberately and permanently is treated as a severe act. The scholars have different rulings on this matter, but all agree it is among the gravest of major sins.",
    },
    {
      num: "186", narrator: "Umar ibn al-Khattab (ra)", grade: "Sahih" as const,
      topics: ["iman", "islam", "ihsan", "jibril", "pillars"],
      ar: "فَأَخْبِرْنِي عَنِ الإِيمَانِ قَالَ أَنْ تُؤْمِنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الآخِرِ",
      en: "The Angel Jibreel asked: 'Tell me about iman.' The Prophet replied: 'It is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine decree (qadar) — both its good and its evil.'",
      sharh: "The Six Pillars of Iman from the Hadith of Jibreel as recorded in Sahih Muslim. This is the complete doctrinal framework of Islamic theology (aqeedah). Belief in qadar (divine decree) is the distinguishing feature compared to other monotheistic formulations.",
    },
  ];

  for (const h of muslimHadiths) {
    await db.insert(hadithsTable).values({
      collectionId: "muslim",
      hadithNumber: h.num,
      arabicText: h.ar,
      translation: h.en,
      grade: h.grade,
      gradeReason: "Imam Muslim verified through multiple authentic chains",
      narrator: h.narrator,
      topics: h.topics,
      sharh: h.sharh,
    }).onConflictDoNothing();
    hadithInsertCount++;
  }

  console.log(`✓ ${hadithInsertCount} hadiths seeded`);

  // ─── NARRATORS ───────────────────────────────────────────────────────────────
  await db.delete(narratorsTable);
  const narrators = [
    { name: "The Prophet Muhammad ﷺ", nameArabic: "النبي محمد ﷺ", birthYear: null, deathYear: 11, location: "Medina", reliability: "The Messenger of Allah", grade: "Prophet", heardFrom: [] },
    { name: "Umar ibn al-Khattab", nameArabic: "عُمَرُ بْنُ الْخَطَّابِ", birthYear: null, deathYear: 23, location: "Medina", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Abu Hurairah", nameArabic: "أَبُو هُرَيْرَةَ", birthYear: null, deathYear: 59, location: "Medina", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Anas ibn Malik", nameArabic: "أَنَسُ بْنُ مَالِكٍ", birthYear: 10, deathYear: 93, location: "Basra", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Ibn Abbas", nameArabic: "عَبْدُ اللَّهِ بْنُ عَبَّاسٍ", birthYear: null, deathYear: 68, location: "Mecca", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ", "Umar ibn al-Khattab"] },
    { name: "Aisha bint Abi Bakr", nameArabic: "عَائِشَةُ بِنْتُ أَبِي بَكْرٍ", birthYear: null, deathYear: 58, location: "Medina", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Ibn Umar", nameArabic: "عَبْدُ اللَّهِ بْنُ عُمَرَ", birthYear: 10, deathYear: 73, location: "Medina", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ", "Umar ibn al-Khattab"] },
    { name: "Ali ibn Abi Talib", nameArabic: "عَلِيُّ بْنُ أَبِي طَالِبٍ", birthYear: null, deathYear: 40, location: "Kufa", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Muadh ibn Jabal", nameArabic: "مُعَاذُ بْنُ جَبَلٍ", birthYear: null, deathYear: 18, location: "Yemen", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Abu Dharr al-Ghifari", nameArabic: "أَبُو ذَرٍّ الْغِفَارِيُّ", birthYear: null, deathYear: 32, location: "Medina", reliability: "Thiqah (Trustworthy)", grade: "Sahabi", heardFrom: ["The Prophet Muhammad ﷺ"] },
    { name: "Zayn al-Abidin", nameArabic: "زَيْنُ الْعَابِدِينَ", birthYear: 38, deathYear: 94, location: "Medina", reliability: "Thiqah (Trustworthy)", grade: "Tabi'i", heardFrom: ["Anas ibn Malik", "Ibn Abbas"] },
    { name: "Imam al-Zuhri", nameArabic: "الإِمَامُ الزُّهْرِيُّ", birthYear: 51, deathYear: 124, location: "Medina", reliability: "Thiqah Hafiz", grade: "Tabi'i", heardFrom: ["Ibn Umar", "Anas ibn Malik", "Ibn Abbas"] },
    { name: "Imam Malik ibn Anas", nameArabic: "الإِمَامُ مَالِكُ بْنُ أَنَسٍ", birthYear: 93, deathYear: 179, location: "Medina", reliability: "Thiqah Hafiz Imam", grade: "Tabi' al-Tabi'in", heardFrom: ["Imam al-Zuhri", "Nafi' (servant of Ibn Umar)"] },
    { name: "Imam al-Shafi'i", nameArabic: "الإِمَامُ الشَّافِعِيُّ", birthYear: 150, deathYear: 204, location: "Mecca/Egypt", reliability: "Thiqah Imam", grade: "Later scholar", heardFrom: ["Imam Malik ibn Anas"] },
    { name: "Imam Ahmad ibn Hanbal", nameArabic: "الإِمَامُ أَحْمَدُ بْنُ حَنْبَلٍ", birthYear: 164, deathYear: 241, location: "Baghdad", reliability: "Thiqah Hafiz Imam", grade: "Later scholar", heardFrom: ["Imam al-Shafi'i", "Sufyan ibn Uyaynah"] },
  ];

  const narratorIds: Record<string, number> = {};
  for (const n of narrators) {
    const [inserted] = await db.insert(narratorsTable).values(n).onConflictDoNothing().returning();
    if (inserted) narratorIds[n.name] = inserted.id;
  }
  console.log(`✓ ${narrators.length} narrators seeded`);

  // ─── ISNAD for Nawawi Hadith 1 ────────────────────────────────────────────────
  const h1 = await db.select().from(hadithsTable).then(hs => hs.find(h => h.collectionId === "nawawi-40" && h.hadithNumber === "1"));
  if (h1) {
    const chain = [
      { name: "The Prophet Muhammad ﷺ", pos: 1 },
      { name: "Umar ibn al-Khattab", pos: 2 },
      { name: "Imam al-Zuhri", pos: 3 },
      { name: "Imam Malik ibn Anas", pos: 4 },
    ];
    const freshNarrators = await db.select().from(narratorsTable);
    for (const c of chain) {
      const narrator = freshNarrators.find(n => n.name === c.name);
      if (narrator) {
        await db.insert(hadithIsnadTable).values({ hadithId: h1.id, narratorId: narrator.id, position: c.pos }).onConflictDoNothing();
      }
    }
  }

  // ─── AYAH-HADITH LINKS ────────────────────────────────────────────────────────
  const allHadiths = await db.select().from(hadithsTable);
  const freshAyahs = await db.select().from(ayahsTable);

  const links: { ayahId: number; hadithId: number }[] = [];
  const bismillah = freshAyahs.find(a => a.surahId === surahMap[1] && a.ayahNumber === 1);
  const niyyahHadith = allHadiths.find(h => h.collectionId === "nawawi-40" && h.hadithNumber === "1");
  if (bismillah && niyyahHadith) links.push({ ayahId: bismillah.id, hadithId: niyyahHadith.id });

  const iyyaka = freshAyahs.find(a => a.surahId === surahMap[1] && a.ayahNumber === 5);
  const ihsanHadith = allHadiths.find(h => h.collectionId === "nawawi-40" && h.hadithNumber === "17");
  if (iyyaka && ihsanHadith) links.push({ ayahId: iyyaka.id, hadithId: ihsanHadith.id });

  const ayatKursi = freshAyahs.find(a => a.surahId === surahMap[2] && a.ayahNumber === 255);
  const tawhidHadith = allHadiths.find(h => h.collectionId === "nawawi-40" && h.hadithNumber === "2");
  if (ayatKursi && tawhidHadith) links.push({ ayahId: ayatKursi.id, hadithId: tawhidHadith.id });

  const laIkraha = freshAyahs.find(a => a.surahId === surahMap[2] && a.ayahNumber === 256);
  const bloodHadith = allHadiths.find(h => h.collectionId === "nawawi-40" && h.hadithNumber === "14");
  if (laIkraha && bloodHadith) links.push({ ayahId: laIkraha.id, hadithId: bloodHadith.id });

  if (links.length > 0) {
    await db.delete(ayahHadithLinksTable);
    await db.insert(ayahHadithLinksTable).values(links).onConflictDoNothing();
  }
  console.log(`✓ ${links.length} ayah-hadith links seeded`);

  console.log("\n🌙 Database seeded successfully!");
  console.log("   Run 'pnpm --filter @workspace/scripts run seed-quran-api' to import all 6,236 Quran ayahs from the API.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
