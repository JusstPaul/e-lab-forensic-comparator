import { FC, useEffect, useState, ChangeEvent } from 'react'
import { PropsWithChildren } from 'react'
import { Head, Link, usePage, useForm } from '@inertiajs/inertia-react'
import { DocumentAddIcon, HomeIcon, UserAddIcon } from '@heroicons/react/solid'
import {
  AppShell,
  Box,
  Header,
  Navbar,
  Text,
  Menu,
  UnstyledButton,
  Modal,
  Button,
  Burger,
  MediaQuery,
  Group,
  Stack,
  Center,
  ThemeIcon,
  Accordion,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  PlusIcon,
  MenuIcon,
  ChevronDownIcon,
  BadgeCheckIcon,
} from '@heroicons/react/outline'
import Input from '@/Components/Input'
import Selection from '@/Components/Selection'
import Time from '@/Components/Time'
import useStyle from '@/Lib/styles'
import { Student } from '@/Pages/Auth/InstructorAndStudent/ClassViewProgress'

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
  students?: Array<Student>
  onModals?: Function
}>

type CreateUserFormProps = {
  onCreateUser?: Function
}
const CreateUserForm: FC<CreateUserFormProps> = ({ onCreateUser }) => {
  const { data, setData, post, processing, errors } = useForm<{
    username: string
    type: 'admin' | 'instructor' | 'student'
  }>({
    username: '',
    type: 'admin',
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        post('/user/create', {
          onSuccess: () => {
            if (onCreateUser) {
              onCreateUser()
            }
          },
        })
      }}
    >
      <Input
        error={{ value: errors.username }}
        textProps={{
          label: 'Username',
          placeholder: 'username',
          value: data.username,
          onChange: (event) => {
            setData({ ...data, username: event.target.value })
          },
        }}
      />
      <Selection
        error={{ value: errors.type, message: 'Role must be a valid role.' }}
        selectProps={{
          label: 'Role',
          data: [
            { value: 'admin', label: 'Admin' },
            { value: 'instructor', label: 'Instructor' },
            { value: 'student', label: 'Student' },
          ],
          value: data.type,
          searchable: true,
          nothingFound: 'Invalid role',
          onChange: (value) => {
            setData({ ...data, type: value as any })
          },
        }}
      />
      <Button type="submit" fullWidth>
        Create
      </Button>
    </form>
  )
}

type CreateClassFormProps = {
  onCreateClass?: Function
}
const CreateClassForm: FC<CreateClassFormProps> = ({ onCreateClass }) => {
  const { data, setData, post, processing, errors } = useForm({
    section: '',
    room: '',
    day: 'MWF',
    time_start: new Date(),
    time_end: new Date(),
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    switch (name) {
      case 'section':
        setData({ ...data, section: value })
        break
      case 'room':
        setData({ ...data, room: value })
        break
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        post('/class/create', {
          onSuccess: () => {
            if (onCreateClass) {
              onCreateClass()
            }
          },
        })
      }}
    >
      <Group>
        <Input
          error={{ value: errors.section }}
          textProps={{
            label: 'Section',
            placeholder: 'Section',
            value: data.section,
            name: 'section',
            onChange: handleInputChange,
          }}
        />

        <Input
          error={{ value: errors.room }}
          textProps={{
            label: 'Room',
            placeholder: 'Room',
            value: data.room,
            name: 'room',
            onChange: handleInputChange,
          }}
        />
      </Group>
      <Group>
        <Selection
          error={{
            value: errors.day,
            message: 'Must be a valid schedule day.',
          }}
          selectProps={{
            label: 'Day',
            data: [
              { value: 'MWF', label: 'MWF' },
              { value: 'TTh', label: 'TTh' },
              { value: 'Sat', label: 'Sat' },
            ],
            value: data.day,
            searchable: true,
            nothingFound: 'Invalid schedule day',
            onChange: (value) => {
              setData({ ...data, day: value as any })
            },
          }}
        />
        <Time
          timeProps={{
            label: 'Time Start',
            name: 'time_start',
            value: data.time_start,
            onChange: (value) => setData({ ...data, time_start: value }),
          }}
          error={{
            value: errors.time_start,
            message: 'Please enter valid starting time.',
          }}
        />
        <Time
          timeProps={{
            label: 'Time End',
            name: 'time_end',
            value: data.time_end,
            onChange: (value) => setData({ ...data, time_end: value }),
          }}
          error={{
            value: errors.time_end,
            message: 'Please enter valid ending time.',
          }}
        />
      </Group>
      <Button type="submit" fullWidth>
        Create
      </Button>
    </form>
  )
}

const Auth = ({ title, class_id, onModals, students, children }: Props) => {
  const [headTitle, setHeadTitle] = useState('e-Lab Forensic Comparator')
  useEffect(() => {
    if (title) {
      setHeadTitle(`${headTitle} • ${title}`)
    }
  })

  const [isOpen, isOpenHandler] = useDisclosure(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false)

  const [isNavbarOpen, setIsNavbarOpen] = useState(false)

  const atLeastMd = useMediaQuery('(min-width: 992px)')

  const { url } = usePage()

  const { user } = usePage().props
  const _user = user as User

  const classes = useStyle()

  return (
    <>
      <Head title={headTitle} />
      <AppShell
        fixed
        styles={(theme) => ({
          main: {
            backgroundColor: theme.colors.gray[1],
            color: theme.colors.gray[9],
            position: 'relative',
          },
        })}
        navbarOffsetBreakpoint="sm"
        navbar={
          url !== '/no-class-yet' &&
          _user.name &&
          _user.name.length > 0 &&
          (_user.role == 'instructor' || _user.role == 'student') ? (
            <Navbar
              p="xs"
              pt="lg"
              sx={(theme) => ({
                borderRightWidth: '1px',
                borderRightColor: theme.colors.gray[3],
                backgroundColor: theme.colors.gray[1],
              })}
              hidden={!isNavbarOpen}
              hiddenBreakpoint="sm"
              width={{ sm: 200, md: 250 }}
            >
              {_user.role == 'instructor' ? (
                <>
                  {class_id ? (
                    <>
                      <Navbar.Section>
                        <Stack spacing="xs">
                          <UnstyledButton
                            component={Link}
                            href={`/class/overview/${class_id}`}
                            className={classes.classes.navbarLink}
                          >
                            <ThemeIcon
                              radius="md"
                              size="lg"
                              className={classes.classes.navbarIcon}
                            >
                              <HomeIcon className={classes.classes.icon} />
                            </ThemeIcon>
                            <Text>Class</Text>
                          </UnstyledButton>

                          <UnstyledButton
                            component={Link}
                            href={`/class/overview/${class_id}/progress`}
                            className={classes.classes.navbarLink}
                          >
                            <ThemeIcon
                              radius="md"
                              size="lg"
                              className={classes.classes.navbarIcon}
                            >
                              <BadgeCheckIcon
                                className={classes.classes.icon}
                              />
                            </ThemeIcon>
                            <Text>Progress</Text>
                          </UnstyledButton>

                          <UnstyledButton
                            component={Link}
                            href={`/class/${class_id}/students/add`}
                            className={classes.classes.navbarLink}
                          >
                            <ThemeIcon
                              radius="md"
                              size="lg"
                              className={classes.classes.navbarIcon}
                            >
                              <UserAddIcon className={classes.classes.icon} />
                            </ThemeIcon>
                            <Text>Add Students</Text>
                          </UnstyledButton>

                          <UnstyledButton
                            component={Link}
                            href={`/class/${class_id}/activity/create`}
                            className={classes.classes.navbarLink}
                          >
                            <ThemeIcon
                              radius="md"
                              size="lg"
                              className={classes.classes.navbarIcon}
                            >
                              <PlusIcon className={classes.classes.icon} />
                            </ThemeIcon>
                            <Text>Add Task</Text>
                          </UnstyledButton>
                        </Stack>
                      </Navbar.Section>
                      {students && (
                        <Navbar.Section>
                          <Accordion iconSize={14} offsetIcon={false}>
                            <Accordion.Item label="Students">
                              <Stack>
                                {students.map((value, index) => (
                                  <Link
                                    href={`/class/overview/${class_id}/progress/${value.id}`}
                                    className={classes.classes.link}
                                    key={index}
                                    replace
                                  >
                                    {value.name}
                                  </Link>
                                ))}
                              </Stack>
                            </Accordion.Item>
                          </Accordion>
                        </Navbar.Section>
                      )}
                    </>
                  ) : (
                    <Navbar.Section>
                      <Stack spacing="xs">
                        <UnstyledButton
                          onClick={() => setIsCreateClassOpen(true)}
                          className={classes.classes.navbarLink}
                        >
                          <ThemeIcon
                            radius="md"
                            size="lg"
                            className={classes.classes.navbarIcon}
                          >
                            <PlusIcon className={classes.classes.icon} />
                          </ThemeIcon>
                          <Text>Create Class</Text>
                        </UnstyledButton>
                      </Stack>
                    </Navbar.Section>
                  )}
                </>
              ) : (
                <>
                  {class_id ? (
                    <Navbar.Section>
                      <Stack spacing="xs">
                        <UnstyledButton
                          component={Link}
                          href={`/class/overview/${class_id}/progress`}
                          className={classes.classes.navbarLink}
                        >
                          <ThemeIcon
                            radius="md"
                            size="lg"
                            className={classes.classes.navbarIcon}
                          >
                            <HomeIcon className={classes.classes.icon} />
                          </ThemeIcon>
                          <Text>Class</Text>
                        </UnstyledButton>

                        <UnstyledButton
                          component={Link}
                          href={`/class/overview/${class_id}`}
                          className={classes.classes.navbarLink}
                        >
                          <ThemeIcon
                            radius="md"
                            size="lg"
                            className={classes.classes.navbarIcon}
                          >
                            <BadgeCheckIcon className={classes.classes.icon} />
                          </ThemeIcon>
                          <Text>Progress</Text>
                        </UnstyledButton>
                      </Stack>
                    </Navbar.Section>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </Navbar>
          ) : (
            <></>
          )
        }
        header={
          <Header
            height={60}
            sx={(theme) => ({
              color: theme.colors.gray[0],
              height: '100%',
            })}
          >
            <Box
              sx={(_) => ({
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                height: '100%',
                '@media (min-width: 992px)': {
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                },
              })}
            >
              {_user.role === 'admin' ? (
                <div>
                  <Link
                    href="/"
                    style={{
                      textDecoration: 'none',
                      color: '#f8f9fa',
                      fontWeight: 'bolder',
                    }}
                  >
                    Admin Dashboard
                  </Link>
                </div>
              ) : (
                <Box
                  style={{
                    display: 'flex',
                    columnGap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <MediaQuery
                    query="(min-width: 992px)"
                    styles={{ display: 'none' }}
                  >
                    <Burger
                      opened={isNavbarOpen}
                      onClick={() => setIsNavbarOpen((value) => !value)}
                      title={'Toggle Navigation Bar'}
                      color="#f8f9fa"
                      size="sm"
                    />
                  </MediaQuery>
                  <Link
                    href="/"
                    style={{
                      textDecoration: 'none',
                      color: '#f8f9fa',
                      fontWeight: 'bolder',
                    }}
                  >
                    Home
                  </Link>
                </Box>
              )}
              <MediaQuery
                query="(max-width: 992px)"
                styles={{ display: 'none' }}
              >
                <Text weight="bolder" align="center">
                  Data Center College of the Philippines of Laoag, Inc.
                </Text>
              </MediaQuery>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  columnGap: '0.5rem',
                  gridColumn: `${
                    atLeastMd ? 'span 1 / span 1' : 'span 2 / span 2'
                  }`,
                }}
              >
                {_user.role === 'admin' ? (
                  <div>
                    <UnstyledButton
                      onClick={() => setIsCreateUserOpen(true)}
                      sx={(theme) => ({
                        color: theme.colors.gray[0],
                      })}
                    >
                      Create User
                    </UnstyledButton>
                  </div>
                ) : (
                  <>
                    {atLeastMd && _user.name != undefined ? (
                      <Text
                        sx={(theme) => ({
                          color: theme.colors.gray[0],
                        })}
                      >
                        {_user.name}
                      </Text>
                    ) : (
                      <></>
                    )}
                  </>
                )}
                <Menu
                  withArrow
                  placement="end"
                  opened={isOpen}
                  onOpen={isOpenHandler.open}
                  onClose={isOpenHandler.close}
                  control={
                    <UnstyledButton
                      sx={(theme) => ({
                        color: theme.colors.gray[0],
                        alignItems: 'center',
                      })}
                    >
                      <ChevronDownIcon className={classes.classes.icon} />
                    </UnstyledButton>
                  }
                >
                  {_user.role === 'admin' ? (
                    <Menu.Item component={Link} href="/password/change">
                      Change Password
                    </Menu.Item>
                  ) : (
                    <Menu.Item component={Link} href="/profile/edit">
                      Profile
                    </Menu.Item>
                  )}
                  <Menu.Item
                    component={Link}
                    href="/logout"
                    method="post"
                    as="button"
                  >
                    Logout
                  </Menu.Item>
                </Menu>
              </Box>
            </Box>
          </Header>
        }
      >
        {_user.role === 'admin' ? (
          <Modal
            opened={isCreateUserOpen}
            onClose={() => setIsCreateUserOpen(false)}
            title="Create User"
          >
            <CreateUserForm onCreateUser={onModals} />
          </Modal>
        ) : (
          <Modal
            opened={isCreateClassOpen}
            onClose={() => setIsCreateClassOpen(false)}
            title="Create Class"
          >
            <CreateClassForm onCreateClass={onModals} />
          </Modal>
        )}
        {children}
      </AppShell>
    </>
  )

  /* return (
    <>
      <Head title={headTitle} />
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
  ) */
}

export default Auth
