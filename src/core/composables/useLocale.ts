import { useI18n } from 'vue-i18n'
import type { AvailableLocales } from '@/i18n'
import { setLocale, getCurrentLocale, availableLocales } from '@/i18n'

export const useLocale = () => {
  const { t, locale } = useI18n()

  const changeLocale = (newLocale: AvailableLocales) => {
    setLocale(newLocale)
  }

  const currentLocale = getCurrentLocale()

  return {
    t,
    locale,
    currentLocale,
    changeLocale,
    availableLocales,
  }
}
