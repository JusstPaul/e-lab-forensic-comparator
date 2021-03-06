import {
  FC,
  ChangeEvent,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { useForm, usePage } from '@inertiajs/inertia-react'
import {
  PlusCircleIcon,
  TemplateIcon,
  PencilAltIcon,
  InformationCircleIcon,
  DocumentDownloadIcon,
} from '@heroicons/react/outline'
import { SearchCircleIcon, XCircleIcon } from '@heroicons/react/solid'
import Auth from '@/Layouts/Auth'
import Editor from '@/Components/Editor'
import {
  Container,
  Card,
  Text,
  Box,
  Group,
  Button,
  Affix,
  Stack,
  ActionIcon,
  Tooltip,
  Checkbox,
  Image,
  Alert,
  Portal,
  Highlight,
  Table,
} from '@mantine/core'
import Input from '@/Components/Input'
import Selection from '@/Components/Selection'
import DateInput from '@/Components/DateInput'
import Time from '@/Components/Time'
import useStyles from '@/Lib/styles'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import Upload from '@/Components/Upload'
import dayjs from 'dayjs'
import ImageViewer from 'react-simple-image-viewer'
import { cloneDeep } from 'lodash'
import { useModals } from '@mantine/modals'
import { Link } from '@inertiajs/inertia-react'
import { Student } from '../InstructorAndStudent/ClassOverview'

export type Activity = 'assignment' | 'exam'

type QuestionType = 'question' | 'comparator' | 'essay' | 'directions'
type Choices = 'radio' | 'checkbox'

export type Question = {
  id: number
  type: QuestionType
  instruction: string
  choices?: { type: Choices; active: boolean; data: Array<string> }
  files: FileList | Array<string> | null
  answer?: string
  points: number
}

export type Questions = Array<Question>

type Props = {
  id: string
  import_activity: {
    title: string
    type: QuestionType
    questions: Questions
  } | null
  current_students: Array<Student>
}

type RenderItemsProps = {
  value: Question
  index: number
  data: Function
  setData: Function
  onImageOpen: Function
}

const RenderItems: FC<RenderItemsProps> = ({
  value,
  index,
  data,
  setData,
  onImageOpen,
}) => {
  const classes = useStyles()

  const [currentValue, setCurrentValue] = useState(value)
  useEffect(() => {
    let nQuestions = [...data().questions]
    nQuestions[index] = cloneDeep(currentValue)

    setData({ ...data(), questions: cloneDeep(nQuestions) })
  }, [currentValue])

  const handleInstructionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: val } = event.target

    setCurrentValue({
      ...currentValue,
      instruction: val,
    })
  }

  const handlePointsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { valueAsNumber } = event.target

    setCurrentValue({
      ...currentValue,
      points: valueAsNumber,
    })
  }

  switch (value.type) {
    case 'directions':
      return (
        <Editor
          name="directions"
          setContents={currentValue.instruction}
          onChange={(content) => {
            let nValue = currentValue
            nValue.instruction = content
            setCurrentValue(nValue)
          }}
        />
      )

    case 'question':
      return (
        <Box>
          <Input
            textProps={{
              label: 'Instruction',
              name: 'instruction',
              value: currentValue.instruction,
              onChange: handleInstructionChange,
            }}
          />
          <Group align="center">
            <Input
              textProps={{
                label: 'Points',
                name: 'points',
                type: 'number',
                value: currentValue.points,
                onChange: handlePointsChange,
              }}
            />
            <Checkbox
              label="Has Choices"
              name="has-choice"
              onChange={(event) => {
                if (currentValue.choices) {
                  setCurrentValue({
                    ...currentValue,
                    choices: {
                      ...currentValue.choices,
                      active: event.currentTarget.checked,
                    },
                  })
                } else {
                  const nValue = value
                  nValue.choices = {
                    active: event.currentTarget.checked,
                    data: [],
                    type: 'checkbox',
                  }
                  setCurrentValue({ ...nValue })
                }
              }}
            />

            <Checkbox
              label="Has Correct Answer"
              name={`has-answer-${currentValue.id}`}
              onChange={() => {
                if (currentValue.answer != undefined) {
                  setCurrentValue({
                    ...currentValue,
                    answer: undefined,
                  })
                } else {
                  setCurrentValue({ ...currentValue, answer: '' })
                }
              }}
            />
          </Group>
          {currentValue.choices && currentValue.choices.active == true ? (
            <Box>
              <Selection
                selectProps={{
                  label: 'Choice Type',
                  placeholder: 'Select one',
                  value: currentValue.choices.type,
                  data: [
                    { value: 'radio', label: 'Radio' },
                    { value: 'checkbox', label: 'Checkbox' },
                  ],
                  searchable: true,
                  nothingFound: 'Invalid choice type',
                  onChange: (value) => {
                    if (currentValue.choices) {
                      setCurrentValue({
                        ...currentValue,
                        choices: {
                          ...currentValue.choices,
                          type: value as any,
                        },
                      })
                    } else {
                      console.error('Render error on question')
                    }
                  },
                }}
              />
              <Group>
                <Text
                  size="sm"
                  weight="500"
                  sx={(theme) => ({
                    color: theme.colors.gray[9],
                  })}
                >
                  Choices
                </Text>
                <ActionIcon
                  color="cyan"
                  variant="outline"
                  onClick={() => {
                    if (currentValue.choices) {
                      let nData = currentValue.choices.data
                      nData.push('')
                      setCurrentValue({
                        ...currentValue,
                        choices: {
                          ...currentValue.choices,
                          data: nData,
                        },
                      })
                    } else {
                      console.error('Render error on question')
                    }
                  }}
                >
                  <Tooltip label="Add Choice" withArrow>
                    <PlusCircleIcon className={classes.classes.icon} />
                  </Tooltip>
                </ActionIcon>
              </Group>
              <Stack py="sm">
                {currentValue.choices.data.map((val, idx) => (
                  <Input
                    key={idx}
                    textProps={{
                      name: 'choice-data',
                      value: val,
                      onChange: (event) => {
                        if (currentValue.choices) {
                          let nData = currentValue.choices.data
                          nData[idx] = event.target.value

                          setCurrentValue({
                            ...currentValue,
                            choices: {
                              ...currentValue.choices,
                              data: nData,
                            },
                          })
                        } else {
                          console.error('Render error on question data')
                        }
                      },
                      rightSection: (
                        <ActionIcon
                          color="red"
                          onClick={() => {
                            if (currentValue.choices) {
                              let nData = currentValue.choices.data
                              nData.splice(idx, 1)

                              setCurrentValue({
                                ...currentValue,
                                choices: {
                                  ...currentValue.choices,
                                  data: nData,
                                },
                              })
                            } else {
                              console.error('Render error on question data')
                            }
                          }}
                        >
                          <XCircleIcon className={classes.classes.icon} />
                        </ActionIcon>
                      ),
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            <></>
          )}

          {currentValue.answer !== undefined ? (
            <>
              {currentValue.choices && currentValue.choices.active ? (
                <Box>
                  <Selection
                    selectProps={{
                      data: currentValue.choices.data.map((value) => ({
                        value: value,
                        label: value,
                      })),
                      value: currentValue.answer,
                      placeholder: 'Select answer',
                      onChange: (value) => {
                        if (currentValue.answer != undefined && value) {
                          setCurrentValue({
                            ...currentValue,
                            answer: value,
                          })
                        }
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box>
                  <Input
                    textProps={{
                      label: 'Answer',
                      name: `answer-${currentValue.id}`,
                      value: currentValue.answer,
                      onChange: (event) => {
                        if (currentValue.answer != undefined) {
                          setCurrentValue({
                            ...currentValue,
                            answer: event.target.value,
                          })
                        }
                      },
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <></>
          )}
        </Box>
      )

    case 'essay':
      return (
        <Box>
          <Input
            textProps={{
              label: 'Instruction',
              name: 'instruction',
              value: currentValue.instruction,
              onChange: handleInstructionChange,
            }}
          />
          <Group>
            <Input
              textProps={{
                label: 'Points',
                name: 'points',
                type: 'number',
                value: currentValue.points,
                onChange: handlePointsChange,
              }}
            />
          </Group>
        </Box>
      )

    case 'comparator':
      return (
        <Box>
          <Input
            textProps={{
              label: 'Instruction',
              name: 'instruction',
              value: currentValue.instruction,
              onChange: handleInstructionChange,
            }}
          />
          <Group>
            <Input
              textProps={{
                label: 'Points',
                name: 'points',
                type: 'number',
                value: currentValue.points,
                onChange: handlePointsChange,
              }}
            />
            <Upload
              id={`comparator-${currentValue.id}`}
              name={`comparator-${currentValue.id}`}
              label="Upload Image"
              onChange={(event) => {
                setCurrentValue({
                  ...currentValue,
                  files: event.target.files,
                })
              }}
            />
          </Group>

          {currentValue.files ? (
            <>
              <Text
                size="sm"
                weight="500"
                sx={(theme) => ({
                  color: theme.colors.gray[9],
                })}
              >
                Specimens
              </Text>
              <Group spacing="xs" position="center">
                {Array.from(currentValue.files as FileList).map(
                  (value, idx) => (
                    <Image
                      key={idx}
                      radius="lg"
                      src={URL.createObjectURL(value)}
                      width={200}
                      height={200}
                      withPlaceholder
                      fit="contain"
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        onImageOpen(
                          Array.from(currentValue.files as FileList).map(
                            (value) => URL.createObjectURL(value)
                          ),
                          idx
                        )
                      }
                    />
                  )
                )}
              </Group>
            </>
          ) : (
            <></>
          )}
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

const ClassCreateActivity: FC<Props> = ({
  id,
  import_activity,
  current_students,
}) => {
  const classes = useStyles()

  const atLeastMd = useMediaQuery('(min-width: 992px)')
  const indexRef = useRef(0)
  const generateID = () => {
    const val = indexRef.current
    indexRef.current++
    return val
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const { height, width } = useViewportSize()

  const getRightMenuLocation = () => {
    if (atLeastMd && containerRef.current) {
      const halfWidth = width / 2
      const continerWidth =
        containerRef.current.getBoundingClientRect().width / 2
      return width - (continerWidth + halfWidth + 200)
    }
    return 10
  }

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [currentImageOpen, setCurrentImageOpen] = useState(0)
  const [currentImages, setCurrentImages] = useState<Array<string>>([])

  const openImageViewer = useCallback((index: number) => {
    setCurrentImageOpen(index)
    setIsImageViewerOpen(true)
  }, [])
  const closeImageViewer = () => {
    setCurrentImageOpen(0)
    setIsImageViewerOpen(false)
  }

  const { data, setData, post, processing, errors } = useForm<{
    title: string
    type: Activity
    date_end: Date
    time_end: Date
    questions: Questions
    students: Array<string>
  }>('Class:' + id + '/CreateActivity', {
    title: import_activity?.title ?? '',
    type: (import_activity?.type as any) ?? 'assignment',
    date_end: dayjs(new Date()).add(1, 'day').toDate(),
    time_end: new Date(),
    questions: import_activity?.questions ?? [],
    students: [],
  })

  const [isShowStudents, setIsShowStudents] = useState(false)

  const { errors: error_bag } = usePage().props

  const handleAddingQuestions = (type: QuestionType) => {
    const nQuestions = data.questions

    switch (type) {
      case 'question':
        nQuestions.push({
          id: generateID(),
          type: type,
          instruction: '',
          points: 1,
          choices: {
            type: 'checkbox',
            active: false,
            data: [],
          },
          files: null,
        })
        break
      case 'essay':
        nQuestions.push({
          id: generateID(),
          type: type,
          instruction: '',
          points: 1,
          files: null,
        })
        break
      case 'comparator':
        nQuestions.push({
          id: generateID(),
          type: type,
          instruction: '',
          points: 1,
          files: null,
        })
        break
      case 'directions':
        nQuestions.push({
          id: generateID(),
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

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    switch (name) {
      case 'title':
        setData({ ...data, title: value })
        break
      case 'type':
        setData({ ...data, type: value as Activity })
        break
      default:
        console.error('Invalid input name!')
    }
  }

  const modals = useModals()
  const openConfirmModal = () =>
    modals.openConfirmModal({
      title: `Submit Task`,
      children: (
        <Highlight highlight={data.title} size="sm">
          {`Are you sure you want to post task ${data.title}?`}
        </Highlight>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => {
        post(`/class/${id}/activity/create`, {
          _method: 'put',
        } as any)
      },
    })

  const [search, setSearch] = useState('')
  const [searchIndexes, setSearchIndexes] = useState<Array<number>>([])

  return (
    <Auth class_id={id} isNavHidden={isImageViewerOpen}>
      <Container size="sm" ref={containerRef}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            openConfirmModal()
          }}
          encType="multipart/form-data"
        >
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
              })}
            >
              <Text>General Settings</Text>
            </Card.Section>
            <Box py="sm">
              <Input
                textProps={{
                  name: 'title',
                  label: 'Task Title',
                  value: data.title,
                  onChange: handleInputChange,
                }}
                error={{
                  value: errors.title,
                }}
              />
              <Selection
                selectProps={{
                  label: 'Task Type',
                  placeholder: 'Select one',
                  value: data.type,
                  data: [
                    { value: 'assignment', label: 'Assignment' },
                    { value: 'exam', label: 'Exam' },
                  ],
                  searchable: true,
                  nothingFound: 'Invalid task type',
                  onChange: (value) => {
                    setData({ ...data, type: value as any })
                  },
                }}
                error={{
                  value: errors.type,
                }}
              />
              <Group grow>
                {data.type == 'assignment' ? (
                  <DateInput
                    dateProps={{
                      label: 'Date End',
                      name: 'date_end',
                      value: data.date_end,
                      minDate: dayjs(new Date()).add(1, 'day').toDate(),
                      onChange: (event) => {
                        if (event) {
                          setData({ ...data, date_end: event })
                        }
                      },
                    }}
                    error={{ value: errors.date_end }}
                  />
                ) : (
                  <></>
                )}
                <Time
                  timeProps={{
                    label: 'Time End',
                    name: 'time_end',
                    value: data.time_end,
                    onChange: (event) => {
                      if (event) {
                        setData({ ...data, time_end: event })
                      }
                    },
                  }}
                  error={{ value: errors.time_end }}
                />
              </Group>

              <Checkbox
                label="Only selected students"
                onChange={(event) =>
                  setIsShowStudents(event.currentTarget.checked)
                }
              />
            </Box>
          </Card>

          {isShowStudents ? (
            <Card
              p="sm"
              withBorder
              sx={() => ({
                marginBottom: '1rem',
              })}
            >
              <Group position="right">
                <Input
                  textProps={{
                    placeholder: 'Search student',
                    value: search,
                    onChange: (event) => setSearch(event.target.value),
                    rightSection: (
                      <ActionIcon
                        onClick={() => {
                          if (search.length == 0) {
                            setSearchIndexes([])
                            return
                          }

                          try {
                            const searchRegex = new RegExp(search, 'ig')
                            const nIndexes: Array<number> = []

                            current_students.forEach(
                              ({ name, username }, index) => {
                                if (
                                  name.match(searchRegex) == null &&
                                  username.match(searchRegex) == null
                                ) {
                                  nIndexes.push(index)
                                }
                              }
                            )

                            setSearchIndexes(nIndexes)
                          } catch (error) {
                            console.error(error)
                          }
                        }}
                      >
                        <SearchCircleIcon className={classes.classes.icon} />
                      </ActionIcon>
                    ),
                  }}
                />
              </Group>
              <Table striped>
                <caption>Target Students</caption>
                <thead>
                  <tr>
                    <th></th>
                    <th>Student Number</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {current_students.map((value, index) => (
                    <tr key={value.id}>
                      {searchIndexes.indexOf(index) == -1 ? (
                        <>
                          <td>
                            <Checkbox
                              size="xs"
                              onChange={(event) => {
                                const { checked } = event.currentTarget
                                let nStudents = data.students

                                if (checked) {
                                  nStudents.push(value.id)
                                } else {
                                  const idx = nStudents.indexOf(value.id)
                                  nStudents.splice(idx, 1)
                                }

                                setData({ ...data, students: nStudents })
                              }}
                              checked={data.students.indexOf(value.id) != -1}
                            />
                          </td>
                          <td>{value.username}</td>
                          <td style={{ textTransform: 'uppercase' }}>
                            {value.name}
                          </td>
                        </>
                      ) : (
                        <></>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : (
            <></>
          )}

          {Object.keys(error_bag).length >= 1 && (
            <Alert
              icon={<InformationCircleIcon className={classes.classes.icon} />}
              title="Create Task Error"
              color="red"
            >
              Please check your questions
            </Alert>
          )}

          {data.questions.map((_, index) => (
            <Card
              key={data.questions[index].id}
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
                })}
              >
                <Text transform="capitalize">
                  {data.questions[index].type != 'directions' ? (
                    <>{index + 1}. </>
                  ) : (
                    ''
                  )}
                  {data.questions[index].type}
                </Text>
                <ActionIcon
                  sx={(theme) => ({
                    color: theme.colors.gray[0],
                    ':hover': {
                      backgroundColor: theme.colors.cyan[7],
                      color: theme.colors.gray[1],
                    },
                  })}
                  type="button"
                  onClick={() => {
                    let nQuestions = data.questions
                    nQuestions.splice(index, 1)
                    setData({ ...data, questions: nQuestions })
                  }}
                >
                  <XCircleIcon className={classes.classes.icon} />
                </ActionIcon>
              </Card.Section>
              <Box py="sm">
                <RenderItems
                  value={data.questions[index]}
                  index={index}
                  data={() => data}
                  setData={setData}
                  onImageOpen={(images: Array<string>, index: number) => {
                    setCurrentImages(images)
                    openImageViewer(index)
                  }}
                />
              </Box>
            </Card>
          ))}

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
      <Affix
        position={{
          bottom: atLeastMd ? height / 2 - 60 : 10,
          right: getRightMenuLocation(),
        }}
        zIndex={5}
      >
        <Card p="xs" withBorder>
          <Stack>
            <ActionIcon
              variant="hover"
              onClick={() => handleAddingQuestions('directions')}
            >
              <Tooltip withArrow label="Add Directions">
                <InformationCircleIcon className={classes.classes.icon} />
              </Tooltip>
            </ActionIcon>
            <ActionIcon
              variant="hover"
              onClick={() => handleAddingQuestions('question')}
            >
              <Tooltip withArrow label="Add Question">
                <PlusCircleIcon className={classes.classes.icon} />
              </Tooltip>
            </ActionIcon>
            <ActionIcon
              variant="hover"
              onClick={() => handleAddingQuestions('essay')}
            >
              <Tooltip withArrow label="Add Essay">
                <PencilAltIcon className={classes.classes.icon} />
              </Tooltip>
            </ActionIcon>
            <ActionIcon
              variant="hover"
              onClick={() => handleAddingQuestions('comparator')}
            >
              <Tooltip withArrow label="Add Comparator">
                <TemplateIcon className={classes.classes.icon} />
              </Tooltip>
            </ActionIcon>
            <ActionIcon
              variant="hover"
              component={Link}
              href={`/class/${id}/activity/import`}
              replace
            >
              <Tooltip withArrow label="Use Previous Task">
                <DocumentDownloadIcon className={classes.classes.icon} />
              </Tooltip>
            </ActionIcon>
          </Stack>
        </Card>
      </Affix>
      <Portal zIndex={20} position="absolute">
        {isImageViewerOpen && (
          <ImageViewer
            src={currentImages}
            currentIndex={currentImageOpen}
            disableScroll={false}
            closeOnClickOutside={true}
            onClose={closeImageViewer}
          />
        )}
      </Portal>
    </Auth>
  )
}

export default ClassCreateActivity
