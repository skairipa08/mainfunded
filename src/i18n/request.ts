import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['tr', 'en'];

export default getRequestConfig(async (config) => {
    console.log("REQUEST CONFIG IS:", config);
    let locale = (config as any).locale;
    if (!locale && (config as any).requestLocale) {
        locale = await (config as any).requestLocale;
    }

    console.log("RESOLVED LOCALE:", locale);

    if (!locales.includes(locale as any)) {
        console.log("NOT FOUND LOCALE:", locale);
        notFound();
    }

    try {
        const messages = (await import(`../../messages/${locale}.json`)).default;
        return {
            locale: locale as string,
            messages
        };
    } catch (e) {
        console.error("FAILED TO LOAD MESSAGES FOR:", locale, e);
        notFound();
    }
});
