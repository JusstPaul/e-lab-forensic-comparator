import { ChangeEvent, FC, useState } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import { SearchIcon } from '@heroicons/react/solid'
import Table from '@/Components/Table'
import TextInput from '@/Components/TextInput'
import Class from '@/Layouts/Class'

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
  )
}

export default ClassAddStudent
