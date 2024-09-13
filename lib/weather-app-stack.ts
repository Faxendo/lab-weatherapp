import * as dotenv from 'dotenv';

import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

// Load env vars with dotenv lib

dotenv.config({
  path: `${__dirname}/../.env`
});

// Our WeatherApp CDK Stack 
export class WeatherAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB Table used to store (cached) weather data
    const weatherDB = new dynamodb.Table(this, 'WeatherDB', {
      partitionKey: { name: 'city', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Lambda function retrieving weather data from API
    const weatherAppFunction = new lambda.Function(this, 'WeatherAppFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: Duration.seconds(10),
      environment: {
        OWM_KEY: process.env.OWM_KEY || '',
        TABLE_NAME: weatherDB.tableName
      },
    });

    // Allow Lambda function to read/write data from/to DynamoDB
    weatherDB.grantReadWriteData(weatherAppFunction);

    // API Gateway proxy route to distribute lambda function
    const weatherAppApi = new apigateway.LambdaRestApi(this, 'WeatherAppApi', {
      handler: weatherAppFunction,
      restApiName: 'WeatherAppApi',

      // Enable CORS to allow our frontend to access API
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    // Output API Gateway URL to use in frontend
    new CfnOutput(this, 'ApiURL', {
      value: weatherAppApi.url
    });
  }
}
