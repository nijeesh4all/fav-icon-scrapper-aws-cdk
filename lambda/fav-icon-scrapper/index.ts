
import { Context, APIGatewayProxyResult, S3BatchEvent } from 'aws-lambda';

export const lambdaHandler = async (event: S3BatchEvent, context: Context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    
    

};