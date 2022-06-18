import { FC, useEffect, useState } from 'react'
import { Box, Container, Card, Stack, Text, Group } from '@mantine/core'
import { Link } from '@inertiajs/inertia-react'
import moment from 'moment'
import Auth from '@/Layouts/Auth'

type Props = {
  id: string
  activity: {
    title: string
    date_end: Date
    time_end: Date
    students: Array<{
      id: string
      student_id: string
      username: string
      name: string
      timestamp: Date
    }>
  }
}

const ClassActivityReport: FC<Props> = ({ id, activity }) => {
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const dateEndMoment = moment(activity.date_end)
    const timeEndMoment = moment(activity.time_end)

    dateEndMoment.set({
      hour: timeEndMoment.get('hour'),
      minute: timeEndMoment.get('minute'),
    })

    setDateStr(dateEndMoment.format('ddd DD MMMM, h:mm A'))
  }, [])

  return (
    <Auth class_id={id}>
      <Container size="sm">
        <Box py="lg">
          <Text size="xl" align="center">
            {activity.title}
          </Text>
          <Text size="sm" align="center">
            Due: {dateStr}
          </Text>
        </Box>
        <Text>Students Submitted: {activity.students.length}</Text>
        <Stack my="lg">
          {activity.students.map((value, index) => (
            <Card
              component={Link}
              href={`/class/${id}/activity/${value.id}/show/${value.student_id}`}
              key={index}
              withBorder
            >
              <Text>{value.username}</Text>
              <Text>{value.name}</Text>
            </Card>
          ))}
        </Stack>
      </Container>
    </Auth>
  )
}

export default ClassActivityReport
