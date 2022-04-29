import { FC, useState } from 'react'
import { usePage, useForm } from '@inertiajs/inertia-react'
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from 'react-compare-slider'
import {
  AnswerState,
  ComparatorState,
} from '@/Pages/Auth/Student/ActivityAnswer'
import {
  Activity,
  Questions,
} from '@/Pages/Auth/Instructor/ClassCreateActivity'
import Class from '@/Layouts/Class'
import { User } from '@/Layouts/Auth'
import moment from 'moment'
import CheckBox from '@/Components/CheckBox'
import { XCircleIcon } from '@heroicons/react/solid'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'

type CheckState = {
  score: number
  checks: Array<boolean>
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

  const [currentComparator, setCurrentComparator] = useState<
    ComparatorState | undefined
  >()
  const [showCompator, setShowCompator] = useState(false)

  const date = questions.questions.date_end + ' ' + questions.questions.time_end
  const isLate = new Date(date).getTime() <= new Date().getTime()

  const initializeScores = (): CheckState => {
    if (!answers.checks) {
      return {
        score: 0,
        checks: questions.questions.questions.map((_) => {
          return false
        }),
      } as CheckState
    }

    return answers.checks
  }

  const { data, setData, post, processing, errors } = useForm({
    checks: initializeScores(),
  })

  const renderQuestionItem = (index: number) => {
    const { type, instruction } = questions.questions.questions[index]

    switch (type) {
      case 'directions':
        return (
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: instruction }}></div>
          </div>
        )
      case 'essay':
        return (
          <div>
            <div className="prose">{instruction}</div>
            <div className="prose">
              <div
                dangerouslySetInnerHTML={{
                  __html: answers.answers.data![index].answer as string,
                }}
              ></div>
            </div>
          </div>
        )
      case 'question':
        return (
          <div>
            <div className="prose">{instruction}</div>
            <div className="prose">
              {answers.answers.data![index].answer as string}
            </div>
          </div>
        )
      case 'comparator':
        return (
          <div>
            <div className="prose">{instruction}</div>
            <div className="mt-2">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  setCurrentComparator(
                    answers.answers.data![index].answer as ComparatorState
                  )
                  setShowCompator(true)
                }}
              >
                View
              </button>
            </div>
          </div>
        )
      default:
        return <div className="text-sm text-red-500">Invalid item!</div>
    }
  }

  return (
    <Class mode={3} id={id}>
      <div className="container-lg p-4 md:p-8">
        <p className="font-light text-lg w-fit mx-auto mb-4">
          {_user.role == 'instructor' ? 'Check' : 'View'} Activity
        </p>
        <div className="">
          <form
            className="w-full md:w-5/12 mx-auto pb-32 md:pb-16"
            onSubmit={(event) => {
              event.preventDefault()
              post(`/class/${id}/activity/${activity_id}/show/${student_id}`)
            }}
          >
            <div className="text-center my-4">
              <div className="text-xl">{questions.questions.title}</div>
              <div className={'text-sm ' + (isLate && 'text-red-500')}>
                Due {moment(date).format('ddd DD MMMM, h:mm A')}
              </div>
            </div>
            <div className="text-right mb-2">
              Total score: {data.checks.score}/{questions.total_points}
            </div>
            <div hidden={showCompator}>
              {questions.questions.questions.map((value, index) => (
                <fieldset key={index} className="card mb-4">
                  <legend className="card-legend capitalize flex justify-between items-end">
                    <span>
                      {index + 1}. {value.type}
                    </span>
                    {value.points > 0 && (
                      <span className="h-full">
                        <div className="flex gap-4">
                          <div>
                            <span className="text-sm">
                              {value.points}{' '}
                              {value.points > 1 ? <>Points</> : <>Point</>}
                            </span>
                          </div>
                          <CheckBox
                            name="check"
                            className="mb-0"
                            defaultChecked={data.checks.checks[index]}
                            value={data.checks.checks[index] ? 1 : 0}
                            disabled={_user.role == 'student'}
                            onChange={(event) => {
                              const { checked } = event.target
                              let nChecked = data.checks
                              nChecked.checks[index] = checked

                              if (checked) {
                                nChecked.score += parseInt(value.points as any)
                              } else {
                                nChecked.score -= parseInt(value.points as any)
                              }

                              setData({ checks: nChecked })
                            }}
                          />
                        </div>
                      </span>
                    )}
                  </legend>
                  <div className="card-legend-body py-2">
                    {renderQuestionItem(index)}
                  </div>
                </fieldset>
              ))}
              {_user.role == 'instructor' ? (
                <div className="flex justify-end">
                  <button className="btn-primary" disabled={processing}>
                    Submit
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
            <div hidden={!showCompator}>
              {currentComparator ? (
                <>
                  <div className="w-full flex justify-end">
                    <button
                      type="button"
                      className="text-red-500 flex-grow-0 w-fit h-auto outline-none"
                      tabIndex={-1}
                      onClick={() => {
                        setShowCompator(false)
                      }}
                    >
                      <XCircleIcon className="icon" />
                    </button>
                  </div>
                  <div className="border border-dark rounded bg-slate-200 overflow-hidden shadow-sm mx-auto">
                    <ReactCompareSlider
                      itemOne={
                        <ReactCompareSliderImage
                          src={getFileURL(
                            client,
                            _aws.bucket,
                            currentComparator.images[
                              currentComparator.current.left
                            ]
                          )}
                          style={{
                            position: 'relative',
                            ...currentComparator.styles.left,
                          }}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={getFileURL(
                            client,
                            _aws.bucket,
                            currentComparator.images[
                              currentComparator.current.right
                            ]
                          )}
                          style={{
                            position: 'relative',
                            ...currentComparator.styles.right,
                          }}
                        />
                      }
                      onlyHandleDraggable={true}
                      handle={
                        <ReactCompareSliderHandle
                          buttonStyle={{ display: 'none' }}
                          linesStyle={{ height: '100%', width: 3 }}
                        />
                      }
                      position={currentComparator.position}
                    />
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </form>
        </div>
      </div>
    </Class>
  )
}

export default ClassShowAnswers
