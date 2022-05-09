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

import { useControls, Leva, button } from 'leva'
import ImageViewer from 'react-simple-image-viewer'
import Class from '@/Layouts/Class'
import { ComparatorState } from './ActivityAnswer'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Editor from '@/Components/Editor'
import html2canvas from 'html2canvas'
import Cropper, { Area } from 'react-easy-crop'
import * as markerjs2 from 'markerjs2'

type Props = {
  id: string
  activity_id: string
  answer_index: number
  state_comparator: { answer: ComparatorState; points: number }
}

const Comparator: FC<Props> = ({
  id,
  activity_id,
  answer_index,
  state_comparator,
}) => {
  const { aws } = usePage().props
  const _aws = aws as S3PageProps
  const client = s3Client(_aws)

  const [comparator, setComparator] = useState(state_comparator.answer)

  const [annotations, setAnnotations] = useState<
    Array<{ image: File; essay: string }>
  >([])

  const [leftSrc, setLeftSrc] = useState('')
  const [rightSrc, setRightSrc] = useState('')

  const [imageClickMode, setImageClickMode] = useState<'set' | 'preview'>('set')
  const [currentImage, setCurrentImage] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const images = comparator.images.map((value) =>
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
      getFileURL(
        client,
        _aws.bucket,
        comparator.images[comparator.current.left]
      )
    )
    setRightSrc(
      getFileURL(
        client,
        _aws.bucket,
        comparator.images[comparator.current.right]
      )
    )
  }

  useEffect(() => {
    updateImages()
  }, [])

  useEffect(() => {
    updateImages()
  }, [comparator])

  const Comparator = () => {
    const croppedRef = useRef<HTMLDivElement>(null)

    const { preview } = useControls('General', {
      preview: false,
      'add annotation': button(() => {
        if (croppedRef.current) {
          html2canvas(croppedRef.current, {
            allowTaint: true,
            useCORS: true,
          }).then((canvas) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const nAnnotations = [...annotations]
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
                })
                setAnnotations(nAnnotations)
              }
            })
          })
        }
      }),
    })

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
            style={{ ...imageStyle, height: 500, overflow: 'hidden' }}
          />
        </div>
      )
    }

    return (
      <>
        <div className={``}>
          <div
            className="z-10 mb-4 flex gap-4 overflow-hidden"
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
              <>Unable to load Left Image</>
            )}
            {rightCroppedArea ? (
              <View url={rightSrc} croppedArea={rightCroppedArea} />
            ) : (
              <>Unable to load Right Image</>
            )}
          </div>
        </div>
      </>
    )
  }

  const Marker = ({
    index,
    value,
  }: {
    index: number
    value: { image: File; essay: string }
  }) => {
    const ref = useRef<HTMLImageElement>(null)

    return (
      <div className="mx-auto w-fit mb-4 card">
        <img
          src={URL.createObjectURL(value.image)}
          ref={ref}
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
            }
          }}
          className="mb-4"
        />
        <Editor setContents={value.essay} />
      </div>
    )
  }

  return (
    <Class id={id} mode={3}>
      <div className="pt-4 pb-2 px-4 border-b border-dark flex justify-between">
        <div className="text-sm">{comparator.instructions}</div>
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
                    data: comparator as ComparatorState,
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
            <div className="mx-auto w-fit">
              <Comparator />
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-y-auto md:px-12 px-4 py-2">
          {comparator.images.map((value, index) => (
            <img
              key={index}
              className={
                'w-16 h-16 rounded-md cursor-pointer ' +
                ((index == comparator.current.left ||
                  index == comparator.current.right) &&
                  'border-2 border-primary')
              }
              src={getFileURL(client, _aws.bucket, value)}
              onClick={() => {
                switch (imageClickMode) {
                  case 'preview':
                    openImageViewer(index)
                    break
                  case 'set':
                    if (comparator.select_mode == 'left') {
                      setComparator({
                        ...comparator,
                        current: {
                          ...comparator.current,
                          left: index,
                        },
                      })
                    } else {
                      setComparator({
                        ...comparator,
                        current: {
                          ...comparator.current,
                          right: index,
                        },
                      })
                    }
                }
              }}
            />
          ))}
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
