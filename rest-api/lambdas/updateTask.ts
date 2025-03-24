import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["Task"] || {});

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const body = event.body ? JSON.parse(event.body) : undefined;

    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body is missing" }),
      };
    }

    if (!isValidBodyParams(body)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Incorrect type. Must match the Task schema",
          schema: schema.definitions["Task"],
        }),
      };
    }

    const taskId = body.taskId; // taskId is used as the partition key
    const updateExpression = "SET #title = :title, #description = :description, #priority = :priority, #status = :status, #projectId = :projectId, #dueDate = :dueDate";
    const expressionAttributeNames = {
      "#title": "title",
      "#description": "description",
      "#priority": "priority",
      "#status": "status",
      "#projectId": "projectId",
      "#dueDate": "dueDate"
    };
    const expressionAttributeValues = {
      ":title": body.title,
      ":description": body.description,
      ":priority": body.priority,
      ":status": body.status,
      ":projectId": body.projectId,
      ":dueDate": body.dueDate || null 
    };

    const commandOutput = await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { taskId }, // taskId must be the key
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW" 
      })
    );

    if (!commandOutput.Attributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Task not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task updated successfully", updatedTask: commandOutput.Attributes }),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to update task" }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
