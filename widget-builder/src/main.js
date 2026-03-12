(function () {
    function initWidget() {
        const containers = document.querySelectorAll('.funded-campaign-widget');
        containers.forEach(container => {
            // Prevent multiple initializations
            if (container.dataset.loaded) return;
            container.dataset.loaded = 'true';

            const campaignId = container.dataset.campaignId;
            const theme = container.dataset.theme || 'light';
            const locale = container.dataset.locale || 'tr';
            const origin = container.dataset.origin || 'https://fund-ed.com';

            if (!campaignId) {
                console.warn('FundEd Widget: Missing data-campaign-id attribute');
                return;
            }

            const iframe = document.createElement('iframe');
            // Create iframe source url
            iframe.src = `${origin}/${locale}/embed/campaign/${campaignId}?theme=${theme}`;

            // Inline styles for iframe injection to guarantee responsive design
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.minHeight = '360px'; // ensure we have enough height
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.overflow = 'hidden';
            iframe.loading = 'lazy'; // Lazy load explicitly requested

            // Setup container styles to match iframe behavior
            container.style.display = 'block';
            container.style.width = '100%';
            container.style.maxWidth = '600px';
            container.style.minWidth = '300px';

            // Clear container loading state if any, and append iframe
            container.innerHTML = '';
            container.appendChild(iframe);
        });
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

    // Expose to global for dynamic initialization if needed (e.g. Single Page Apps)
    window.FundedWidget = { init: initWidget };
})();
