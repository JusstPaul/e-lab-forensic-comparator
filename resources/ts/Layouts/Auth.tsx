import { useEffect, useState } from 'react'
import { PropsWithChildren } from 'react'
import { Head, Link, usePage } from '@inertiajs/inertia-react'
import { DocumentAddIcon, UserAddIcon } from '@heroicons/react/solid'

import {
  PlusIcon,
  MenuIcon as Menu,
  ChevronDownIcon,
} from '@heroicons/react/outline'
import SidebarElement from '@/Components/SidebarElement'
import isMobile from '@/Lib/isMobile'
import Dropdown, { DropdownChild, DropdownSelect } from '@/Components/Dropdown'

type SideBarSectionElements = {
  display: string
  link: string
}

export type SideBarSection = {
  title: string
  elements: Array<SideBarSectionElements>
}

export type User = {
  id: string
  role: 'admin' | 'instructor' | 'student' | 'guest'
  name?: string
  sidebar?: Array<SideBarSection>
}

type Props = PropsWithChildren<{
  title?: string
  class_id?: string
}>

const Auth = ({ title, class_id, children }: Props) => {
  const headTitle = 'e-Lab Forensic Comparator'

  const [isOpen, setOpen] = useState(false)
  const [isSideOpen, setSideOpen] = useState(false)

  const isMobileCheck = isMobile()

  const { url } = usePage()
  const { user } = usePage().props
  const _user = user as User

  return (
    <>
      <Head title={!title ? headTitle : title + ' • ' + headTitle} />
      <header className="grid grid-cols-3 items-center bg-primary px-2 md:px-4 py-4">
        {_user.role === 'admin' ? (
          <div>
            <Link
              href="/"
              className="text-lg font-extrabold col-span-2 md:col-span-1 w-fit"
            >
              Admin Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            {_user.role == 'student' &&
            (_user.sidebar == undefined || _user.sidebar.length < 1) ? (
              <></>
            ) : (
              <button
                type="button"
                className="outline-none"
                onClick={() => setSideOpen(!isSideOpen)}
              >
                <Menu className="icon" />
              </button>
            )}
            <Link
              href="/"
              className="text-lg font-extrabold col-span-2 md:col-span-1 w-fit"
            >
              Home
            </Link>
          </div>
        )}
        {isMobileCheck ? (
          <div className="text-center font-bold">
            Data Center College of the Philippines of Laoag, Inc.
          </div>
        ) : (
          <></>
        )}
        <div
          className={
            'relative inline-block ' + (!isMobileCheck && 'col-span-2')
          }
        >
          <div>
            <div className="w-full flex items-center gap-4 justify-end">
              {isMobileCheck && _user.name != undefined ? (
                <span>{_user.name}</span>
              ) : (
                <></>
              )}
              {_user.role == 'admin' ? (
                <span>
                  <Link href="/user/create" disabled={url === '/user/create'}>
                    Create User
                  </Link>
                </span>
              ) : (
                <></>
              )}
              <button
                type="button"
                className="outline-none bg-primary-dark p-2 rounded-full shadow-sm"
                onClick={() => setOpen(!isOpen)}
              >
                <ChevronDownIcon className="icon" />
              </button>
            </div>
          </div>
          {isOpen ? (
            <Dropdown>
              <DropdownChild>
                <DropdownSelect>
                  <Link href="/profile/edit" className="w-full text-left">
                    Profile
                  </Link>
                </DropdownSelect>

                <DropdownSelect>
                  <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full text-left"
                  >
                    Logout
                  </Link>
                </DropdownSelect>
              </DropdownChild>
            </Dropdown>
          ) : (
            <></>
          )}
        </div>
      </header>
      <main
        className="relative container-lg h-full flex overflow-hidden"
        onClick={() => {
          if (isOpen) {
            setOpen(false)
          }
        }}
      >
        {_user.role == 'admin' || isSideOpen == false ? (
          <></>
        ) : (
          <aside
            className="flex-grow-0 divide-y border-r border-dark h-full md:px-6 bg-light absolute md:static z-10 origin-top-left top-0 left-0 w-fit"
            aria-label="sidebar"
          >
            {_user.role == 'instructor' ? (
              <>
                {class_id ? (
                  <div className="pt-8 pb-4 px-2 flex flex-col gap-4 w-max">
                    <Link
                      href={'/class/' + class_id + '/students/add'}
                      className="flex gap-2"
                    >
                      <UserAddIcon className="icon" />
                      <span>Add Student</span>
                    </Link>

                    <Link
                      href={'/class/' + class_id + '/activity/create'}
                      className="flex gap-2 mb-4"
                    >
                      <DocumentAddIcon className="icon" />
                      <span>Create Task</span>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-8 pb-4 px-2">
                    <Link href="/class/create" className="flex gap-2">
                      <PlusIcon className="icon" />
                      <span>Create Class</span>
                    </Link>
                  </div>
                )}
                <div className="pt-4 px-2 text-left">
                  {_user.sidebar?.map((value, index) => (
                    <div key={index}>
                      <SidebarElement sidebar={value} toggleable={false} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {isSideOpen ? (
                  <div className="py-8 px-2">
                    {_user.sidebar?.map((value, index) => (
                      <div key={index}>
                        <SidebarElement
                          sidebar={value}
                          hasCounter={true}
                          highlight={true}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}
          </aside>
        )}
        <div className="flex-grow h-full overflow-auto">{children}</div>
      </main>
    </>
  )
}

export default Auth
