import { FC, ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import TextInput from '@/Components/TextInput'
import RadioGroup from '@/Components/RadioGroup'
import CheckBox from '@/Components/CheckBox'
import Auth, { User } from '@/Layouts/Auth'

type Props = {
  id: string
  username: string
  role: string
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
        setData({ ...data, role: value })
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
      <div className="container-lg py-4">
        <div className="font-light text-lg w-fit mx-auto mb-4">Create User</div>
        <form
          className="card w-fit mx-auto"
          onSubmit={(event) => {
            event.preventDefault()
            post(`/user/edit/${id}`)
          }}
        >
          <TextInput
            label="Username"
            name="username"
            isFocused={true}
            value={data.username}
            onChange={handleInputChange}
            error={{ value: errors.username }}
          />
          <div className="label">User Type</div>
          <RadioGroup
            name="role"
            values={['admin', 'instructor', 'student']}
            className="w-fit mx-auto"
            value={data.role}
            onChange={handleInputChange}
            error={{ value: errors.role }}
          />
          <div className="flex justify-end">
            <CheckBox
              name="reset_password"
              label="Reset Password"
              value={data.reset_password ? 1 : 1}
              onChange={handleInputChange}
            />
          </div>
          <div className="px-4 mt-4">
            <button className="btn-primary w-full" disabled={processing}>
              Change
            </button>
          </div>
        </form>
      </div>
    </Auth>
  )
}

export default EditUser
