import { FC, Suspense } from 'react'
import { usePage, useForm, Link } from '@inertiajs/inertia-react'
import {
  Box,
  Stack,
  Button,
  Container,
  Text,
  Divider,
  Paper,
  Menu,
  Tabs,
  Table,
  Group,
  Checkbox,
  Tooltip,
} from '@mantine/core'
import { User } from '@/Layouts/Auth'
import Auth from '@/Layouts/Auth'
import Editor from '@/Components/Editor'
import Error from '@/Components/Error'
import { Inertia } from '@inertiajs/inertia'
import useStyle from '@/Lib/styles'
import moment from 'moment'
import Upload from '@/Components/Upload'
import { useModals } from '@mantine/modals'
import { FileIcon } from 'react-file-icon'

type Classes = {
  id: string
  code: string
  instructor_name: string
  day: string
  time_end: string
  time_start: string
}

export type Student = {
  id: string
  username: string
  name: string
  contact?: string
}

type ActivityStatus = {
  id?: string
  type?: string
  title: string
  score: string
  is_late: boolean
}

type StudentWithActivities = {
  student: Student
  exams: Array<ActivityStatus>
  assignments: Array<ActivityStatus>
}

type ProgressProps = {
  students?: Array<Student>
  current_student?: StudentWithActivities
}

type Props = {
  classes: Classes
  cards?: Array<{
    id: string
    type: string
    display: string
    link: string
    created_at: string
  }>
  students: Array<Student>
}

const ClassOverview: FC<Props> = ({ classes, cards, students }) => {
  const { user } = usePage().props
  const _user = user as User

  const { data, setData, post, processing, errors, reset } = useForm<{
    text: string
    files: FileList | null
  }>({
    text: '',
    files: null,
  })

  const studentsForm = useForm<{ selected: Array<string> }>({
    selected: [],
  })

  const _classes = useStyle()

  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search)
    const value = params.get('tab')
    if (value && Number(value) != NaN) {
      const convert = parseInt(value)
      if (!(convert < 0 && convert > 2)) {
        return convert
      }
    }
    return 0
  }

  const modals = useModals()
  const openConfirmModal = (type: string, id: string) =>
    modals.openConfirmModal({
      title: `Delete ${type}?`,
      children: <Text size="sm">Are you sure you want to delete {type}?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => {
        if (type == 'task') {
          Inertia.post(
            `/class/${classes.id}/activity/delete/${id}`,
            undefined,
            {
              only: ['cards'],
            }
          )
        } else {
          Inertia.post(
            `/class/${classes.id}/announcement/delete/${id}`,
            undefined,
            {
              only: ['cards'],
            }
          )
        }
      },
    })

  return (
    <Auth class_id={classes.id}>
      <Suspense>
        <Tabs
          grow
          position="center"
          initialTab={getInitialTab()}
          onTabChange={(index) => {
            if (index == 0) {
              Inertia.visit(`/class/overview/${classes.id}`, {
                replace: true,
              })
            } else {
              Inertia.visit(`/class/overview/${classes.id}?tab=${index}`, {
                replace: true,
              })
            }
          }}
        >
          <Tabs.Tab label="Overview">
            <Stack
              p="lg"
              align="flex-start"
              justify="flex-end"
              sx={(theme) => ({
                backgroundImage: 'url("/storage/assets/banner.jpg")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                filter: 'contrast("110%")',
                borderRadius: theme.radius.md,
                height: 200,
              })}
            >
              <div className="w-full banner px-2 py-2 md:px-4 md:py-8 rounded-md shadoe-sm">
                <div className="bg-primary mr-auto w-fit px-2 py rounded-md shadow-sm">
                  <Text
                    color="#ffffff"
                    weight="bold"
                    sx={(theme) => ({
                      textShadow: theme.shadows.xs,
                    })}
                  >
                    {classes.code}
                  </Text>

                  <Text
                    color="#ffffff"
                    weight="bold"
                    sx={(theme) => ({
                      textShadow: theme.shadows.xs,
                    })}
                  >
                    {classes.day}{' '}
                    {moment(new Date(classes.time_start)).format('h:mm a')}{' '}
                    {moment(new Date(classes.time_end)).format('h:mm a')}
                  </Text>
                  <Text
                    color="#ffffff"
                    weight="bold"
                    sx={(theme) => ({
                      textShadow: theme.shadows.xs,
                    })}
                  >
                    {classes.instructor_name}
                  </Text>
                </div>
              </div>
            </Stack>
            <div>
              {_user.role == 'instructor' ? (
                <Container size="md" mt="lg">
                  <form
                    className="w-full md:w-5/12 mx-auto pb-32 md:pb-16"
                    onSubmit={(event) => {
                      event.preventDefault()
                      post(`/class/${classes.id}/announcement/create`, {
                        _method: 'put',
                        onSuccess: () => {
                          Inertia.visit(`/class/overview/${classes.id}`, {
                            only: ['cards'],
                          })
                        },
                      } as any)
                    }}
                    encType="multipart/form-data"
                  >
                    <Editor
                      name="announcement"
                      placeholder="Set announcements here..."
                      setContents={data.text}
                      onChange={(content) => {
                        setData({ ...data, text: content })
                      }}
                    />
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack justify="center">
                        <Error value={errors.files} />
                        <Error value={errors.text} />
                      </Stack>
                      <Box
                        mt="md"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          columnGap: '1rem',
                        }}
                      >
                        <Group position="left">
                          {data.files &&
                            Array.from(data.files).map((value, index) => (
                              <Box
                                key={index}
                                style={{
                                  width: 48,
                                  margin: 16,
                                  position: 'relative',
                                }}
                              >
                                <Tooltip label={value.name} withArrow>
                                  <FileIcon
                                    extension={value.name.split('.').pop()}
                                  />
                                </Tooltip>
                              </Box>
                            ))}
                        </Group>
                        <Group position="right">
                          <Upload
                            id="file-upload"
                            label="Upload File"
                            onChange={(event) => {
                              setData({ ...data, files: event.target.files })
                            }}
                          />
                          <Button
                            type="submit"
                            loading={processing}
                            className="sr-only"
                          >
                            Post
                          </Button>
                        </Group>
                      </Box>
                    </Box>
                  </form>
                </Container>
              ) : (
                <></>
              )}
            </div>
            <Container size="md">
              <Divider my="md" label="Announcements" />
              {cards ? (
                <>
                  {cards.map((value, index) => (
                    <Paper p="md" my="sm" key={index} withBorder>
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Group align="center">
                          <Text size="md" transform="capitalize">
                            {value.type}
                          </Text>
                          <Text size="xs" color="gray">
                            {moment(value.created_at).fromNow()}
                          </Text>
                        </Group>

                        {_user.role == 'instructor' ? (
                          <Menu>
                            {value.type == 'announcement' ? (
                              <Menu.Item
                                component={Link}
                                href={`/class/${classes.id}/announcement/view/${value.id}?edit=true`}
                              >
                                Edit
                              </Menu.Item>
                            ) : (
                              <></>
                            )}
                            <Menu.Item
                              onClick={() =>
                                openConfirmModal(value.type, value.id)
                              }
                              component="button"
                              type="button"
                            >
                              Delete
                            </Menu.Item>
                          </Menu>
                        ) : (
                          <></>
                        )}
                      </Box>
                      <Link className={_classes.classes.link} href={value.link}>
                        <Text lineClamp={2}>
                          <div
                            dangerouslySetInnerHTML={{ __html: value.display }}
                          ></div>
                        </Text>
                      </Link>
                    </Paper>
                  ))}
                </>
              ) : (
                <></>
              )}
            </Container>
          </Tabs.Tab>
          <Tabs.Tab label="Students">
            <Suspense>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  studentsForm.post(`/class/${classes.id}/students/remove`)
                }}
              >
                <Container size="md">
                  {_user.role == 'instructor' && (
                    <Group position="right" my="md">
                      <Button
                        type="submit"
                        loading={studentsForm.processing}
                        disabled={studentsForm.data.selected.length < 1}
                      >
                        Remove Selected
                      </Button>
                    </Group>
                  )}
                  <Paper shadow="xs" p="sm" withBorder>
                    <Table striped>
                      <thead>
                        <tr>
                          {_user.role == 'instructor' ? <th></th> : <></>}
                          <th>Student Number</th>
                          <th>Name</th>
                          {_user.role == 'instructor' ? (
                            <th>Contact</th>
                          ) : (
                            <></>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((value, index) => (
                          <tr key={index}>
                            {_user.role == 'instructor' ? (
                              <td>
                                <Checkbox
                                  size="xs"
                                  onChange={(event) => {
                                    const { checked } = event.currentTarget
                                    let nSelected = studentsForm.data.selected

                                    if (checked) {
                                      nSelected.push(value.id)
                                    } else {
                                      const idx = nSelected.indexOf(value.id)
                                      nSelected.splice(idx, 1)
                                    }

                                    studentsForm.setData({
                                      ...studentsForm.data,
                                      selected: nSelected,
                                    })
                                  }}
                                />
                              </td>
                            ) : (
                              <></>
                            )}
                            <td>{value.username}</td>
                            <td style={{ textTransform: 'uppercase' }}>
                              {value.name}
                            </td>
                            {_user.role == 'instructor' ? (
                              <td>{value.contact}</td>
                            ) : (
                              <></>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Paper>
                </Container>
              </form>
            </Suspense>
          </Tabs.Tab>
        </Tabs>
      </Suspense>
    </Auth>
  )
}

export default ClassOverview
