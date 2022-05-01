import { ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import TextInput from '@/Components/TextInput'
import CheckBox from '@/Components/CheckBox'
import Guest from '@/Layouts/Guest'

const Login = () => {
  const { data, setData, post, processing, errors } = useForm({
    username: '',
    password: '',
    remember: 0,
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target
    switch (name) {
      case 'username':
        setData({ ...data, username: value })
        break
      case 'password':
        setData({ ...data, password: value })
        break
      case 'remember':
        setData({ ...data, remember: checked ? 1 : 0 })
        break
      default:
        console.error('Invalid input name!')
    }
  }

  return (
    <Guest title="Login">
      <div className="container-lg py-4">
        <p className="font-light text-lg w-fit mx-auto mb-4">
          e-Lab Forensic Ballistics Login
        </p>
        <form
          className="card w-fit mx-auto"
          onSubmit={(event) => {
            event.preventDefault()
            post('/login')
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
          <TextInput
            label="Password"
            name="password"
            type="password"
            value={data.password}
            error={{
              value: errors.username,
              message: 'Invalid password.',
            }}
            onChange={handleInputChange}
          />
          <div className="flex justify-end">
            <CheckBox
              label="Remember Me"
              name="remember"
              value={data.remember}
              onChange={handleInputChange}
            />
          </div>
          <div className="px-4">
            <button className="btn-primary w-full" disabled={processing}>
              Login
            </button>
          </div>
        </form>
      </div>
    </Guest>
  )
}

export default Login
