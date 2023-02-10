
import { Context, S3CreateEvent, S3EventRecord } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk'

import { Transform } from 'stream'

const s3 = new S3({
    region: process.env.AWS_REGION
});

const sqs = new SQS({
    region: process.env.AWS_REGION
})

export const lambdaHandler = async (event: S3CreateEvent, context: Context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    if (!process.env.SQS_DESTINATION_URL) {
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

    const s3_object_stream = s3.getObject(object_params).createReadStream()

    const liner = new Transform({
        transform: async (chunk, encoding, callback) => {
            const lines = chunk.toString().split('\n');

            for (const line of lines) {
                await pushToSQS(line)
            }

            callback();
        }
    });


    try {
        // Wait for the liner stream to complete
        await new Promise((resolve, reject) => {
            s3_object_stream.pipe(liner).on('error', reject).on('finish', resolve);
        });
    }
    catch (err) {
        console.error(err);
    }

}

const pushToSQS = async (line: string) => {
    if (!line) {
        return
    }

    const queue_url: string = process.env.SQS_DESTINATION_URL || ''

    await sqs.sendMessage({
        MessageBody: line,
        QueueUrl: queue_url
    }).promise()
}