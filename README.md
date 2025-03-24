## Serverless REST Assignment - Distributed Systems.

__Name:__ James Hanlon

__Demo:__ ... link to your YouTube video demonstration ......

### Context.

For this web API, I have built a **Task Management API** that allows for managing tasks within a project. The API supports creating, retrieving, updating, and deleting tasks. The underlying database is DynamoDB, and the API uses serverless technologies, including AWS Lambda and API Gateway, to handle requests.

**Table item attributes for the `Task` table**:
- **taskId** - number (Partition key): The unique identifier for each task.
- **projectId** - number: The identifier of the project to which the task belongs.
- **title** - string: The title or name of the task.
- **description** - string: A detailed description of the task.
- **priority** - string (Enum: `high`, `medium`, `low`): The priority level of the task.
- **status** - string (Enum: `pending`, `in-progress`, `completed`): The current status of the task.
- **dueDate** - string: The due date of the task.
- **createdAt** - string: The timestamp when the task was created.

### App API endpoints.
The following endpoints have been implemented:

- **POST /task** - Adds a new task to the database. (Requires an API key for authentication).
- **GET /task/{taskId}** - Retrieves a specific task by `taskId`.
- **GET /task - Retrieves all tasks.
- **PUT /task/{taskId}** - Updates an existing task by `taskId`. This includes fields like `status`, `priority`, `dueDate`, etc. (Requires an API key for authentication).
- **Delete /task/{taskId}** - Deletes the task by task ID.



### Features.

#### Translation persistence (not completed)


#### Custom L2 Construct (not completed)


#### Multi-Stack app (not completed)


#### Lambda Layers (not completed)



#### API Keys. (if completed)

To secure the `POST` and `PUT` endpoints, API key authentication is used in the API Gateway. This ensures that only requests with the correct API key can interact with the endpoints. I use this website https://conermurphy.com/blog/build-rest-api-aws-cdk-api-gateway-lambda-dynamodb-api-key-authentication/ to help me understand how to setup rest API keys for endpoints. For this I use the apiKeyRequired to be true to ensure the endpoint had to use the API key. Below is the code implementation for setting up API keys and securing specific endpoints:

~~~ts
// REST API
const api = new apig.RestApi(this, "RestAPI-Assigment", {
  description: "Assignment API",
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowHeaders: ["Content-Type", "X-Amz-Date"],
    allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
    allowCredentials: true,
    allowOrigins: ["*"],
  },
});

// API Key (to secure POST and PUT)
const apiKey = api.addApiKey("ApiKey", {
  description: "API Key for protected endpoints",
});

// Create a usage plan and add the API key to it
const usagePlan = api.addUsagePlan("UsagePlan", {
  name: 'Usage Plan',
  apiStages: [
    {
      stage: api.deploymentStage,
    },
  ],
});

// Update a task - Secure this method with API Key
specificTaskEndpoint.addMethod(
  "PUT",
  new apig.LambdaIntegration(updateTaskFn), 
  { apiKeyRequired: true }
);

// Add a new task - Secure this method with API Key
tasksEndpoint.addMethod(
  "POST",
  new apig.LambdaIntegration(newTaskFn), 
  { apiKeyRequired: true }
);
~~~

