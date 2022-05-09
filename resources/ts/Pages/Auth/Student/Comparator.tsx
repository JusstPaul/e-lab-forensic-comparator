// NOTE: Whoever reads this code, just don't.
import {
  FC,
  useState,
  useCallback,
  useEffect,
  Suspense,
  createRef,
  useRef,
} from 'react'
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
import * as THREE from 'three'
import { Canvas, ThreeEvent, useFrame, useLoader } from '@react-three/fiber'
import { useControls, Leva, button } from 'leva'
import { Image, shaderMaterial, useCursor, Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { animated as a } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import Toggle from '@/Components/Toggle'
import ImageViewer from 'react-simple-image-viewer'
import Class from '@/Layouts/Class'
import CheckBox from '@/Components/CheckBox'
import { ComparatorState } from './ActivityAnswer'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Editor from '@/Components/Editor'
import vertexShader from '@/Shaders/vertex.glsl'
import fragmentShader from '@/Shaders/fragment.glsl'
import { Vector4 } from 'three'

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

  useEffect(() => {
    if (workSpaceRef.current) {
      const { width } = workSpaceRef.current.getBoundingClientRect()
      if (!(width <= 639)) {
      }
    }
  }, [workSpaceRef.current])

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
    const { zoom: lZoom } = useControls('Left', {
      zoom: {
        min: 0,
        max: 5,
        step: 1,
        value: 0,
      },
      'move x': {
        min: -5,
        max: 5,
        step: 1,
        value: 0,
      },
      'move y': {
        min: -5,
        max: 5,
        step: 1,
        value: 0,
      },
    })
    const { zoom: rZoom, 'move x': rMoveX } = useControls('Right', {
      zoom: {
        min: 0,
        max: 5,
        step: 1,
        value: 0,
      },
      'move x': {
        min: -5,
        max: 5,
        step: 1,
        value: 0,
      },
      'move y': {
        min: -5,
        max: 5,
        step: 1,
        value: 0,
      },
    })
    const { preview } = useControls('General', {
      preview: false,
      'add screenshot': button((get) => {}),
    })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvasDimensions = useRef({ w: 0, h: 0 })

    const sliderRef = useRef<THREE.Mesh>(null)

    const sliderPos = useRef(0)

    useEffect(() => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect()
        canvasDimensions.current = {
          w: width,
          h: height,
        }
      }
    }, [canvasRef])

    const LeftImg = () => {
      const img = useLoader(THREE.TextureLoader, [leftSrc])

      const imgInset = useRef(new Vector4(0, 0.5, 0, 0))
      useFrame(
        useCallback(() => {
          if (imgInset.current) {
            const percent = sliderPos.current / 5
            const zoomOffset = lZoom / 5
            imgInset.current.y = 0.5 - percent / 2 - zoomOffset
          }
        }, [sliderPos, lZoom])
      )

      return (
        <animated.mesh>
          <planeBufferGeometry args={[10 + lZoom, 10 + lZoom]} />
          <meshStandardMaterial />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={
              {
                u_img: {
                  value: img[0],
                },
                u_inset: {
                  value: imgInset.current,
                },
              } as any
            }
            transparent
          />
        </animated.mesh>
      )
    }

    const RightImg = () => {
      const img = useLoader(THREE.TextureLoader, [rightSrc])

      const imgInset = useRef(new Vector4(0, 0, 0, 0.5))
      useFrame(
        useCallback(() => {
          if (imgInset.current) {
            const percent = sliderPos.current / 5
            const sliderLoc = 0.5 + percent / 2
            const zoomOffset = (rZoom / 5) * 0.001
            imgInset.current.w = sliderLoc + zoomOffset
          }
        }, [sliderPos, rZoom])
      )

      return (
        <animated.mesh>
          <planeBufferGeometry args={[10 + rZoom, 10 + rZoom]} />
          <meshStandardMaterial />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={
              {
                u_img: {
                  value: img[0],
                },
                u_inset: {
                  value: imgInset.current,
                },
              } as any
            }
            transparent
          />
        </animated.mesh>
      )
    }

    const Slider = () => {
      useFrame(() => {
        if (sliderRef.current) {
          sliderRef.current.position.set(sliderPos.current, 0, 0)
        }
      })

      const bind = useDrag(({ active, movement: [mX], direction: [dX] }) => {
        if (active) {
          const { w } = canvasDimensions.current
          if (w != 0) {
            let location = (mX / w) * 5
            if (dX < 0 && location < -4.5) {
              location = -4.5
            } else if (dX > 0 && location > 4.5) {
              location = 4.5
            }

            sliderPos.current = location
          }
        }
      })

      return (
        <animated.mesh ref={sliderRef} {...(bind() as any)}>
          <planeBufferGeometry args={[0.1, 10]} />
          <meshStandardMaterial color={0xffffff} transparent={false} />
        </animated.mesh>
      )
    }

    return (
      <Canvas
        ref={canvasRef}
        style={{
          width: 500,
          height: 500,
        }}
        className="flex-grow rounded-md shadow-sm mx-6"
      >
        <ambientLight />
        <Suspense>
          <LeftImg />
          <RightImg />
          <Slider />
        </Suspense>
      </Canvas>
    )
    return <></>
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
        <div className="flex h-full overflow-auto px-6 py-2 md:px-12 mx-auto">
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
