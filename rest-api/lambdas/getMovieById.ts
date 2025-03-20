import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const pathParameters = event?.pathParameters;
    const movieId = pathParameters?.movieId ? parseInt(pathParameters.movieId) : undefined;

    if (!movieId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing movie Id" }),
      };
    }

    // Check if 'cast=true' query parameter is present
    const includeCast = event?.queryStringParameters?.cast === "true";

    // Fetch movie metadata from DynamoDB
    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: movieId },
      })
    );
    console.log("GetCommand response: ", commandOutput);
    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Invalid movie Id" }),
      };
    }

    const responseBody: any = {
      data: commandOutput.Item,
    };

    // If 'cast=true' query parameter is present, fetch movie cast
    if (includeCast) {
      const cast = await fetchMovieCast(movieId);
      responseBody.data.cast = cast;
    }

    // Return response with movie details and optional cast
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(responseBody),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error: error.message || "Failed to fetch movie data" }),
    };
  }
};

// Function to fetch movie cast from the MovieCastTable
async function fetchMovieCast(movieId: number) {
  const commandOutput = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.CAST_TABLE_NAME,  // Make sure this environment variable is set
      Key: { movieId: movieId },
    })
  );

  return commandOutput.Item ? commandOutput.Item.cast : []; // Assuming 'cast' is an attribute in the MovieCastTable
}

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
