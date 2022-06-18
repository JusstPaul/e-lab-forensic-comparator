import { FC, useEffect, useState } from 'react'
import { TrashIcon, PencilAltIcon } from '@heroicons/react/solid'
import { saveAs } from 'file-saver'
import { Link, useForm, usePage } from '@inertiajs/inertia-react'
import moment from 'moment'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Auth, { User } from '@/Layouts/Auth'
import { Inertia } from '@inertiajs/inertia'
import {
  Container,
  Tooltip,
  Box,
  Text,
  Paper,
  Group,
  Menu,
  Button,
} from '@mantine/core'
import { useModals } from '@mantine/modals'
import Editor from '@/Components/Editor'
import Error from '@/Components/Error'
import { FileIcon } from 'react-file-icon'

type Props = {
  id: string
  announcement: {
    id: string
    text: string
    files: Array<string>
    created_at: Date
  }
}

const ClassViewAnnouncement: FC<Props> = ({ id, announcement }) => {
  const { aws, user } = usePage().props
  const _aws = aws as S3PageProps
  const _user = user as User
  const client = s3Client(_aws)

  const [isEdit, setIsEdit] = useState(false)
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    setDateStr(moment(announcement.created_at).fromNow())

    const params = new URLSearchParams(window.location.search)
    const value = params.get('edit') === 'true'
    setIsEdit(value)
  }, [])

  const { data, setData, post, processing, errors } = useForm({
    text: announcement.text,
  })

  const modals = useModals()
  const openConfirmModal = () =>
    modals.openConfirmModal({
      title: 'Delete Announcement',
      children: <Text>Are you sure you want to delete announcement?</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onClose: () => {},
      onConfirm: () =>
        Inertia.post(`/class/${id}/announcement/delete/${announcement.id}`),
      confirmProps: {
        sx: (theme) => ({
          backgroundColor: theme.colors.red[6],
          ':hover': {
            backgroundColor: theme.colors.red[7],
          },
        }),
      },
    })

  return (
    <Auth class_id={id}>
      <Container size="sm">
        <Box py="lg">
          <Text size="xl" align="center">
            Announcement
          </Text>
          <Text size="xs" align="center">
            {dateStr}
          </Text>
        </Box>
        <Box py="sm">
          <Paper p="sm" withBorder>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Box
                style={{
                  width: '100%',
                }}
              >
                {!isEdit ? (
                  <Text>
                    <div
                      dangerouslySetInnerHTML={{ __html: announcement.text }}
                    ></div>
                  </Text>
                ) : (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      post(
                        `/class/${id}/announcement/edit/${announcement.id}`,
                        {
                          onSuccess: () => setIsEdit(false),
                        }
                      )
                    }}
                    style={{
                      width: '100%',
                    }}
                  >
                    <Editor
                      autoFocus={true}
                      name="text"
                      setContents={data.text}
                      onChange={(content) => setData({ text: content })}
                    />
                    <Group position="right" my="sm">
                      <Button
                        type="submit"
                        loading={processing}
                        className="sr-only"
                      >
                        Post
                      </Button>
                    </Group>
                  </form>
                )}

                {announcement.files.length > 0 ? (
                  <Group mt="md">
                    {announcement.files.map((value, index) => (
                      <UploadedFile
                        name={value.split('/')[4]}
                        url={getFileURL(client, _aws.bucket, value)}
                        key={index}
                      />
                    ))}
                  </Group>
                ) : (
                  <></>
                )}
              </Box>
              {_user.role == 'instructor' ? (
                <Menu withArrow>
                  <Menu.Item onClick={() => setIsEdit(!isEdit)}>Edit</Menu.Item>
                  <Menu.Item onClick={() => openConfirmModal()}>
                    Delete
                  </Menu.Item>
                </Menu>
              ) : (
                <></>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Auth>
  )
}

type UploadedFileProps = {
  url: string
  name: string
}
const UploadedFile: FC<UploadedFileProps> = ({ url, name }) => {
  const [file, setFile] = useState<File | undefined>()
  useEffect(() => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        let fileGet = new File([blob], name)
        setFile(fileGet)
      })
      .catch((e) => {
        console.error(e)
        alert('Error Fetching Uploaded File')
      })
  }, [])

  return (
    <Box
      style={{
        width: 48,
        margin: 16,
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => {
        saveAs(url, name)
      }}
    >
      <Tooltip label={name} withArrow>
        <FileIcon extension={name.split('.').pop()} />
      </Tooltip>
    </Box>
  )
}

export default ClassViewAnnouncement
