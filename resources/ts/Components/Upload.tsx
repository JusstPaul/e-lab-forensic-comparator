import { ChangeEventHandler, FC } from 'react'
import { InputWrapper, ThemeIcon } from '@mantine/core'
import { UploadIcon } from '@heroicons/react/outline'
import useStyle from '@/Lib/styles'

type Props = {
  id: string
  label?: string
  name?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const Upload: FC<Props> = ({ id, label, name, onChange }) => {
  const _classes = useStyle()
  return (
    <InputWrapper
      id={id}
      label={label}
      className={_classes.classes.fileWrapper}
    >
      <ThemeIcon size="sm" color="cyan">
        <UploadIcon className={_classes.classes.icon} />
      </ThemeIcon>
      <input
        type="file"
        id={id}
        name={name}
        className={_classes.classes.fileInput}
        multiple
        onChange={(event) => {
          if (onChange) {
            onChange(event)
          }
        }}
      />
    </InputWrapper>
  )
}

export default Upload
