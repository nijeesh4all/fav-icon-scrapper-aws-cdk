# Fav Icon Scraper using AWS CDK
This repository contains code for a serverless Fav Icon Scraper implemented using AWS CDK and TypeScript.

## Overview
The Fav Icon Scraper is a serverless stack that extracts favicon URLs from a list of websites and saves them to an S3 bucket. It uses AWS Lambda, Amazon S3, and Amazon SQS as part of the stack. 

The extire stack is built using The AWS Cloud Development Kit (CDK) on typescript

## Architecture
The architecture of the Fav Icon Scraper is as follows:

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
