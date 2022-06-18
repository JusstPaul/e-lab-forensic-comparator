import Class from '@/Layouts/Class'
import moment from 'moment'
import { FC } from 'react'

type Props = {
  id: string
  activity: {
    id: string
    title: string
    type: string
    date_end: string
    time_end: string
  }
}

const ClassViewActivity: FC<Props> = ({ id, activity }) => (
  <Class id={id} mode={3}>
    <div className="container-lg py-4">
      <div className="font-light text-lg w-fit mx-auto mb-4">Activity</div>
      <div className="card w-fit mx-auto">
        <div className="text-sm">
          Due{' '}
          {moment(activity.date_end + ' ' + activity.time_end).format(
            'ddd DD MMMM, h:mm A'
          )}
        </div>
        <div className="text-lg">{activity.title}</div>
      </div>
    </div>
  </Class>
)

export default ClassViewActivity
