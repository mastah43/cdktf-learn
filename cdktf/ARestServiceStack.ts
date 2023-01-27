import { Construct } from "constructs";
import {TerraformAsset, AssetType, TerraformOutput} from "cdktf";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import {S3Object} from "@cdktf/provider-aws/lib/s3-object";
import {IamRole} from "@cdktf/provider-aws/lib/iam-role";
import {IamRolePolicyAttachment} from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import {LambdaFunction} from "@cdktf/provider-aws/lib/lambda-function";
import {Apigatewayv2Api} from "@cdktf/provider-aws/lib/apigatewayv2-api";
import {LambdaPermission} from "@cdktf/provider-aws/lib/lambda-permission";
import * as path from "path";
import {Pet} from "@cdktf/provider-random/lib/pet";
import {RandomProvider} from "@cdktf/provider-random/lib/provider";
import {AwsStack} from "./AwsStack";

interface LambdaFunctionConfig {
    path: string,
    handler: string,
    runtime: string,
    stageName: string,
    version: string,
}

const lambdaRolePolicy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}

// TODO change lambda stack to construct?
export class ARestServiceStack extends AwsStack {
    constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
        super(scope, name);

        new RandomProvider(this, "random");

        // TODO change random value go something shorter not using pet names
        // Create random value
        const pet = new Pet(this, "random-name", {
            length: 2,
        });

        // Create Lambda executable
        const asset = new TerraformAsset(this, "lambda-asset", {
            path: path.resolve(__dirname, config.path),
            type: AssetType.ARCHIVE, // if left empty it infers directory and file
        });

        // Create unique S3 bucket that hosts Lambda executable
        const bucket = new S3Bucket(this, "bucket", {
            bucketPrefix: `learn-cdktf-${name}`,
        });

        // Upload Lambda zip file to newly created S3 bucket
        const lambdaArchive = new S3Object(this, "lambda-archive", {
            bucket: bucket.bucket,
            key: `${config.version}/${asset.fileName}`,
            source: asset.path, // returns a posix path
        });

        // Create Lambda role
        const role = new IamRole(this, "lambda-exec", {
            name: `learn-cdktf-${name}-${pet.id}`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy)
        });

        // Add execution role for lambda to write to CloudWatch logs
        new IamRolePolicyAttachment(this, "lambda-managed-policy", {
            policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            role: role.name
        });

        const lambdaFunc = new LambdaFunction(this, "learn-cdktf-lambda", {
            functionName: `learn-cdktf-${name}-${pet.id}`,
            s3Bucket: bucket.bucket,
            s3Key: lambdaArchive.key,
            handler: config.handler,
            runtime: config.runtime,
            role: role.arn
        });

        const api = new Apigatewayv2Api(this, "api-gw", {
            name: name,
            protocolType: "HTTP",
            target: lambdaFunc.arn
        });

        new LambdaPermission(this, "apigw-lambda", {
            functionName: lambdaFunc.functionName,
            action: "lambda:InvokeFunction",
            principal: "apigateway.amazonaws.com",
            sourceArn: `${api.executionArn}/*/*`,
        });

        new TerraformOutput(this, "url", {
            value: api.apiEndpoint
        });
    }
}