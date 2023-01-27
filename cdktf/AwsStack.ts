import {S3Backend, TerraformStack} from "cdktf";
import {Construct} from "constructs";
import {AwsProvider} from "@cdktf/provider-aws/lib/provider";

const environment = "dev"
const region = "eu-west-1"
const prefix = `com-bmwgroup-aip-idp-${environment}-${region}`

export abstract class AwsStack extends TerraformStack {

    protected constructor(scope: Construct, id: string) {
        super(scope, id);

        new AwsProvider(this, "AWS", {
            region: region,
        });

        // TODO use dynamo db table for tf state locking
        new S3Backend(this, {
            bucket: `${prefix}-terraform-state`,
            key: "idp-dev",
            //dynamodbTable: "terraform-state-locks",
            region: region,
        });

    }

    protected getGloballyUniqueName(localName: string): string {
        return `${prefix}-${localName}`;
    }
}