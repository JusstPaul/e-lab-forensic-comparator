import { ChangeEvent } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import Guest from '@/Layouts/Guest'
import {
  Button,
  Center,
  Checkbox,
  Container,
  Image,
  LoadingOverlay,
  Paper,
  Text,
} from '@mantine/core'
import Input from '@/Components/Input'

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
      <Container size="md">
        <Center>
          <div>
            <Image
              style={{
                width: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '1rem',
              }}
              src="/storage/assets/dccp-logo.png"
            />
            <Text
              size="lg"
              weight="300"
              sx={(theme) => ({
                marginBottom: '1rem',
                textAlign: 'center',
                color: theme.colors.gray[9],
              })}
            >
              e-Lab Forensic Ballistics Login
            </Text>

            <Paper p="sm" withBorder>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  post('/login')
                }}
              >
                <Input
                  textProps={{
                    label: 'Username',
                    placeholder: 'username',
                    name: 'username',
                    value: data.username,
                    onChange: handleInputChange,
                    autoFocus: true,
                  }}
                  error={{
                    value: errors.username,
                  }}
                />
                <Input
                  textProps={{
                    label: 'Password',
                    placeholder: 'password',
                    name: 'password',
                    type: 'password',
                    value: data.password,
                    onChange: handleInputChange,
                  }}
                  error={{
                    value: errors.username,
                    message: 'Invalid password.',
                  }}
                />
                <Checkbox
                  value={data.remember}
                  label="Remember me"
                  onChange={handleInputChange}
                  style={{
                    width: 'fit-content',
                    marginLeft: 'auto',
                    marginBottom: '1rem',
                  }}
                />

                <Button type="submit" loading={processing} fullWidth>
                  Login
                </Button>
              </form>
            </Paper>
          </div>
        </Center>
      </Container>
    </Guest>
  )

  /*  return (
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
  ) */
}

export default Login
