import { FC } from 'react'
import moment from 'moment'
import Table from '@/Components/Table'
import Class from '@/Layouts/Class'
import { Link } from '@inertiajs/inertia-react'

type Props = {
  id: string
  activities?: Array<{
    id: string
    title: string
    created_at: string
  }>
}

const ClassImportActivity: FC<Props> = ({ id, activities }) => {
  return (
    <Class id={id} mode={3}>
      <div className="container-lg p-4 md:p-8">
        <div className="w-full md:w-7/12 mx-auto pb-32 md:pb-16">
          <Table title="Import">
            <thead>
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Created At</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {activities ? (
                <>
                  {activities.map((value, index) => (
                    <tr>
                      <td className="table-data">{value.title}</td>
                      <td className="table-data">
                        {moment(value.created_at.split('T')[0]).format(
                          'ddd DD MMMM, h:mm A'
                        )}
                      </td>
                      <td className="table-data">
                        <Link href="#" className="btn-primary">
                          Use
                        </Link>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <></>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Class>
  )
}

export default ClassImportActivity
