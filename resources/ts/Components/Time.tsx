import { TimeInput, TimeInputProps } from '@mantine/dates'
import { FC } from 'react'
import { Box } from '@mantine/core'
import Error, { ErrorProps } from './Error'

type Props = {
  error: ErrorProps
  timeProps: TimeInputProps
}

const Time: FC<Props> = ({ error, timeProps }) => (
  <Box
    sx={(_) => ({
      marginBottom: '1rem',
    })}
  >
    <TimeInput format="12" {...timeProps} />
    {error ? <Error value={error.value} message={error.message} /> : <></>}
  </Box>
)

export default Time
