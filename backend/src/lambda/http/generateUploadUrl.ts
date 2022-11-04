import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, generateUploadUrl, getTodoById } from '../../businessLogic/todos'
// import { getUserId } from '../utils'

// const mybucket = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const mybucket = process.env.ATTACHMENT_S3_BUCKET
    const todoItem = await getTodoById(todoId)
    todoItem.attachmentUrl = `http://${mybucket}.s3.amazonaws.com/${todoId}`
    await createAttachmentPresignedUrl(todoItem)

    const uploadUrl = await generateUploadUrl(todoId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
