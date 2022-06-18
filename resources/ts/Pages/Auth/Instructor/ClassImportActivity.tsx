import { FC } from 'react'
import moment from 'moment'
import Auth from '@/Layouts/Auth'
import { Link, useForm } from '@inertiajs/inertia-react'
import {
  Card,
  Container,
  Group,
  Table,
  Button,
  Radio,
  RadioGroup,
} from '@mantine/core'

type Props = {
  id: string
  activities?: Array<{
    id: string
    title: string
    created_at: Date
  }>
}

const ClassImportActivity: FC<Props> = ({ id, activities }) => {
  const { data, setData, post, processing, errors } = useForm({
    activityID: '',
  })

  return (
    <Auth class_id={id}>
      <Container size="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            post(`/class/${id}/activity/import`)
          }}
        >
          <Card
            p="sm"
            withBorder
            sx={() => ({
              marginBottom: '1rem',
            })}
          >
            <Table striped>
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {activities?.map((value) => (
                  <tr key={value.id}>
                    <td>
                      <Radio
                        name="activity_id"
                        value={value.id}
                        onChange={(event) => {
                          setData({ ...data, activityID: event.target.value })
                        }}
                      />
                    </td>
                    <td>{value.title}</td>
                    <td>
                      {moment(value.created_at).format('ddd DD MMMM, h:mm A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Group position="right">
            <Button
              type="submit"
              sx={(theme) => ({
                marginTop: theme.spacing.md,
              })}
              loading={processing}
            >
              Import
            </Button>
          </Group>
        </form>
      </Container>
    </Auth>
  )
  /*  return (
    <Class id={id} mode={3}>
      <div className="container-lg p-4 md:p-8">
        <div className="w-full md:w-7/12 mx-auto pb-32 md:pb-16">
          <Table title="Import">
            <thead>
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Created At</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {activities ? (
                <>
                  {activities.map((value, index) => (
                    <tr>
                      <td className="table-data">{value.title}</td>
                      <td className="table-data">
                        {moment(value.created_at.split('T')[0]).format(
                          'ddd DD MMMM, h:mm A'
                        )}
                      </td>
                      <td className="table-data">
                        <Link href="#" className="btn-primary">
                          Use
                        </Link>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <></>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Class>
  ) */
}

export default ClassImportActivity
