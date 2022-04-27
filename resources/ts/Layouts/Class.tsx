import { PropsWithChildren } from 'react'
import { Link } from '@inertiajs/inertia-react'
import Auth from './Auth'

type Props = PropsWithChildren<{
  mode: 0 | 1 | 2 | 3
  id: string
  student?: {
    id: string
    activity_id?: string
  }
}>

const Class = ({ children, mode, id, student }: Props) => (
  <Auth class_id={id}>
    <div
      className={
        'flex justify-around pt-6 border-b border-dark ' +
        (mode != 3 ? 'pb-0' : 'pb-1')
      }
    >
      <Link
        href={'/class/overview/' + id}
        className={
          'font-semibold pb-5 ' +
          (mode == 0 && 'text-primary border-b-4 border-primary')
        }
      >
        Overview
      </Link>
      <Link
        href={'/class/' + id + '/students/view'}
        className={
          'font-semibold pb-5 ' +
          (mode == 1 && 'text-primary border-b-4 border-primary')
        }
      >
        Students
      </Link>
      <Link
        href={`/class/${id}/overview/progress/${
          student?.id == undefined ? '' : student.id
        }${student?.activity_id == undefined ? '' : `/${student.activity_id}`}`}
        className={
          'font-semibold pb-5 ' +
          (mode == 2 && 'text-primary border-b-4 border-primary')
        }
      >
        Progress
      </Link>
    </div>
    {children}
  </Auth>
)

export default Class
