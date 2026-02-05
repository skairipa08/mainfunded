/**
 * Utility functions for name censoring/privacy
 */

/**
 * Censors surname by keeping only the first letter followed by asterisks
 * Example: "Ayse Yilmaz" -> "Ayse Y***"
 * 
 * @param fullName - Full name (first name + surname)
 * @param censorSurname - Whether to censor the surname
 * @returns Censored or original name
 */
export function censorSurname(fullName: string, censorSurname: boolean = true): string {
    if (!censorSurname || !fullName) return fullName;

    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName;

    const firstName = parts.slice(0, -1).join(' ');
    const surname = parts[parts.length - 1];

    if (surname.length <= 1) return fullName;

    const censoredSurname = surname[0] + '***';
    return `${firstName} ${censoredSurname}`;
}

/**
 * Gets initials from a name, respecting censoring preference
 * Example: "Ayse Yilmaz" with censoring -> "AY" (still shows initial)
 */
export function getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('');
}
