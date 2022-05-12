import { CSSProperties, FC, useEffect, useRef, useState } from 'react'
import { usePage, useForm } from '@inertiajs/inertia-react'
import * as markerjs2 from 'markerjs2'
import { AnswerState } from '@/Pages/Auth/Student/ActivityAnswer'
import {
  Activity,
  Questions,
} from '@/Pages/Auth/Instructor/ClassCreateActivity'
import Class from '@/Layouts/Class'
import { User } from '@/Layouts/Auth'
import moment from 'moment'
import CheckBox from '@/Components/CheckBox'
import TextInput from '@/Components/TextInput'
import { AnnotationIcon, XCircleIcon } from '@heroicons/react/solid'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import { Annotation, AnnotationsState } from '../Student/Comparator'
import { Popover, ArrowContainer } from 'react-tiny-popover'

type CheckState = {
  score: number
  checks: Array<{
    isChecked: boolean
    points: number
    comment: string
    hasComment: boolean
  }>
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

  const date = questions.questions.date_end + ' ' + questions.questions.time_end
  const isLate = new Date(date).getTime() <= new Date().getTime()

  const initializeScores = (): CheckState => {
    if (!answers.checks) {
      return {
        score: 0,
        checks: questions.questions.questions.map((_) => {
          return {
            isChecked: false,
            points: 0,
            hasComment: false,
            comment: '',
          }
        }),
      } as CheckState
    }

    return answers.checks
  }

  const { data, setData, post, processing, errors } = useForm<{
    checks: CheckState
    comments: Array<string>
  }>({
    checks: initializeScores(),
    comments: [],
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
        const getStyle = (
          filter: 'none' | 'hue' | 'sepia' | 'saturate' | 'grayscale'
        ): CSSProperties => {
          switch (filter) {
            case 'none':
              return {}
            case 'hue':
              return { filter: 'hue-rotate(180deg)' }
            case 'sepia':
              return { filter: 'sepia(100%)' }
            case 'saturate':
              return { filter: 'saturate(4)' }
            case 'grayscale':
              return { filter: 'grayscale(100%)' }
          }
        }
        const Marker = ({ value }: { value: Annotation }) => {
          const ref = useRef<HTMLImageElement>(null)
          const url = getFileURL(client, _aws.bucket, value.image as string)
          const state = useRef<markerjs2.MarkerAreaState>(
            value.state ? value.state : null
          )

          return (
            <div className="prose">
              <img
                ref={ref}
                src={url}
                className="mb-2"
                style={getStyle(value.filter)}
                onClick={() => {
                  if (ref.current) {
                    const markerArea = new markerjs2.MarkerArea(ref.current)
                    markerArea.settings.displayMode = 'popup'
                    markerArea.addEventListener('render', (event) => {
                      if (ref.current) {
                        ref.current.src = event.dataUrl
                      }
                    })
                    markerArea.show()
                    if (state.current) {
                      markerArea.restoreState(state.current)
                    }
                  }
                }}
                crossOrigin="anonymous"
              />
              <div dangerouslySetInnerHTML={{ __html: value.essay }}></div>
            </div>
          )
        }
        return (
          <div>
            <div className="prose">{instruction}</div>
            <div className="mt-2">
              {(answers.answers.data![index].answer as AnnotationsState).map(
                (value, index) => (
                  <Marker key={index} value={value} />
                )
              )}
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
            className="w-fit min-w-[45%] mx-auto pb-32 md:pb-16"
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
            <div>
              {questions.questions.questions.map((value, index) => (
                <fieldset key={index} className="card mb-4">
                  <legend className="card-legend capitalize flex justify-between items-end ">
                    <span>
                      {index + 1}. {value.type}
                    </span>
                    <div>
                      {value.points > 0 && (
                        <span className="h-full">
                          <div className="flex gap-4">
                            <div>
                              <span className="text-sm">
                                {value.points}{' '}
                                {value.points > 1 ? <>Points</> : <>Point</>}
                              </span>
                            </div>
                            {!(value.points > 1) ? (
                              <CheckBox
                                name="check"
                                className="mb-0"
                                defaultChecked={
                                  data.checks.checks[index].isChecked
                                }
                                value={data.checks.checks[index] ? 1 : 0}
                                disabled={_user.role == 'student'}
                                onChange={(event) => {
                                  const { checked } = event.target
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
                            ) : _user.role == 'instructor' ? (
                              <TextInput
                                name="check-input"
                                noLabel
                                value={data.checks.checks[
                                  index
                                ].points.toString()}
                                onChange={(event) => {
                                  const { value: val } = event.target

                                  const nPoint = parseInt(val == '' ? '0' : val)
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
                                className="w-12 mb-0"
                              />
                            ) : (
                              <span>
                                / {data.checks.checks[index].points} Points
                              </span>
                            )}
                            <Popover
                              isOpen={data.checks.checks[index].hasComment}
                              padding={10}
                              positions={['right']}
                              content={({
                                position,
                                childRect,
                                popoverRect,
                              }) => (
                                <ArrowContainer
                                  position={position}
                                  childRect={childRect}
                                  popoverRect={popoverRect}
                                  arrowSize={10}
                                  arrowColor={'white'}
                                  className="card"
                                >
                                  {_user.role == 'instructor' ? (
                                    <textarea
                                      className="rounded-sm"
                                      value={data.checks.checks[index].comment}
                                      onChange={(event) => {
                                        let nChecked = data.checks
                                        nChecked.checks[index].comment =
                                          event.target.value

                                        setData({ ...data, checks: nChecked })
                                      }}
                                    ></textarea>
                                  ) : (
                                    <div className="prose">
                                      <p>
                                        <strong>Comment:</strong>
                                        <br />
                                        {data.checks.checks[index].comment}
                                      </p>
                                    </div>
                                  )}
                                </ArrowContainer>
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  let nChecked = data.checks
                                  nChecked.checks[index].hasComment =
                                    !nChecked.checks[index].hasComment

                                  setData({ ...data, checks: nChecked })
                                }}
                              >
                                <AnnotationIcon className="icon" />
                              </button>
                            </Popover>
                          </div>
                        </span>
                      )}
                    </div>
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
          </form>
        </div>
      </div>
    </Class>
  )
}

export default ClassShowAnswers
