import { FC, useState } from 'react'
import { Link } from '@inertiajs/inertia-react'
import { PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import Table from '@/Components/Table'
import ConfirmDialog from '@/Components/ConfirmDialog'
import Auth from '@/Layouts/Auth'
import { Inertia } from '@inertiajs/inertia'

type User = {
  id: string
  username: string
  role: string
}

type Props = {
  users: Array<User>
}

const Dashboard: FC<Props> = ({ users }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentID, setCurrentID] = useState('')

  return (
    <Auth title="Admin Dashboard">
      <div className="md:grid grid-cols-6 h-full mx-2 mt-4">
        <div></div>
        <div className="col-span-4">
          <Table title="Users">
            <thead>
              <tr>
                <th className="table-header">Username</th>
                <th className="table-header">Role</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((value, index) => (
                <tr key={index}>
                  <td className="table-data">{value.username}</td>
                  <td className="table-data">{value.role}</td>
                  <td className="table-data">
                    <div className="flex gap-2">
                      <Link href={`/user/edit/${value.id}`}>
                        <PencilAltIcon className="icon text-teal-400" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentID(value.id)
                          setIsDialogOpen(true)
                        }}
                      >
                        <TrashIcon className="icon text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <ConfirmDialog
            title="Delete user"
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onConfirm={() => {
              Inertia.post(`/user/delete/${currentID}`)
            }}
          >
            Are you sure you want to delete this user?
          </ConfirmDialog>
        </div>
        <div></div>
      </div>
    </Auth>
  )
}

export default Dashboard
