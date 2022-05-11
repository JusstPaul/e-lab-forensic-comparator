import { FC } from 'react'
import { Text } from '@mantine/core'

export type ErrorProps = {
  value: string
  message?: string
}

const Error: FC<ErrorProps> = ({ value, message }) => (
  <>
    {value && (
      <Text size="sm" color="red">
        {message ? message : value}
      </Text>
    )}
  </>
)

export default Error
