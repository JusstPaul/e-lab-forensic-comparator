import { PropsWithChildren, useEffect, useState } from 'react'
import { Head } from '@inertiajs/inertia-react'
import { AppShell, Box, Header, Title } from '@mantine/core'

type Props = PropsWithChildren<{
  title?: string
}>

const Guest = ({ title, children }: Props) => {
  const [headTitle, setHeadTitle] = useState('e-Lab Forensic Ballistics')
  useEffect(() => {
    if (title) {
      setHeadTitle(`${headTitle} • ${title}`)
    }
  }, [])

  return (
    <>
      <Head title={headTitle} />

      <AppShell
        fixed
        styles={(theme) => ({
          main: {
            backgroundColor: theme.colors.gray[1],
            color: theme.colors.gray[0],
            position: 'relative',
          },
        })}
        header={
          <Header height={120}>
            <Box
              component="div"
              sx={(theme) => ({
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                color: theme.colors.gray[0],
              })}
            >
              <Title order={1}>
                Data Center College of the Philippines of Laoag, Inc.
              </Title>
            </Box>
          </Header>
        }
      >
        {children}
      </AppShell>
    </>
  )
}

export default Guest
