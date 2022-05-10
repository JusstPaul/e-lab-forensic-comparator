import { FC, ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import TextInput from '@/Components/TextInput'
import Select from '@/Components/Select'
import Auth from '@/Layouts/Auth'

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
    time_start: time_start,
    time_end: time_end,
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
      case 'time_start':
        setData({ ...data, time_start: value })
        break
      case 'time_end':
        setData({ ...data, time_end: value })
        break
    }
  }

  return (
    <Auth>
      <div className="container-lg py-4">
        <div className="font-light text-lg w-fit mx-auto mb-4">Edit Class</div>
        <form
          className="card w-fit mx-auto"
          onSubmit={(event) => {
            event.preventDefault()
            post(`/class/edit/${id}`)
          }}
        >
          <TextInput
            label="Section Code"
            name="section"
            value={data.section}
            error={{ value: errors.section }}
            onChange={handleInputChange}
            isFocused
          />
          <fieldset className="md:grid grid-cols-2 gap-2">
            <TextInput
              label="Room"
              name="room"
              value={data.room}
              error={{ value: errors.room }}
              className="mb-2 md:mb-4"
              onChange={handleInputChange}
            />
            <Select
              label="Day"
              name="day"
              options={['MWF', 'TTh', 'Sat']}
              onChange={(event) =>
                setData({ ...data, day: event.target.value })
              }
            />
            <TextInput
              type="time"
              label="Time Start"
              name="time_start"
              value={data.time_start}
              error={{ value: errors.time_start }}
              className="mb-2 md:mb-4"
              onChange={handleInputChange}
            />
            <TextInput
              type="time"
              label="Time End"
              name="time_end"
              value={data.time_end}
              error={{
                value: errors.time_end,
                message: 'Time end must be a time after time start',
              }}
              onChange={handleInputChange}
            />
          </fieldset>
          <fieldset></fieldset>
          <div className="w-full md:w-fit md:ml-auto">
            <button className="btn-primary w-full" disabled={processing}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </Auth>
  )
}

export default EditClass