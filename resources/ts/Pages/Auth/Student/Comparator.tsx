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
import { useControls, Leva, button, buttonGroup } from 'leva'
import ImageViewer from 'react-simple-image-viewer'
import Class from '@/Layouts/Class'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Editor from '@/Components/Editor'
import html2canvas from 'html2canvas'
import Cropper, { Area } from 'react-easy-crop'
import * as markerjs2 from 'markerjs2'
import { XCircleIcon } from '@heroicons/react/solid'
import Select from '@/Components/Select'
import { Question } from '../Instructor/ClassCreateActivity'

export type Annotation = {
  image: File | string
  isKey: boolean
  essay: string
  state?: markerjs2.MarkerAreaState
  filter: 'none' | 'hue' | 'sepia' | 'saturate' | 'grayscale'
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
  const { aws } = usePage().props
  const _aws = aws as S3PageProps
  const client = s3Client(_aws)

  const questionImages = question.files as Array<string>
  const [questionImagesIndex, seQuestionImagesIndex] = useState({
    left: 0,
    right: 1,
  })

  const [annotations, setAnnotations] = useState<Array<Annotation>>(
    state_annotation ? state_annotation : []
  )

  console.log(state_annotation)

  const [leftSrc, setLeftSrc] = useState('')
  const [rightSrc, setRightSrc] = useState('')

  const [currentImage, setCurrentImage] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const images = questionImages.map((value) =>
    getFileURL(client, _aws.bucket, value)
  )

  const openImageViewer = useCallback((index: number) => {
    setCurrentImage(index)
    setIsViewerOpen(true)
  }, [])

  const closeImageViewer = useCallback(() => {
    setCurrentImage(0)
    setIsViewerOpen(false)
  }, [])

  const workSpaceRef = useRef<HTMLDivElement>(null)

  const updateImages = () => {
    setLeftSrc(
      getFileURL(client, _aws.bucket, questionImages[questionImagesIndex.left])
    )
    setRightSrc(
      getFileURL(client, _aws.bucket, questionImages[questionImagesIndex.right])
    )
  }

  useEffect(() => {
    updateImages()
  }, [])

  useEffect(() => {
    updateImages()
  }, [questionImagesIndex])

  const croppedRef = useRef<HTMLDivElement>(null)
  const [{ preview, select: selectMode }, setGeneral] = useControls(
    'General',
    () => ({
      select: {
        value: 'left',
        options: ['left', 'right'],
      },
      ' ': buttonGroup({
        left: () => {
          setGeneral({ select: 'left' })
        },
        right: () => {
          setGeneral({ select: 'right' })
        },
      }),
      preview: false,
      'add screenshot': button(() => {
        if (croppedRef.current) {
          html2canvas(croppedRef.current, {
            allowTaint: true,
            useCORS: true,
          }).then((canvas) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const nAnnotations = annotations
                nAnnotations.push({
                  essay: '',
                  image: new File(
                    [blob],
                    `comparator-${id}-${activity_id}-${answer_index}-${annotations.length}.png`,
                    {
                      type: 'image/png',
                      lastModified: new Date().valueOf(),
                    }
                  ),
                  filter: 'none',
                  isKey: false,
                })
                setAnnotations([...nAnnotations])
              }
            })
          })
        }
      }),
    })
  )

  const Comparator = () => {
    const [leftCrop, setLeftCrop] = useState({ x: 0, y: 0 })
    const [leftZoom, setLeftZoom] = useState(1)
    const [leftCroppedArea, setLeftCroppedArea] = useState<Area>()

    const [rightCrop, setRightCrop] = useState({ x: 0, y: 0 })
    const [rightZoom, setRightZoom] = useState(1)
    const [rightCroppedArea, setRightCroppedArea] = useState<Area>()

    const ASPECT = 3 / 2

    const View = ({ croppedArea, url }: { croppedArea: Area; url: string }) => {
      const scale = 100 / croppedArea.width
      const transform = {
        x: `${-croppedArea.x * scale}%`,
        y: `${-croppedArea.y * scale}%`,
        scale,
        width: 'calc(100% + 0.5px)',
        height: 'auto',
      }

      const imageStyle = {
        transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale}, ${transform.scale}, 1)`,
        width: transform.width,
        height: transform.height,
      } as CSSProperties

      return (
        <div
          style={{
            paddingBottom: `${100 / ASPECT}%`,
            width: 500,
            height: 500,
            overflow: 'hidden',
          }}
        >
          <img
            src={url}
            style={{
              ...imageStyle,
              height: 500,
              overflow: 'hidden',
            }}
          />
        </div>
      )
    }

    return (
      <>
        <div className={``}>
          <div
            ref={croppedRef}
            className="mt-4 flex gap-0 rounded-md shadow-sm"
            style={{
              height: 350,
              overflow: 'hidden',
            }}
          >
            {leftCroppedArea ? (
              <View url={leftSrc} croppedArea={leftCroppedArea} />
            ) : (
              <span className="mx-2">Unable to load Left Image</span>
            )}
            {rightCroppedArea ? (
              <View url={rightSrc} croppedArea={rightCroppedArea} />
            ) : (
              <span className="mx-2">Unable to load Right Image</span>
            )}
          </div>
          <div
            className="z-10 mt-4 flex justify-center gap-4 overflow-x-auto overflow-y-hidden"
            style={{
              height: 300,
              width: 900,
            }}
          >
            <div
              className="relative"
              style={{
                width: 300,
                height: 300,
                overflow: 'hidden',
              }}
            >
              <Cropper
                image={leftSrc}
                aspect={ASPECT}
                onCropChange={setLeftCrop}
                crop={leftCrop}
                onZoomChange={setLeftZoom}
                zoom={leftZoom}
                onCropAreaChange={(croppedArea) => {
                  setLeftCroppedArea(croppedArea)
                }}
                style={{
                  containerStyle: {
                    width: 300,
                    height: 300,
                    overflow: 'hidden',
                  },
                }}
              />
            </div>
            <div
              className="relative"
              style={{
                width: 300,
                height: 300,
                overflow: 'hidden',
              }}
            >
              <Cropper
                image={rightSrc}
                aspect={ASPECT}
                onCropChange={setRightCrop}
                crop={rightCrop}
                onZoomChange={setRightZoom}
                zoom={rightZoom}
                onCropAreaChange={(croppedArea) => {
                  setRightCroppedArea(croppedArea)
                }}
                style={{
                  containerStyle: {
                    width: 300,
                    height: 300,
                    overflow: 'hidden',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  const Marker = ({ index, value }: { index: number; value: Annotation }) => {
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

    const ref = useRef<HTMLImageElement>(null)
    const url = value.isKey
      ? getFileURL(client, _aws.bucket, value.image as string)
      : URL.createObjectURL(value.image as File)
    const [filterStyle, setFilterStyle] = useState(getStyle(value.filter))

    return (
      <div className="mx-auto w-fit mb-4 card relative">
        <div className="card-legend capitalize flex justify-between">
          <span>Screenshot #{index + 1}</span>
          <button
            type="button"
            onClick={() => {
              const nAnnotations = [...annotations]
              nAnnotations.splice(index, 1)

              setAnnotations([...nAnnotations])
            }}
          >
            <XCircleIcon className="icon" />
          </button>
        </div>

        <div className="card-legend-body py-2">
          <img
            src={url}
            ref={ref}
            style={filterStyle}
            onClick={() => {
              if (ref.current) {
                const markerArea = new markerjs2.MarkerArea(ref.current)
                markerArea.settings.displayMode = 'popup'
                markerArea.addEventListener('render', (event) => {
                  if (ref.current) {
                    ref.current.src = event.dataUrl
                    const nAnnotations = annotations
                    nAnnotations[index] = {
                      ...nAnnotations[index],
                      state: event.state,
                    }
                  }
                })

                markerArea.show()
              }
            }}
            className="mb-2 cursor-pointer"
          />
          <div>
            <Select
              name="select-filter"
              label="Filter"
              options={['none', 'hue', 'sepia', 'saturate', 'grayscale']}
              value={value.filter}
              onChange={(event) => {
                const { value } = event.target
                const nAnnotations = annotations
                nAnnotations[index].filter = value as any

                setAnnotations(nAnnotations)
                setFilterStyle(getStyle(value as any))
              }}
              className="w-fit"
            />
          </div>
          <Editor
            setContents={value.essay}
            onChange={(content) => {
              const nAnnotations = annotations
              nAnnotations[index].essay = content

              setAnnotations(nAnnotations)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Class id={id} mode={3}>
      <div className="pt-4 pb-2 px-4 border-b border-dark flex justify-between">
        <div className="text-sm">{question.instruction}</div>
        <div className="flex gap-4">
          <div className="flex gap-4">
            <div className="flex items-end"></div>
          </div>
          <div>
            <Link
              className="btn-alt mr-2"
              href={`/class/${id}/activity/${activity_id}`}
            >
              Cancel
            </Link>
            <button
              type="button"
              className="btn-primary"
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
            </button>
          </div>
        </div>
      </div>
      <div ref={workSpaceRef} className="mt-4 px-2 h-fit">
        <div className="flex h-full overflow-x-auto px-6 py-2 md:px-12 mx-auto">
          <div className="max-w-[180px] w-full col-span-2">
            <Leva
              theme={{
                colors: {
                  elevation1: '#E2E8F0',
                  elevation2: '#F1F5F9',
                  elevation3: '#E2E8F0',
                  accent1: '#14B8A6',
                  accent2: '#2DD4BF',
                  accent3: '#5EEAD4',
                  highlight1: '#1F2937',
                  highlight2: '#111827',
                  highlight3: '#111827',
                  folderWidgetColor: '#111827',
                  folderTextColor: '#111827',
                },
              }}
              fill
              flat
              titleBar={false}
              oneLineLabels={true}
            />
          </div>
          <div className="flex-grow-0 w-full">
            <div className="flex gap-2 overflow-x-auto md:px-12 px-4 py-2">
              {questionImages.map((value, index) => (
                <img
                  key={index}
                  className={
                    'w-16 h-16 rounded-md cursor-pointer ' +
                    ((index == questionImagesIndex.left ||
                      index == questionImagesIndex.right) &&
                      'border-2 border-primary')
                  }
                  src={getFileURL(client, _aws.bucket, value)}
                  onClick={() => {
                    if (preview) {
                      openImageViewer(index)
                    } else {
                      if (selectMode == 'left') {
                        seQuestionImagesIndex({
                          ...questionImagesIndex,
                          left: index,
                        })
                      } else {
                        seQuestionImagesIndex({
                          ...questionImagesIndex,
                          right: index,
                        })
                      }
                    }
                  }}
                />
              ))}
            </div>
            <div className="mx-auto w-fit">
              <Comparator />
            </div>
          </div>
        </div>
      </div>

      <div>
        {annotations.map((value, index) => (
          <Marker index={index} value={value} key={index} />
        ))}
      </div>

      <div className="px-4 py-2 w-3/6 mx-auto"></div>
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

export default Comparator
