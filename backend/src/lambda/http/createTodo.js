import {v4 as uuidv4} from 'uuid';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getUserId } from '../../auth/utils.mjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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


  try {
    const command = new PutCommand({
      TableName: process.env.TODOS_TABLE,
      Item: newItem
    })
    await docClient.send(command);
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

