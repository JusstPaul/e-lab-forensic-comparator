import { FC } from 'react'
import { Select, Box, SelectProps } from '@mantine/core'
import Error, { ErrorProps } from './Error'

type SelectionProps = {
  selectProps: SelectProps
  error?: ErrorProps
}

const Selection: FC<SelectionProps> = ({ selectProps, error }) => (
  <Box
    sx={(_) => ({
      marginBottom: '1rem',
    })}
  >
    <Select {...selectProps} />
    {error ? <Error value={error.value} message={error.message} /> : <></>}
  </Box>
)

export default Selection
