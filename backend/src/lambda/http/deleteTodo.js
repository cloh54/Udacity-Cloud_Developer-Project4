import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getUserId } from '../../auth/utils.mjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  try {
    const command = new DeleteCommand({
      TableName: process.env.TODOS_TABLE,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    });
    await docClient.send(command);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({error: 'Could not delete TODO item'})
    };
  }
};

