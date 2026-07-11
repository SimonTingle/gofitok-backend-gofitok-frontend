import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

const endpoint = process.env.S3_ENDPOINT
const region = process.env.S3_REGION ?? 'us-east-1'
const accessKeyId = process.env.S3_ACCESS_KEY
const secretAccessKey = process.env.S3_SECRET_KEY
const bucket = process.env.S3_BUCKET
const publicUrl = process.env.S3_PUBLIC_URL

if (!endpoint) throw new Error('Missing environment variable: S3_ENDPOINT')
if (!accessKeyId) throw new Error('Missing environment variable: S3_ACCESS_KEY')
if (!secretAccessKey) throw new Error('Missing environment variable: S3_SECRET_KEY')
if (!bucket) throw new Error('Missing environment variable: S3_BUCKET')
if (!publicUrl) throw new Error('Missing environment variable: S3_PUBLIC_URL')

// `forcePathStyle` makes URLs look like http://host/bucket/key, which MinIO
// (and most self-hosted S3) serve directly. Virtual-host style needs DNS setup.
const s3 = new S3Client({
	endpoint,
	region,
	forcePathStyle: true,
	credentials: { accessKeyId, secretAccessKey },
})

/**
 * Uploads a WHATWG File/Blob (as provided by GraphQL Yoga's File scalar) to the
 * object store and returns its public URL. Mirrors Supabase's behaviour of
 * generating a directly-usable URL for a public bucket.
 */
export async function uploadFile(file: File): Promise<string> {
	const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
	const key = `${randomUUID()}${extension}`
	const body = Buffer.from(await file.arrayBuffer())

	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: file.type || 'application/octet-stream',
		}),
	)

	return `${publicUrl!.replace(/\/$/, '')}/${key}`
}
