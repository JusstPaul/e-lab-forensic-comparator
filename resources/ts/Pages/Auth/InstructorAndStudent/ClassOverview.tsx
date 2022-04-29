import { FC } from 'react'
import { usePage, useForm, Link } from '@inertiajs/inertia-react'
import { User } from '@/Layouts/Auth'
import Class from '@/Layouts/Class'
import Editor from '@/Components/Editor'
import FileInput from '@/Components/FileInput'
import Error from '@/Components/Error'

type Classes = {
  id: string
  code: string
  instructor_name: string
  day: string
  time_end: string
  time_start: string
}

type Props = {
  classes: Classes
  cards?: Array<{
    type: string
    display: string
    link: string
    created_at: string
  }>
}

const ClassOverview: FC<Props> = ({ classes, cards }) => {
  const { user } = usePage().props
  const _user = user as User

  const { data, setData, post, processing, errors, reset } = useForm<{
    text: string
    files: FileList | null
  }>({
    text: '',
    files: null,
  })

  return (
    <Class mode={0} id={classes.id}>
      <div className="w-full">
        <div className="flex justify-center my-4 md:my-8 w-full px-2 md:px-8">
          <div className="w-full banner px-2 py-2 md:px-4 md:py-8 rounded-md shadoe-sm">
            <div className="bg-primary mr-auto w-fit px-2 py rounded-md shadow-sm">
              <div className="font-semibold text-xl">{classes.code}</div>
              <div className="text-sm">
                <span>{classes.day} </span>
                <span>{classes.time_start} </span>
                {' to '}
                <span>{classes.time_end} </span>
              </div>
            </div>
            <div className="text-md mt-4 bg-primary w-fit px-2 py shadow-sm rounded-md">
              {classes.instructor_name}
            </div>
          </div>
        </div>
        <div>
          {_user.role == 'instructor' ? (
            <>
              <form
                className="w-full md:w-5/12 mx-auto pb-32 md:pb-16"
                onSubmit={(event) => {
                  event.preventDefault()
                  post(`/class/${classes.id}/announcement/create`, {
                    _method: 'put',
                    onSuccess: () => {
                      window.location.reload()
                    },
                  } as any)
                }}
                encType="multipart/form-data"
              >
                <Editor
                  name="announcement"
                  placeholder="Set announcements here..."
                  onChange={(content) => {
                    setData({ ...data, text: content })
                  }}
                />
                <div className="mt-4 md:flex justify-between">
                  <div className="flex md:justify-start justify-center">
                    <Error value={errors.files} />
                    <Error value={errors.text} />
                  </div>
                  <div className="flex justify-end gap-2 md:gap-4">
                    <FileInput
                      multiple
                      label="Attachments"
                      name="announcement-file"
                      onChange={(event) => {
                        setData({ ...data, files: event.target.files })
                      }}
                    />
                    <button className="btn-primary">Post</button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="w-full md:w-5/12 mx-auto pb-32 md:pb-16">
          <div className="divide-y divide-slate-200">
            <span>Announcements</span>
            <div></div>
          </div>
          {cards ? (
            <>
              {cards.map((value, index) => (
                <div key={index} className="card my-4">
                  <div className="capitalize prose font-semibold">
                    {value.type}
                  </div>
                  <Link
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: value.display }}
                    href={value.link}
                  ></Link>
                </div>
              ))}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Class>
  )
}

export default ClassOverview
