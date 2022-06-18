import { FC, ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import Auth, { User } from '@/Layouts/Auth'
import { Container, Paper, Button, Checkbox } from '@mantine/core'
import Input from '@/Components/Input'
import Selection from '@/Components/Selection'

type Props = {
  id: string
  username: string
  role: 'admin' | 'instructor' | 'student'
}

const EditUser: FC<Props> = ({ id, username, role }) => {
  const { data, setData, post, processing, errors } = useForm({
    username: username,
    role: role,
    reset_password: false,
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target
    switch (name) {
      case 'username':
        setData({ ...data, username: value })
        break
      case 'role':
        setData({ ...data, role: value as any })
        break
      case 'reset_password':
        setData({ ...data, reset_password: checked })
        break
      default:
        console.error('Invalid input!')
    }
  }

  return (
    <Auth title="Admin Edit User">
      <Container size="xs">
        <Paper shadow="xs" p="md" withBorder>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              post(`/user/edit/${id}`)
            }}
          >
            <Input
              textProps={{
                label: 'Username',
                name: 'username',
                autoFocus: true,
                value: data.username,
                onChange: handleInputChange,
              }}
              error={{ value: errors.username }}
            />
            <Selection
              selectProps={{
                label: 'Role',
                name: 'reser_password',
                data: [
                  { value: 'admin', label: 'Admin' },
                  { value: 'instructor', label: 'Instructor' },
                  { value: 'student', label: 'Student' },
                ],
                value: data.role,
                searchable: true,
                nothingFound: 'Invalid role',
                onChange: (value) => {
                  setData({ ...data, role: value as any })
                },
              }}
            />
            <Checkbox
              value={data.reset_password ? 1 : 0}
              label="Reset password"
              name="reset_password"
              onChange={handleInputChange}
              style={{
                width: 'fit-content',
                marginLeft: 'auto',
                marginBottom: '1rem',
              }}
            />
            <Button type="submit" fullWidth loading={processing}>
              Change
            </Button>
          </form>
        </Paper>
      </Container>
    </Auth>
  )
}

export default EditUser
