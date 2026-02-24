
export const DEMO_CAMPAIGNS = [
    {
        _id: 'demo_campaign_1', // MongoDB usually uses _id
        campaign_id: 'campaign_demo_001',
        owner_id: 'demo_user_baran',
        title: "Baran's Lab & Capstone Project Support",
        story: `Hi, I’m Baran, an Electrical & Electronics Engineering student at Duzce University. This semester I’m working on my capstone and lab projects and need essential parts like components, sensors, and PCB fabrication. I also need a few basic measurement tools and software/license access to complete the work properly. Because the semester schedule is tight, this support directly helps me finish on time. I will share progress updates and a clear breakdown of spending. Your help directly translates into the ability to build and deliver.

---
[Turkish / Türkçe]
Merhaba, ben Baran. Düzce Üniversitesi Elektrik Elektronik Mühendisliği öğrencisiyim. Bu dönem bitirme projem ve laboratuvar çalışmalarım için elektronik komponentler, sensörler ve PCB üretimi gibi temel kalemlere ihtiyacım var. Ayrıca test/ölçüm için gerekli bazı araçlar ve proje sürecinde kullanacağım yazılım/lisans maliyetleri bulunuyor. Dönem takvimi sıkışık olduğu için bu destek, projemi zamanında tamamlamam için kritik. Süreç boyunca gelişmeleri ve harcama kalemlerini düzenli paylaşacağım. Desteğiniz benim için doğrudan "çalışabilme imkanı" demek.

**Use of Funds:**
- $350 components & sensors
- $300 PCB fabrication + assembly
- $250 measurement/tools
- $200 software/license
- $150 shipping & contingency`,
        category: 'education', // Lowercase to match value="education" usually, verifying against typical category IDs
        goal_amount: 1250,
        raised_amount: 0,
        donor_count: 0,
        status: 'published',
        country: 'Turkey',
        field_of_study: 'Engineering',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Enriched student data
        student: {
            name: 'Baran Deniz',
            picture: null, // Placeholder
            country: 'Turkey',
            field_of_study: 'Electrical & Electronics Engineering',
            university: 'Düzce University',
            verification_status: 'verified', // Tier 1/2 equivalent
        }
    },
    {
        _id: 'demo_campaign_2',
        campaign_id: 'campaign_demo_002',
        owner_id: 'demo_user_ozge',
        title: "Monthly Scholarship for Özge: Transportation & Study Resources",
        story: `Hi, I’m Ozge, a Materials & Metallurgy Engineering student at Sakarya University. Student life isn’t only about classes—transportation, lab work, printing, and study materials create ongoing monthly costs. That’s why a stable monthly scholarship makes more sense for me than a one-time donation. My goal is to cover transportation, essential resources, and small lab-related expenses so I can stay consistent with coursework and lab practice. I’ll share short monthly updates and a term-end summary of progress. Your support helps me keep going without interruptions.

---
[Turkish / Türkçe]
Merhaba, ben Özge. Sakarya Üniversitesi Malzeme Metalürji Mühendisliği öğrencisiyim. Üniversite hayatı sadece derslerden ibaret değil; ulaşım, laboratuvar çalışmaları, yazdırma ve kaynak/kitap gibi masraflar her ay düzenli devam ediyor. Bu nedenle tek seferlik bir destekten çok, daha stabil bir şekilde aylık burs desteği benim için daha anlamlı. Aylık hedefim; okula ulaşım, gerekli ders kaynakları ve laboratuvarla ilgili küçük giderleri karşılamak. Her ay kısa bir ilerleme notu ve dönem sonunda genel bir durum özeti paylaşacağım. Amacım, derslere ve laboratuvar çalışmalarına kesintisiz devam edebilmek.

**Monthly Breakdown:**
- $85 transportation
- $55 books/resources
- $25 printing/materials
- $15 lab-related small expenses
= $180 total`,
        category: 'scholarship', // or education
        goal_amount: 180, // Monthly target
        raised_amount: 0,
        donor_count: 0,
        status: 'published',
        country: 'Turkey',
        field_of_study: 'Engineering',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Enriched student data
        student: {
            name: 'Özge Karabaş',
            picture: null,
            country: 'Turkey',
            field_of_study: 'Materials & Metallurgy Engineering',
            university: 'Sakarya University',
            verification_status: 'verified',
        }
    }
];

export function getDemoCampaigns(params: Record<string, string>): any[] {
    let results = [...DEMO_CAMPAIGNS];

    // Search filter
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        results = results.filter(c =>
            c.title.toLowerCase().includes(searchLower) ||
            c.story.toLowerCase().includes(searchLower) ||
            c.student.name.toLowerCase().includes(searchLower)
        );
    }

    // Category filter
    // Note: The category IDs in the app might be UUIDs. 
    // If the filters send names, we match loosely. If IDs, we might need to adjust.
    // For now assuming the select values pass keys like 'education' or IDs. 
    // Given the lack of ID map, we'll try to match exact or partial.
    if (params.category && params.category !== 'all') {
        results = results.filter(c => c.category === params.category || c.category === 'education');
        // Force match for demo purposes if category logic is complex
    }

    // Country filter
    if (params.country && params.country !== 'all') {
        results = results.filter(c => c.country === params.country || c.student.country === params.country);
    }

    // Field of Study filter
    if (params.field_of_study && params.field_of_study !== 'all') {
        results = results.filter(c =>
            c.field_of_study === params.field_of_study ||
            c.student.field_of_study === params.field_of_study ||
            c.student.field_of_study.includes(params.field_of_study)
        );
    }

    return results;
}
