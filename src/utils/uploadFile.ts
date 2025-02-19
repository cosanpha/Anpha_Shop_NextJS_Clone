import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

async function uploadFile(file: any, ratio: string = '16:9') {
  let size: any = { width: 1920, height: 1080, fit: 'cover' }
  if (ratio === '1:1') {
    size.width = 480
    size.height = 480
  } else if (ratio === '9:16') {
    size.width = 1920
    size.height = 1080
  } else if (ratio === '4:3') {
    size.width = 480
    size.height = 640
  } else if (ratio === '3:4') {
    size.width = 640
    size.height = 480
  }

  try {
    // Resize
    const buffer: any = Buffer.from(await file.arrayBuffer())
    const resizedBuffer = await sharp(buffer).resize(size).toBuffer()

    const fileUploaded: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        })
        .end(resizedBuffer)
    })

    return fileUploaded.url
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function deleteFile(url: string) {
  try {
    if (url.startsWith('http')) {
      url = url.split('/').pop() || ''
      const publicId = url.split('.')[0]

      const { result } = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      })
      return result === 'ok'
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export { uploadFile, deleteFile }
