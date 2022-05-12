import { FC, ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import Auth from '@/Layouts/Auth'
import Input from '@/Components/Input'
import Selection from '@/Components/Selection'
import Time from '@/Components/Time'
import { Container, Paper, Stack, Text, Group, Button } from '@mantine/core'

type Props = {
  id: string
  section: string
  room: string
  day: string
  time_start: string
  time_end: string
}

const EditClass: FC<Props> = ({
  id,
  section,
  room,
  day,
  time_end,
  time_start,
}) => {
  const { data, setData, post, processing, errors } = useForm({
    section: section,
    room: room,
    day: day,
    time_start: new Date(time_start),
    time_end: new Date(time_end),
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    switch (name) {
      case 'section':
        setData({ ...data, section: value })
        break
      case 'room':
        setData({ ...data, room: value })
        break
    }
  }

  return (
    <Auth title="Edit Class">
      <Container size="xs">
        <Stack>
          <Text align="center" size="lg">
            Edit Class
          </Text>
          <Paper p="sm" withBorder>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                post(`/class/edit/${id}`)
              }}
            >
              <Input
                textProps={{
                  label: 'Section',
                  placeholder: 'Section',
                  value: data.section,
                  name: 'section',
                  onChange: handleInputChange,
                }}
                error={{ value: errors.section }}
              />
              <Group>
                <Input
                  textProps={{
                    label: 'Room',
                    name: 'room',
                    value: data.room,
                    onChange: handleInputChange,
                  }}
                  error={{ value: errors.room }}
                />
              </Group>
              <Group>
                <Selection
                  selectProps={{
                    label: 'Day',
                    name: 'day',
                    data: [
                      { value: 'MWF', label: 'MWF' },
                      { value: 'TTh', label: 'TTh' },
                      { value: 'Sat', label: 'Sat' },
                    ],
                    value: data.day,
                    searchable: true,
                    nothingFound: 'Invalid schedule day',
                    onChange: (value) => {
                      setData({ ...data, day: value as any })
                    },
                  }}
                  error={{
                    value: errors.day,
                    message: 'Must be a valid schedule day.',
                  }}
                />
                <Group>
                  <Time
                    timeProps={{
                      label: 'Time Start',
                      name: 'time_start',
                      value: data.time_start,
                      onChange: (value) =>
                        setData({ ...data, time_start: value }),
                    }}
                    error={{
                      value: errors.time_start,
                      message: 'Please enter valid starting time.',
                    }}
                  />
                  <Time
                    timeProps={{
                      label: 'Time End',
                      name: 'time_end',
                      value: data.time_end,
                      onChange: (value) =>
                        setData({ ...data, time_end: value }),
                    }}
                    error={{
                      value: errors.time_end,
                      message: 'Please enter valid ending time.',
                    }}
                  />
                </Group>
              </Group>

              <Button type="submit" fullWidth>
                Update
              </Button>
            </form>
          </Paper>
        </Stack>
      </Container>
    </Auth>
  )
}

export default EditClass
