import AWS from 'aws-sdk';
import { getUserId } from '../../auth/utils.mjs';
const s3 = new AWS.s3()

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  const key = `${userId}/${todoId}.png`;
  const params = {
    Bucket: process.env.TODOS_S3_BUCKET,
    Key: key,
    Expires: 1000
  };

  try {
    const url = await s3.getSignedUrl('putObject', params);
    return {
      statusCode: 200,
       body: JSON.stringify({
        uploadUrl: url
       })
    };
  } catch (error) {
    console.error('Error generating upload url:', error);
    return {
      statucCode: 500,
      body: JSON.stringify({ error: 'Could not generate upload url'})
    };
  }
};

