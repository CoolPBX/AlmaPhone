export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://coolpbx2.hornblower.com/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },

  sip: {
    serverUrl: import.meta.env.VITE_SIP_SERVER_URL || 'wss://coolpbx2.hornblower.com:7443',
    domain: import.meta.env.VITE_SIP_DOMAIN || 'coolpbx2.hornblower.com',
  },

  router: {
    baseUrl: import.meta.env.BASE_URL,
  },
} as const

export default config