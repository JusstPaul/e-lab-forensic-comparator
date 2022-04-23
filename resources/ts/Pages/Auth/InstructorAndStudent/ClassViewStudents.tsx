import { FC } from 'react'
import { SideBarSection } from '@/Layouts/Auth'
import Class from '@/Layouts/Class'
import Table from '@/Components/Table'

type Student = {
  id: string
  student_id: string
  name: string
  contact?: string
}

type Props = {
  role: string
  id: string
  students: Array<Student>
  sidebar?: Array<SideBarSection>
}

const ClassViewStudents: FC<Props> = ({ role, id, students, sidebar }) => (
  <Class role={role} id={id} mode={1} sidebar={sidebar}>
    <Table title="Students">
      <thead>
        <tr>
          <th className="table-header">User ID</th>
          <th className="table-header">Student ID</th>
          <th className="table-header">Name</th>
          {role == 'instructor' && <th className="table-header">Contact</th>}
        </tr>
      </thead>
      <tbody>
        {students.map((value, index) => (
          <tr key={index}>
            <td className="table-data">{value.id}</td>
            <td className="table-data">{value.student_id}</td>
            <td className="table-data">{value.name}</td>
            {role == 'instructor' && (
              <td className="table-data">{value.contact}</td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  </Class>
)
export default ClassViewStudents
