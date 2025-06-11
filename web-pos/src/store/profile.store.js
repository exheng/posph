export const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem("access_token", token);
    } else {
        localStorage.removeItem("access_token");
    }
};

export const getAccessToken = () => {
    return localStorage.getItem("access_token");
};

export const setProfile = (profile) => {
    if (profile !== null && profile !== undefined) {
        localStorage.setItem("profile", JSON.stringify(profile));
    } else {
        localStorage.removeItem("profile");
    }
};

export const getProfile = () => {
    try {
        const profile = localStorage.getItem("profile");
        if (profile && (profile.startsWith('{') || profile.startsWith('['))) {
            return JSON.parse(profile);
        }
        return null; // Return null if it's not a valid JSON string
    } catch (error) {
        console.error("Error parsing profile from localStorage:", error);
        localStorage.removeItem("profile"); // Clear corrupted data
        return null;
    }
};

