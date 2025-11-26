
class I18nManager {
    private static instance: I18nManager;
    private translations: { [key: string]: string } = {};
    private language: string = 'en';
    private readonly STORAGE_KEY = 'survivor_game_lang';

    private constructor() {}

    public static getInstance(): I18nManager {
        if (!I18nManager.instance) {
            I18nManager.instance = new I18nManager();
        }
        return I18nManager.instance;
    }

    get currentLanguage(): string {
        return this.language;
    }

    async init() {
        const savedLang = localStorage.getItem(this.STORAGE_KEY) || navigator.language || 'en';
        await this.setLanguage(savedLang.startsWith('zh') ? 'zh-CN' : 'en');
    }
    
    async setLanguage(lang: string) {
        this.language = lang;
        try {
            const response = await fetch(`./locales/${lang}.json`);
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

export const i18nManager = I18nManager.getInstance();