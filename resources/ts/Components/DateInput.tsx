import { DatePicker, DatePickerProps } from '@mantine/dates'
import { Box } from '@mantine/core'
import { FC } from 'react'
import Error, { ErrorProps } from './Error'

type Props = {
  dateProps: DatePickerProps
  error: ErrorProps
}

const DateInput: FC<Props> = ({ error, dateProps }) => (
  <Box
    sx={(_) => ({
      marginBottom: '1rem',
    })}
  >
    <DatePicker
      firstDayOfWeek="sunday"
      inputFormat="MM/DD/YYYY"
      {...dateProps}
    />
    {error ? <Error value={error.value} message={error.message} /> : <></>}
  </Box>
)

export default DateInput
