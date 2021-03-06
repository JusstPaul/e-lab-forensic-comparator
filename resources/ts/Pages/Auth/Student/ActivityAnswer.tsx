import { ChangeEvent, FC, CSSProperties, useEffect, useState } from 'react'
import { Inertia } from '@inertiajs/inertia'
import { useForm, usePage } from '@inertiajs/inertia-react'
import {
  Questions,
  Activity,
  Question,
} from '../Instructor/ClassCreateActivity'
import CheckBox from '@/Components/CheckBox'
import TextInput from '@/Components/TextInput'
import Error from '@/Components/Error'
import Auth from '@/Layouts/Auth'
import moment from 'moment'
import { cloneDeep } from 'lodash'
import Editor from '@/Components/Editor'
import { AnnotationsState } from './Comparator'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  Stack,
  Text,
  RadioGroup,
  Radio,
  Alert,
} from '@mantine/core'
import { InformationCircleIcon } from '@heroicons/react/outline'
import Input from '@/Components/Input'
import useStyles from '@/Lib/styles'

type AnswerData = Array<{
  answer: string | Array<string> | AnnotationsState
  points: number
}>

export type AnswerState = {
  id: string
  data: AnswerData
}

type Props = {
  id: string
  activity_id: string
  activity: {
    id: string
    title: string
    type: Activity
    date_end: string
    time_end: string
    questions: Questions
    created_at: string
  }
  total_points: number
  cached_answer?: AnswerState
}

type RenderItemsProps = {
  value: Question
  id: string
  activity_id: string
  index: number
  data: {
    answers: { id: string; data: AnswerData }
  }
  setData: Function
}
const RenderItems: FC<RenderItemsProps> = ({
  value,
  id,
  activity_id,
  index,
  data,
  setData,
}) => {
  const [answer, setAnswer] = useState(data.answers.data[index])
  useEffect(() => {
    let nAnswersData = data.answers.data
    nAnswersData[index] = answer
    setData({
      ...data,
      answers: {
        ...data.answers,
        data: nAnswersData,
      },
    })
  }, [answer])

  switch (value.type) {
    case 'directions':
      return (
        <Text>
          <div dangerouslySetInnerHTML={{ __html: value.instruction }}></div>
        </Text>
      )

    case 'question': {
      return (
        <Stack>
          <Text>{value.instruction}</Text>
          {value.choices && value.choices.active ? (
            <>
              {value.choices.type == 'checkbox' ? (
                <Stack>
                  {value.choices.data.map((val, idx) => (
                    <Checkbox
                      label={val}
                      key={idx}
                      defaultChecked={
                        (
                          answer as {
                            points: number
                            answer: Array<string>
                          }
                        ).answer.length > 0 &&
                        (
                          answer as {
                            points: number
                            answer: Array<String>
                          }
                        ).answer.includes(val)
                      }
                      onChange={(event) => {
                        let nAnswer = answer.answer as Array<string>

                        if (event.currentTarget.checked) {
                          nAnswer.push(val)
                        } else {
                          const i = nAnswer.indexOf(val)
                          nAnswer.splice(i, 1)
                        }

                        setAnswer({
                          ...answer,
                          answer: nAnswer,
                        })
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <RadioGroup
                  value={answer.answer as string}
                  onChange={(value) => {
                    setAnswer({ ...answer, answer: value })
                  }}
                >
                  {value.choices.data.map((val, idx) => (
                    <Radio key={idx} value={val} label={val} />
                  ))}
                </RadioGroup>
              )}
            </>
          ) : (
            <Input
              textProps={{
                name: 'question-text',
                autoFocus: index == 0,
                value: answer.answer as string,
                onChange: (event) => {
                  setAnswer({
                    ...answer,
                    answer: event.target.value,
                  })
                },
              }}
            />
          )}
        </Stack>
      )
    }

    case 'comparator':
      return (
        <Stack>
          <Text>{value.instruction}</Text>
          <Button
            type="button"
            onClick={() => {
              Inertia.post(
                `/class/${id}/activity/${activity_id}/comparator/${index}`,
                data as any
              )
            }}
          >
            Open Comparator
          </Button>
        </Stack>
      )

    case 'essay':
      return (
        <Stack>
          <Text>{value.instruction}</Text>
          <Editor
            name="essay-text"
            autoFocus={index == 0}
            setContents={answer.answer as string}
            onChange={(content) => {
              setAnswer({
                ...answer,
                answer: content,
              })
            }}
          />
        </Stack>
      )

    default:
      return (
        <Text size="sm" color="red">
          Invalid Item!
        </Text>
      )
  }
}

const ActivityAnswer: FC<Props> = ({
  id,
  activity_id,
  activity,
  total_points,
  cached_answer,
}) => {
  const [dateStr, setDateStr] = useState('')
  const [isLate, setIsLate] = useState(false)

  useEffect(() => {
    const date = moment(new Date())
    const dateEndMoment = moment(activity.date_end)
    const timeEndMoment = moment(activity.time_end)

    dateEndMoment.set({
      hour: timeEndMoment.get('hour'),
      minute: timeEndMoment.get('minute'),
    })

    setDateStr(dateEndMoment.format('ddd DD MMMM, h:mm A'))
    setIsLate(dateEndMoment.isSameOrBefore(date))
  }, [])

  const initializeAnswers = () => {
    if (cached_answer) {
      // TODO: With comparator
      return {
        ...cached_answer,
        data: cached_answer.data.map((value, index) => {
          switch (activity.questions[index].type) {
            case 'directions':
              return value

            case 'question':
              if (value.answer == null) {
                if (activity.questions[index].choices != undefined) {
                  const { active, type, data } =
                    activity.questions[index].choices!
                  if (active) {
                    if (type == 'checkbox') {
                      return {
                        ...value,
                        answer: '',
                      }
                    } else if (type == 'radio') {
                      return {
                        ...value,
                        answer: [data[0]],
                      }
                    }
                  } else {
                    return { ...value, answer: '' }
                  }
                } else {
                  return { ...value, answer: '' }
                }
              }
              return value
            // @ts-expect-error
            case 'essay':
              if (value.answer == null) {
                return { ...value, answer: '' }
              }
            case 'directions':
            case 'comparator':
              return value
            default:
              return { ...value, answer: '' }
          }
        }),
      }
    }

    return {
      id: activity_id,
      data: activity.questions.map((value) => {
        switch (value.type) {
          // @ts-ignore
          case 'question':
            if (value.choices && value.choices.active) {
              if (value.choices.type == 'radio') {
                return {
                  points: value.points,
                  answer: value.choices.data[0],
                }
              } else {
                return {
                  points: value.points,
                  answer: [],
                }
              }
            }
          case 'essay':
            return {
              points: value.points,
              answer: '',
            }
          case 'comparator':
            return {
              points: value.points,
              answer: [],
            }
          default:
            return undefined
        }
      }) as AnswerData,
    }
  }

  const { data, setData, post, processing, errors } = useForm({
    answers: initializeAnswers(),
  })
  const { errors: error_bag } = usePage().props

  const classes = useStyles()

  return (
    <Auth class_id={id}>
      <Container size="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            post(`/class/${id}/activity/${activity_id}`)
          }}
        >
          <Box py="lg">
            <Text size="xl" align="center">
              {activity.title}
            </Text>
            <Text size="sm" align="center" color={isLate ? 'red' : 'gray'}>
              Due: {dateStr}
            </Text>
          </Box>
          {Object.keys(error_bag).length >= 1 && (
            <Alert
              icon={<InformationCircleIcon className={classes.classes.icon} />}
              title="Create Task Error"
              color="red"
            >
              Please check your questions
            </Alert>
          )}
          <Stack>
            {activity.questions.map((value, index) => (
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
                  {value.points > 0 && (
                    <Text size="sm">
                      {value.points} {value.points > 1 ? 'Points' : 'Point'}
                    </Text>
                  )}
                </Card.Section>
                <Box py="sm">
                  <RenderItems
                    value={value}
                    index={index}
                    activity_id={activity_id}
                    id={id}
                    data={data}
                    setData={setData}
                  />
                </Box>
              </Card>
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
  /*   const date = activity.date_end + ' ' + activity.time_end
  const isLate = new Date(date).getTime() <= new Date().getTime()

  const { errors: error_bag } = usePage().props

  const initializeAnswers = () => {
    const emptyAnswer = {
      id: activity_id,
      data: activity.questions.map((value) => {
        switch (value.type) {
          case 'question':
            if (value.choices != undefined && value.choices.active == 1) {
              if (value.choices.type == 'radio') {
                return {
                  points: value.points,
                  answer: value.choices.data[0],
                }
              }
            }
          case 'essay':
            return {
              points: value.points,
              answer: '',
            }
          case 'comparator':
            return {
              points: value.points,
              answer: [],
            }
          case 'directions':
          default:
            return undefined
        }
      }),
    }

    if (cached_answer != null) {
      const nCachedAswer = cached_answer
      nCachedAswer.data = nCachedAswer.data!.map((value, index) => {
        switch (activity.questions[index].type) {
          case 'directions':
            return value

          case 'question':
            if (value.answer == null) {
              if (activity.questions[index].choices != undefined) {
                const { active, type, data } =
                  activity.questions[index].choices!
                if (active == 1) {
                  if (type == 'checkbox') {
                    return {
                      ...value,
                      answer: '',
                    }
                  } else if (type == 'radio') {
                    return {
                      ...value,
                      answer: [data[0]],
                    }
                  }
                } else {
                  return { ...value, answer: '' }
                }
              } else {
                return { ...value, answer: '' }
              }
            }
            return value
          // @ts-expect-error
          case 'essay':
            if (value.answer == null) {
              return { ...value, answer: '' }
            }
          case 'directions':
          case 'comparator':
            return value
          default:
            return { ...value, answer: '' }
        }
      }) as AnswerData

      return nCachedAswer
    }

    return emptyAnswer
  }

  const { data, setData, post, processing, errors } = useForm({
    answers: initializeAnswers(),
  })

  const renderQuestionItem = (index: number) => {
    const { type, instruction } = activity.questions[index]

    switch (type) {
      case 'directions':
        return (
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: instruction }}></div>
          </div>
        )
      case 'question': {
        const {
          data: choice_data,
          active,
          type: choice_type,
        } = activity.questions[index].choices ?? {
          data: [],
          type: 'checkbox',
          active: 0,
        }

        const handleInputChange = (
          event: ChangeEvent<HTMLInputElement>,
          val?: string
        ) => {
          const { value, name, checked } = event.target
          const nAnswers = data.answers!

          if (name == 'choice') {
            if (checked) {
              nAnswers.data![index] = {
                points: data.answers!.data![index]!.points,
                answer: [
                  ...(nAnswers.data![index]!.answer as Array<string>),
                  val!,
                ],
              }
            } else {
              const idx = (
                nAnswers.data![index]!.answer as Array<string>
              ).indexOf(value)
              nAnswers.data![index]!.answer = (
                nAnswers.data![index]!.answer as Array<string>
              ).splice(idx, 1)
            }
          } else {
            nAnswers.data![index] = {
              points: data.answers!.data![index]!.points,
              answer: value,
            }
          }
          setData({ ...data, answers: nAnswers })
        }

        return (
          <div>
            <div className="prose">{instruction}</div>
            <div className="mt-4">
              {active == 1 ? (
                <>
                  {choice_type == 'checkbox' ? (
                    <>
                      {choice_data.map((val, idx) => (
                        <CheckBox
                          label={val}
                          name="choice"
                          key={idx}
                          defaultChecked={
                            (
                              data.answers!.data![index] as {
                                points: number
                                answer: Array<string>
                              }
                            ).answer != null &&
                            (
                              data.answers!.data![index] as {
                                points: number
                                answer: Array<string>
                              }
                            ).answer.includes(val)
                          }
                          onChange={(event) => handleInputChange(event, val)}
                        />
                      ))}
                    </>
                  ) : (
                    <RadioGroup
                      name={'choice-' + index}
                      value={
                        (
                          data.answers!.data![index] as {
                            points: number
                            answer: string
                          }
                        ).answer
                      }
                      values={choice_data}
                      onChange={handleInputChange}
                    />
                  )}
                </>
              ) : (
                <TextInput
                  name="choice-text"
                  isFocused={index == 0}
                  value={
                    (
                      data.answers!.data![index] as {
                        points: number
                        answer: string
                      }
                    ).answer
                  }
                  onChange={handleInputChange}
                  noLabel
                />
              )}
            </div>
          </div>
        )
      }
      case 'essay':
        return (
          <div>
            <div className="prose">{instruction}</div>
            <Editor
              name="essay-text"
              autoFocus={index == 0}
              setContents={
                (
                  data.answers!.data![index] as {
                    points: number
                    answer: string
                  }
                ).answer
              }
              onChange={(content) => {
                const nAnswers = data.answers!
                nAnswers.data![index]!.answer = content

                setData({
                  ...data,
                  answers: nAnswers,
                })
              }}
            />
          </div>
        )

      case 'comparator':
        return (
          <div>
            <div className="prose">{instruction}</div>
            <div className="mt-4 px-4">
              <button
                type="button"
                className="w-full btn-primary"
                onClick={() => {
                  Inertia.post(
                    `/class/${id}/activity/${activity_id}/comparator/${index}`,
                    data as any
                  )
                }}
              >
                Open Comparator
              </button>
            </div>
          </div>
        )
      default:
        return <div className="text-sm text-red-500">Invalid item!</div>
    }
  }

  return (
    <Class id={id} mode={3}>
      <form
        className="w-full md:w-5/12 mx-auto pb-32 md:pb-16"
        onSubmit={(event) => {
          event.preventDefault()
          post(`/class/${id}/activity/${activity_id}`)
        }}
      >
        <div className="text-center my-4">
          <div className="text-xl">{activity.title}</div>
          <div className={'text-sm ' + (isLate && 'text-red-500')}>
            Due {moment(date).format('ddd DD MMMM, h:mm A')}
          </div>
        </div>
        <div className="text-right mb-2">Total points: {total_points}</div>
        <div>
          {activity.questions.map((_, index) => (
            <fieldset key={index} className="card mb-4">
              <legend className="card-legend capitalize flex justify-between items-end">
                <span>
                  {index + 1}. {activity.questions[index].type}
                </span>
                {activity.questions[index].points > 0 && (
                  <span className="text-sm">
                    {activity.questions[index].points}{' '}
                    {activity.questions[index].points > 1 ? (
                      <>Points</>
                    ) : (
                      <>Point</>
                    )}
                  </span>
                )}
              </legend>
              <div className="card-legend-body py-2">
                {renderQuestionItem(index)}
              </div>
            </fieldset>
          ))}
        </div>
        {Object.keys(error_bag as Object).length >= 1 && (
          <div className="border border-red-500 rounded-md w-full flex justify-center mb-4 py-8">
            <Error
              value={Object.keys(error_bag).at(0) ?? ''}
              message="Please check your answers"
            />
          </div>
        )}
        <div className="flex justify-end mt-16">
          <button
            type="submit"
            className="btn-primary w-fit"
            disabled={processing}
          >
            Submit
          </button>
        </div>
      </form>
    </Class>
  ) */
}

export default ActivityAnswer
