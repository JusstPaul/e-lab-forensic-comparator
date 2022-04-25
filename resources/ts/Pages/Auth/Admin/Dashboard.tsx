import { FC, useState } from 'react'
import { Inertia } from '@inertiajs/inertia'
import { PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import Table from '@/Components/Table'
import ConfirmDialog from '@/Components/ConfirmDialog'
import Auth from '@/Layouts/Auth'

type User = {
  id: string
  username: string
  role: string
}

type Props = {
  role: string
  users: Array<User>
}

const Dashboard: FC<Props> = ({ role, users }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentId, setCurrentId] = useState('')

  return (
    <Auth title="Admin Dashboard" role={role}>
      <div className="flex flex-1 flex-col md:flex-row mx-2 mt-4 text-left">
        <Table title="Users">
          <thead>
            <tr>
              <th className="table-header">User ID</th>
              <th className="table-header">Username</th>
              <th className="table-header">Role</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((value, index) => (
              <tr key={index}>
                <td className="table-data">{value.id}</td>
                <td className="table-data">{value.username}</td>
                <td className="table-data">{value.role}</td>
                <td className="table-data">
                  <div className="flex gap-2">
                    <PencilAltIcon className="icon text-teal-400" />
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentId(value.id)
                        setIsOpen(true)
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
          title="Delete user?"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            Inertia.post(`/user/delete/${currentId}`)
          }}
        >
          Are you sure you want to delete this user?
        </ConfirmDialog>
      </div>
    </Auth>
  )
}

export default Dashboard
