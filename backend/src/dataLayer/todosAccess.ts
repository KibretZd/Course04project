import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodosAccess{
    constructor (
        private readonly docClient:DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexTable = process.env.TODOS_CREATED_AT_INDEX) {

    }
    
    async getTodosForUser(userId: string): Promise<TodoItem []>{

        // console.log("Getting all todo items for user")
        logger.info("Reading all todos for the user", userId)
        const getTodoForUserQuery = {
            TableName: this.todosTable,
            //IndexName: this.indexTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }

        const resultSet = await this.docClient.query(getTodoForUserQuery).promise()
    
        if(resultSet.Count !== 0 ){
            return resultSet.Items as TodoItem[]
        }
            
        return null
    }
    
    
    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string) {

        logger.info("Updating a todo Item for todoId", todoId)

        const updateTodoQuery = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues:{
                "name": todoUpdate["name"],
                "dueDate" : todoUpdate["dueDate"],
                "done" : todoUpdate["done"]
            },
            // ReturnValues: "ALL_NEW"
        }
        
        logger.info("Todo Item has been updated")
        await this.docClient.update(updateTodoQuery).promise()
    }
    
    
    async createTodo(todoItem: TodoItem) :Promise<TodoItem>{

        logger.info("Creating a todo Item")

        const createTodoQuery = {
            TableName: this.todosTable,
            Item: todoItem
        }

        await this.docClient.put(createTodoQuery).promise()
    
        logger.info("Todo item has been created")
        return todoItem
    }
    
    
    async getTodoById(todoId:string) :Promise<TodoItem>{ 

        logger.info("Getting a todo Item by todoId")

        const getTodoIdQuery = {
            TableName: this.todosTable,
            IndexName: this.indexTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId':todoId
            }
        }
    
        const resultSet = await this.docClient.query(getTodoIdQuery).promise()

        if (resultSet.Count !== 0)
            return resultSet.Items[0] as TodoItem
        return null
    }
    
    async deleteTodo(userId: string, todoId: string) {

        logger.info("Delete a Todo Item for todoId", todoId)

        const deleteTodoQuery = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        }
        await this.docClient.delete(deleteTodoQuery).promise()
        logger.info("Todo item with id of ", todoId, " has been deleted")
    }
}

function createDynamoDBClient() {

    if (process.env.IS_OFFLINE) {

      console.log('Creating a local DynamoDB instance')

      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }

    return new XAWS.DynamoDB.DocumentClient()
}