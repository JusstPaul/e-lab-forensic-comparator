import AWS from 'aws-sdk'

export type S3PageProps = {
  default_region: string
  access_key_id: string
  secret_access_key: string
  bucket: string
}

const s3Client = ({
  default_region,
  access_key_id,
  secret_access_key,
  bucket,
}: S3PageProps) =>
  new AWS.S3({
    region: default_region,
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key,
    },
  })

export const getFileUrl = (client: AWS.S3, bucket: string, key: string) => {
  return client.getSignedUrl('getObject', { Bucket: bucket, Key: key })
}

export default s3Client
