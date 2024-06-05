import AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();
import { getUserId } from '../../auth/utils.mjs';

export async function handler(event) {
  // TODO: Get all TODO items for a current user
  const userId = getUserId(event);
  const params = {
    TableName: process.env.TODOS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  try {
    const result = await docClient.query(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: result.Items})
    };
  } catch (error) {
    console.error('Error fetching TODOs:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Could not fetch TODOs' })
    };
  }
};

