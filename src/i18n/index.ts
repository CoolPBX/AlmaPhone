import { createI18n } from 'vue-i18n'
import en from './locales/en'
import es from './locales/es'

export type MessageSchema = typeof en
export type AvailableLocales = 'en' | 'es'

// Get the locale from localStorage or default to Spanish
const getDefaultLocale = (): AvailableLocales => {
  const stored = localStorage.getItem('almaphone-locale')
  if (stored && (stored === 'en' || stored === 'es')) {
    return stored as AvailableLocales
  }

  // Try to detect browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'en' || browserLang === 'es') {
    return browserLang as AvailableLocales
  }

  // Default to Spanish
  return 'es'
}

export const i18n = createI18n({
  locale: getDefaultLocale(),
  fallbackLocale: 'es',
  messages: {
    en,
    es,
  },
})

export const availableLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const

// Helper function to change locale
export const setLocale = (locale: AvailableLocales) => {
  i18n.global.locale.value = locale
  localStorage.setItem('almaphone-locale', locale)
  document.documentElement.lang = locale
}

// Get current locale
export const getCurrentLocale = (): AvailableLocales => {
  return i18n.global.locale.value as AvailableLocales
}

export default i18n
