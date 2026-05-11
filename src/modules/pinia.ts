import type { UserModule } from '~/types'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const install: UserModule = ({ isClient, initialState, app }) => {
  const pinia = createPinia()
  if (isClient)
    pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  if (isClient)
    pinia.state.value = (initialState.pinia) || {}
  else
    initialState.pinia = pinia.state.value
}
