# Fav Icon Scraper using AWS CDK
This repository contains code for a serverless Fav Icon Scraper implemented using AWS CDK and TypeScript.

## Overview
This project consists of an AWS CDK stack that sets up an S3 bucket, an SQS queue, and two Lambda functions to scrape and download favicons from URLs.
The first Lambda function, `list_parser`, is triggered when a new `.txt` file is uploaded to the S3 bucket. It reads the file and creates SQS messages for each URL found in the file.
The second Lambda function, `scrapper`, is triggered by messages in the SQS queue created by list_parser. It scrapes the favicons from the URLs in the messages and saves them to the S3 bucket.

## Architecture
The architecture of the Fav Icon Scraper is as follows:

![Untitled (5)](https://user-images.githubusercontent.com/14291254/222208403-3ab94855-a35d-4b32-8553-b5160ca37661.jpg)


1. A text file containing a list of website URLs is uploaded to the Amazon S3 bucket.
2. The file upload triggers an S3 Put event, which invokes a Lambda function called list_parser.
3. The `list_parser` Lambda function reads the file from S3 and adds the URLs to an SQS queue named `url_sns_queue` 
4. The `url_sns_queue` triggers another Lambda function named `scrapper`.
5. The scrapper Lambda function takes the URL from the message, downloads the favicon, and saves it to the same S3 bucket in a separate directory.


## Prerequisites
Before you can deploy the Fav Icon Scraper, you will need:
- An AWS account
- [AWS CLI installed on your local machine](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS CDK](https://towardsthecloud.com/install-aws-cdk)
- Node.js version 12.x or higher installed on your local machine 

## Installation
To setup local dev env
``` bash
#Clone this repository to your local machine using 
git clone https://github.com/nijeesh4all/fav-icon-scrapper-aws-cdk.git.

#Navigate to the project directory using 
cd fav-icon-scrapper-aws-cdk

#Install the dependencies using 
npm install

#Configure your AWS credentials using the AWS CLI using 
aws configure.
```
## Deployment
Deploy the application to AWS by running `cdk deploy`.

## Usage
- Create a file containing a list of URLs, one URL per line.
- Upload the file to the S3 bucket created during the deployment.
- Wait for a few minutes for the Lambda functions to download the favicon images from the URLs and save them to the S3 bucket.
- Check the icons directory in the S3 bucket to find the downloaded images.

## Clean up
Run `cdk destroy` to remove the AWS CDK stack and all associated resources.
