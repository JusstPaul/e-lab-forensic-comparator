import { MouseEventHandler, PropsWithChildren } from 'react'
import Dialog from './Dialog'

type Props = PropsWithChildren<{
  title: string
  isOpen: boolean
  onClose?: MouseEventHandler<HTMLButtonElement>
  onConfirm?: MouseEventHandler<HTMLButtonElement>
}>

const ConfirmDialog = ({
  title,
  isOpen,
  children,
  onClose,
  onConfirm,
}: Props) => {
  if (!isOpen) {
    return <></>
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl">{title}</h2>
      <div className="py-4">{children}</div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="btn-critical"
          onClick={(event) => {
            if (onClose) {
              onClose(event)
            }
          }}
        >
          No
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={(event) => {
            if (onClose) {
              onClose(event)
            }

            if (onConfirm) {
              onConfirm(event)
            }
          }}
        >
          Yes
        </button>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog
