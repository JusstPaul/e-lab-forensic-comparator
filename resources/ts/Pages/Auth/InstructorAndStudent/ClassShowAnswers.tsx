import {
  ChangeEvent,
  CSSProperties,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePage, useForm } from '@inertiajs/inertia-react'
import * as markerjs2 from 'markerjs2'
import { AnswerState } from '@/Pages/Auth/Student/ActivityAnswer'
import {
  Activity,
  Questions,
  Question,
} from '@/Pages/Auth/Instructor/ClassCreateActivity'
import Class from '@/Layouts/Class'
import Auth, { User } from '@/Layouts/Auth'
import moment from 'moment'
import CheckBox from '@/Components/CheckBox'
import { XCircleIcon, AnnotationIcon } from '@heroicons/react/solid'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import { Annotation, AnnotationsState } from '../Student/Comparator'
import {
  Container,
  Text,
  Box,
  Stack,
  Card,
  Group,
  ActionIcon,
  Popover,
  Textarea,
  Tooltip,
  Input,
  Button,
} from '@mantine/core'
import useStyles from '@/Lib/styles'

type Check = {
  isChecked: boolean
  points: number
  comment: string
  hasComment: boolean
}

type CheckState = {
  score: number
  checks: Array<Check>
}

type Props = {
  id: string
  activity_id: string
  student_id: string
  total_points: number
  questions: {
    questions: {
      title: string
      type: Activity
      date_end: string
      time_end: string
      questions: Questions
    }
    total_points: number
  }
  answers: {
    answers: AnswerState
    checks?: CheckState
  }
}

const ClassShowAnswers: FC<Props> = ({
  id,
  activity_id,
  student_id,
  questions,
  answers,
}) => {
  const { user, aws } = usePage().props
  const _user = user as User

  const _aws = aws as S3PageProps
  const client = s3Client(_aws)

  const [dateStr, setDateStr] = useState('')
  const [isLate, setIsLate] = useState(false)

  const { classes } = useStyles()

  useEffect(() => {
    const date = moment(new Date())
    const dateEndMoment = moment(questions.questions.date_end)
    const timeEndMoment = moment(questions.questions.time_end)

    dateEndMoment.set({
      hour: timeEndMoment.get('hour'),
      minute: timeEndMoment.get('minute'),
    })

    setDateStr(dateEndMoment.format('ddd DD MMMM, h:mm A'))
    setIsLate(dateEndMoment.isSameOrBefore(date))
  }, [])

  const initializeScores = (): CheckState => {
    if (!answers.checks) {
      return {
        score: 0,
        checks: questions.questions.questions.map(
          (_) =>
            ({
              isChecked: false,
              points: 0,
              comment: '',
              hasComment: false,
            } as Check)
        ),
      } as CheckState
    }

    return answers.checks
  }

  const { data, setData, post, processing, errors } = useForm({
    checks: initializeScores(),
  })

  return (
    <Auth class_id={id}>
      <Container size="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <Box py="lg">
            <Text size="xl" align="center">
              {questions.questions.title}
            </Text>
            <Text size="sm" align="center" color={isLate ? 'red' : 'gray'}>
              Due: {dateStr}
            </Text>
          </Box>
          <Group position="right">
            <Text>
              Total score: {data.checks.score}/{questions.total_points}
            </Text>
          </Group>
          <Stack>
            {questions.questions.questions.map((value, index) => (
              <Popover
                opened={data.checks.checks[index].hasComment}
                withArrow
                closeOnClickOutside={false}
                gutter={5}
                target={
                  <Card
                    key={index}
                    p="sm"
                    withBorder
                    sx={() => ({
                      marginBottom: '1rem',
                    })}
                  >
                    <Card.Section
                      p="sm"
                      sx={(theme) => ({
                        backgroundColor: theme.colors.cyan[7],
                        color: theme.colors.gray[0],
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'end',
                      })}
                    >
                      <Text transform="capitalize">
                        {value.type != 'directions' ? <>{index + 1}. </> : ''}
                        {value.type}
                      </Text>
                      <Group spacing="xs">
                        <Tooltip label="Add Comment" withArrow>
                          <ActionIcon
                            sx={(theme) => ({
                              color: theme.colors.gray[0],
                              ':hover': {
                                backgroundColor: theme.colors.cyan[7],
                              },
                            })}
                            onClick={() => {
                              let nChecks = data.checks.checks
                              nChecks[index].hasComment =
                                !nChecks[index].hasComment
                              setData({
                                ...data,
                                checks: {
                                  ...data.checks,
                                  checks: nChecks,
                                },
                              })
                            }}
                          >
                            <AnnotationIcon className={classes.icon} />
                          </ActionIcon>
                        </Tooltip>
                        {value.points > 0 ? (
                          <>
                            {value.points > 1 ? (
                              <>
                                <Input
                                  placeholder={`/${value.points}`}
                                  sx={() => ({
                                    width: '4.5rem',
                                  })}
                                  onChange={(
                                    event: ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const val = event.target.value
                                    const nPoint = parseInt(
                                      val == '' ? '0' : val
                                    )
                                    if (
                                      nPoint <= parseInt(value.points as any) &&
                                      nPoint >= 0
                                    ) {
                                      let nChecked = data.checks
                                      nChecked.score -=
                                        nChecked.checks[index].points
                                      nChecked.checks[index].isChecked = true
                                      nChecked.checks[index].points = nPoint
                                      nChecked.score += nPoint

                                      setData({ ...data, checks: nChecked })
                                    }
                                  }}
                                />
                              </>
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </Group>
                    </Card.Section>
                    <Box py="sm">
                      <RenderAnswer
                        question={value}
                        index={index}
                        answer={answers.answers.data[index].answer}
                      />
                    </Box>
                  </Card>
                }
              >
                <Textarea
                  autosize
                  placeholder="Add Comment"
                  label="Comment"
                  value={data.checks.checks[index].comment}
                  onChange={(event) => {
                    let nCheck = data.checks.checks
                    nCheck[index].comment = event.target.value

                    setData({
                      ...data,
                      checks: {
                        ...data.checks,
                        checks: nCheck,
                      },
                    })
                  }}
                />
              </Popover>
            ))}
          </Stack>
          <Group position="right">
            <Button
              type="submit"
              sx={(theme) => ({
                marginTop: theme.spacing.md,
              })}
              loading={processing}
            >
              Submit
            </Button>
          </Group>
        </form>
      </Container>
    </Auth>
  )
}

type RenderAnswerProps = {
  question: Question
  index: number
  answer: string | Array<string> | AnnotationsState
}

const RenderAnswer: FC<RenderAnswerProps> = ({ question, index, answer }) => {
  const { classes } = useStyles()

  switch (question.type) {
    case 'directions':
      return (
        <Text>
          <div dangerouslySetInnerHTML={{ __html: question.instruction }}></div>
        </Text>
      )

    case 'question':
      return (
        <Box>
          <Text>{question.instruction}</Text>
          <Box className={classes.answer}>{answer as string}</Box>
        </Box>
      )

    case 'essay':
      return (
        <Box>
          <Text>{question.instruction}</Text>
          <Box className={classes.answer}>
            {question.choices && question.choices.type == 'checkbox' ? (
              <Stack>
                {(answer as Array<string>).map((value, index) => (
                  <Text key={index}>{value}</Text>
                ))}
              </Stack>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: answer as string }}></div>
            )}
          </Box>
        </Box>
      )

    case 'comparator':
      alert('Comparator!')
      return <></>

    default:
      return (
        <Text size="sm" color="red">
          Invalid Item!
        </Text>
      )
  }
}

export default ClassShowAnswers
