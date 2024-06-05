import AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();
import { getUserId } from '../../auth/utils.mjs';

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  
  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId: userId,
      todoId: todoId
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    }
  };

  try {
    await docClient.delete(params).promise();
    return {
      statusCode: 200,
      body: ''
    };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Could not delete TODO item'})
    };
  }
};

