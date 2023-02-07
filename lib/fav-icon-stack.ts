import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class FavIconStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const scrapper_lambda = new lambda.Function(this, 'scrapper_lambda', {
      code: lambda.Code.fromAsset('./lambda/fav-icon-scrapper'),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.lambdaHandler'
    })

  }
}
