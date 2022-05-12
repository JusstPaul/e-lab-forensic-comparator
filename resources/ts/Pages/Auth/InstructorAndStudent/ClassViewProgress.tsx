import { FC, Fragment, useState } from 'react'
import { Link, usePage } from '@inertiajs/inertia-react'
import Class from '@/Layouts/Class'
import Table from '@/Components/Table'
import Select from '@/Components/Select'
import { User } from '@/Layouts/Auth'

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
  students?: Array<Student>
  current_student?: StudentWithActivities
}

const ClassViewProgress: FC<Props> = ({ id, students, current_student }) => {
  const [progressViewMode, setProgressViewMode] = useState<
    'Exams' | 'Assignment'
  >('Exams')

  const { user } = usePage().props
  const _user = user as User

  const renderScore = (score: string) => {
    if (score == 'Submitted') {
      return <span className="text-green-500">{score}</span>
    } else if (score == 'None') {
      return <span className="text-red-500">{score}</span>
    }

    return <span>{score}</span>
  }

  // FIX: Remove this
  /*  if (_user.role == 'student') {
    return <Class id={id} mode={2}></Class>
  } */

  return (
    <Class id={id} mode={2}>
      <div className="h-full flex justify-end py-4">
        <div className="flex-grow overflow-y-auto md:grid grid-cols-5 w-fit">
          {current_student != undefined ? (
            <>
              <div></div>
              <div className="w-full px-4 col-span-3">
                <div className="w-full mx-2">
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
                    <tr>
                      <th className="table-header">Title</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Is On Time</th>
                    </tr>
                  </thead>
                  {progressViewMode == 'Assignment' ? (
                    <tbody>
                      {current_student.assignments.map((value, index) => (
                        <tr key={index}>
                          <td className="table-data">
                            {value.id != undefined ? (
                              <Link
                                href={`/class/${id}/activity/${value.id}/show/${current_student.student.id}`}
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
                                href={`/class/${id}/activity/${value.id}/show/${current_student.student.id}`}
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
              <div></div>
            </>
          ) : (
            <></>
          )}
        </div>
        {_user.role == 'instructor' ? (
          <div className="flex-grow-0 border-l border-dark h-full overflow-y-auto px-8 w-max">
            <div className="mb-2 text-lg">Students</div>
            {students != undefined ? (
              <>
                {students.map((value, index) => (
                  <div key={index}>
                    <Link
                      href={`/class/${id}/overview/progress/${value.id}`}
                      only={['current_student']}
                      preserveState
                      replace
                      className="w-max"
                    >
                      <span className="w-max">{value.name}</span>
                    </Link>
                  </div>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </Class>
  )
}

export default ClassViewProgress
