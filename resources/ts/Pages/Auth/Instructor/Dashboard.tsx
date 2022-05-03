import { FC, useState } from 'react'
import { Link } from '@inertiajs/inertia-react'
import { DotsVerticalIcon } from '@heroicons/react/solid'
import Auth from '@/Layouts/Auth'
import Dropdown, { DropdownChild, DropdownSelect } from '@/Components/Dropdown'
import ConfirmDialog from '@/Components/ConfirmDialog'
import { Inertia } from '@inertiajs/inertia'

type Class = {
  id: string
  code: string
  day: string
  room: string
  time_start: string
  time_end: string
}

type Props = {
  classes?: Array<Class>
}

const Dashboard: FC<Props> = ({ classes }) => {
  const [isOpen, setIsOpen] = useState(classes?.map(() => false))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentClass, setCurrentClass] = useState('')

  return (
    <Auth>
      <div className="container-lg p-4 md:p-8">
        <div className="py-4 md:grid grid-cols-4 gap-4">
          {classes ? (
            classes.map((value, index) => (
              <div
                key={index}
                className="bg-primary pl-8 pr-2 py-4 rounded-md shadow-sm cursor-pointer mb-4 relative"
              >
                <div className="flex items-center">
                  <Link
                    className="text-lg mb-0 flex-grow"
                    href={`/class/overview/${value.id}`}
                  >
                    {value.code}
                  </Link>
                  <button
                    type="button"
                    className="flex-grow-0 rounded-full outline-none bg-primary-dark p-2"
                    onClick={() => {
                      let nIsOpen = [...isOpen!]
                      nIsOpen[index] = !nIsOpen[index]
                      setIsOpen(nIsOpen)
                      console.log(isOpen)
                    }}
                  >
                    <DotsVerticalIcon className="icon" />
                  </button>
                </div>
                <div className="text-xs">
                  <span>{value.day} </span>
                  <span>{value.time_start}</span>
                  <span> to </span>
                  <span>{value.time_end}</span>
                  {isOpen != undefined && isOpen[index] == true ? (
                    <Dropdown>
                      <DropdownChild>
                        <DropdownSelect>
                          <Link href={`/class/edit/${value.id}`}>Edit</Link>
                        </DropdownSelect>
                        <DropdownSelect>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentClass(value.id)
                              setIsDialogOpen(true)
                            }}
                          >
                            Delete
                          </button>
                        </DropdownSelect>
                      </DropdownChild>
                    </Dropdown>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
      <ConfirmDialog
        title="Delete class"
        onClose={() => {
          setIsDialogOpen(false)
        }}
        onConfirm={() => {
          Inertia.post(`/class/delete/${currentClass}`)
        }}
        isOpen={isDialogOpen}
      >
        Are you sure you want to delete this class?
      </ConfirmDialog>
    </Auth>
  )
}

export default Dashboard
