import { FC, useState } from 'react'
import { useForm, usePage } from '@inertiajs/inertia-react'
import { SideBarSection } from '@/Layouts/Auth'
import { ComparatorState } from '@/Lib/answersReducer'
import { Questions } from './ClassCreateActivity'
import Class from '@/Layouts/Class'
import moment from 'moment'
import CheckBox from '@/Components/CheckBox'
import { cloneDeep } from 'lodash'
import {
  ReactCompareSlider,
  ReactCompareSliderHandle,
  ReactCompareSliderImage,
} from 'react-compare-slider'
import s3Client, { S3PageProps, getFileUrl } from '@/Lib/aws'

type Answer = {
  is_checked: boolean
  score: number
  student: {
    id: string
    username: string
    name: string
  }
  answers: {
    id: string
    data: Array<
      | {
          points: number
          answer: string | ComparatorState
          is_check?: boolean
        }
      | undefined
    >
  }
  activity: {
    id: string
    title: string
    total: number
    type: string
    time_end: string
    date_end: string
    questions: Questions
  }
}

type Props = {
  id: string
  answer_id: string
  sidebar?: Array<SideBarSection>
  answer: Answer
}

const ClassCheckAnswer: FC<Props> = ({ id, sidebar, answer_id, answer }) => {
  const date = answer.activity.date_end + ' ' + answer.activity.time_end
  const [score, setScore] = useState<number>(answer.score)
  const [isComparatorOpen, setIsComparatorOpen] = useState(false)
  const [currentComparator, setCurrentComparator] = useState<ComparatorState>()

  const { aws } = usePage().props
  const _aws = aws as S3PageProps
  const client = s3Client(_aws)

  const { data, setData, post, processing, errors } = useForm({
    answers: answer.answers,
    is_checked: answer.is_checked,
    score: 0,
  })

  const renderQuestionItem = (index: number) => {
    switch (answer.activity.questions[index].type) {
      case 'directions':
        return (
          <div className="prose">
            <div
              dangerouslySetInnerHTML={{
                __html: answer.activity.questions[index].instruction,
              }}
            ></div>
          </div>
        )

      case 'question':
        return (
          <div>
            <div className="prose">
              {answer.activity.questions[index].instruction}
            </div>
            <div className="prose mx-2 mt-4">
              {answer.answers.data[index]?.answer as string}
            </div>
          </div>
        )

      case 'essay':
        return (
          <div>
            <div className="prose">
              {answer.activity.questions[index].instruction}
            </div>
          </div>
        )

      case 'comparator':
        return (
          <div>
            <div className="prose">
              {answer.activity.questions[index].instruction}
            </div>
            <div>
              <div className="mt-4 px-4">
                <button
                  type="button"
                  className="w-full btn-primary"
                  onClick={() => {
                    setIsComparatorOpen(true)
                    setCurrentComparator(
                      cloneDeep(
                        answer.answers.data[index]?.answer as ComparatorState
                      )
                    )
                  }}
                >
                  Show
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return <div className="text-sm text-red-500">Invalid item!</div>
    }
  }

  return (
    <Class id={id} mode={2} role="instructor" sidebar={sidebar}>
      <div className="container-lg p-4 md:p-8">
        <div className="grid grid-cols-3">
          <div>
            <div className="text-sm">{answer.student.username}</div>
            <div className="text-lg">{answer.student.name}</div>
          </div>
          <div className="text-center">
            <div className="text-xl">{answer.activity.title}</div>
            <div className={'text-sm'}>
              Due {moment(date).format('ddd DD MMMM, h:mm A')}
            </div>
          </div>
        </div>

        <div className="w-full md:w-5/12 mx-auto pb-32 md:pb-16 mt-4">
          <div className="text-right mb-2">
            Score: {score}/{answer.activity.total}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              data.is_checked = true
              data.score = score
              post(`/class/${id}/activity/${answer.activity.id}/check`)
            }}
            className={isComparatorOpen ? 'hidden' : ''}
          >
            {answer.activity.questions.map((value, index) => (
              <fieldset key={index} className="card mb-4">
                <legend className="card-legend capitalize flex justify-between items-end">
                  <span>
                    {index + 1}. {value.type}
                  </span>
                  <span className="h-full">
                    {value.type != 'directions' ? (
                      <div className="flex gap-4">
                        <div>
                          <span>{value.points} </span>
                          <span className="text-sm">
                            {value.points > 1 ? <>Pts</> : <>Pt</>}
                          </span>
                        </div>
                        <CheckBox
                          name="check"
                          className="mb-0"
                          defaultChecked={data.answers.data[index]?.is_check}
                          onChange={(event) => {
                            const nAnswers = data.answers

                            if (event.target.checked) {
                              setScore(score + parseInt(value.points as any))
                              nAnswers.data[index] = {
                                ...nAnswers.data[index]!,
                                is_check: true,
                              }
                            } else {
                              setScore(score - parseInt(value.points as any))
                              nAnswers.data[index] = {
                                ...nAnswers.data[index]!,
                                is_check: false,
                              }
                            }

                            setData({
                              ...data,
                              answers: nAnswers,
                            })
                          }}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </span>
                </legend>
                <div className="card-legend-body py-2">
                  {renderQuestionItem(index)}
                </div>
              </fieldset>
            ))}
            <div className="p-4">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={processing}
              >
                Submit
              </button>
            </div>
          </form>
          <div className={isComparatorOpen ? '' : 'hidden'}>
            {currentComparator ? (
              <div>
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src={getFileUrl(
                        client,
                        _aws.bucket,
                        currentComparator!.images[
                          currentComparator!.current.left
                        ]
                      )}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={getFileUrl(
                        client,
                        _aws.bucket,
                        currentComparator!.images[
                          currentComparator!.current.right
                        ]
                      )}
                      style={{
                        position: 'relative',
                        ...currentComparator!.styles.right,
                        pointerEvents: 'none',
                      }}
                    />
                  }
                  position={currentComparator!.position}
                  handle={
                    <ReactCompareSliderHandle
                      buttonStyle={{ display: 'none', pointerEvents: 'none' }}
                      linesStyle={{
                        height: '100%',
                        width: 3,
                        pointerEvents: 'none',
                      }}
                      style={{ pointerEvents: 'none' }}
                    />
                  }
                  style={{ pointerEvents: 'none' }}
                />
                <div className="flex justify-center">
                  <div className="prose">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: currentComparator!.essay,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="p-4">
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => setIsComparatorOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </Class>
  )
}

export default ClassCheckAnswer
