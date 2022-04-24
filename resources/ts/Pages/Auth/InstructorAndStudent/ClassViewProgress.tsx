import { FC, Fragment, useState } from 'react'
import { Link } from '@inertiajs/inertia-react'
import Select from '@/Components/Select'
import Class from '@/Layouts/Class'
import Table from '@/Components/Table'
import { SideBarSection } from '@/Layouts/Auth'

type Student = {
  id: string
  username: string
  name: string
}

type ActivityStatus = {
  id?: string
  type?: string
  title: string
  score: string
  is_late: boolean
}

type StudentWithActivities = {
  student: Student
  exams: Array<ActivityStatus>
  assignments: Array<ActivityStatus>
}

type Props = {
  id: string
  role: string
  sidebar?: Array<SideBarSection>
  students?: Array<Student>
  current_student?: StudentWithActivities
}

const ClassViewProgress: FC<Props> = ({
  id,
  role,
  sidebar,
  students,
  current_student,
}) => {
  const [progressViewMode, setProgressViewMode] = useState<
    'Exams' | 'Assignment'
  >('Exams')

  const renderScore = (score: string) => {
    if (score == 'Unchecked') {
      return <span className="text-green-500">{score}</span>
    } else if (score == 'No submits') {
      return <span className="text-red-500">{score}</span>
    }
    return <span>{score}</span>
  }

  return (
    <Class id={id} role={role} mode={2} sidebar={sidebar}>
      <div className="h-full flex">
        {students != undefined ? (
          <div className="pt-8 px-8 border-r border-dark overflow-y-auto">
            <div className="font-semibold mb-4">Students</div>
            <div className="flex flex-col gap-4">
              {students.map((value, index) => (
                <Fragment key={index}>
                  <Link
                    href={`/class/${id}/overview/progress/${value.id}`}
                    only={['current_student']}
                    preserveState
                    replace
                  >
                    <span className="w-fit">{value.name}</span>
                  </Link>
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="overflow-y-auto w-full pt-8 px-8">
          {current_student != undefined ? (
            <div className="w-full">
              <div className="text-center w-full">
                <div className="text-lg">{current_student.student.name}</div>
                <div>{current_student.student.username}</div>
              </div>
              <Table
                title={progressViewMode}
                additionals={
                  <>
                    <Select
                      name="mode"
                      options={['Exams', 'Assignment']}
                      className="mb-0"
                      onChange={(event) => {
                        setProgressViewMode(
                          event.target.value as 'Exams' | 'Assignment'
                        )
                      }}
                    />
                  </>
                }
              >
                <thead>
                  <th className="table-header">Title</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">On Time</th>
                </thead>
                {progressViewMode == 'Assignment' ? (
                  <tbody>
                    {current_student.assignments.map((value, index) => (
                      <tr key={index}>
                        <td className="table-data">
                          {value.id != undefined ? (
                            <Link
                              href={`/class/${id}/activity/${value.id}/check`}
                            >
                              {value.title}
                            </Link>
                          ) : (
                            <span>{value.title}</span>
                          )}
                        </td>
                        <td className="table-data">
                          {renderScore(value.score)}
                        </td>
                        <td className="table-data">
                          {value.is_late ? (
                            <span className="text-red-500">No</span>
                          ) : (
                            <span className="text-green-500">Yes</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    {current_student.exams.map((value, index) => (
                      <tr key={index}>
                        <td className="table-data">
                          {value.id != undefined ? (
                            <Link
                              href={`/class/${id}/activity/${value.id}/check`}
                            >
                              {value.title}
                            </Link>
                          ) : (
                            <span>{value.title}</span>
                          )}
                        </td>
                        <td className="table-data">
                          {renderScore(value.score)}
                        </td>
                        <td className="table-data">
                          {value.is_late ? (
                            <span className="text-red-500">No</span>
                          ) : (
                            <span className="text-green-500">Yes</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </Table>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Class>
  )
}

export default ClassViewProgress
