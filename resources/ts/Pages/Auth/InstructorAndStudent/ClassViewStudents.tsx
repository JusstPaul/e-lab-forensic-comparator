import { FC } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import { User } from '@/Layouts/Auth'
import Class from '@/Layouts/Class'
import Table from '@/Components/Table'

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

  return (
    <Class id={id} mode={1}>
      <div className="md:grid grid-cols-4">
        <div></div>
        <div className="col-span-2">
          <Table title="Students">
            <thead>
              <tr>
                <th className="table-header">Student ID</th>
                <th className="table-header">Name</th>
                {_user.role == 'instructor' && (
                  <th className="table-header">Contact</th>
                )}
              </tr>
            </thead>
            <tbody>
              {students.map((value, index) => (
                <tr key={index}>
                  <td className="table-data">{value.student_id}</td>
                  <td className="table-data">{value.name}</td>
                  {_user.role == 'instructor' && (
                    <td className="table-data">{value.contact}</td>
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
