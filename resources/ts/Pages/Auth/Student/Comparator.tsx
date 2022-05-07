// NOTE: Whoever reads this code, just don't.
import { FC, useState, useCallback, useEffect, createRef } from 'react'
import { Inertia } from '@inertiajs/inertia'
import { Link, usePage } from '@inertiajs/inertia-react'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@heroicons/react/solid'
import Toggle from '@/Components/Toggle'
import ImageViewer from 'react-simple-image-viewer'
import Class from '@/Layouts/Class'
import CheckBox from '@/Components/CheckBox'
import { ComparatorState } from './ActivityAnswer'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Editor from '@/Components/Editor'

type Props = {
  id: string
  activity_id: string
  answer_index: number
  state: { answer: ComparatorState; points: number }
}

const Comparator: FC<Props> = ({ id, activity_id, answer_index, state }) => {
  const { aws } = usePage().props
  const _aws = aws as S3PageProps
  const client = s3Client(_aws)

  const [comparator, setComparator] = useState(state.answer)

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

  const containerRef = createRef<HTMLDivElement>()
  const canvasRef = createRef<HTMLCanvasElement>()
  const [sliderDimensions, setSliderDimensions] = useState({
    width: 0,
    height: 0,
  })
  const [sliderPos, setSliderPos] = useState(0)

  const [imageSide, setImageSide] = useState<'left' | 'right'>('left')

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setSliderPos(Math.round(width / 2))

      setSliderDimensions({ width, height })
    }
  }, [])

  useEffect(() => {
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
  }, [comparator])

  const [isSliderMoving, setIsSliderMoving] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()

      if (canvasRef.current) {
        const { current } = canvasRef

        const ctx = current.getContext('2d')
        if (ctx) {
          const covered = sliderPos / width

          const leftImg = new Image()
          leftImg.src = leftSrc
          leftImg.onload = () => {
            ctx.drawImage(
              leftImg,
              0,
              0,
              leftImg.width * covered,
              leftImg.height,
              0,
              0,
              sliderPos,
              height
            )
          }

          const rightImg = new Image()
          rightImg.src = rightSrc
          rightImg.onload = () => {
            ctx.drawImage(
              rightImg,
              rightImg.width * covered,
              0,
              rightImg.width,
              rightImg.height,
              sliderPos,
              0,
              width,
              height
            )

            // Draw slider
            ctx.beginPath()
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 5
            ctx.lineJoin = 'miter'
            ctx.moveTo(sliderPos, 0)
            ctx.lineTo(sliderPos, height)
            ctx.stroke()
            ctx.closePath()
          }
        }
      }
    }
  }, [containerRef, canvasRef])

  // TODO: Add annotations
  const Scene = () => {
    return (
      <canvas
        ref={canvasRef}
        className="bg-gray-300 border border-dark rounded overflow-hidden shadow-sm"
        width={sliderDimensions.width}
        height={sliderDimensions.height}
        onMouseDown={(event) => {
          const pos = event.clientX - (event.target as any).offsetLeft
          if (pos >= sliderPos - 2 && pos <= sliderPos + 2) {
            setIsSliderMoving(true)
          }
        }}
        onMouseUp={() => setIsSliderMoving(false)}
        onMouseLeave={() => setIsSliderMoving(false)}
        onMouseMove={(event) => {
          if (isSliderMoving) {
            setSliderPos(sliderPos + event.movementX)
          }
        }}
      />
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
      <div className="flex mt-4 px-2">
        <div className="flex-grow overflow-hidden px-8">
          <div
            ref={containerRef}
            className="h-full md:w-6/12 mx-auto px-2 md:px-4 overflow-hidden"
          >
            <Scene />
          </div>
        </div>

        <div className="flex-grow-0 flex justify-end w-max">
          <div className="flex flex-col gap-2">
            <span className="text-lg select-none">Set Image</span>
            <div className="capitalize">
              <Toggle
                label={imageSide}
                onChange={() => {
                  switch (imageSide) {
                    case 'left':
                      setImageSide('right')
                      setComparator({ ...comparator, select_mode: 'right' })
                      break
                    case 'right':
                      setImageSide('left')
                      setComparator({ ...comparator, select_mode: 'left' })
                      break
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2 w-full px-4">
              <div className="flex justify-end">
                <div>
                  <span className="text-left text-sm font-medium mr-2 mb-1">
                    Zoom
                  </span>
                  <div className="px-4 flex flex-col gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const rate = 0.1

                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            scales: {
                              ...comparator.scales,
                              right: comparator.scales.right + rate,
                            },
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                transform: `scale(${
                                  comparator.scales.right + rate
                                })`,
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            scales: {
                              ...comparator.scales,
                              left: comparator.scales.left + rate,
                            },
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                transform: `scale(${
                                  comparator.scales.left + rate
                                })`,
                              },
                            },
                          })
                        }
                      }}
                    >
                      <ZoomInIcon className="icon-sm" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const rate = 0.1

                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            scales: {
                              ...comparator.scales,
                              right: comparator.scales.right - rate,
                            },
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                transform: `scale(${
                                  comparator.scales.right - rate
                                })`,
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            scales: {
                              ...comparator.scales,
                              left: comparator.scales.left - rate,
                            },
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                transform: `scale(${
                                  comparator.scales.left - rate
                                })`,
                              },
                            },
                          })
                        }
                      }}
                    >
                      <ZoomOutIcon className="icon-sm" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          const nStylright = comparator.styles.right
                          delete nStylright['transform']

                          setComparator({
                            ...comparator,
                            scales: {
                              ...comparator.scales,
                              right: 1,
                            },
                            styles: {
                              ...comparator.styles,
                              right: nStylright,
                            },
                          })
                        } else {
                          const nStyleLeft = comparator.styles.left
                          delete nStyleLeft['transform']

                          setComparator({
                            ...comparator,
                            scales: {
                              ...comparator.scales,
                              left: 1,
                            },
                            styles: {
                              ...comparator.styles,
                              left: nStyleLeft,
                            },
                          })
                        }
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div>
                  <span className="text-left text-sm font-medium mr-2 mb-1">
                    Adjust
                  </span>
                  <div className="px-4 flex flex-col gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const rate = 1

                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              right: {
                                ...comparator.location.right,
                                y: comparator.location.right.y - rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                top: comparator.location.right.y - rate,
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              left: {
                                ...comparator.location.left,
                                y: comparator.location.left.y - rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                top: comparator.location.left.y - rate,
                              },
                            },
                          })
                        }
                      }}
                    >
                      <ArrowUpIcon className="icon-sm" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const rate = 1

                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              right: {
                                ...comparator.location.right,
                                y: comparator.location.right.y + rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                top: comparator.location.right.y + rate,
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              left: {
                                ...comparator.location.left,
                                y: comparator.location.left.y + rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                top: comparator.location.left.y + rate,
                              },
                            },
                          })
                        }
                      }}
                    >
                      <ArrowDownIcon className="icon-sm" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const rate = 1

                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              right: {
                                ...comparator.location.right,
                                x: comparator.location.right.x + rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                right: comparator.location.right.x + rate,
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              left: {
                                ...comparator.location.left,
                                x: comparator.location.left.x - rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                left: comparator.location.left.x - rate,
                              },
                            },
                          })
                        }
                      }}
                    >
                      <ArrowLeftIcon className="icon-sm" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const rate = 1

                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              right: {
                                ...comparator.location.right,
                                x: comparator.location.right.x - rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                right: comparator.location.right.x - rate,
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              left: {
                                ...comparator.location.left,
                                x: comparator.location.left.x + rate,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                left: comparator.location.left.x + rate,
                              },
                            },
                          })
                        }
                      }}
                    >
                      <ArrowRightIcon className="icon-sm" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          const nStylright = comparator.styles.right
                          delete nStylright['top']
                          delete nStylright['right']

                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              right: {
                                x: 0,
                                y: 0,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              right: nStylright,
                            },
                          })
                        } else {
                          const nStylleft = comparator.styles.left
                          delete nStylleft['top']
                          delete nStylleft['left']

                          setComparator({
                            ...comparator,
                            location: {
                              ...comparator.location,
                              left: {
                                x: 0,
                                y: 0,
                              },
                            },
                            styles: {
                              ...comparator.styles,
                              left: nStylleft,
                            },
                          })
                        }
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div>
                  <span className="text-left text-sm font-medium mr-2 mb-1">
                    Filter
                  </span>
                  <div className="px-4 flex flex-col gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                filter: 'hue-rotate(180deg)',
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                filter: 'hue-rotate(180deg)',
                              },
                            },
                          })
                        }
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                filter: 'sepia(100%)',
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                filter: 'sepia(100%)',
                              },
                            },
                          })
                        }
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-yellow-200"></div>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                filter: 'saturate(4)',
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                filter: 'saturate(4)',
                              },
                            },
                          })
                        }
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              right: {
                                ...comparator.styles.right,
                                filter: 'grayscale(100%)',
                              },
                            },
                          })
                        } else {
                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              left: {
                                ...comparator.styles.left,
                                filter: 'grayscale(100%)',
                              },
                            },
                          })
                        }
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-slate-500"></div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (comparator.select_mode == 'right') {
                          const nStyleRight = comparator.styles.right
                          delete nStyleRight['filter']

                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              right: nStyleRight,
                            },
                          })
                        } else {
                          const nStyleleft = comparator.styles.left
                          delete nStyleleft['filter']

                          setComparator({
                            ...comparator,
                            styles: {
                              ...comparator.styles,
                              left: nStyleleft,
                            },
                          })
                        }
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <CheckBox
                  label="Preview"
                  name="mode"
                  onChange={() => {
                    switch (imageClickMode) {
                      case 'preview':
                        setImageClickMode('set')
                        break
                      case 'set':
                        setImageClickMode('preview')
                        break
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 overflow-y-auto px-4 py-2">
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
              console.log(comparator)
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

                    /*                     const nLeftImg = leftImg
                    nLeftImg.src = getFileURL(
                      client,
                      _aws.bucket,
                      comparator.images[index]
                    )
                    setLeftImg(nLeftImg) */
                  } else {
                    setComparator({
                      ...comparator,
                      current: {
                        ...comparator.current,
                        right: index,
                      },
                    })

                    /*                     const nRightImg = rightImg
                    nRightImg.src = getFileURL(
                      client,
                      _aws.bucket,
                      comparator.images[index]
                    )
                    setRightImg(nRightImg) */
                  }
              }
            }}
          />
        ))}
      </div>

      <div className="px-4 py-2 w-3/6 mx-auto">
        <Editor
          name="essay"
          setContents={comparator.essay ? comparator.essay : ''}
          onChange={(content) => {
            setComparator({ ...comparator, essay: content })
          }}
        />
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

export default Comparator
