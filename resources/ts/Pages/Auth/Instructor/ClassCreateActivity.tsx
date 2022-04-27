import { FC, ChangeEvent, useState, useCallback } from 'react'
import { useForm, usePage } from '@inertiajs/inertia-react'
import {
  PlusCircleIcon,
  TemplateIcon,
  PaperClipIcon,
  PencilAltIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import { XCircleIcon } from '@heroicons/react/solid'
import ReactTooltip from 'react-tooltip'
import ImageViewer from 'react-simple-image-viewer'
import TextInput from '@/Components/TextInput'
import FileInput from '@/Components/FileInput'
import Class from '@/Layouts/Class'
import RadioGroup from '@/Components/RadioGroup'
import Error from '@/Components/Error'
import CheckBox from '@/Components/CheckBox'
import Editor from '@/Components/Editor'

export type Activity = 'assignment' | 'exam'

type QuestionType = 'question' | 'comparator' | 'essay' | 'directions'
type Choices = 'radio' | 'checkbox'

export type Question = {
  type: QuestionType
  instruction: string
  choices?: { type: Choices; active: 0 | 1; data: Array<string> }
  files: FileList | Array<string> | null
  points: number
}

export type Questions = Array<Question>

type Props = {
  id: string
}

const ClassCreateActivity: FC<Props> = ({ id }) => {
  const [images, setImages] = useState<Array<string>>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const openImageViewer = useCallback((index: number) => {
    setCurrentImage(index)
    setIsViewerOpen(true)
  }, [])

  const closeImageViewer = useCallback(() => {
    setCurrentImage(0)
    setIsViewerOpen(false)
  }, [])

  const { data, setData, post, processing, errors } = useForm<{
    title: string
    type: Activity
    date_end: string
    time_end: string
    questions: Questions
  }>('Class:' + id + '/CreateActivity', {
    title: '',
    type: 'assignment',
    date_end: new Date().toISOString().split('T')[0],
    time_end: '23:59',
    questions: [],
  })

  const { errors: error_bag } = usePage().props

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    switch (name) {
      case 'title':
        setData({ ...data, title: value })
        break
      case 'type':
        setData({ ...data, type: value as Activity })
        break
      case 'date_end':
        setData({ ...data, date_end: value })
        break
      default:
        console.error('Invalid input name!')
    }
  }

  const handleAddingQuestions = (type: QuestionType) => {
    const nQuestions = data.questions

    switch (type) {
      case 'question':
        nQuestions.push({
          type: type,
          instruction: '',
          points: 1,
          choices: {
            type: 'radio',
            active: 0,
            data: [],
          },
          files: null,
        })
        break
      case 'essay':
        nQuestions.push({
          type: type,
          instruction: '',
          points: 1,
          files: null,
        })
        break
      case 'comparator':
        nQuestions.push({
          type: type,
          instruction: '',
          points: 1,
          files: null,
        })
        break
      case 'directions':
        nQuestions.push({
          type: type,

          instruction: '',
          points: 0,
          files: null,
        })
        break
      default:
        console.error('Invalid question type!')
        return
    }
    setData({ ...data, questions: nQuestions })
  }

  const handleQuestionChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value, checked, valueAsNumber } = event.target
    let nQuestions = data.questions

    switch (name) {
      case 'instruction':
        nQuestions[index].instruction = value
        break
      case 'points':
        nQuestions[index].points = valueAsNumber
        break
      case 'choice-active':
        nQuestions[index].choices!.active = checked ? 1 : 0
        break
      default:
        console.error('Invalid question field!')
        return
    }

    setData({ ...data, questions: nQuestions })
  }

  const renderQuestionBody = (index: number) => {
    switch (data.questions[index].type) {
      case 'directions':
        return (
          <div className="card-legend-body py-2">
            <Editor
              name="direction"
              setContents={data.questions[index].instruction}
              onChange={(content) => {
                const nQuestions = data.questions
                nQuestions[index].instruction = content
                setData({ ...data, questions: nQuestions })
              }}
              placeholder="Enter directions..."
            />
          </div>
        )
      case 'question':
        return (
          <div className="card-legend-body py-2">
            <TextInput
              label="Instruction"
              name="instruction"
              value={data.questions[index].instruction}
              onChange={(event) => handleQuestionChange(event, index)}
            />
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <TextInput
                label="Points"
                name="points"
                type="number"
                value={data.questions[index].points}
                className="w-fit flex-grow-0"
                onChange={(event) => handleQuestionChange(event, index)}
              />
              <div className="flex-grow">
                <CheckBox
                  label="Has Choices"
                  name="choice-active"
                  value={data.questions[index].choices?.active}
                  onChange={(event) => handleQuestionChange(event, index)}
                />
              </div>
            </div>
            {data.questions[index].choices?.active ? (
              <div className="px-4 flex flex-col">
                <span className="label">Choices</span>
                <div>
                  <RadioGroup
                    name={'choices-' + index + '-type'}
                    values={['radio', 'checkbox']}
                    onChange={(event) => {
                      const nQuestions = data.questions
                      nQuestions[index].choices!.type = event.target
                        .value as Choices

                      setData({
                        ...data,
                        questions: nQuestions,
                      })
                    }}
                  />

                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => {
                      const nQuestions = data.questions
                      nQuestions[index].choices!.data.push('')
                      setData({
                        ...data,
                        questions: nQuestions,
                      })
                    }}
                  >
                    Add Choice
                  </button>
                </div>
                <div className="mt-4">
                  {data.questions[index].choices!.data.map((_, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 md:gap-4 items-stretch"
                    >
                      <button
                        type="button"
                        className="text-red-500 flex-grow-0 w-fit h-auto outline-none"
                        tabIndex={-1}
                        onClick={() => {
                          const nQuestions = data.questions
                          nQuestions[index].choices!.data.splice(idx, 1)

                          setData({
                            ...data,
                            questions: nQuestions,
                          })
                        }}
                      >
                        <XCircleIcon className="icon" />
                      </button>
                      <TextInput
                        name="choice-data"
                        value={data.questions[index].choices!.data[idx]}
                        onChange={(event) => {
                          const nQuestions = data.questions
                          nQuestions[index].choices!.data[idx] =
                            event.target.value
                          setData({
                            ...data,
                            questions: nQuestions,
                          })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        )

      case 'essay':
        return (
          <div className="card-legend-body py-2">
            <TextInput
              label="Instruction"
              name="instruction"
              value={data.questions[index].instruction}
              onChange={(event) => handleQuestionChange(event, index)}
            />
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <TextInput
                label="Points"
                name="points"
                type="number"
                value={data.questions[index].points}
                className="w-fit flex-grow-0"
                onChange={(event) => handleQuestionChange(event, index)}
              />
            </div>
          </div>
        )

      case 'comparator':
        return (
          <div className="card-legend-body py-2">
            <TextInput
              label="Instruction"
              name="instruction"
              value={data.questions[index].instruction}
              onChange={(event) => handleQuestionChange(event, index)}
            />
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <TextInput
                label="Points"
                name="points"
                type="number"
                value={data.questions[index].points}
                className="w-fit flex-grow-0"
                onChange={(event) => handleQuestionChange(event, index)}
              />
            </div>
            <div>
              <FileInput
                label="Images"
                name="files"
                accepts="image"
                onChange={(event) => {
                  const nQuestions = data.questions
                  nQuestions[index].files = event.target.files
                  setData({ ...data, questions: nQuestions })
                }}
                multiple
              />
              <div className="flex gap-2 overflow-y-auto px-4 py-2">
                {data.questions[index].files ? (
                  Array.from(data.questions[index].files! as FileList).map(
                    (value, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          const nImages = Array.from(
                            data.questions[index].files! as FileList
                          ).map((value) => URL.createObjectURL(value))
                          setImages(nImages)

                          openImageViewer(idx)
                        }}
                      >
                        <img
                          src={URL.createObjectURL(value)}
                          className="w-16 h-16 rounded-md"
                        />
                      </button>
                    )
                  )
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        )
      default:
        console.error('Invalid question type!')
    }
  }

  return (
    <Class id={id} mode={3}>
      <div className="container-lg p-4 md:p-8">
        <p className="font-light text-lg w-fit mx-auto mb-4">Create Activity</p>
        <div className="">
          <form
            className="w-full md:w-5/12 mx-auto pb-32 md:pb-16"
            onSubmit={(event) => {
              event.preventDefault()
              post(`/class/${id}/activity/create`, {
                _method: 'put',
              } as any)
            }}
            encType="multipart/form-data"
          >
            <fieldset className="card mb-4">
              <legend className="card-legend">General Settings</legend>
              <div className="card-legend-body py-2">
                <TextInput
                  name="title"
                  label="Activity Title"
                  value={data.title}
                  error={{ value: errors.title }}
                  onChange={handleInputChange}
                />
                <div className="label">Activity Type</div>
                <RadioGroup
                  name="type"
                  values={['assignment', 'exam']}
                  error={{ value: errors.type }}
                  onChange={handleInputChange}
                  className="capitalize"
                />
                <div className="md:flex gap-4">
                  {data.type == 'assignment' ? (
                    <>
                      <TextInput
                        label="Date End (mm/dd/yyyy)"
                        type="date"
                        name="date_end"
                        value={data.date_end}
                        error={{
                          value: errors.date_end,
                        }}
                        onChange={handleInputChange}
                        className="mb-2 md:mb-4 flex-grow"
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  <TextInput
                    label="Time End"
                    type="time"
                    name="time_end"
                    value={data.time_end}
                    error={{ value: errors.date_end }}
                    onChange={handleInputChange}
                    className={data.type == 'assignment' ? 'flex-grow' : ''}
                  />
                </div>
              </div>
            </fieldset>
            {Object.keys(error_bag as Object).length >= 1 && (
              <div className="border border-red-500 rounded-md w-full flex justify-center mb-4 py-8">
                <Error
                  value={Object.keys(error_bag).at(0) ?? ''}
                  message="Please check your questions"
                />
              </div>
            )}
            {data.questions.map((_, index) => (
              <fieldset className="card mb-4" key={index}>
                <legend className="card-legend capitalize flex justify-between">
                  <span>
                    {index + 1}. {data.questions[index].type}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nQuestions = data.questions
                      nQuestions.splice(index, 1)
                      setData({
                        ...data,
                        questions: nQuestions,
                      })
                    }}
                  >
                    <XCircleIcon className="icon" />
                  </button>
                </legend>
                {renderQuestionBody(index)}
              </fieldset>
            ))}
            <div className="flex justify-end">
              <button
                className="btn-primary w-full md:w-fit"
                disabled={processing}
              >
                Submit
              </button>
            </div>
          </form>
          <div className="fixed z-10 inset-y-0 right-3.5 md:right-[20%] lg:right-[23%]">
            <div className="h-full flex flex-col justify-end md:justify-center">
              <div className="card-sm py-8 flex flex-col gap-4">
                <button
                  type="button"
                  className="flex gap-2 items-center"
                  data-tip="Add Directions"
                  name="question"
                  onClick={() => handleAddingQuestions('directions')}
                >
                  <InformationCircleIcon className="icon" />
                </button>
                <button
                  type="button"
                  className="flex gap-2 items-center"
                  data-tip="Add Question"
                  name="question"
                  onClick={() => handleAddingQuestions('question')}
                >
                  <PlusCircleIcon className="icon" />
                </button>
                <button
                  type="button"
                  className="flex gap-2 items-center"
                  data-tip="Add Essay"
                  name="essay"
                  onClick={() => handleAddingQuestions('essay')}
                >
                  <PaperClipIcon className="icon" />
                </button>
                <button
                  type="button"
                  className="flex gap-2 items-center"
                  data-tip="Add Comparator"
                  name="comparator"
                  onClick={() => handleAddingQuestions('comparator')}
                >
                  <TemplateIcon className="icon" />
                </button>

                <a
                  href="#"
                  className="flex gap-2 items-center"
                  data-tip="Import Question"
                >
                  <PencilAltIcon className="icon" />
                </a>
                <ReactTooltip place="left" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isViewerOpen ? (
        <ImageViewer
          src={images}
          currentIndex={currentImage}
          disableScroll={false}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
          backgroundStyle={{
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 20,
          }}
        />
      ) : (
        <></>
      )}
    </Class>
  )
}

export default ClassCreateActivity
