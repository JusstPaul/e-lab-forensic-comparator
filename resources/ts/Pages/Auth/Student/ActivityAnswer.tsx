import { ChangeEvent, FC } from 'react'
import { Inertia } from '@inertiajs/inertia'
import { useForm, usePage } from '@inertiajs/inertia-react'
import { SideBarSection } from '@/Layouts/Auth'
import { Questions, Activity } from '../Instructor/ClassCreateActivity'
import RadioGroup from '@/Components/RadioGroup'
import CheckBox from '@/Components/CheckBox'
import TextInput from '@/Components/TextInput'
import Error from '@/Components/Error'
import Class from '@/Layouts/Class'
import moment from 'moment'
import { useSelector, useDispatch } from 'react-redux'
import { AnswerStates } from '@/Lib/answersReducer'
import { cloneDeep } from 'lodash'

type Props = {
  id: string
  activity_id: string
  sidebar?: Array<SideBarSection>
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
}

const ActivityAnswer: FC<Props> = ({
  id,
  activity_id,
  sidebar,
  activity,
  total_points,
}) => {
  const date = activity.date_end + ' ' + activity.time_end
  const isLate = new Date(date).getTime() <= new Date().getTime()

  const { errors: error_bag } = usePage().props

  const answers = useSelector<AnswerStates, AnswerStates['answers']>(
    (state) => state.answers
  )
  const dispatch = useDispatch()

  const initializeAnswers = () => {
    const emptyAnswer = {
      id: activity_id,
      data: activity.questions.map((value) => {
        switch (value.type) {
          //  @ts-expect-error
          case 'question':
            if (value.choices && value.choices.active == 1) {
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
              answer: {
                title: activity.title,
                date: date,
                instructions: value.instruction,
                position: 50,
                images: value.files,
                styles: {
                  left: {},
                  right: {},
                },
                scales: {
                  left: 1,
                  right: 1,
                },
                location: {
                  left: {
                    x: 0,
                    y: 0,
                  },
                  right: {
                    x: 0,
                    y: 0,
                  },
                },
                current: {
                  left: 0,
                  right: 1,
                },
                select_mode: 'left',
                essay: '',
              },
            }
          case 'directions':
          default:
            return undefined
        }
      }),
    }

    const findAnswer = answers.find((value) => value.id == activity_id)

    if (findAnswer) {
      return cloneDeep(findAnswer)
    }

    dispatch({ type: 'ADD_ANSWER', payload: emptyAnswer })
    return cloneDeep(emptyAnswer)
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
                          defaultChecked={(
                            data.answers!.data![index] as {
                              points: number
                              answer: Array<string>
                            }
                          ).answer.includes(val)}
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
                  console.log('Data: ' + answers)
                  dispatch({
                    type: 'CHANGE_ANSWER',
                    payload: {
                      id: data.answers.id,
                      data: data.answers.data,
                    },
                  })

                  Inertia.visit(
                    `/class/${id}/activity/${activity_id}/comparator/${index}`,
                    {
                      preserveState: true,
                    }
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

  console.log(errors)

  return (
    <Class id={id} mode={3} role="student" sidebar={sidebar}>
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
        <div className="flex justify-center mt-16">
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
  )
}

export default ActivityAnswer
