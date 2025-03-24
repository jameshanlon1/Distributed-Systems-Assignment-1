import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../shared/util";
import { tasks, projects } from "../seed/tasks";
import * as apig from "aws-cdk-lib/aws-apigateway";


export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

// Tables
const tasksTable = new dynamodb.Table(this, "TasksTable", {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: "taskId", type: dynamodb.AttributeType.NUMBER }, // Using taskId as partition key
  removalPolicy: cdk.RemovalPolicy.DESTROY, // Ensures the table is destroyed when the stack is deleted
  tableName: "Tasks", // Set the table name to "Tasks"
});

const projectsTable = new dynamodb.Table(this, "ProjectsTable", {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: "projectId", type: dynamodb.AttributeType.NUMBER }, // Using projectId as partition key
  sortKey: { name: "projectName", type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY, // Ensures the table is destroyed when the stack is deleted
  tableName: "Projects", // Set the table name to "Projects"
});
    
        // Functions

        // Lambda function to get a Task by its ID
        const getTaskByIdFn = new lambdanode.NodejsFunction(this, "GetTaskByIdFn", {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_18_X,
          entry: `${__dirname}/../lambdas/getTaskById.ts`, // Path to your Lambda function code
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: tasksTable.tableName, // Use the Tasks table
            REGION: 'eu-west-1',
          },
        });


     // Lambda function to delete a Task by its ID
const deleteTaskFn = new lambdanode.NodejsFunction(this, "DeleteTaskFn", {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  entry: `${__dirname}/../lambdas/deleteTask.ts`, // Path to your Lambda function code
  timeout: cdk.Duration.seconds(10),
  memorySize: 128,
  environment: {
    TABLE_NAME: tasksTable.tableName, // Use the Tasks table
    REGION: 'eu-west-1',
  },
});


      
// Lambda function to get all Tasks
const getAllTasksFn = new lambdanode.NodejsFunction(this, "GetAllTasksFn", {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  entry: `${__dirname}/../lambdas/getAllTasks.ts`, // Path to your Lambda function code
  timeout: cdk.Duration.seconds(10),
  memorySize: 128,
  environment: {
    TABLE_NAME: tasksTable.tableName, // Use the Tasks table
    REGION: 'eu-west-1',
  },
});

        
new custom.AwsCustomResource(this, "tasksddbInitData", {
  onCreate: {
    service: "DynamoDB",
    action: "batchWriteItem",
    parameters: {
      RequestItems: {
        [tasksTable.tableName]: generateBatch(tasks),  // Added Tasks
        [projectsTable.tableName]: generateBatch(projects),  // Added Projects
      },
    },
    physicalResourceId: custom.PhysicalResourceId.of("tasksddbInitData"), // Ensures uniqueness during stack creation
  },
  policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
    resources: [tasksTable.tableArn, projectsTable.tableArn],  // Grants access to both tables
  }),
});

    
        
// Lambda function to add a new Task
const newTaskFn = new lambdanode.NodejsFunction(this, "AddTaskFn", {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,  
  entry: `${__dirname}/../lambdas/addTask.ts`, // Path to the Lambda function code
  timeout: cdk.Duration.seconds(10),
  memorySize: 128,
  environment: {
    TABLE_NAME: tasksTable.tableName, // Use the Tasks table
    REGION: 'eu-west-1',
  },
});

// Lambda function to update a new Task
const updateTaskFn = new lambdanode.NodejsFunction(this, "UpdateTaskFn", {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,  
  entry: `${__dirname}/../lambdas/updateTask.ts`, // Path to the Lambda function code
  timeout: cdk.Duration.seconds(10),
  memorySize: 128,
  environment: {
    TABLE_NAME: tasksTable.tableName, // Use the Tasks table
    REGION: 'eu-west-1',
  },
});


// Grant permissions for Task-related Lambda functions
tasksTable.grantReadData(getTaskByIdFn); 
tasksTable.grantReadData(getAllTasksFn);
tasksTable.grantReadWriteData(newTaskFn);  
tasksTable.grantReadWriteData(deleteTaskFn); 
tasksTable.grantReadWriteData(updateTaskFn);


        
        // REST API 
    const api = new apig.RestApi(this, "RestAPI-Assigment", {
      description: "Assignment api",
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

// 4. Create a usage plan and add the API key to it
const usagePlan = api.addUsagePlan("UsagePlan", {
  name: 'Usage Plan',
  apiStages: [
    {
      stage: api.deploymentStage,
    },
  ],
});

// Attach the API Key to the Usage Plan
usagePlan.addApiKey(apiKey);

// Tasks endpoint
const tasksEndpoint = api.root.addResource("tasks");



// Get all tasks
tasksEndpoint.addMethod(
  "GET",
  new apig.LambdaIntegration(getAllTasksFn, { proxy: true })
);

// Add a new task
tasksEndpoint.addMethod(
  "POST",
  new apig.LambdaIntegration(newTaskFn), { apiKeyRequired: true }
);




// Specific task endpoint by ID
const specificTaskEndpoint = tasksEndpoint.addResource("{taskId}");

// Get a specific task by ID
specificTaskEndpoint.addMethod(
  "GET",
  new apig.LambdaIntegration(getTaskByIdFn, { proxy: true })
);

// Delete a task by ID
specificTaskEndpoint.addMethod(
  "DELETE",
  new apig.LambdaIntegration(deleteTaskFn, { proxy: true })
);

// Update a task
specificTaskEndpoint.addMethod(
  "PUT",
  new apig.LambdaIntegration(updateTaskFn), { apiKeyRequired: true }
);
  
  }};
