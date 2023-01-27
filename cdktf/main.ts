import { Construct } from "constructs";
import {App} from "cdktf";
import {AwsStack} from "./AwsStack";
import {ARestServiceStack} from "./ARestServiceStack";
import {S3Bucket} from "@cdktf/provider-aws/lib/s3-bucket";

// TODO tag all resources with APPD-ID see https://atc.bmwgroup.net/confluence/display/AWM/Guideline+-+Cloud+Computing#GuidelineCloudComputing-IAD.5AllPaaSandIaaSresourcesmustbetaggedappropriatelywithmetadatainformation.

// TODO externalize class into own file
class DocumentsStack extends AwsStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const documentsBucket = new S3Bucket(this, "bucket-docs");
    documentsBucket.bucket = this.getGloballyUniqueName("docs");
    documentsBucket.acl = "private"

  }
}

const app = new App();
new DocumentsStack(app, "idp");

new ARestServiceStack(app, "service-hello-world", {
  path: "../lambda-hello-world/dist",
  handler: "index.handler",
  runtime: "nodejs14.x",
  stageName: "hello-world",
  version: "v0.0.2"
});

new ARestServiceStack(app, "service-hello-name", {
  path: "../lambda-hello-name/dist",
  handler: "index.handler",
  runtime: "nodejs14.x",
  stageName: "hello-name",
  version: "v0.0.1"
});

new ARestServiceStack(app, "service-document", {
  path: "../idp-services/build/staging",
  handler: "idp-services.lambda_handlers.document_extract",
  runtime: "python3.9",
  stageName: "send-document",
  version: "v0.0.1"
});

app.synth();