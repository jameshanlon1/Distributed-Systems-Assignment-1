import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => { 
  try {
    console.log("[EVENT]", JSON.stringify(event));
    
    // Get the taskId from path parameters
    const pathParameters = event?.pathParameters;
    const taskId = pathParameters?.taskId ? parseInt(pathParameters.taskId) : undefined;

    // Validate the taskId
    if (!taskId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing task Id" }),
      };
    }

    // Delete the task from DynamoDB by matching the primary key (id in this case)
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME!,  
        Key: { taskId: taskId },  
      })
    );

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: `task ${taskId} deleted successfully` }),
    };
  } catch (error: any) {
    console.error("[ERROR]", error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Failed to delete task" }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  return DynamoDBDocumentClient.from(ddbClient);
}
