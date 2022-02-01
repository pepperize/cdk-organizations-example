"use strict";
/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("@aws-cdk/assert");
const organization_trail_1 = require("../lib/organization-trail");
const aws_cdk_lib_1 = require("aws-cdk-lib");
test("OrganizationTrail creation", () => {
    const stack = new aws_cdk_lib_1.Stack();
    new organization_trail_1.OrganizationTrail(stack, "OrganizationTrail", { OrganizationId: 'o-111111' });
    assert_1.expect(stack).to(assert_1.haveResource("AWS::S3::Bucket", {
        PublicAccessBlockConfiguration: {
            "BlockPublicAcls": true,
            "BlockPublicPolicy": true,
            "IgnorePublicAcls": true,
            "RestrictPublicBuckets": true
        }
    }));
    assert_1.expect(stack).to(assert_1.haveResource("AWS::S3::BucketPolicy", {
        Bucket: {
            "Ref": "OrganizationTrailOrganizationTrailBucket31446F20"
        },
        PolicyDocument: {
            "Statement": [
                {
                    "Action": "s3:GetBucketAcl",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "cloudtrail.amazonaws.com"
                    },
                    "Resource": {
                        "Fn::GetAtt": [
                            "OrganizationTrailOrganizationTrailBucket31446F20",
                            "Arn"
                        ]
                    }
                },
                {
                    "Action": "s3:PutObject",
                    "Condition": {
                        "StringEquals": {
                            "s3:x-amz-acl": "bucket-owner-full-control"
                        }
                    },
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "cloudtrail.amazonaws.com"
                    },
                    "Resource": {
                        "Fn::Join": [
                            "",
                            [
                                {
                                    "Fn::GetAtt": [
                                        "OrganizationTrailOrganizationTrailBucket31446F20",
                                        "Arn"
                                    ]
                                },
                                "/AWSLogs/o-111111/*"
                            ]
                        ]
                    }
                },
                {
                    "Action": "s3:PutObject",
                    "Condition": {
                        "StringEquals": {
                            "s3:x-amz-acl": "bucket-owner-full-control"
                        }
                    },
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "cloudtrail.amazonaws.com"
                    },
                    "Resource": {
                        "Fn::Join": [
                            "",
                            [
                                {
                                    "Fn::GetAtt": [
                                        "OrganizationTrailOrganizationTrailBucket31446F20",
                                        "Arn"
                                    ]
                                },
                                "/AWSLogs/",
                                {
                                    "Ref": "AWS::AccountId"
                                },
                                "/*"
                            ]
                        ]
                    }
                }
            ],
            "Version": "2012-10-17"
        }
    }));
    assert_1.expect(stack).to(assert_1.haveResource("Custom::AWS", {
        Create: JSON.stringify({
            "service": "Organizations",
            "action": "enableAWSServiceAccess",
            "physicalResourceId": {
                "id": "EnableAWSServiceAccess"
            },
            "region": "us-east-1",
            "parameters": {
                "ServicePrincipal": "cloudtrail.amazonaws.com"
            }
        }),
        Delete: JSON.stringify({
            "service": "Organizations",
            "action": "disableAWSServiceAccess",
            "region": "us-east-1",
            "parameters": {
                "ServicePrincipal": "cloudtrail.amazonaws.com"
            }
        })
    }));
    assert_1.expect(stack).to(assert_1.haveResource("Custom::AWS", {
        Create: {
            "Fn::Join": [
                "",
                [
                    "{\"service\":\"CloudTrail\",\"action\":\"createTrail\",\"physicalResourceId\":{\"id\":\"OrganizationTrailCreate\"},\"parameters\":{\"IsMultiRegionTrail\":true,\"IsOrganizationTrail\":true,\"Name\":\"OrganizationTrail\",\"S3BucketName\":\"",
                    {
                        "Ref": "OrganizationTrailOrganizationTrailBucket31446F20"
                    },
                    "\"}}"
                ]
            ]
        },
        Delete: JSON.stringify({
            "service": "CloudTrail",
            "action": "deleteTrail",
            "parameters": {
                "Name": "OrganizationTrail"
            }
        })
    }));
    assert_1.expect(stack).to(assert_1.haveResource("Custom::AWS", {
        Create: "{\"service\":\"CloudTrail\",\"action\":\"startLogging\",\"physicalResourceId\":{\"id\":\"OrganizationTrailStartLogging\"},\"parameters\":{\"Name\":\"OrganizationTrail\"}}",
        Delete: "{\"service\":\"CloudTrail\",\"action\":\"stopLogging\",\"physicalResourceId\":{\"id\":\"OrganizationTrailStartLogging\"},\"parameters\":{\"Name\":\"OrganizationTrail\"}}"
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnYW5pemF0aW9uYWwtdHJhaWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9yZ2FuaXphdGlvbmFsLXRyYWlsLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7OztFQWNFOztBQUVGLDRDQUFvRTtBQUNwRSxrRUFBOEQ7QUFDOUQsNkNBQW9DO0FBRXBDLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7SUFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxtQkFBSyxFQUFFLENBQUM7SUFDMUIsSUFBSSxzQ0FBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsRUFBQyxjQUFjLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztJQUVoRixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLGlCQUFpQixFQUFFO1FBQzVCLDhCQUE4QixFQUFFO1lBQzlCLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLHVCQUF1QixFQUFFLElBQUk7U0FDOUI7S0FFSixDQUFDLENBQ0gsQ0FBQztJQUVGLGVBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQ2pCLHFCQUFZLENBQUMsdUJBQXVCLEVBQUU7UUFDbEMsTUFBTSxFQUFFO1lBQ0osS0FBSyxFQUFFLGtEQUFrRDtTQUMxRDtRQUNELGNBQWMsRUFBRTtZQUNkLFdBQVcsRUFBRTtnQkFDWDtvQkFDRSxRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixRQUFRLEVBQUUsT0FBTztvQkFDakIsV0FBVyxFQUFFO3dCQUNYLFNBQVMsRUFBRSwwQkFBMEI7cUJBQ3RDO29CQUNELFVBQVUsRUFBRTt3QkFDVixZQUFZLEVBQUU7NEJBQ1osa0RBQWtEOzRCQUNsRCxLQUFLO3lCQUNOO3FCQUNGO2lCQUNGO2dCQUNEO29CQUNFLFFBQVEsRUFBRSxjQUFjO29CQUN4QixXQUFXLEVBQUU7d0JBQ1gsY0FBYyxFQUFFOzRCQUNkLGNBQWMsRUFBRSwyQkFBMkI7eUJBQzVDO3FCQUNGO29CQUNELFFBQVEsRUFBRSxPQUFPO29CQUNqQixXQUFXLEVBQUU7d0JBQ1gsU0FBUyxFQUFFLDBCQUEwQjtxQkFDdEM7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLFVBQVUsRUFBRTs0QkFDVixFQUFFOzRCQUNGO2dDQUNFO29DQUNFLFlBQVksRUFBRTt3Q0FDWixrREFBa0Q7d0NBQ2xELEtBQUs7cUNBQ047aUNBQ0Y7Z0NBQ0QscUJBQXFCOzZCQUN0Qjt5QkFDRjtxQkFDRjtpQkFDRjtnQkFDRDtvQkFDRSxRQUFRLEVBQUUsY0FBYztvQkFDeEIsV0FBVyxFQUFFO3dCQUNYLGNBQWMsRUFBRTs0QkFDZCxjQUFjLEVBQUUsMkJBQTJCO3lCQUM1QztxQkFDRjtvQkFDRCxRQUFRLEVBQUUsT0FBTztvQkFDakIsV0FBVyxFQUFFO3dCQUNYLFNBQVMsRUFBRSwwQkFBMEI7cUJBQ3RDO29CQUNELFVBQVUsRUFBRTt3QkFDVixVQUFVLEVBQUU7NEJBQ1YsRUFBRTs0QkFDRjtnQ0FDRTtvQ0FDRSxZQUFZLEVBQUU7d0NBQ1osa0RBQWtEO3dDQUNsRCxLQUFLO3FDQUNOO2lDQUNGO2dDQUNELFdBQVc7Z0NBQ1g7b0NBQ0UsS0FBSyxFQUFFLGdCQUFnQjtpQ0FDeEI7Z0NBQ0QsSUFBSTs2QkFDTDt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1lBQ0QsU0FBUyxFQUFFLFlBQVk7U0FDeEI7S0FFTixDQUFDLENBQ0gsQ0FBQztJQUVGLGVBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQ2pCLHFCQUFZLENBQUMsYUFBYSxFQUFFO1FBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ25CLFNBQVMsRUFBRSxlQUFlO1lBQzFCLFFBQVEsRUFBRSx3QkFBd0I7WUFDbEMsb0JBQW9CLEVBQUU7Z0JBQ3BCLElBQUksRUFBRSx3QkFBd0I7YUFDL0I7WUFDRCxRQUFRLEVBQUUsV0FBVztZQUNyQixZQUFZLEVBQUU7Z0JBQ1osa0JBQWtCLEVBQUUsMEJBQTBCO2FBQy9DO1NBQ0YsQ0FBQztRQUNGLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3JCLFNBQVMsRUFBRSxlQUFlO1lBQzFCLFFBQVEsRUFBRSx5QkFBeUI7WUFDbkMsUUFBUSxFQUFFLFdBQVc7WUFDckIsWUFBWSxFQUFFO2dCQUNaLGtCQUFrQixFQUFFLDBCQUEwQjthQUMvQztTQUNGLENBQUM7S0FDUCxDQUFDLENBQ0gsQ0FBQztJQUVGLGVBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQ2pCLHFCQUFZLENBQUMsYUFBYSxFQUFFO1FBQ3hCLE1BQU0sRUFBRztZQUNQLFVBQVUsRUFBRTtnQkFDVixFQUFFO2dCQUNGO29CQUNFLGdQQUFnUDtvQkFDaFA7d0JBQ0UsS0FBSyxFQUFFLGtEQUFrRDtxQkFDMUQ7b0JBQ0QsTUFBTTtpQkFDUDthQUNGO1NBQ0Y7UUFDQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNyQixTQUFTLEVBQUUsWUFBWTtZQUN2QixRQUFRLEVBQUUsYUFBYTtZQUN2QixZQUFZLEVBQUU7Z0JBQ1osTUFBTSxFQUFFLG1CQUFtQjthQUM1QjtTQUNGLENBQUM7S0FDUCxDQUFDLENBQ0gsQ0FBQztJQUVGLGVBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQ2pCLHFCQUFZLENBQUMsYUFBYSxFQUFFO1FBQ3hCLE1BQU0sRUFBRSw0S0FBNEs7UUFDcEwsTUFBTSxFQUFFLDJLQUEySztLQUN0TCxDQUFDLENBQ0gsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGV4cGVjdCBhcyBleHBlY3RDREssIGhhdmVSZXNvdXJjZSB9IGZyb20gXCJAYXdzLWNkay9hc3NlcnRcIjtcbmltcG9ydCB7IE9yZ2FuaXphdGlvblRyYWlsIH0gZnJvbSBcIi4uL2xpYi9vcmdhbml6YXRpb24tdHJhaWxcIjtcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbnRlc3QoXCJPcmdhbml6YXRpb25UcmFpbCBjcmVhdGlvblwiLCAoKSA9PiB7XG4gIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gIG5ldyBPcmdhbml6YXRpb25UcmFpbChzdGFjaywgXCJPcmdhbml6YXRpb25UcmFpbFwiLCB7T3JnYW5pemF0aW9uSWQ6ICdvLTExMTExMSd9KTtcblxuICBleHBlY3RDREsoc3RhY2spLnRvKFxuICAgIGhhdmVSZXNvdXJjZShcIkFXUzo6UzM6OkJ1Y2tldFwiLCB7XG4gICAgICAgIFB1YmxpY0FjY2Vzc0Jsb2NrQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgIFwiQmxvY2tQdWJsaWNBY2xzXCI6IHRydWUsXG4gICAgICAgICAgXCJCbG9ja1B1YmxpY1BvbGljeVwiOiB0cnVlLFxuICAgICAgICAgIFwiSWdub3JlUHVibGljQWNsc1wiOiB0cnVlLFxuICAgICAgICAgIFwiUmVzdHJpY3RQdWJsaWNCdWNrZXRzXCI6IHRydWVcbiAgICAgICAgfVxuXG4gICAgfSlcbiAgKTtcblxuICBleHBlY3RDREsoc3RhY2spLnRvKFxuICAgIGhhdmVSZXNvdXJjZShcIkFXUzo6UzM6OkJ1Y2tldFBvbGljeVwiLCB7XG4gICAgICAgIEJ1Y2tldDoge1xuICAgICAgICAgICAgXCJSZWZcIjogXCJPcmdhbml6YXRpb25UcmFpbE9yZ2FuaXphdGlvblRyYWlsQnVja2V0MzE0NDZGMjBcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgUG9saWN5RG9jdW1lbnQ6IHtcbiAgICAgICAgICAgIFwiU3RhdGVtZW50XCI6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFwiczM6R2V0QnVja2V0QWNsXCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUHJpbmNpcGFsXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwiU2VydmljZVwiOiBcImNsb3VkdHJhaWwuYW1hem9uYXdzLmNvbVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwiRm46OkdldEF0dFwiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiT3JnYW5pemF0aW9uVHJhaWxPcmdhbml6YXRpb25UcmFpbEJ1Y2tldDMxNDQ2RjIwXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXJuXCJcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBcInMzOlB1dE9iamVjdFwiLFxuICAgICAgICAgICAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJzMzp4LWFtei1hY2xcIjogXCJidWNrZXQtb3duZXItZnVsbC1jb250cm9sXCJcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIlByaW5jaXBhbFwiOiB7XG4gICAgICAgICAgICAgICAgICBcIlNlcnZpY2VcIjogXCJjbG91ZHRyYWlsLmFtYXpvbmF3cy5jb21cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiB7XG4gICAgICAgICAgICAgICAgICBcIkZuOjpKb2luXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkdldEF0dFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiT3JnYW5pemF0aW9uVHJhaWxPcmdhbml6YXRpb25UcmFpbEJ1Y2tldDMxNDQ2RjIwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXJuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIFwiL0FXU0xvZ3Mvby0xMTExMTEvKlwiXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBcInMzOlB1dE9iamVjdFwiLFxuICAgICAgICAgICAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJzMzp4LWFtei1hY2xcIjogXCJidWNrZXQtb3duZXItZnVsbC1jb250cm9sXCJcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIlByaW5jaXBhbFwiOiB7XG4gICAgICAgICAgICAgICAgICBcIlNlcnZpY2VcIjogXCJjbG91ZHRyYWlsLmFtYXpvbmF3cy5jb21cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiB7XG4gICAgICAgICAgICAgICAgICBcIkZuOjpKb2luXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRm46OkdldEF0dFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiT3JnYW5pemF0aW9uVHJhaWxPcmdhbml6YXRpb25UcmFpbEJ1Y2tldDMxNDQ2RjIwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXJuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIFwiL0FXU0xvZ3MvXCIsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWZcIjogXCJBV1M6OkFjY291bnRJZFwiXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBcIi8qXCJcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiVmVyc2lvblwiOiBcIjIwMTItMTAtMTdcIlxuICAgICAgICAgIH1cblxuICAgIH0pXG4gICk7XG5cbiAgZXhwZWN0Q0RLKHN0YWNrKS50byhcbiAgICBoYXZlUmVzb3VyY2UoXCJDdXN0b206OkFXU1wiLCB7XG4gICAgICAgIENyZWF0ZTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgXCJzZXJ2aWNlXCI6IFwiT3JnYW5pemF0aW9uc1wiLFxuICAgICAgICAgICAgXCJhY3Rpb25cIjogXCJlbmFibGVBV1NTZXJ2aWNlQWNjZXNzXCIsXG4gICAgICAgICAgICBcInBoeXNpY2FsUmVzb3VyY2VJZFwiOiB7XG4gICAgICAgICAgICAgIFwiaWRcIjogXCJFbmFibGVBV1NTZXJ2aWNlQWNjZXNzXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlZ2lvblwiOiBcInVzLWVhc3QtMVwiLFxuICAgICAgICAgICAgXCJwYXJhbWV0ZXJzXCI6IHtcbiAgICAgICAgICAgICAgXCJTZXJ2aWNlUHJpbmNpcGFsXCI6IFwiY2xvdWR0cmFpbC5hbWF6b25hd3MuY29tXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICAgICBEZWxldGU6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIFwic2VydmljZVwiOiBcIk9yZ2FuaXphdGlvbnNcIixcbiAgICAgICAgICAgIFwiYWN0aW9uXCI6IFwiZGlzYWJsZUFXU1NlcnZpY2VBY2Nlc3NcIixcbiAgICAgICAgICAgIFwicmVnaW9uXCI6IFwidXMtZWFzdC0xXCIsXG4gICAgICAgICAgICBcInBhcmFtZXRlcnNcIjoge1xuICAgICAgICAgICAgICBcIlNlcnZpY2VQcmluY2lwYWxcIjogXCJjbG91ZHRyYWlsLmFtYXpvbmF3cy5jb21cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgfSlcbiAgKTtcblxuICBleHBlY3RDREsoc3RhY2spLnRvKFxuICAgIGhhdmVSZXNvdXJjZShcIkN1c3RvbTo6QVdTXCIsIHtcbiAgICAgICAgQ3JlYXRlOiAge1xuICAgICAgICAgIFwiRm46OkpvaW5cIjogW1xuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgXCJ7XFxcInNlcnZpY2VcXFwiOlxcXCJDbG91ZFRyYWlsXFxcIixcXFwiYWN0aW9uXFxcIjpcXFwiY3JlYXRlVHJhaWxcXFwiLFxcXCJwaHlzaWNhbFJlc291cmNlSWRcXFwiOntcXFwiaWRcXFwiOlxcXCJPcmdhbml6YXRpb25UcmFpbENyZWF0ZVxcXCJ9LFxcXCJwYXJhbWV0ZXJzXFxcIjp7XFxcIklzTXVsdGlSZWdpb25UcmFpbFxcXCI6dHJ1ZSxcXFwiSXNPcmdhbml6YXRpb25UcmFpbFxcXCI6dHJ1ZSxcXFwiTmFtZVxcXCI6XFxcIk9yZ2FuaXphdGlvblRyYWlsXFxcIixcXFwiUzNCdWNrZXROYW1lXFxcIjpcXFwiXCIsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlJlZlwiOiBcIk9yZ2FuaXphdGlvblRyYWlsT3JnYW5pemF0aW9uVHJhaWxCdWNrZXQzMTQ0NkYyMFwiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIFwiXFxcIn19XCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICAgRGVsZXRlOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBcInNlcnZpY2VcIjogXCJDbG91ZFRyYWlsXCIsXG4gICAgICAgICAgICBcImFjdGlvblwiOiBcImRlbGV0ZVRyYWlsXCIsXG4gICAgICAgICAgICBcInBhcmFtZXRlcnNcIjoge1xuICAgICAgICAgICAgICBcIk5hbWVcIjogXCJPcmdhbml6YXRpb25UcmFpbFwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICB9KVxuICApO1xuXG4gIGV4cGVjdENESyhzdGFjaykudG8oXG4gICAgaGF2ZVJlc291cmNlKFwiQ3VzdG9tOjpBV1NcIiwge1xuICAgICAgICBDcmVhdGU6IFwie1xcXCJzZXJ2aWNlXFxcIjpcXFwiQ2xvdWRUcmFpbFxcXCIsXFxcImFjdGlvblxcXCI6XFxcInN0YXJ0TG9nZ2luZ1xcXCIsXFxcInBoeXNpY2FsUmVzb3VyY2VJZFxcXCI6e1xcXCJpZFxcXCI6XFxcIk9yZ2FuaXphdGlvblRyYWlsU3RhcnRMb2dnaW5nXFxcIn0sXFxcInBhcmFtZXRlcnNcXFwiOntcXFwiTmFtZVxcXCI6XFxcIk9yZ2FuaXphdGlvblRyYWlsXFxcIn19XCIsXG4gICAgICAgIERlbGV0ZTogXCJ7XFxcInNlcnZpY2VcXFwiOlxcXCJDbG91ZFRyYWlsXFxcIixcXFwiYWN0aW9uXFxcIjpcXFwic3RvcExvZ2dpbmdcXFwiLFxcXCJwaHlzaWNhbFJlc291cmNlSWRcXFwiOntcXFwiaWRcXFwiOlxcXCJPcmdhbml6YXRpb25UcmFpbFN0YXJ0TG9nZ2luZ1xcXCJ9LFxcXCJwYXJhbWV0ZXJzXFxcIjp7XFxcIk5hbWVcXFwiOlxcXCJPcmdhbml6YXRpb25UcmFpbFxcXCJ9fVwiXG4gICAgfSlcbiAgKTtcbn0pO1xuIl19