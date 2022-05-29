// NOTE: Whoever reads this code, just don't.
import {
  FC,
  useState,
  useCallback,
  useEffect,
  useRef,
  CSSProperties,
} from 'react'
import { Inertia } from '@inertiajs/inertia'
import { Link, usePage } from '@inertiajs/inertia-react'
import ImageViewer from 'react-simple-image-viewer'
import Auth, { User } from '@/Layouts/Auth'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Editor from '@/Components/Editor'
import html2canvas from 'html2canvas'
import Cropper, { Area } from 'react-easy-crop'
import * as markerjs2 from 'markerjs2'
import { XCircleIcon } from '@heroicons/react/solid'
import Select from '@/Components/Select'
import { Question } from '../Instructor/ClassCreateActivity'
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Switch,
  Text,
} from '@mantine/core'
import Selection from '@/Components/Selection'
import { toBlob } from 'html-to-image'
import Axios from 'axios'
import useStyles from '@/Lib/styles'

type FilterProps = 'none' | 'hue' | 'sepia' | 'saturate' | 'grayscale'

export type Annotation = {
  image: File | string
  isKey: boolean
  essay: string
  state?: markerjs2.MarkerAreaState
}
export type AnnotationsState = Array<Annotation>

type Props = {
  id: string
  activity_id: string
  answer_index: number
  question: Question
  state_annotation?: AnnotationsState
}

const Comparator: FC<Props> = ({
  id,
  activity_id,
  answer_index,
  state_annotation,
  question,
}) => {
  const { aws, user } = usePage().props
  const _aws = aws as S3PageProps
  const { classes } = useStyles()

  const [selectMode, setSelectMode] = useState<'left' | 'right'>('left')
  const [isImagePreview, setIsImagePreview] = useState(false)

  // Comparator
  const [images, setImages] = useState<Array<string>>([])
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(1)
  useEffect(() => {
    const _user = user as User

    Axios.defaults.headers.common = {
      Authorization: `bearer ${_user.token}`,
    }

    const questionImages = question.files as Array<string>
    let images: Array<string> = []

    questionImages.map((value) =>
      Axios.get(`/api/file?key=${value}`, {
        headers: {
          Authorization: `Bearer ${_user.token}`,
        },
        responseType: 'blob',
      })
        .then((response) => {
          const reader = new window.FileReader()
          reader.readAsDataURL(response.data)
          reader.onload = () => {
            let nImages = images
            nImages.push(reader.result?.toString() ?? '#')
            setImages([...nImages])
          }
        })
        .catch((error) => {
          alert('File fetch error!')
          console.log(error)
        })
    )
  }, [])

  const [filter, setFilter] = useState<FilterProps>('none')

  const [annotations, setAnnotations] = useState<Array<Annotation>>(
    state_annotation ? state_annotation : []
  )

  const setFilterView = (): CSSProperties => {
    switch (filter) {
      case 'hue':
        return { filter: 'hue-rotate(180deg)' }
      case 'hue':
        return { filter: 'hue-rotate(180deg)' }
      case 'sepia':
        return { filter: 'sepia(100%)' }
      case 'saturate':
        return { filter: 'saturate(4)' }
      case 'grayscale':
        return { filter: 'grayscale(100%)' }
      case 'none':
      default:
        return {}
    }
  }

  const [leftCrop, setLeftCrop] = useState({ x: 0, y: 0 })
  const [leftZoom, setLeftZoom] = useState(1)
  const [leftCroppedArea, setLeftCroppedArea] = useState<Area>()

  const [rightCrop, setRightCrop] = useState({ x: 0, y: 0 })
  const [rightZoom, setRightZoom] = useState(1)
  const [rightCroppedArea, setRightCroppedArea] = useState<Area>()

  const ASPECT = 3 / 2

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <Auth class_id={id}>
      <Container size="xl">
        <Box>
          <Group position="right">
            <Button
              color="gray"
              component={Link}
              href={`/class/${id}/activity/${activity_id}`}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                Inertia.post(
                  `/class/${id}/activity/${activity_id}/index/${answer_index}`,
                  {
                    data: annotations,
                  } as any
                )
              }}
            >
              Done
            </Button>
          </Group>
        </Box>
        <Box
          style={{
            display: 'flex',
          }}
          py="sm"
        >
          <Stack
            style={{
              maxWidth: '200px',
            }}
          >
            <Button
              onClick={() => {
                if (containerRef.current) {
                  toBlob(containerRef.current, {
                    quality: 1,
                  })
                    .then((blob) => {
                      if (blob) {
                        const date = new Date().valueOf()
                        const nAnnotations = annotations
                        const file = new File(
                          [blob],
                          `comparator-${id}-${activity_id}-${answer_index}-${annotations.length}-${date}.png`,
                          {
                            type: 'image/png',
                            lastModified: date,
                          }
                        )

                        nAnnotations.push({
                          essay: '',
                          image: file,
                          isKey: false,
                        })

                        setAnnotations([...nAnnotations])
                        setFilter('none')
                      }
                    })
                    .catch((error) => {
                      alert('An Error Occured')
                      console.error(error)
                    })
                }
              }}
            >
              Screenshot
            </Button>

            <Selection
              selectProps={{
                label: 'Filter',
                value: filter,
                data: [
                  { value: 'none', label: 'None' },
                  { value: 'hue', label: 'Hue' },
                  { value: 'sepia', label: 'Sepia' },
                  { value: 'saturate', label: 'Saturate' },
                  { value: 'grayscale', label: 'Grayscale' },
                ],
                onChange: (value) => setFilter(value as any),
              }}
            />

            <Selection
              selectProps={{
                label: 'Select Mode',
                value: selectMode,
                data: [
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ],
                onChange: (value) => setSelectMode(value as any),
              }}
            />
            <Switch
              label={`Preview Image`}
              checked={isImagePreview}
              onChange={(event) =>
                setIsImagePreview(event.currentTarget.checked)
              }
            />

            <Box>
              <Text>Images</Text>
              <ScrollArea offsetScrollbars>
                <Stack>
                  {images.map((value, index) => (
                    <Image
                      src={value}
                      key={index}
                      sx={(theme) => ({
                        cursor: 'pointer',
                        borderStyle: 'solid',
                        borderWidth: '0.25rem',
                        borderColor:
                          leftIndex == index || rightIndex == index
                            ? theme.colors.cyan[7]
                            : theme.colors.gray[7],
                        borderRadius: theme.radius.md,
                      })}
                      onClick={() => {
                        if (!isImagePreview) {
                          switch (selectMode) {
                            case 'left':
                              setLeftIndex(index)
                              break
                            case 'right':
                              setRightIndex(index)
                          }
                        }
                      }}
                    />
                  ))}
                </Stack>
              </ScrollArea>
            </Box>
          </Stack>
          <Container size="xl">
            <Paper
              ref={containerRef}
              style={{
                display: 'flex',
              }}
              withBorder
            >
              <Skeleton visible={leftCroppedArea == undefined} radius={0}>
                {leftCroppedArea ? (
                  <View
                    url={images[leftIndex]}
                    croppedArea={leftCroppedArea}
                    aspect={ASPECT}
                    filter={setFilterView()}
                  />
                ) : (
                  <></>
                )}
              </Skeleton>

              <Skeleton visible={rightCroppedArea == undefined} radius={0}>
                {rightCroppedArea ? (
                  <View
                    url={images[rightIndex]}
                    croppedArea={rightCroppedArea}
                    aspect={ASPECT}
                    filter={setFilterView()}
                  />
                ) : (
                  <></>
                )}
              </Skeleton>
            </Paper>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                height: '50vh',
              }}
              py="sm"
            >
              <Box
                style={{
                  position: 'relative',
                  height: '50vh',
                  width: 300,
                  overflow: 'hidden',
                }}
              >
                <Cropper
                  image={images[leftIndex]}
                  aspect={ASPECT}
                  onCropChange={setLeftCrop}
                  crop={leftCrop}
                  onZoomChange={setLeftZoom}
                  zoom={leftZoom}
                  onCropAreaChange={(croppedArea) =>
                    setLeftCroppedArea(croppedArea)
                  }
                />
              </Box>

              <Box
                style={{
                  position: 'relative',
                  height: '50vh',
                  width: 300,
                  overflow: 'hidden',
                }}
              >
                <Cropper
                  image={images[rightIndex]}
                  aspect={ASPECT}
                  onCropChange={setRightCrop}
                  crop={rightCrop}
                  onZoomChange={setRightZoom}
                  zoom={rightZoom}
                  onCropAreaChange={(croppedArea) =>
                    setRightCroppedArea(croppedArea)
                  }
                />
              </Box>
            </Box>
          </Container>
        </Box>
        <Container size="sm" py="lg">
          <Stack>
            {annotations.map((value, index) => (
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
                  <Text transform="capitalize">Annotation #{index + 1}</Text>
                  <ActionIcon
                    sx={(theme) => ({
                      color: theme.colors.gray[0],
                      ':hover': {
                        backgroundColor: theme.colors.cyan[7],
                        color: theme.colors.gray[1],
                      },
                    })}
                    onClick={() => {
                      const nAnnotations = annotations
                      nAnnotations.splice(index, 1)
                      setAnnotations([...nAnnotations])
                    }}
                  >
                    <XCircleIcon className={classes.icon} />
                  </ActionIcon>
                </Card.Section>
                <Box py="sm">
                  <Marker
                    index={index}
                    value={value}
                    annotations={annotations}
                    setAnnotations={setAnnotations}
                  />
                </Box>
              </Card>
            ))}
          </Stack>
        </Container>
      </Container>
    </Auth>
  )
}

type MarkerProps = {
  index: number
  value: Annotation
  annotations: Array<Annotation>
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>
}
const Marker: FC<MarkerProps> = ({
  index,
  value,
  annotations,
  setAnnotations,
}) => {
  const { aws, user } = usePage().props
  const _aws = aws as S3PageProps
  const client = s3Client(_aws)
  const _user = user as User

  const [url, setUrl] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const overRef = useRef<HTMLImageElement>(null)
  const [parent, setParent] = useState<HTMLElement | null | undefined>()

  const [annotate, setAnnotate] = useState(value)

  useEffect(() => {
    if (value.isKey) {
      Axios.defaults.headers.common = {
        Authorizaton: `bearer ${_user.token}`,
      }

      Axios.get(`/api/file?key=${value.image as string}`, {
        headers: {
          Authorization: `Bearer ${_user.token}`,
        },
        responseType: 'blob',
      })
        .then((res) => {
          const reader = new window.FileReader()
          reader.readAsDataURL(res.data)
          reader.onload = () => {
            const result = reader.result?.toString()
            if (result) {
              setUrl(result)
              setParent(overRef.current?.parentElement)
            } else {
              alert('Error fetching image!')
            }
          }
        })
        .catch((error) => {
          alert('File fetching error!')
          console.error(error)
        })
    } else {
      setUrl(URL.createObjectURL(value.image as File))
    }
  }, [])

  useEffect(() => {
    let nAnnotations = annotations
    nAnnotations[index] = annotate
    setAnnotations(nAnnotations)
  }, [annotate])

  return (
    <Stack>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 50,
        }}
      >
        <img
          src={url}
          ref={overRef}
          style={{
            cursor: 'pointer',
          }}
        />

        <img
          src={url}
          ref={imgRef}
          style={{
            cursor: 'pointer',
            position: 'absolute',
          }}
          onClick={() => {
            if (imgRef.current) {
              const markerArea = new markerjs2.MarkerArea(imgRef.current)

              if (parent) {
                markerArea.targetRoot = parent
              }

              markerArea.availableMarkerTypes = [
                markerjs2.TextMarker,
                markerjs2.FreehandMarker,
              ]

              markerArea.addEventListener('render', (event) => {
                if (imgRef.current) {
                  imgRef.current.src = event.dataUrl
                  setAnnotate({ ...annotate, state: event.state })
                }
              })
              markerArea.settings.displayMode = 'popup'
              markerArea.renderAtNaturalSize = true
              markerArea.renderImageType = 'image/png'
              markerArea.renderImageQuality = 1.0
              markerArea.show()

              if (annotate.state) {
                markerArea.restoreState(annotate.state)
              }
            }
          }}
        />
      </div>

      <Editor
        setContents={annotate.essay}
        name={`essay-${index}`}
        onChange={(value) => setAnnotate({ ...annotate, essay: value })}
      />
    </Stack>
  )
}

type ViewProps = {
  croppedArea: Area
  url: string
  aspect: number
  filter: CSSProperties
}

const View: FC<ViewProps> = ({ croppedArea, url, aspect, filter }) => {
  const scale = 100 / croppedArea.width
  const transform = {
    x: `${-croppedArea.x * scale}%`,
    y: `${-croppedArea.y * scale}%`,
    scale,
    width: 'calc(100% + 0.5px)',
    height: 'auto',
  }

  const imageStyle: CSSProperties = {
    transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
    width: transform.width,
    height: transform.height,
  }

  return (
    <div
      style={{
        paddingBottom: `${100 / aspect}%`,
        width: '400px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src={url}
        style={{
          ...imageStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: 'top left',
          ...filter,
        }}
      />
    </div>
  )
}

export default Comparator
