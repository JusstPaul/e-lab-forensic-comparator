import { ChangeEvent } from 'react'
import Auth from '@/Layouts/Auth'
import { useForm } from '@inertiajs/inertia-react'
import { Container, Paper, Button } from '@mantine/core'
import Input from '@/Components/Input'

const PasswordChange = () => {
  const { data, setData, post, processing, errors } = useForm({
    password_current: '',
    password_new: '',
    password_new_confirmation: '',
  })

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target
    switch (name) {
      case 'password_current':
        setData({ ...data, password_current: value })
        break

      case 'password_new':
        setData({ ...data, password_new: value })
        break

      case 'password_new_confirmation':
        setData({ ...data, password_new_confirmation: value })
        break
    }
  }

  return (
    <Auth title="Admin Password Change">
      <Container size="xs">
        <Paper shadow="xs" p="md" withBorder>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              post('/password/change')
            }}
          >
            <Input
              textProps={{
                label: 'Current Password',
                name: 'password_current',
                type: 'password',
                autoFocus: true,
                value: data.password_current,
                onChange: handleInputChange,
              }}
              error={{
                value: errors.password_current,
                message: 'Current Password is not valid',
              }}
            />
            <Input
              textProps={{
                label: 'New Password',
                name: 'password_new',
                type: 'password',
                value: data.password_new,
                onChange: handleInputChange,
              }}
              error={{
                value: errors.password_current,
                message: 'Current Password is not valid',
              }}
            />
            <Input
              textProps={{
                label: 'Confirm New Password',
                name: 'password_new_confirmation',
                type: 'password',
                value: data.password_new_confirmation,
                onChange: handleInputChange,
              }}
              error={{
                value: errors.password_current,
                message: 'Current Password is not valid',
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

export default PasswordChange
