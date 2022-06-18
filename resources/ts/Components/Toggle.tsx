import { FC, ChangeEventHandler } from 'react'

type Props = {
  label?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const Toggle: FC<Props> = ({ label, onChange }) => (
  <div className="flex items-center justify-center w-full">
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          onChange={(event) => {
            if (onChange) {
              onChange(event)
            }
          }}
        />
        <div className="block bg-light-dark w-10 h-6 rounded-full"></div>
        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
      </div>
      {label ? <div className="ml-3">{label}</div> : <></>}
    </label>
  </div>
)

export default Toggle
