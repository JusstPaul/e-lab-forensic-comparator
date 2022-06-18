import { FC, ChangeEventHandler, ChangeEvent } from 'react'

type Props = {
  label?: string
  value?: number
  name: string
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const CheckBox: FC<Props> = ({
  label,
  value,
  name,
  defaultChecked,
  disabled,
  className,
  onChange,
}) => (
  <div className={'mb-4' + className}>
    <label>
      <input
        type="checkbox"
        name={name}
        value={value}
        className="rounded"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (onChange) {
            onChange(event)
          }
        }}
        defaultChecked={defaultChecked}
        disabled={disabled}
      />
      {label != undefined ? <span className="label ml-1">{label}</span> : <></>}
    </label>
  </div>
)

export default CheckBox
