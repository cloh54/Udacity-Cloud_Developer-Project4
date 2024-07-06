import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getSignedUrl
} from "@aws-sdk/s3-request-presigner";
import { getUserId } from '../../auth/utils.mjs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  const region = "us-east-1";

  const key = `${userId}/${todoId}.png`;
  console.log("key: ", key)
  console.log("Bucket: ", process.env.TODOS_S3_BUCKET)

  try {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: process.env.TODOS_S3_BUCKET, Key: key });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    console.log("generate url:", url)

    const updateComamnd = new UpdateCommand({
      TableName: process.env.TODOS_TABLE,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "SET #attachmentUrl = :attachmentUrl",
      ExpressionAttributeNames: {
        "#attachmentUrl": "attachmentUrl"
      },
      ExpressionAttributeValues: {
        ":attachmentUrl": url,
        ':userId': userId
      },
      ConditionExpression: 'userId = :userId'
    });

    await docClient.send(updateComamnd);
    console.log("updated todo item")

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: url
      })
    };
  } catch (error) {
    console.error('Error generating upload url:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not generate upload url'})
    };
  }
};

