## Setup terraform remote state AWS resources
Currently, the AWS infrastructure for the TerraForm remote is setup manually:

1. Create S3 bucket:
   - name: com-bmwgroup-aip-idp-dev-eu-west-1-terraform-state
   - ACLs disabled
   - Block all public access
   - versioning: enabled
   - bucket policy:
```
     {
         "Version": "2012-10-17",
         "Statement": [
            {
             "Effect": "Allow",
             "Action": "s3:ListBucket",
             "Resource": "arn:aws:s3:::com-bmwgroup-aip-idp-dev-eu-west-1-terraform-state",
             "Principal": "*"
           },
           {
              "Effect": "Allow",
              "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
              "Resource": "arn:aws:s3:::com-bmwgroup-aip-idp-dev-eu-west-1-terraform-state/idp-dev",
              "Principal": "*"
            }
         ]
     }
```

2. Create dynamo db table: