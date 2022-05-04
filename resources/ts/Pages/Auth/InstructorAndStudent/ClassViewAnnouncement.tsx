import { FC, useState } from 'react'
import { TrashIcon, PencilAltIcon } from '@heroicons/react/solid'
import { saveAs } from 'file-saver'
import { Link, usePage } from '@inertiajs/inertia-react'
import moment from 'moment'
import s3Client, { S3PageProps, getFileURL } from '@/Lib/s3'
import Class from '@/Layouts/Class'
import { User } from '@/Layouts/Auth'
import ConfirmDialog from '@/Components/ConfirmDialog'
import { Inertia } from '@inertiajs/inertia'

type Props = {
  id: string
  announcement: {
    id: string
    text: string
    files: Array<string>
    created_at: string
  }
}

const ClassViewAnnouncement: FC<Props> = ({ id, announcement }) => {
  const { aws, user } = usePage().props
  const _aws = aws as S3PageProps
  const _user = user as User
  const client = s3Client(_aws)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <Class id={id} mode={3}>
      <div className="container-lg p-4 md:p-8">
        <div className="w-full md:w-7/12 mx-auto pb-32 md:pb-16">
          <p className="font-light text-lg w-fit mx-auto mb-4">Announcement</p>
          <div className="prose card mx-auto">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Posted:{' '}
                {moment(announcement.created_at.split('T')[0]).format(
                  'ddd DD MMMM, h:mm A'
                )}
              </div>
              <div className="flex gap-x-2">
                {_user.role == 'instructor' ? (
                  <>
                    <Link
                      href={`/class/${id}/announcement/edit/${announcement.id}`}
                      className="text-green-500"
                    >
                      <PencilAltIcon className="icon" />
                    </Link>
                    <button
                      className="text-red-500"
                      onClick={() => {
                        setIsDialogOpen(true)
                      }}
                    >
                      <TrashIcon className="icon" />
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="px-4">
              <div
                dangerouslySetInnerHTML={{ __html: announcement.text }}
              ></div>
              {announcement.files.length > 0 ? (
                <div>
                  <div>Attachments:</div>
                  <div className="px-4">
                    {announcement.files.map((value, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          saveAs(
                            getFileURL(client, _aws.bucket, value),
                            value.split('/')[4]
                          )
                        }}
                      >
                        {value.split('/')[4]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Delete announcement"
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => {
          Inertia.post(`/class/${id}/announcement/delete/${announcement.id}`)
        }}
      >
        Do you want to delete this announcement?
      </ConfirmDialog>
    </Class>
  )
}

export default ClassViewAnnouncement
