import uuidv4 from 'uuid';
import AWS from 'aws-sdk';
import { getUserId } from '../../auth/utils.mjs';

const docClient = new AWS.DynamoDB.DocumentClient();

export async function handler(event) {
  const newTodo = JSON.parse(event.body)
  const userId = getUserId(event);
  const todoId = uuidv4();
  
  const newItem = {
    userId: userId,
    todoId: todoId,
    name: newTodo.name,
    duDate: newTodo.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  }
  const params = {
    TableName: process.env.TODOS_TABLE,
    Item: newItem
  }

  try {
    await docClient.put(params).promise();
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newItem
      })
    };
  } catch (error) {
    console.error('Error creating TODO item:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Could not create TODO item'
      })
    };
  }
}

