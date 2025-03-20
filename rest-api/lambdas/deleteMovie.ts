import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => { 
  try {
    console.log("[EVENT]", JSON.stringify(event));
    
    // Get the movieId from path parameters
    const pathParameters = event?.pathParameters;
    const movieId = pathParameters?.movieId ? parseInt(pathParameters.movieId) : undefined;

    // Validate the movieId
    if (!movieId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing movie Id" }),
      };
    }

    // Delete the movie from DynamoDB by matching the primary key (id in this case)
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME!,  // Ensure the table name is correctly set in your environment variables
        Key: { id: movieId },  // Make sure the key matches the primary key in DynamoDB (here assuming it's 'id')
      })
    );

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: `Movie ${movieId} deleted successfully` }),
    };
  } catch (error: any) {
    console.error("[ERROR]", error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Failed to delete movie" }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  return DynamoDBDocumentClient.from(ddbClient);
}
