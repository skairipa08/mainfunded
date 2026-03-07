const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

const translations = {
    tr: {
        specialNeeds: {
            badge: "🚨 Acil Yardım Kampanyası",
            heroTitle1: "Her Çocuk",
            heroTitle2: "Sevgiyi Hak Eder",
            heroAlt: "Özel gereksinimli çocuklar",
            heroSubtitle: "Türkiye'de <strong>3 milyondan fazla</strong> özel gereksinimli çocuk, temel eğitim ve terapi hizmetlerine erişemiyor. Onların gülüşü için bugün bir adım atın.",
            heroUrgency: "Bu çocuklar her geçen gün fırsatlarını kaybediyor — beklemeye tahammülleri yok.",
            donateNow: "Şimdi Bağış Yap",
            hearStories: "Hikayelerini Dinle",
            raised: "Toplanan",
            goal: "Hedef",
            completed: "tamamlandı",
            donors: "bağışçı",
            heroProgressNote: "Her bağış bir çocuğun hayatında umut ışığı olur.",
            exploreCampaign: "Kampanyayı Keşfet",
            otherAmount: "Başka bir tutar...",
            allSecure: "🔒 Tüm bağışlar güvenli altyapı ile işlenir.",
            transparencyPolicy: "Şeffaflık Politikamız",
            emotionalQuote: {
                text: "Bir çocuğun elinden tutmak, sadece ona yardım etmek değil — kendi insanlığınızı hatırlamaktır.",
                subtext: "Bu çocukların tek ihtiyacı bir şans. O şansı verecek olan sizsiniz.",
                author: "FundEd Ailesi",
                cta: "Bir Çocuğun Elinden Tut"
            },
            stats: {
                childrenSupported: "Desteklenen Çocuk",
                countries: "Aktif Ülke",
                donorCount: "Bağışçı",
                fundingRate: "Fonlama Oranı"
            },
            challenge: {
                badge: "Gerçeği Görelim",
                title: "Onlar Görünmez Değil, Görmezden Geliniyor",
                subtitle: "Dünyada 240 milyondan fazla engelli çocuk var. Çoğu eğitimden, sağlıktan ve sevgiden mahrum bırakılıyor.",
                imgAlt1: "Terapi alan çocuk",
                imgAlt2: "Öğrenme etkinliği",
                imgAlt3: "Oyun oynayan çocuklar",
                imgAlt4: "Kapsayıcı eğitim",
                fact1: "Dünya genelinde 240 milyon çocuk engellilik ile yaşıyor — her 10 çocuktan biri.",
                fact2: "Gelişmekte olan ülkelerde engelli çocukların %90'ı okula gidemiyor.",
                fact3: "Engelli çocukların yarısından fazlası hiçbir terapi veya destek almıyor.",
                fact4: "Engelli her 10 çocuktan sadece 1'i eğitime erişebiliyor.",
                fact5: "ile bir çocuğa bir haftalık terapi desteği sağlayabilirsiniz."
            },
            stories: {
                badge: "Gerçek Hikayeler",
                title: "Bu Gözler Sizden Umut Bekliyor",
                subtitle: "Her isim bir hayat, her alıntı bir çığlık. Bu çocuklar gerçek ve yardımınızı bekliyorlar.",
                yearsOld: "yaşında",
                country1: "İstanbul, Türkiye",
                country2: "Ankara, Türkiye",
                country3: "İzmir, Türkiye",
                quote1: "Arkadaşlarım gibi okulda oturup ders dinlemek istiyorum ama tekerlekli sandalyem sınıfa sığmıyor...",
                quote2: "Annemin sesini duyamıyorum ama gülüşünü hissedebiliyorum. Keşke ona 'seni seviyorum' diyebilsem...",
                quote3: "Kitaplardaki resimleri göremiyorum ama öğretmenim bana anlattığında hayal edebiliyorum. Keşke görebilsem...",
                condition1: "Fiziksel Engel",
                condition2: "İşitme Engeli",
                condition3: "Görme Engeli",
                dream1: "Okula gitmek",
                dream2: "Konuşabilmek",
                dream3: "Görebilmek",
                helpChild: "{name} için bağış yap"
            },
            coffee: {
                badge: "Küçük Bağış, Büyük Etki",
                title: "Bir Kahve Parası Bile Hayat Değiştirir",
                subtitle: "Vazgeçtiğiniz bir kahve ya da atıştırmalık, bir çocuğun hayatında mucize yaratabilir.",
                impact1: "Bir çocuğa bir haftalık eğitim materyali sağlar.",
                impact2: "Bir çocuğa bir aylık sanat terapisi desteği verir.",
                impact3: "Özel eğitim sınıfına duyusal oyuncak seti kazandırır.",
                impact4: "Bir çocuğa üç aylık konuşma terapisi sağlar.",
                selectAmount: "Bu tutarı seç →",
                emotionalNote: "\"Dünyanın en güzel sesi, yardım ettiğiniz bir çocuğun gülüşüdür.\""
            },
            impact: {
                badge: "Etki Alanlarımız",
                title: "Bağışınız Nereye Gidiyor?",
                subtitle: "Her kuruş, bir çocuğun hayatına dokunuyor. İşte bağışlarınızın yarattığı somut etki.",
                assistiveTech: "Yardımcı Teknoloji",
                assistiveTechDesc: "Tekerlekli sandalye, işitme cihazı, konuşma tabletleri ve özel yazılımlar ile çocukların dünyayla bağ kurmasını sağlıyoruz.",
                therapy: "Terapi Desteği",
                therapyDesc: "Fizik tedavi, konuşma terapisi, ergoterapi ve psikolojik destek ile çocukların gelişimine katkıda bulunuyoruz.",
                inclusiveClassroom: "Kapsayıcı Sınıflar",
                inclusiveClassroomDesc: "Engelsiz sınıf ortamları oluşturarak her çocuğun eğitime eşit erişimini sağlıyoruz.",
                teacherTraining: "Öğretmen Eğitimi",
                teacherTrainingDesc: "Öğretmenlere özel eğitim yöntemleri ve kapsayıcı pedagoji eğitimi veriyoruz.",
                sensoryRooms: "Duyusal Odalar",
                sensoryRoomsDesc: "Otizmli ve duyusal hassasiyeti olan çocuklar için özel tasarlanmış terapi odaları kuruyoruz.",
                joinCard: "Bu Çocukların Sesi Olun",
                joinCardDesc: "Bir bağışla bir çocuğun hayatını değiştirebilirsiniz. Onların gülüşü, sizin eseriniz olsun.",
                donate: "Hayat Değiştir"
            },
            parentLetter: {
                badge: "Bir Annenin Mektubu",
                title: "Bir Anne Yazıyor",
                text: "Oğlum Yusuf 6 yaşında ve işitme engelli. Her gece yatmadan önce dudaklarımı okuyor, 'iyi geceler' dememi bekliyor. İşitme cihazı alacak paramız yok. Bir keresinde televizyondaki çocukların şarkı söylediğini gördü ve bana dönerek 'Anne, onlar ne yapıyor?' diye sordu. O an kalbim parçalandı. Yusuf'un da diğer çocuklar gibi şarkı duymasını, kuş seslerini duymasını, benim sesimi duymasını istiyorum. Lütfen bize yardım edin.",
                author: "Ayşe Hanım",
                role: "Yusuf'un annesi, Ankara"
            },
            transparency: {
                badge: "Şeffaflık Taahhüdü",
                title: "Bağışınızın Her Kuruşu Takip Edilir",
                step1: "Bağış Yapın",
                step1Desc: "Güvenli ödeme sistemiyle dilediğiniz tutarda bağış yapın.",
                step2: "Doğrulama",
                step2Desc: "Her çocuğun ihtiyacı uzman ekibimiz tarafından doğrulanır.",
                step3: "Ulaştırma",
                step3Desc: "Bağışınız doğrudan çocuğun ihtiyacına yönlendirilir.",
                step4: "Etki Raporu",
                step4Desc: "Bağışınızın yarattığı etkiyi fotoğraf ve verilerle görürsünüz."
            },
            awareness: {
                badge: "Farkındalık",
                title: "Özel Gereksinimleri Anlamak",
                subtitle: "Her çocuk farklıdır ve her birinin kendine özgü ihtiyaçları vardır.",
                autism: "Otizm Spektrum",
                autismDesc: "Her 36 çocuktan biri otizm spektrumunda. Erken müdahale ve doğru eğitimle bu çocuklar inanılmaz başarılar elde edebilir.",
                visual: "Görme Engeli",
                visualDesc: "Dünyada 19 milyon çocuk görme engelli. Doğru araçlar ve eğitimle onlar da hayallerine ulaşabilir.",
                hearing: "İşitme Engeli",
                hearingDesc: "34 milyon çocuk işitme kaybı yaşıyor. İşitme cihazları ve işaret dili eğitimi hayatlarını değiştirebilir.",
                learning: "Öğrenme Güçlüğü",
                learningDesc: "Disleksi, diskalkuli gibi öğrenme güçlükleri yaşayan çocuklar özel yöntemlerle başarılı olabilir."
            },
            ctaTitle: "Bir Çocuğun Hayatını Değiştirin",
            ctaSubtitle: "Şu an bu sayfayı okuyan siz, bir çocuğun hayatındaki dönüm noktası olabilirsiniz.",
            ctaEmotional: "\"Yarın değil, bugün. Çünkü o çocukların yarını sizin bugününüze bağlı.\"",
            share: {
                title: "Bu Sesi Duyurun",
                subtitle: "Paylaşarak daha fazla çocuğa umut olabilirsiniz.",
                copyLink: "Bağlantıyı Kopyala"
            }
        }
    },
    en: {
        specialNeeds: {
            badge: "🚨 Urgent Help Campaign",
            heroTitle1: "Every Child",
            heroTitle2: "Deserves Love",
            heroAlt: "Special needs children",
            heroSubtitle: "Over <strong>3 million</strong> special needs children in Turkey cannot access basic education and therapy services. Take a step today for their smiles.",
            heroUrgency: "These children lose opportunities every passing day — they can't wait.",
            donateNow: "Donate Now",
            hearStories: "Hear Their Stories",
            raised: "Raised",
            goal: "Goal",
            completed: "completed",
            donors: "donors",
            heroProgressNote: "Every donation becomes a light of hope in a child's life.",
            exploreCampaign: "Explore Campaign",
            otherAmount: "Other amount...",
            allSecure: "🔒 All donations are processed through secure infrastructure.",
            transparencyPolicy: "Our Transparency Policy",
            emotionalQuote: {
                text: "Holding a child's hand is not just helping them — it's remembering your own humanity.",
                subtext: "All these children need is a chance. You are the one who can give it.",
                author: "FundEd Family",
                cta: "Hold a Child's Hand"
            },
            stats: {
                childrenSupported: "Children Supported",
                countries: "Active Countries",
                donorCount: "Donors",
                fundingRate: "Funding Rate"
            },
            challenge: {
                badge: "Face the Reality",
                title: "They're Not Invisible, They're Being Ignored",
                subtitle: "There are over 240 million children with disabilities worldwide. Most are deprived of education, healthcare, and love.",
                imgAlt1: "Child receiving therapy",
                imgAlt2: "Learning activity",
                imgAlt3: "Children playing",
                imgAlt4: "Inclusive education",
                fact1: "240 million children worldwide live with disabilities — 1 in every 10 children.",
                fact2: "90% of children with disabilities in developing countries cannot go to school.",
                fact3: "More than half of children with disabilities receive no therapy or support.",
                fact4: "Only 1 in 10 children with disabilities can access education.",
                fact5: "can provide a week of therapy support for a child."
            },
            stories: {
                badge: "Real Stories",
                title: "These Eyes Are Waiting for Hope From You",
                subtitle: "Each name is a life, each quote is a cry. These children are real and waiting for your help.",
                yearsOld: "years old",
                country1: "Istanbul, Turkey",
                country2: "Ankara, Turkey",
                country3: "Izmir, Turkey",
                quote1: "I want to sit and listen to lessons like my friends, but my wheelchair doesn't fit in the classroom...",
                quote2: "I can't hear my mother's voice, but I can feel her smile. I wish I could tell her 'I love you'...",
                quote3: "I can't see the pictures in books, but I can imagine when my teacher tells me. I wish I could see...",
                condition1: "Physical Disability",
                condition2: "Hearing Impairment",
                condition3: "Visual Impairment",
                dream1: "Go to school",
                dream2: "Be able to speak",
                dream3: "Be able to see",
                helpChild: "Donate for {name}"
            },
            coffee: {
                badge: "Small Donation, Big Impact",
                title: "Even a Coffee's Worth Changes a Life",
                subtitle: "A coffee or snack you give up can create a miracle in a child's life.",
                impact1: "Provides a week of educational materials for a child.",
                impact2: "Gives a month of art therapy support to a child.",
                impact3: "Provides a sensory toy set for a special education classroom.",
                impact4: "Provides three months of speech therapy for a child.",
                selectAmount: "Select this amount →",
                emotionalNote: "\"The most beautiful sound in the world is the laughter of a child you helped.\""
            },
            impact: {
                badge: "Our Impact Areas",
                title: "Where Does Your Donation Go?",
                subtitle: "Every penny touches a child's life. Here is the concrete impact your donations create.",
                assistiveTech: "Assistive Technology",
                assistiveTechDesc: "We help children connect with the world through wheelchairs, hearing aids, speech tablets, and specialized software.",
                therapy: "Therapy Support",
                therapyDesc: "We contribute to children's development through physical therapy, speech therapy, occupational therapy, and psychological support.",
                inclusiveClassroom: "Inclusive Classrooms",
                inclusiveClassroomDesc: "We ensure every child has equal access to education by creating barrier-free classroom environments.",
                teacherTraining: "Teacher Training",
                teacherTrainingDesc: "We train teachers in special education methods and inclusive pedagogy.",
                sensoryRooms: "Sensory Rooms",
                sensoryRoomsDesc: "We build specially designed therapy rooms for children with autism and sensory sensitivities.",
                joinCard: "Be the Voice of These Children",
                joinCardDesc: "You can change a child's life with a donation. Let their smile be your masterpiece.",
                donate: "Change a Life"
            },
            parentLetter: {
                badge: "A Mother's Letter",
                title: "A Mother Writes",
                text: "My son Yusuf is 6 years old and hearing impaired. Every night before bed, he reads my lips, waiting for me to say 'good night.' We can't afford a hearing aid. Once he saw children singing on TV and turned to me asking, 'Mom, what are they doing?' My heart shattered at that moment. I want Yusuf to hear songs like other children, to hear birdsong, to hear my voice. Please help us.",
                author: "Mrs. Ayşe",
                role: "Yusuf's mother, Ankara"
            },
            transparency: {
                badge: "Transparency Commitment",
                title: "Every Penny of Your Donation Is Tracked",
                step1: "Make a Donation",
                step1Desc: "Donate any amount through our secure payment system.",
                step2: "Verification",
                step2Desc: "Every child's needs are verified by our expert team.",
                step3: "Delivery",
                step3Desc: "Your donation is directed to the child's specific needs.",
                step4: "Impact Report",
                step4Desc: "See the impact of your donation with photos and data."
            },
            awareness: {
                badge: "Awareness",
                title: "Understanding Special Needs",
                subtitle: "Every child is different, and each has unique needs.",
                autism: "Autism Spectrum",
                autismDesc: "1 in 36 children is on the autism spectrum. With early intervention and proper education, these children can achieve incredible things.",
                visual: "Visual Impairment",
                visualDesc: "19 million children worldwide are visually impaired. With the right tools and education, they can reach their dreams too.",
                hearing: "Hearing Impairment",
                hearingDesc: "34 million children experience hearing loss. Hearing aids and sign language education can change their lives.",
                learning: "Learning Difficulties",
                learningDesc: "Children with learning difficulties like dyslexia and dyscalculia can succeed with specialized methods."
            },
            ctaTitle: "Change a Child's Life",
            ctaSubtitle: "You, reading this page right now, can be the turning point in a child's life.",
            ctaEmotional: "\"Not tomorrow, today. Because those children's tomorrow depends on your today.\"",
            share: {
                title: "Spread the Word",
                subtitle: "By sharing, you can bring hope to more children.",
                copyLink: "Copy Link"
            }
        }
    }
};

// Compact translations for other languages (key structure same as en)
translations.de = { specialNeeds: JSON.parse(JSON.stringify(translations.en.specialNeeds)) };
translations.es = { specialNeeds: JSON.parse(JSON.stringify(translations.en.specialNeeds)) };
translations.fr = { specialNeeds: JSON.parse(JSON.stringify(translations.en.specialNeeds)) };
translations.ar = { specialNeeds: JSON.parse(JSON.stringify(translations.en.specialNeeds)) };
translations.ru = { specialNeeds: JSON.parse(JSON.stringify(translations.en.specialNeeds)) };
translations.zh = { specialNeeds: JSON.parse(JSON.stringify(translations.en.specialNeeds)) };

// German overrides
const de = translations.de.specialNeeds;
de.badge = "🚨 Dringende Hilfskampagne";
de.heroTitle1 = "Jedes Kind";
de.heroTitle2 = "Verdient Liebe";
de.donateNow = "Jetzt Spenden";
de.ctaTitle = "Verändern Sie das Leben eines Kindes";

// Spanish overrides
const es = translations.es.specialNeeds;
es.badge = "🚨 Campaña de Ayuda Urgente";
es.heroTitle1 = "Cada Niño";
es.heroTitle2 = "Merece Amor";
es.donateNow = "Donar Ahora";
es.ctaTitle = "Cambia la Vida de un Niño";

// French overrides
const fr = translations.fr.specialNeeds;
fr.badge = "🚨 Campagne d'Aide Urgente";
fr.heroTitle1 = "Chaque Enfant";
fr.heroTitle2 = "Mérite l'Amour";
fr.donateNow = "Faire un Don";
fr.ctaTitle = "Changez la Vie d'un Enfant";

// Arabic overrides
const ar = translations.ar.specialNeeds;
ar.badge = "🚨 حملة مساعدة عاجلة";
ar.heroTitle1 = "كل طفل";
ar.heroTitle2 = "يستحق الحب";
ar.donateNow = "تبرع الآن";
ar.ctaTitle = "غيّر حياة طفل";

// Russian overrides
const ru = translations.ru.specialNeeds;
ru.badge = "🚨 Срочная кампания помощи";
ru.heroTitle1 = "Каждый ребёнок";
ru.heroTitle2 = "Заслуживает любви";
ru.donateNow = "Пожертвовать сейчас";
ru.ctaTitle = "Измените жизнь ребёнка";

// Chinese overrides
const zh = translations.zh.specialNeeds;
zh.badge = "🚨 紧急援助活动";
zh.heroTitle1 = "每个孩子";
zh.heroTitle2 = "都值得被爱";
zh.donateNow = "立即捐款";
zh.ctaTitle = "改变一个孩子的生命";

// Inject into locale files
const locales = ['tr', 'en', 'de', 'es', 'fr', 'ar', 'ru', 'zh'];

for (const locale of locales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Add specialNeeds translations
    content.specialNeeds = translations[locale].specialNeeds;

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${locale}.json`);
}

console.log('\n🎉 All locale files updated with specialNeeds translations!');
