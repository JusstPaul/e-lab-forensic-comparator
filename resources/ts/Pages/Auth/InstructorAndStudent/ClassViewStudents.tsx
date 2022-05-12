import { FC, useState, ChangeEvent } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import { User } from '@/Layouts/Auth'
import Class from '@/Layouts/Class'
import Table from '@/Components/Table'
import { Inertia } from '@inertiajs/inertia'

type Student = {
  id: string
  student_id: string
  name: string
  contact?: string
}

type Props = {
  id: string
  students: Array<Student>
}

const ClassViewStudents: FC<Props> = ({ id, students }) => {
  const { user } = usePage().props
  const _user = user as User

  const [selected, setSelected] = useState<Array<string>>([])

  return (
    <Class id={id} mode={1}>
      <div className="md:grid grid-cols-4">
        <div></div>
        <div className="col-span-2">
          <Table
            title="Students"
            className="w-full overflow-auto"
            additionals={
              _user.role == 'instructor' ? (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={selected.length < 1}
                  onClick={() => {
                    Inertia.post(`/class/${id}/students/remove`, {
                      students: selected,
                    })
                  }}
                >
                  Remove Selected
                </button>
              ) : (
                <></>
              )
            }
          >
            <thead>
              <tr>
                {_user.role == 'instructor' && (
                  <th className="table-header w-14"></th>
                )}
                <th className="table-header">Student ID</th>
                <th className="table-header">Name</th>
                {_user.role == 'instructor' && (
                  <>
                    <th className="table-header">Contact</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {students.map((value, index) => (
                <tr key={index}>
                  {_user.role == 'instructor' && (
                    <td className="table-data">
                      <input
                        type="checkbox"
                        name={value.id}
                        className="rounded"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const idx = selected.indexOf(event.target.name, 0)
                          const nSelected = selected
                          if (idx > -1) {
                            nSelected.splice(idx, 1)
                          } else {
                            nSelected.push(event.target.name)
                          }
                          setSelected([...nSelected])
                        }}
                      />
                    </td>
                  )}
                  <td className="table-data">{value.student_id}</td>
                  <td className="table-data">{value.name}</td>
                  {_user.role == 'instructor' && (
                    <>
                      <td className="table-data">{value.contact}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div></div>
      </div>
    </Class>
  )
}
export default ClassViewStudents
