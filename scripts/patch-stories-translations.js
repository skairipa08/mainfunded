const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');

const storiesPageTranslations = {
    tr: {
        backToMain: "← Kampanyaya Dön",
        heroTitle: "Onların Hikayelerini Dinleyin",
        heroSubtitle: "Her ismin arkasında bir hayat, her alıntının arkasında bir çığlık var. Bu çocuklar gerçek ve sizin yardımınızı bekliyorlar.",
        ctaTitle: "Bu Hikayeleri Değiştirebilirsiniz",
        ctaSubtitle: "Her bağış, bu çocukların hikayelerine umut dolu yeni bir sayfa ekler.",
        elifStory: "Elif 8 yaşında ve fiziksel engelli. Her sabah okulun merdivenlerinin önünde bekliyor, arkadaşları sınıfa girerken o dışarıda kalıyor. Tekerlekli sandalyesi dar kapılardan geçemiyor. Ama Elif'in gözlerindeki ışık hiç sönmüyor — çünkü öğrenmeyi çok seviyor. Bir kitap eline geçtiğinde saatlerce okuyabiliyor. Tek istediği, diğer çocuklar gibi sırasına oturabilmek.",
        yusufStory: "Yusuf 6 yaşında ve doğuştan işitme engelli. Annesiyle iletişim kurmak için dudak okumayı öğrendi. Televizyondaki çocukların şarkı söylediğini görünce annesine 'Anne, onlar ne yapıyor?' diye sordu. O an annesi Ayşe Hanım'ın kalbi parçalandı. Yusuf'un bir işitme cihazı ile duyabileceği bir dünya var — kuş sesleri, müzik, annesinin 'seni seviyorum' demesi.",
        zeynepStory: "Zeynep 10 yaşında ve görme engelli. Kitaplardaki resimleri göremese de öğretmeni anlattığında hayal edebiliyor. Parmak uçlarıyla braille alfabesi öğrenmeye başladı. Bir gün doktor olmak istiyor — 'Göremesem de insanların acısını hissedebiliyorum' diyor. Zeynep'in hayali, görme engelliler için özel tasarlanmış bir tablet ile eğitimine devam edebilmek.",
        country4: "Bursa, Türkiye",
        quote4: "Diğer çocuklar sahada koşarken ben kenardan izliyorum. Keşke onlarla birlikte oynayabilsem...",
        condition4: "Otizm Spektrum",
        dream4: "Arkadaş edinmek",
        emreStory: "Emre 7 yaşında ve otizm spektrumunda. Okuldaki sesler ve kalabalık onu bunaltıyor. Teneffüste diğer çocuklar oynarken o bir köşede oturuyor. Ama Emre matematik dahisi — sayıları çok seviyor. Eğer duyusal bir oda olsa, Emre rahatça çalışabilir ve yeteneklerini gösterebilir. Tek ihtiyacı, onu anlayan bir ortam ve ona uygun eğitim araçları.",
        country5: "Antalya, Türkiye",
        quote5: "Harfleri karıştırıyorum, herkes bana tembel diyor. Ama ben çok çalışıyorum, sadece farklı öğreniyorum...",
        condition5: "Disleksi",
        dream5: "Kitap yazabilmek",
        aylinStory: "Aylin 9 yaşında ve disleksi tanısı almış. Harfleri ve sayıları karıştırıyor, okumakta zorlanıyor. Sınıf arkadaşları onu 'tembel' diye aşağılıyor ama Aylin her gece saatlerce çalışıyor. Hikaye anlatmayı çok seviyor — ağzından harika masallar dökülüyor. Eğer özel eğitim desteği alabilse, bir gün kendi kitabını yazabilir.",
        country6: "Diyarbakır, Türkiye",
        quote6: "Yürümeyi öğrenmek istiyorum. Annemin elini tutarak bahçede yürümek en büyük hayalim...",
        condition6: "Serebral Palsi",
        dream6: "Yürüyebilmek",
        canStory: "Can 5 yaşında ve serebral palsi ile doğdu. Henüz tek başına yürüyemiyor. Her gün fizik tedaviye gitmesi gerekiyor ama ailesi masrafları karşılayamıyor. Can'ın en büyük hayali, annesinin elini tutarak bahçede yürümek. 'Ağaçlara dokunmak istiyorum' diyor. Düzenli fizik tedavi ile Can yürüme şansına sahip olabilir."
    },
    en: {
        backToMain: "← Back to Campaign",
        heroTitle: "Hear Their Stories",
        heroSubtitle: "Behind every name is a life, behind every quote is a cry. These children are real and waiting for your help.",
        ctaTitle: "You Can Change These Stories",
        ctaSubtitle: "Every donation adds a new page of hope to these children's stories.",
        elifStory: "Elif is 8 years old and physically disabled. Every morning she waits in front of the school stairs as her friends walk into class while she stays outside. Her wheelchair doesn't fit through the narrow doors. But the light in Elif's eyes never fades — because she loves learning. When she gets her hands on a book, she can read for hours. All she wants is to sit at her desk like other children.",
        yusufStory: "Yusuf is 6 years old and born with hearing impairment. He learned to lip-read to communicate with his mother. When he saw children singing on TV, he asked his mother, 'Mom, what are they doing?' That moment shattered his mother Ayşe's heart. With a hearing aid, Yusuf could discover a world of sound — birdsong, music, his mother saying 'I love you.'",
        zeynepStory: "Zeynep is 10 years old and visually impaired. Although she can't see pictures in books, she imagines them when her teacher describes them. She has started learning braille. She wants to be a doctor someday — 'Even if I can't see, I can feel people's pain,' she says. Zeynep's dream is to continue her education with a specially designed tablet for the visually impaired.",
        country4: "Bursa, Turkey",
        quote4: "While other kids run on the field, I watch from the sideline. I wish I could play with them...",
        condition4: "Autism Spectrum",
        dream4: "Make friends",
        emreStory: "Emre is 7 years old and on the autism spectrum. The noise and crowds at school overwhelm him. While other children play during recess, he sits in a corner. But Emre is a math genius — he loves numbers. If there were a sensory room, Emre could work comfortably and showcase his talents. All he needs is an environment that understands him and educational tools suited to his needs.",
        country5: "Antalya, Turkey",
        quote5: "I mix up letters, everyone calls me lazy. But I work so hard, I just learn differently...",
        condition5: "Dyslexia",
        dream5: "Write a book",
        aylinStory: "Aylin is 9 years old and diagnosed with dyslexia. She mixes up letters and numbers, and struggles with reading. Her classmates mock her as 'lazy' but Aylin studies for hours every night. She loves storytelling — wonderful tales flow from her lips. With special education support, she could write her own book someday.",
        country6: "Diyarbakır, Turkey",
        quote6: "I want to learn to walk. Walking in the garden holding my mom's hand is my biggest dream...",
        condition6: "Cerebral Palsy",
        dream6: "Be able to walk",
        canStory: "Can is 5 years old and born with cerebral palsy. He still can't walk on his own. He needs daily physical therapy but his family can't afford the expenses. Can's biggest dream is to walk in the garden holding his mother's hand. 'I want to touch the trees,' he says. With regular physical therapy, Can could have a chance to walk."
    }
};

// Copy English as base for other languages
const otherLocales = ['de', 'es', 'fr', 'ar', 'ru', 'zh'];
for (const loc of otherLocales) {
    storiesPageTranslations[loc] = { ...storiesPageTranslations.en };
}

for (const [locale, data] of Object.entries(storiesPageTranslations)) {
    const fp = path.join(localesDir, `${locale}.json`);
    const content = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (content.specialNeeds) {
        content.specialNeeds.storiesPage = data;
    }
    fs.writeFileSync(fp, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✅ ${locale}.json`);
}
console.log('Done!');
