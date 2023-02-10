
import { Context, S3CreateEvent, S3EventRecord } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk'

import * as readline from 'readline'

const s3 = new S3({
    region: process.env.AWS_REGION
});

const sqs = new SQS({
    region: process.env.AWS_REGION
})

export const lambdaHandler = async (event: S3CreateEvent, context: Context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    if(!process.env.SQS_DESTINATION_URL){
        throw new Error("SNS_DESTINATION is not set");
        
    }

    for (const record of event.Records) {
        await processRecord(record)
    }

};

// process each record ( one file ), get the file data as line by line
//  so we can avoid loading the entire file in to memory
const processRecord = async (record: S3EventRecord) => {
    const object_params = {
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key
    }

    console.log(object_params);

    const line_reader = readline.createInterface({
        input: s3.getObject(object_params).createReadStream(),
        terminal: false
    })

    try {
        await readLineStream(line_reader)
    }
    catch (err) {
        console.error(err);
    }

}


const readLineStream = async (line_reader: readline.Interface) => {
    return new Promise((resolve, reject) => {
        line_reader
            .on('line', pushToSQS)
            .on('close', resolve)
            .on('error', reject)
    })
}

const pushToSQS = async (line: string)=>{
    if(!line){
        return
    }
    
    const queue_url:string = process.env.SQS_DESTINATION_URL || ''

    await sqs.sendMessage({
        MessageBody: line,
        QueueUrl: queue_url
    }).promise()
}