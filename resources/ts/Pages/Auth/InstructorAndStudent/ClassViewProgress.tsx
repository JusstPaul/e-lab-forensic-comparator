import { FC, Fragment, Suspense, useState } from 'react'
import { Link, usePage } from '@inertiajs/inertia-react'
import { User } from '@/Layouts/Auth'
import { Container, Paper, Table, Tabs, Text } from '@mantine/core'
import Auth from '@/Layouts/Auth'
import useStyle from '@/Lib/styles'

export type Student = {
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

type Props = {
  id: string
  students?: Array<Student>
  current_student?: StudentWithActivities
}

const ClassViewProgress: FC<Props> = ({ id, students, current_student }) => {
  const [progressViewMode, setProgressViewMode] = useState<
    'Exams' | 'Assignment'
  >('Exams')

  const { user } = usePage().props
  const _user = user as User

  const classes = useStyle()

  const renderScore = (score: string) => {
    if (score == 'Submitted') {
      return (
        <Text size="sm" color="green">
          {score}
        </Text>
      )
    } else if (score == 'None') {
      return (
        <Text size="sm" color="red">
          {score}
        </Text>
      )
    }

    return <>{score}</>
  }

  // FIX: Remove this
  /*  if (_user.role == 'student') {
    return <Class id={id} mode={2}></Class>
  } */

  return (
    <Auth class_id={id} students={students}>
      <Suspense>
        {current_student ? (
          <Tabs grow position="center">
            <Tabs.Tab label="Assignment">
              <Container size="md">
                <Paper shadow="xs" p="sm" withBorder>
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Score</th>
                        <th>Is Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current_student.assignments.map((value, index) => (
                        <tr key={index}>
                          <td>
                            {value.id != undefined ? (
                              <Link
                                href={`/class/${id}/activity/${value.id}/show/${current_student.student.id}`}
                                className={classes.classes.link}
                              >
                                {value.title}
                              </Link>
                            ) : (
                              <>{value.title}</>
                            )}
                          </td>
                          <td>{renderScore(value.score)}</td>
                          <td>
                            {value.is_late ? (
                              <Text size="sm" color="red">
                                Yes
                              </Text>
                            ) : (
                              <Text size="sm" color="green">
                                No
                              </Text>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Paper>
              </Container>
            </Tabs.Tab>
            <Tabs.Tab label="Exams">
              <Container size="md">
                <Paper shadow="xs" p="sm" withBorder>
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Score</th>
                        <th>Is Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current_student.exams.map((value, index) => (
                        <tr key={index}>
                          <td>
                            {value.id != undefined ? (
                              <Link
                                href={`/class/${id}/activity/${value.id}/show/${current_student.student.id}`}
                                className={classes.classes.link}
                              >
                                {value.title}
                              </Link>
                            ) : (
                              <>{value.title}</>
                            )}
                          </td>
                          <td>{renderScore(value.score)}</td>
                          <td>
                            {value.is_late ? (
                              <Text size="sm" color="red">
                                Yes
                              </Text>
                            ) : (
                              <Text size="sm" color="green">
                                No
                              </Text>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Paper>
              </Container>
            </Tabs.Tab>
          </Tabs>
        ) : (
          <></>
        )}
      </Suspense>
    </Auth>
  )
}

export default ClassViewProgress
