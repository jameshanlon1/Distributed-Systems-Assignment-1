import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    const pathParameters = event?.pathParameters;
    const taskIdStr = pathParameters?.taskId;
    const taskId = taskIdStr ? Number(taskIdStr) : NaN;

    if (Number.isNaN(taskId)) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Invalid taskId format. Must be a number." }),
      };
    }

    // Check if 'cast=true' query parameter is present
    const includeCast = event?.queryStringParameters?.cast === "true";

    // Fetch task metadata from DynamoDB
    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { taskId: taskId }, 
      })
    );

    console.log("GetCommand response: ", commandOutput);

    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Task not found" }),
      };
    }

    const responseBody: any = { data: commandOutput.Item };

    // If 'cast=true' query parameter is present, fetch task cast
    if (includeCast) {
      responseBody.data.cast = await fetchTaskCast(taskId);
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(responseBody),
    };
  } catch (error: any) {
    console.error("Error fetching task:", error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Failed to fetch task data" }),
    };
  }
};

// Function to fetch task cast from the taskCastTable
async function fetchTaskCast(taskId: number) {
  const commandOutput = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.CAST_TABLE_NAME,  
      Key: { taskId: taskId }, 
    })
  );
  return commandOutput.Item ? commandOutput.Item.cast : [];
}

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  return DynamoDBDocumentClient.from(ddbClient);
}
