import { XCircleIcon } from '@heroicons/react/solid'
import { PropsWithChildren, MouseEventHandler } from 'react'

type Props = PropsWithChildren<{
  isOpen: boolean
  onClose?: MouseEventHandler<HTMLButtonElement>
}>

const Dialog = ({ isOpen, onClose, children }: Props) => {
  if (!isOpen) {
    return <></>
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-200/75 flex">
      <div className="relative p-8 bg-light w-fill max-w-md m-auto flex-col flex rounded-md">
        <div>{children}</div>
        <span className="absolute top-0 right-0 p-4">
          <button
            type="button"
            onClick={(event) => {
              if (onClose) {
                onClose(event)
              }
            }}
          >
            <XCircleIcon className="icon" />
          </button>
        </span>
      </div>
    </div>
  )
}

export default Dialog
