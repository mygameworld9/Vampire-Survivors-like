/**
 * Manages internationalization (i18n) for the game.
 * It handles loading translation files, storing the current language, and providing
 * a function to get translated strings.
 * This class is implemented as a Singleton.
 */
class I18nManager {
    /** @private The singleton instance of the I18nManager. */
    private static instance: I18nManager;
    /** @private A cache for the currently loaded translation key-value pairs. */
    private translations: { [key: string]: string } = {};
    /** @private The currently active language code (e.g., 'en', 'zh-CN'). */
    private language: string = 'en';
    /** @private The key for storing the selected language in local storage. */
    private readonly STORAGE_KEY = 'survivor_game_lang';

    /** @private The constructor is private to enforce the singleton pattern. */
    private constructor() {}

    /**
     * Gets the singleton instance of the I18nManager.
     * @returns {I18nManager} The singleton instance.
     */
    public static getInstance(): I18nManager {
        if (!I18nManager.instance) {
            I18nManager.instance = new I18nManager();
        }
        return I18nManager.instance;
    }

    /**
     * Gets the currently active language code.
     * @returns {string} The current language code.
     */
    get currentLanguage(): string {
        return this.language;
    }

    /**
     * Initializes the manager by detecting the saved or browser-preferred language
     * and loading the corresponding translation file.
     */
    async init() {
        const savedLang = localStorage.getItem(this.STORAGE_KEY) || navigator.language || 'en';
        await this.setLanguage(savedLang.startsWith('zh') ? 'zh-CN' : 'en');
    }
    
    /**
     * Sets the active language and loads its translation file.
     * If the specified language fails to load, it falls back to English.
     * @param {string} lang - The language code to set (e.g., 'en', 'zh-CN').
     */
    async setLanguage(lang: string) {
        this.language = lang;
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Could not load language file: ${lang}`);
            }
            this.translations = await response.json();
            localStorage.setItem(this.STORAGE_KEY, lang);
        } catch (error) {
            console.error(error);
            // Fallback to English if the chosen language fails to load
            if (lang !== 'en') {
                await this.setLanguage('en');
            }
        }
    }

    /**
     * Retrieves a translated string for a given key.
     * It can also replace placeholders in the translation string with provided values.
     * If the key is not found, the key itself is returned.
     * @param {string} key - The translation key (e.g., 'ui.start_game').
     * @param {object} [replacements] - An optional object of placeholder-value pairs to substitute into the translated string (e.g., `{ count: 5 }`).
     * @returns {string} The translated and formatted string.
     */
    t(key: string, replacements?: { [key: string]: string | number }): string {
        let translation = this.translations[key] || key;
        if (replacements) {
            for (const placeholder in replacements) {
                translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
            }
        }
        return translation;
    }
}

/**
 * The singleton instance of the I18nManager, exported for global use.
 */
export const i18nManager = I18nManager.getInstance();