import { FC } from 'react'
import { Link } from '@inertiajs/inertia-react'
import { PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import Auth from '@/Layouts/Auth'
import { Inertia } from '@inertiajs/inertia'
import {
  Container,
  Table,
  UnstyledButton,
  Paper,
  Highlight,
  SimpleGrid,
} from '@mantine/core'
import { useModals } from '@mantine/modals'
import useStyles from '@/Lib/styles'

type User = {
  id: string
  username: string
  role: string
}

type Props = {
  users: Array<User>
}

const Dashboard: FC<Props> = ({ users }) => {
  const modals = useModals()
  const modalMessage = (username: string) =>
    `Are you sure you want to delete user '${username}'?`
  const openConfirmModal = (username: string, id: string) =>
    modals.openConfirmModal({
      title: 'Confirm user delete',
      children: (
        <Highlight highlight={`'${username}'`}>
          {modalMessage(username)}
        </Highlight>
      ),
      labels: {
        confirm: 'Confirm',
        cancel: 'Cancel',
      },
      onConfirm: () =>
        Inertia.post(`/user/delete/${id}`, undefined, {
          onFinish: () => {
            Inertia.visit('/admin/dashboard', {
              only: ['users'],
            })
          },
        }),
      onCancel: () => {},
      onClose: () => {},
    })

  const classes = useStyles()

  return (
    <Auth
      title="Admin Dashboard"
      onModals={() => {
        Inertia.visit('/admin/dashboard', {
          only: ['users'],
        })
      }}
    >
      <Container
        size="md"
        style={{
          paddingTop: '4rem',
        }}
      >
        <Paper shadow="xs" p="sm" withBorder>
          <Table striped>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((value, index) => (
                <tr key={index}>
                  <td>{value.username}</td>
                  <td>{value.role}</td>
                  <td style={{ display: 'flex', columnGap: '1rem' }}>
                    <Link
                      href={`/user/edit/${value.id}`}
                      className={classes.classes.link}
                      style={{
                        color: '#20c997',
                      }}
                    >
                      <PencilAltIcon className={classes.classes.icon} />
                    </Link>
                    <UnstyledButton
                      type="button"
                      sx={(theme) => ({
                        color: theme.colors.red[5],
                      })}
                      onClick={() => {
                        openConfirmModal(value.username, value.id)
                      }}
                    >
                      <TrashIcon className={classes.classes.icon} />
                    </UnstyledButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Paper>
      </Container>
    </Auth>
  )
}

export default Dashboard
