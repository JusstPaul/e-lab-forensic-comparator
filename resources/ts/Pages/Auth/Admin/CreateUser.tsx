import { FC, ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import TextInput from '@/Components/TextInput'
import RadioGroup from '@/Components/RadioGroup'
import Auth from '@/Layouts/Auth'

type Props = {}

const CreateUser: FC<Props> = ({}) => {
  const { data, setData, post, processing, errors } = useForm({
    username: '',
    type: 'admin',
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    switch (name) {
      case 'username':
        setData({ ...data, username: value })
        break
      case 'type':
        setData({ ...data, type: value })
        break
      default:
        console.error('Invalid input!')
    }
  }

  return (
    <Auth>
      <div className="container-lg py-4">
        <div className="font-light text-lg w-fit mx-auto mb-4">Create User</div>
        <form
          className="card w-fit mx-auto"
          onSubmit={(event) => {
            event.preventDefault()
            post('/user/create')
          }}
        >
          <TextInput
            label="Username"
            name="username"
            value={data.username}
            isFocused={true}
            error={{
              value: errors.username,
            }}
            onChange={handleInputChange}
          />
          <div className="label">User Type</div>
          <RadioGroup
            name="type"
            values={['admin', 'instructor', 'student']}
            className="w-fit mx-auto"
            onChange={handleInputChange}
          />
          <div className="px-4">
            <button className="btn-primary w-full" disabled={processing}>
              Create
            </button>
          </div>
        </form>
      </div>
    </Auth>
  )
}

export default CreateUser