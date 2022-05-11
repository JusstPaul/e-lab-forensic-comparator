import { FC } from 'react'
import { Box, TextInput, TextInputProps } from '@mantine/core'
import Error, { ErrorProps } from './Error'

type Props = {
  error?: ErrorProps
  textProps: TextInputProps
}

const Input: FC<Props> = ({ error, textProps }) => (
  <Box
    sx={(_) => ({
      marginBottom: '1rem',
    })}
  >
    <TextInput {...textProps} />
    {error ? <Error value={error.value} message={error.message} /> : <></>}
  </Box>
)

export default Input
