import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/inertia-react'
import { InertiaProgress } from '@inertiajs/progress'
import { Provider } from 'react-redux'
import store from '@/Lib/store'

InertiaProgress.init({
  showSpinner: true,
})

createInertiaApp({
  resolve: async (name) => await import(`./Pages/${name}`),
  setup({ el, App, props }) {
    createRoot(el).render(
      <React.StrictMode>
        <Provider store={store}>
          <App {...props} />
        </Provider>
      </React.StrictMode>
    )
  },
})
