import React from 'react'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/inertia-react'
import { InertiaProgress } from '@inertiajs/progress'
import 'dayjs/locale/en'

InertiaProgress.init({
  showSpinner: true,
})

createInertiaApp({
  resolve: async (name) => await import(`./Pages/${name}`),
  setup({ el, App, props }) {
    createRoot(el).render(
      <React.StrictMode>
        <MantineProvider
          theme={{
            fontFamily: 'Poppins, sans-serif',
            dateFormat: 'MM/DD/YYYY',
            datesLocale: 'en',
            primaryColor: 'cyan',
          }}
          withGlobalStyles
          withNormalizeCSS
          styles={{
            Header: (theme) => ({
              root: {
                backgroundColor: theme.colors.cyan[7],
              },
            }),
            Button: (theme) => ({
              filled: {
                backgroundColor: theme.colors.cyan[7],
                ':hover': {
                  backgroundColor: theme.colors.cyan[8],
                },
              },
            }),
            UnstyledButton: (theme) => ({
              root: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                columnGap: '0.5rem',
              },
            }),
          }}
        >
          <ModalsProvider>
            <App {...props} />
          </ModalsProvider>
        </MantineProvider>
      </React.StrictMode>
    )
  },
})
