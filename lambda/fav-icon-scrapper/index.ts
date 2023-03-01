
import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { S3 } from 'aws-sdk'

import fetch from 'node-fetch'
import { ReadableStream } from 'stream/web';

const s3 = new S3({
    region: process.env.AWS_REGION
});

export const lambdaHandler = async (event: SQSEvent, context: Context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    for (const record of event.Records) {
        console.log(record)
        await processRecord(record)
    }

};

// process each record ( one file ), get the file data as line by line
//  so we can avoid loading the entire file in to memory
const processRecord = async (record: SQSRecord) => {
    const event_message = record.body

    if(!event_message){
        return
    }
    
    await processDownload(event_message)
}

// download favicon from given url and upload it to s3
const processDownload = async (web_url: string) => {
    if (!web_url) {
        return
    }

    const parsed_url = web_url.trim();

    const fav_icon_url = `http://${parsed_url}/favicon.ico`
    const s3_object_key = `icons/${parsed_url}.ico`

    console.log({ parsed_url, fav_icon_url, s3_object_key });


    let fetch_request;
    try {
        fetch_request = await fetch(fav_icon_url)
    } catch (err) {
        console.log(err);
        return
    }

    if (!fetch_request.ok) {
        console.error(`could not fetch logo for url ${parsed_url}`)
        return
    }


    try {
        await s3.upload({
            Bucket: process.env.OUTPUT_BUCKET_NAME || '' ,
            Key: s3_object_key,
            Body: fetch_request.body || ''
        }).promise()
    } catch (err) {
        console.error(err);
    }

    finally {
        console.log(`uploaded file to ${s3_object_key}`);
    }
}