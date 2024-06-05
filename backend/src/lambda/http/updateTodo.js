import AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();
import { getUserId } from '../../auth/utils.mjs';

export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  const updatedTodo = JSON.parse(event.body);
  const userId = getUserId(event);
  
  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId: userId,
      todoId: todoId
    },
    UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    }

  }
  try {
    await docClient.update(params).promise();
    return {
      statusCode: 200,
      body: ''
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Could not update TODO item'})
    };
  }
};
