import { createI18n } from 'vue-i18n'
import en from './locales/en'
import es from './locales/es'

export type MessageSchema = typeof en
export type AvailableLocales = 'en' | 'es'

const getDefaultLocale = (): AvailableLocales => {
  // const stored = localStorage.getItem('almaphone-locale')
  // if (stored && (stored === 'en' || stored === 'es')) {
  //   return stored as AvailableLocales
  // }

  // const browserLang = navigator.language.split('-')[0]
  // if (browserLang === 'en' || browserLang === 'es') {
  //   return browserLang as AvailableLocales
  // }

  return 'en'
}

export const i18n = createI18n({
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    es,
  },
})

export const availableLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const

export const setLocale = (locale: AvailableLocales) => {
  i18n.global.locale = locale
  localStorage.setItem('almaphone-locale', locale)
  document.documentElement.lang = locale
}

export const getCurrentLocale = (): AvailableLocales => {
  return i18n.global.locale as AvailableLocales
}

export default i18n
