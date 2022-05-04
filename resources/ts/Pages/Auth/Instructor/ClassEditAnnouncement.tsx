import { FC } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import Editor from '@/Components/Editor'
import Class from '@/Layouts/Class'
import Error from '@/Components/Error'

type Props = {
  id: string
  announcement: {
    id: string
    text: string
  }
}

const ClassEditAnnouncement: FC<Props> = ({ id, announcement }) => {
  const { data, setData, post, processing, errors } = useForm({
    text: announcement.text,
  })

  return (
    <Class id={id} mode={3}>
      <div className="container-lg py-4">
        <div className="font-light text-lg w-fit mx-auto mb-4">
          Edit Announcement
        </div>
        <form
          className="card w-fit mx-auto"
          onSubmit={(event) => {
            event.preventDefault()
            post(`/class/${id}/announcement/edit/${announcement.id}`)
          }}
        >
          <Editor
            autoFocus={true}
            name="text"
            setContents={data.text}
            onChange={(content) => {
              setData({ text: content })
            }}
          />
          <div className="mt-2">
            <Error value={errors.text} />
          </div>

          <div className="w-full md:w-fit md:ml-auto mt-4">
            <button className="btn-primary w-full" disabled={processing}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </Class>
  )
}

export default ClassEditAnnouncement
