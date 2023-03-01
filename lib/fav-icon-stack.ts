import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs'

import { S3EventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'

const LAMBDA_CONCURRENCY = 8
const DEFAULT_BATCH_SIZE = 20

export class FavIconStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // parse file and push each url to sqs
    const s3_bucket = new s3.Bucket(this, 'fave-icons-bucket', {})
    
    const queue = new sqs.Queue(this, 'url_sns_queue',{
      visibilityTimeout: cdk.Duration.minutes(10)
    })

    const list_parser = new NodejsFunction(this, 'list_parser', {
      handler: 'lambdaHandler',
      entry: 'lambda/list-parser/index.ts',
      timeout: cdk.Duration.minutes(2),
      environment: {
        SQS_DESTINATION_URL: queue.queueUrl
      }
    })

    list_parser.addEventSource(
      new S3EventSource(s3_bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [
          {
            suffix: '.txt'
          }
        ]
      })
    )

    s3_bucket.grantRead(list_parser)
    queue.grantSendMessages(list_parser)



    // Stack-2
    const scrapper_lambda = new NodejsFunction(this, 'scrapper', {
      handler: 'lambdaHandler',
      entry: 'lambda/fav-icon-scrapper/index.ts',
      timeout: cdk.Duration.minutes(1),
      environment: {
        OUTPUT_BUCKET_NAME: s3_bucket.bucketName
      }
    })

    queue.grantConsumeMessages(scrapper_lambda) 
    
    scrapper_lambda.addEventSource(
      new SqsEventSource(queue, {
        batchSize: DEFAULT_BATCH_SIZE,
        maxConcurrency: LAMBDA_CONCURRENCY,
        maxBatchingWindow: cdk.Duration.minutes(2)
      })
    )

    s3_bucket.grantWrite(scrapper_lambda)
    
  }
}
