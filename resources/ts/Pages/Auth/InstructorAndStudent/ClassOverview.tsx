import { FC } from 'react'
import { SideBarSection } from '@/Layouts/Auth'
import Class from '@/Layouts/Class'

type Classes = {
  id: string
  code: string
  instructor_name: string
  day: string
  time_end: string
  time_start: string
}

type Props = {
  role: string
  classes: Classes
  sidebar?: Array<SideBarSection>
}

const ClassOverview: FC<Props> = ({ role, classes, sidebar }) => (
  <Class role={role} mode={0} id={classes.id} sidebar={sidebar}>
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
    </div>
  </Class>
)

export default ClassOverview
