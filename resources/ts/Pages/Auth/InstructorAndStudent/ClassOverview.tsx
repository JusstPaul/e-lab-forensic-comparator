import { FC, useState, Fragment, useEffect } from 'react'
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
} from '@mantine/core'
import Upload from 'rc-upload'
import { User } from '@/Layouts/Auth'
import Auth from '@/Layouts/Auth'
import Editor from '@/Components/Editor'
import FileInput from '@/Components/FileInput'
import Error from '@/Components/Error'
import { Inertia } from '@inertiajs/inertia'
import useStyle from '@/Lib/styles'
import moment from 'moment'

type Classes = {
  id: string
  code: string
  instructor_name: string
  day: string
  time_end: string
  time_start: string
}

type Student = {
  id: string
  username: string
  name: string
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
    type: string
    display: string
    link: string
    created_at: string
  }>
  progress: ProgressProps
  initial_active?: number
}

const ClassOverview: FC<Props> = ({
  classes,
  cards,
  progress,
  initial_active,
}) => {
  const { user } = usePage().props
  const _user = user as User

  const { data, setData, post, processing, errors, reset } = useForm<{
    text: string
    files: FileList | null
  }>({
    text: '',
    files: null,
  })

  const [progressViewMode, setProgressViewMode] = useState<
    'Exams' | 'Assignment'
  >('Exams')

  const _classes = useStyle()

  const renderScore = (score: string) => {
    if (score == 'Submitted') {
      return <span className="text-green-500">{score}</span>
    } else if (score == 'None') {
      return <span className="text-red-500">{score}</span>
    }

    return <span>{score}</span>
  }

  return (
    <Auth class_id={classes.id}>
      <Tabs grow position="center" initialTab={initial_active}>
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
                        justifyContent: 'flex-end',
                        columnGap: '1rem',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="file"
                        multiple
                        onChange={(event) =>
                          setData({ ...data, files: event.target.files })
                        }
                      />
                      <Button type="submit" loading={processing}>
                        Post
                      </Button>
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
                  <Paper p="md" key={index}>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text size="md" transform="capitalize">
                        {value.type}
                      </Text>

                      {_user.role == 'instructor' ? (
                        <Menu>
                          <Menu.Item>Edit</Menu.Item>
                          <Menu.Item>Delete</Menu.Item>
                        </Menu>
                      ) : (
                        <></>
                      )}
                    </Box>
                    <Link
                      className={_classes.classes.link}
                      dangerouslySetInnerHTML={{ __html: value.display }}
                      href={value.link}
                    ></Link>
                  </Paper>
                ))}
              </>
            ) : (
              <></>
            )}
          </Container>
        </Tabs.Tab>
        <Tabs.Tab label="Students"></Tabs.Tab>
        <Tabs.Tab label="Progress">
          <Container style={{ display: 'flex' }}>
            <Stack style={{ flexGrow: 0 }}>
              <Text weight="bold">Students</Text>
              {_user.role == 'instructor' ? (
                <>
                  {progress.students != undefined ? (
                    <>
                      {progress.students.map((value, index) => (
                        <Fragment key={index}>
                          <Link
                            href={`/class/overview/${classes.id}/${2}/${
                              value.id
                            }`}
                            className={_classes.classes.link}
                          >
                            <span className="w-max">{value.name}</span>
                          </Link>
                        </Fragment>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </Stack>
            <Container size="md">
              {progress.current_student != undefined ? (
                <Paper shadow="xs" p="sm" withBorder>
                  <Table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Score</th>
                        <th>Is On Time</th>
                      </tr>
                    </thead>
                    {progressViewMode == 'Assignment' ? (
                      <tbody>
                        {progress.current_student.assignments.map(
                          (value, index) => (
                            <tr key={index}>
                              <td className="table-data">
                                {value.id != undefined ? (
                                  <Link
                                    href={`/class/overview/${classes.id}/${2}/${
                                      value.id
                                    }/${progress.current_student!.student.id}`}
                                    className={_classes.classes.link}
                                    only={['current_student']}
                                  >
                                    {value.title}
                                  </Link>
                                ) : (
                                  <span>{value.title}</span>
                                )}
                              </td>
                              <td className="table-data">
                                {renderScore(value.score)}
                              </td>
                              <td className="table-data">
                                {value.is_late ? (
                                  <span className="text-red-500">No</span>
                                ) : (
                                  <span className="text-green-500">Yes</span>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    ) : (
                      <tbody>
                        {progress.current_student.exams.map((value, index) => (
                          <tr key={index}>
                            <td className="table-data">
                              {value.id != undefined ? (
                                <Link
                                  href={`/class/overview/${2}/${classes.id}/${
                                    value.id
                                  }/${progress.current_student!.student.id}`}
                                  className={_classes.classes.link}
                                  only={['current_student']}
                                >
                                  {value.title}
                                </Link>
                              ) : (
                                <span>{value.title}</span>
                              )}
                            </td>
                            <td className="table-data">
                              {renderScore(value.score)}
                            </td>
                            <td className="table-data">
                              {value.is_late ? (
                                <span className="text-red-500">No</span>
                              ) : (
                                <span className="text-green-500">Yes</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </Table>
                </Paper>
              ) : (
                <></>
              )}
            </Container>
          </Container>
        </Tabs.Tab>
      </Tabs>
    </Auth>
  )
}

export default ClassOverview
