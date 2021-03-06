import { ChangeEvent, FC, useState } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import { SearchIcon } from '@heroicons/react/solid'
import TextInput from '@/Components/TextInput'
import Auth from '@/Layouts/Auth'
import {
  Text,
  Box,
  Button,
  Container,
  Group,
  Center,
  Table,
  Paper,
  Checkbox,
} from '@mantine/core'
import { Inertia } from '@inertiajs/inertia'
import Input from '@/Components/Input'

type Student = {
  id: string
  student_id: string
  name: string
  contact: string
}

type Props = {
  id: string
  students: Array<Student>
}

const ClassAddStudent: FC<Props> = ({ id, students }) => {
  const [search, setSearch] = useState('')
  const [searchIndexes, setSearchIndexes] = useState<Array<number>>([])

  const { data, setData, post, processing, errors } = useForm<{
    selected: Array<string>
  }>({
    selected: [],
  })

  return (
    <Auth class_id={id}>
      <Container size="md" p="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            post(`/class/${id}/students/add`)
          }}
        >
          <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Container size="sm" style={{ display: 'flex', columnGap: '1rem' }}>
              <Input
                textProps={{
                  value: search,
                  placeholder: 'Search',
                  onChange: (event) => setSearch(event.target.value),
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  if (search.length == 0) {
                    setSearchIndexes([])
                    return
                  }

                  try {
                    const searchRegex = new RegExp(search, 'ig')
                    const nIndexes: Array<number> = []

                    students.forEach(({ name, student_id }, index) => {
                      if (
                        name.match(searchRegex) == null &&
                        student_id.match(searchRegex) == null
                      ) {
                        nIndexes.push(index)
                      }
                    })

                    setSearchIndexes(nIndexes)
                  } catch (error) {
                    console.error(error)
                  }
                }}
              >
                Search
              </Button>
            </Container>
            <div className="md:flex items-center gap-4 justify-end">
              {errors.selected ? (
                <Text
                  size="sm"
                  sx={(theme) => ({ color: theme.colors.red[5] })}
                >
                  Please select at least one student
                </Text>
              ) : (
                <></>
              )}
              <Button
                type="submit"
                className="btn-primary"
                loading={processing}
              >
                Add Students
              </Button>
            </div>
          </Box>
          <Box>
            <Center>
              <Text size="lg">Add Student</Text>
            </Center>
            <Paper shadow="xs" p="sm" withBorder>
              <Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((value, index) => (
                    <tr key={value.id}>
                      {searchIndexes.indexOf(index) == -1 ? (
                        <>
                          <td>
                            <Checkbox
                              name={value.id}
                              onChange={(
                                event: ChangeEvent<HTMLInputElement>
                              ) => {
                                const idx = data.selected.indexOf(
                                  event.target.name,
                                  0
                                )
                                const nSelected = data.selected
                                if (idx > -1) {
                                  nSelected.splice(idx, 1)
                                } else {
                                  nSelected.push(event.target.name)
                                }
                                setData({ selected: nSelected })
                              }}
                              checked={data.selected.indexOf(value.id) != -1}
                            />
                          </td>
                          <td>{value.student_id}</td>
                          <td style={{ textTransform: 'uppercase' }}>
                            {value.name}
                          </td>
                          <td>{value.contact}</td>
                        </>
                      ) : (
                        <></>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Box>
        </form>
      </Container>
    </Auth>
  )

  /*   return (
    <Class id={id} mode={3}>
      <form
        className="py-8 md:grid grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          post('/class/' + id + '/students/add')
        }}
      >
        <div></div>
        <div className="col-span-2">
          <div className="flex gap-x-4 gap-y-0">
            <TextInput
              label="Search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
              }}
              className="w-fit mx-2"
            />
            <button
              type="button"
              className="btn-primary h-fit my-auto flex gap-2 py-1.5"
              onClick={() => {
                if (search.length == 0) {
                  setSearchIndexes([])
                  return
                }

                try {
                  const searchRegex = new RegExp(search, 'ig')
                  const nIndexes: Array<number> = []

                  students.forEach((value, index) => {
                    if (value.name.match(searchRegex) == null) {
                      nIndexes.push(index)
                    }
                  })

                  setSearchIndexes(nIndexes)
                } catch (error) {
                  console.error(error)
                }
              }}
            >
              <span>Search</span>
              <SearchIcon className="icon" />
            </button>
          </div>
          <Table
            title="Add Student"
            className="w-full"
            additionals={
              <div className="md:flex items-center gap-4 justify-end">
                {errors.selected ? (
                  <div className="error">
                    Please select at least one student
                  </div>
                ) : (
                  <></>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={processing}
                >
                  Add Students
                </button>
              </div>
            }
          >
            <thead>
              <tr>
                <th className="table-header w-14"></th>
                <th className="table-header">Student ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Contact</th>
              </tr>
            </thead>
            <tbody>
              {students.map((value, index) => (
                <tr key={index}>
                  {searchIndexes.indexOf(index) == -1 ? (
                    <>
                      <td className="table-data w-fit">
                        <input
                          type="checkbox"
                          name={value.id}
                          className="rounded"
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const idx = data.selected.indexOf(
                              event.target.name,
                              0
                            )
                            const nSelected = data.selected
                            if (idx > -1) {
                              nSelected.splice(idx, 1)
                            } else {
                              nSelected.push(event.target.name)
                            }
                            setData({ selected: nSelected })
                          }}
                        />
                      </td>
                      <td className="table-data">{value.student_id}</td>
                      <td className="table-data">{value.name}</td>
                      <td className="table-data">{value.contact}</td>
                    </>
                  ) : (
                    <></>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div></div>
      </form>
    </Class>
  ) */
}

export default ClassAddStudent
