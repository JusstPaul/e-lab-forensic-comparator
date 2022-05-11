import { FC } from 'react'
import { Link } from '@inertiajs/inertia-react'
import Auth from '@/Layouts/Auth'
import { Inertia } from '@inertiajs/inertia'
import {
  Container,
  Paper,
  Box,
  Menu,
  Text,
  UnstyledButton,
} from '@mantine/core'
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
                  <Menu.Item>
                    <UnstyledButton onClick={() => openConfirmModal(value.id)}>
                      Delete
                    </UnstyledButton>
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
      {/*       <div className="container-lg p-4 md:p-8">
        <div className="py-4 md:grid grid-cols-4 gap-4">
          {classes ? (
            classes.map((value, index) => (
              <div
                key={index}
                className="bg-primary pl-8 pr-2 py-4 rounded-md shadow-sm cursor-pointer mb-4 relative"
              >
                <div className="flex items-center">
                  <Link
                    className="text-lg mb-0 flex-grow"
                    href={`/class/overview/${value.id}`}
                  >
                    {value.code}
                  </Link>
                  <button
                    type="button"
                    className="flex-grow-0 rounded-full outline-none bg-primary-dark p-2"
                    onClick={() => {
                      let nIsOpen = [...isOpen!]
                      nIsOpen[index] = !nIsOpen[index]
                      setIsOpen(nIsOpen)
                      console.log(isOpen)
                    }}
                  >
                    <DotsVerticalIcon className="icon" />
                  </button>
                </div>
                <div className="text-xs">
                  <span>{value.day} </span>
                  <span>{value.time_start}</span>
                  <span> to </span>
                  <span>{value.time_end}</span>
                  {isOpen != undefined && isOpen[index] == true ? (
                    <Dropdown>
                      <DropdownChild>
                        <DropdownSelect>
                          <Link href={`/class/edit/${value.id}`}>Edit</Link>
                        </DropdownSelect>
                        <DropdownSelect>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentClass(value.id)
                              setIsDialogOpen(true)
                            }}
                          >
                            Delete
                          </button>
                        </DropdownSelect>
                      </DropdownChild>
                    </Dropdown>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
      <ConfirmDialog
        title="Delete class"
        onClose={() => {
          setIsDialogOpen(false)
        }}
        onConfirm={() => {
          Inertia.post(`/class/delete/${currentClass}`)
        }}
        isOpen={isDialogOpen}
      >
        Are you sure you want to delete this class?
      </ConfirmDialog> */}
    </Auth>
  )
}

export default Dashboard
