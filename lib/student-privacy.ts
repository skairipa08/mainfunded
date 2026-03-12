// Types for privacy masking

export type ViewerRole = 'EVERYONE' | 'DONORS_ONLY';

/**
 * Applies privacy settings to a student profile based on the viewer's role.
 * 
 * @param profile The raw student profile
 * @param settings The privacy settings for this student
 * @param viewerRole The role of the person viewing the profile
 * @returns An object with the allowed data. If a field is restricted, it will be mapped to null.
 */
export function applyPrivacySettings(
    profile: any, // Using any here to bypass exact Prisma type checking if Prisma client isn't generated
    settings: any,
    viewerRole: ViewerRole
) {
    // Helper to determine if a field is visible
    const isVisible = (level: string) => {
        if (level === 'HIDDEN') return false;
        if (level === 'DONORS_ONLY' && viewerRole !== 'DONORS_ONLY') return false;
        return true; // 'EVERYONE' or (DONORS_ONLY and user is DONORS_ONLY)
    };

    return {
        ...profile,
        age: isVisible(settings?.ageVisibility || 'EVERYONE') ? profile.age : null,
        gpa: isVisible(settings?.gpaVisibility || 'DONORS_ONLY') ? profile.gpa : null,
        shortStory: isVisible(settings?.storyVisibility || 'EVERYONE') ? profile.shortStory : null,
    };
}
