import { FC, ChangeEventHandler } from 'react'
import Error from './Error'

type Error = {
  value: string
  message?: string
}

type Props = {
  label?: string
  name: string
  value?: string | number | readonly string[] | undefined
  options?: Array<string | number | readonly string[]> | undefined
  className?: string
  error?: Error
  onChange?: ChangeEventHandler<HTMLSelectElement>
}

const Select: FC<Props> = ({
  label,
  name,
  value,
  options,
  className,
  error,
  onChange,
}) => (
  <div className={'mb-4 ' + className}>
    <label>
      {label != 'undefined' ? (
        <span className="label block">{label}</span>
      ) : (
        <></>
      )}
      <select
        name={name}
        value={value}
        onChange={(event) => {
          if (onChange) {
            onChange(event)
          }
        }}
        className="w-full"
      >
        {options ? (
          options.map((value, index) => (
            <option value={value} key={index}>
              {value}
            </option>
          ))
        ) : (
          <></>
        )}
      </select>
    </label>

    {error && <Error value={error?.value} message={error.message} />}
  </div>
)

export default Select
