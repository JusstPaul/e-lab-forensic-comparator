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
import Auth, { User } from '@/Layouts/Auth'
import moment from 'moment'
import CheckBox from '@/Components/CheckBox'
import { AnnotationIcon } from '@heroicons/react/solid'
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
  Alert,
  Paper,
  Image,
  Checkbox,
} from '@mantine/core'
import useStyles from '@/Lib/styles'
import { InformationCircleIcon } from '@heroicons/react/outline'

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

  const { errors: error_bag } = usePage().props

  return (
    <Auth class_id={id}>
      <Container size="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            post(`/class/${id}/activity/${activity_id}/show/${student_id}`)
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
                withinPortal
                key={index}
                target={
                  <Card
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
                        <Tooltip
                          label={`${
                            _user.role == 'instructor' ? 'Add' : 'Open'
                          }Comment`}
                          withArrow
                        >
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
                                {_user.role == 'instructor' ? (
                                  <Input
                                    placeholder={`/${value.points}`}
                                    type="number"
                                    sx={() => ({
                                      width: '4.5rem',
                                    })}
                                    value={data.checks.checks[index].points}
                                    onChange={(
                                      event: ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const val = event.target.value
                                      const nPoint = parseInt(
                                        val == '' ? '0' : val
                                      )
                                      if (
                                        nPoint <=
                                          parseInt(value.points as any) &&
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
                                ) : (
                                  <Text>
                                    {data.checks.checks[index].points} Points
                                  </Text>
                                )}
                              </>
                            ) : (
                              <>
                                <Checkbox
                                  name="check"
                                  defaultChecked={
                                    data.checks.checks[index].isChecked
                                  }
                                  value={
                                    data.checks.checks[index].isChecked ? 1 : 0
                                  }
                                  disabled={_user.role == 'student'}
                                  onChange={(event) => {
                                    const { checked } = event.currentTarget
                                    let nChecked = data.checks
                                    nChecked.checks[index].isChecked = checked
                                    nChecked.checks[index].points = parseInt(
                                      value.points as any
                                    )

                                    if (checked) {
                                      nChecked.score += parseInt(
                                        value.points as any
                                      )
                                    } else {
                                      nChecked.score -= parseInt(
                                        value.points as any
                                      )
                                    }

                                    setData({ ...data, checks: nChecked })
                                  }}
                                />
                              </>
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
                <Paper>
                  {_user.role == 'instructor' ? (
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
                  ) : (
                    <Text>{data.checks.checks[index].comment}</Text>
                  )}
                </Paper>
              </Popover>
            ))}
            {Object.keys(error_bag).length >= 1 && (
              <Alert
                icon={<InformationCircleIcon className={classes.icon} />}
                title="Check Task Error"
                color="red"
              >
                Please check the answers
              </Alert>
            )}
          </Stack>
          {_user.role == 'instructor' ? (
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
          ) : (
            <></>
          )}
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
          <Box className={classes.answer}>
            {question.choices &&
            question.choices.active &&
            question.choices.type == 'checkbox' ? (
              <Stack>
                {(answer as Array<string>).map((value, index) => (
                  <Text key={index}>{value}</Text>
                ))}
              </Stack>
            ) : (
              <>{answer as string}</>
            )}
          </Box>
        </Box>
      )

    case 'essay':
      return (
        <Box>
          <Text>{question.instruction}</Text>
          <Box className={classes.answer}>
            <div dangerouslySetInnerHTML={{ __html: answer as string }}></div>
          </Box>
        </Box>
      )

    case 'comparator':
      return (
        <Box>
          <Text>{question.instruction}</Text>
          <Stack>
            {(answer as AnnotationsState).map((value, index) => (
              <Box key={index}>
                <Marker {...value} />
                <Box className={classes.answer}>
                  <div dangerouslySetInnerHTML={{ __html: value.essay }}></div>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )

    default:
      return (
        <Text size="sm" color="red">
          Invalid Item!
        </Text>
      )
  }
}

const Marker: FC<Annotation> = (props) => {
  const { aws } = usePage().props

  const _aws = aws as S3PageProps
  const client = s3Client(_aws)
  const imgRef = useRef<HTMLImageElement>(null)

  const [url, setUrl] = useState('')
  useEffect(() => {
    setUrl(getFileURL(client, _aws.bucket, props.image as string))

    if (imgRef.current) {
      imgRef.current.crossOrigin = 'anonymous'
    }
  }, [])

  return (
    <img
      src={url}
      ref={imgRef}
      style={{
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() => {
        if (imgRef.current) {
          const markerArea = new markerjs2.MarkerArea(imgRef.current)
          markerArea.addEventListener('render', (event) => {
            if (imgRef.current) {
              imgRef.current.src = event.dataUrl
            }
          })

          markerArea.settings.displayMode = 'popup'
          markerArea.renderAtNaturalSize = true
          markerArea.renderImageType = 'image/png'
          markerArea.renderImageQuality = 1.0

          markerArea.show()
          if (props.state) {
            markerArea.restoreState(props.state)
          }
        }
      }}
    />
  )
}

export default ClassShowAnswers
