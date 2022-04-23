import { FC, ChangeEventHandler, ChangeEvent } from 'react'
import Error from './Error'

type Error = {
  value: string
  message?: string
}

type Props = {
  name: string
  values: Array<string>
  value?: string
  error?: Error
  className?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const RadioGroup: FC<Props> = ({
  name,
  values,
  value,
  error,
  className,
  onChange,
}) => {
  const check = (index: number) => {
    if (value) {
      return value == values[index]
    }
    return index == 0
  }

  return (
    <div className="mb-4">
      <div role="group" className={`flex gap-4 ` + className}>
        {values.map((value, index) => (
          <label key={index}>
            <input
              type="radio"
              value={value}
              name={name}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (onChange) {
                  onChange(event)
                }
              }}
              defaultChecked={check(index)}
            />
            <span className="label ml-1">{value}</span>
          </label>
        ))}
      </div>
      {error && <Error value={error?.value} message={error.message} />}
    </div>
  )
}

export default RadioGroup
