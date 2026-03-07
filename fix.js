const fs = require('fs');

let card = fs.readFileSync('components/CampaignCard.tsx', 'utf8');
card = card.replace(
    '{campaign.isPublished',
    `{campaign.condition && (
              <span className="bg-purple-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm truncate max-w-[120px]">
                {campaign.condition}
              </span>
            )}
            {campaign.isPublished`
);
fs.writeFileSync('components/CampaignCard.tsx', card);

let bw = fs.readFileSync('app/browse/page-wrapper.tsx', 'utf8');
bw = bw.replace(
    /const res = await getCampaigns\(params\);\s*setCampaigns\(res\.data \|\| \[\]\);\s*setPagination\(res\.pagination \|\| \{ total: 0, page: 1, total_pages: 0 \}\);/,
    `const res = await getCampaigns(params);
        let fetchedCampaigns = res.data || [];

        // --- Inject special needs stories if we are on page 1 and they match filters ---
        if (params.page === 1) {
          const staticStories = [
            {
              campaign_id: 'special-needs-story-Elif',
              title: t('specialNeeds.stories.condition1') !== 'specialNeeds.stories.condition1' ? t('specialNeeds.stories.condition1') + ' / Elif' : 'Otizm / Elif',
              status: 'published',
              student: { name: 'Elif', country: t('specialNeeds.stories.country1') !== 'specialNeeds.stories.country1' ? t('specialNeeds.stories.country1') : 'Türkiye', verification_status: 'verified' },
              raised_amount: 0,
              goal_amount: 50000,
              donor_count: 0,
              category: 'special-needs',
              cover_image: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=80&auto=format&fit=crop',
              story: t('specialNeeds.stories.quote1') !== 'specialNeeds.stories.quote1' ? t('specialNeeds.stories.quote1') : '',
              condition: t('specialNeeds.stories.condition1') !== 'specialNeeds.stories.condition1' ? t('specialNeeds.stories.condition1') : 'Otizm',
              isPublished: true,
              tier_approved: 1
            },
            {
              campaign_id: 'special-needs-story-Yusuf',
              title: t('specialNeeds.stories.condition2') !== 'specialNeeds.stories.condition2' ? t('specialNeeds.stories.condition2') + ' / Yusuf' : 'İşitme Engelli / Yusuf',
              status: 'published',
              student: { name: 'Yusuf', country: t('specialNeeds.stories.country2') !== 'specialNeeds.stories.country2' ? t('specialNeeds.stories.country2') : 'Suriye', verification_status: 'verified' },
              raised_amount: 0,
              goal_amount: 50000,
              donor_count: 0,
              category: 'special-needs',
              cover_image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80&auto=format&fit=crop',
              story: t('specialNeeds.stories.quote2') !== 'specialNeeds.stories.quote2' ? t('specialNeeds.stories.quote2') : '',
              condition: t('specialNeeds.stories.condition2') !== 'specialNeeds.stories.condition2' ? t('specialNeeds.stories.condition2') : 'İşitme Engelli',
              isPublished: true,
              tier_approved: 1
            },
            {
              campaign_id: 'special-needs-story-Zeynep',
              title: t('specialNeeds.stories.condition3') !== 'specialNeeds.stories.condition3' ? t('specialNeeds.stories.condition3') + ' / Zeynep' : 'Görme Engelli / Zeynep',
              status: 'published',
              student: { name: 'Zeynep', country: t('specialNeeds.stories.country3') !== 'specialNeeds.stories.country3' ? t('specialNeeds.stories.country3') : 'Türkiye', verification_status: 'verified' },
              raised_amount: 0,
              goal_amount: 50000,
              donor_count: 0,
              category: 'special-needs',
              cover_image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&auto=format&fit=crop',
              story: t('specialNeeds.stories.quote3') !== 'specialNeeds.stories.quote3' ? t('specialNeeds.stories.quote3') : '',
              condition: t('specialNeeds.stories.condition3') !== 'specialNeeds.stories.condition3' ? t('specialNeeds.stories.condition3') : 'Görme Engelli',
              isPublished: true,
              tier_approved: 1
            }
          ];

          const filteredStories = staticStories.filter(story => {
            if (params.category && params.category !== "all" && story.category !== params.category) return false;
            if (params.search && !story.student.name.toLowerCase().includes(params.search.toLowerCase()) && !story.title.toLowerCase().includes(params.search.toLowerCase()) && !story.condition.toLowerCase().includes(params.search.toLowerCase())) return false;
            return true;
          });

          fetchedCampaigns = [...filteredStories, ...fetchedCampaigns];
        }

        setCampaigns(fetchedCampaigns);
        setPagination(res.pagination || { total: 0, page: 1, total_pages: 0 });`
);
fs.writeFileSync('app/browse/page-wrapper.tsx', bw);

console.log('done!');
