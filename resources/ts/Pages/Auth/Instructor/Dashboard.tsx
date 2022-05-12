import { FC } from 'react'
import { Link } from '@inertiajs/inertia-react'
import Auth from '@/Layouts/Auth'
import { Inertia } from '@inertiajs/inertia'
import { Container, Paper, Box, Menu, Text } from '@mantine/core'
import { useModals } from '@mantine/modals'
import moment from 'moment'

type Class = {
  id: string
  code: string
  day: string
  room: string
  time_start: string
  time_end: string
}

type Props = {
  classes?: Array<Class>
}

const Dashboard: FC<Props> = ({ classes }) => {
  const modals = useModals()
  const openConfirmModal = (currentClass: string) =>
    modals.openConfirmModal({
      title: 'Delete class',
      children: <Text>Are you sure you want to delete class?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onClose: () => {},
      onConfirm: () => Inertia.post(`/class/delete/${currentClass}`),
    })

  return (
    <Auth
      title="Instructor Dashboard"
      onModals={() => {
        Inertia.visit('/instructor/dashboard', {
          only: ['classes'],
        })
      }}
    >
      <Container
        size="xl"
        sx={(theme) => ({
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        })}
      >
        {classes ? (
          classes.map((value, index) => (
            <Paper
              key={index}
              p="sm"
              sx={(theme) => ({
                backgroundColor: theme.colors.cyan[7],
                color: theme.colors.gray[0],
              })}
            >
              <Box
                sx={() => ({
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                })}
              >
                <Link
                  href={`/class/overview/${value.id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#f8f9fa',
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem',
                  }}
                >
                  {value.code}
                </Link>
                <Menu withArrow>
                  <Menu.Item component={Link} href={`/class/edit/${value.id}`}>
                    Edit
                  </Menu.Item>
                  <Menu.Item onClick={() => openConfirmModal(value.id)}>
                    Delete
                  </Menu.Item>
                </Menu>
              </Box>
              <Text size="sm">
                {moment(value.time_start).format('h:mm a')} to{' '}
                {moment(value.time_end).format('h:mm a')}
              </Text>
            </Paper>
          ))
        ) : (
          <></>
        )}
      </Container>
    </Auth>
  )
}

export default Dashboard
