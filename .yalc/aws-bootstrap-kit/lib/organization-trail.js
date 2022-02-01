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
exports.OrganizationTrail = void 0;
const constructs_1 = require("constructs");
const core = require("aws-cdk-lib");
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
/**
 * This represents an organization trail. An organization trail logs all events for all AWS accounts in that organization
 * and write them in a dedicated S3 bucket in the master account of the organization. To deploy this construct you should
 * the credential of the master account of your organization. It deploys a S3 bucket, enables cloudtrail.amazonaws.com to
 * access the organization API, creates an organization trail and
 * start logging. To learn about AWS Cloud Trail and organization trail,
 * check https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html
 */
class OrganizationTrail extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const orgTrailBucket = new aws_s3_1.Bucket(this, 'OrganizationTrailBucket', { blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL });
        orgTrailBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            actions: ['s3:GetBucketAcl'],
            effect: aws_iam_1.Effect.ALLOW,
            principals: [new aws_iam_1.ServicePrincipal('cloudtrail.amazonaws.com')],
            resources: [orgTrailBucket.bucketArn]
        }));
        orgTrailBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            actions: ['s3:PutObject'],
            effect: aws_iam_1.Effect.ALLOW,
            principals: [new aws_iam_1.ServicePrincipal('cloudtrail.amazonaws.com')],
            resources: [orgTrailBucket.bucketArn + '/AWSLogs/' + props.OrganizationId + '/*'],
            conditions: {
                StringEquals: {
                    "s3:x-amz-acl": "bucket-owner-full-control"
                }
            }
        }));
        orgTrailBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            actions: ['s3:PutObject'],
            effect: aws_iam_1.Effect.ALLOW,
            principals: [new aws_iam_1.ServicePrincipal('cloudtrail.amazonaws.com')],
            resources: [orgTrailBucket.bucketArn + '/AWSLogs/' + core.Stack.of(this).account + '/*'],
            conditions: {
                StringEquals: {
                    "s3:x-amz-acl": "bucket-owner-full-control"
                }
            }
        }));
        const enableAWSServiceAccess = new custom_resources_1.AwsCustomResource(this, "EnableAWSServiceAccess", {
            onCreate: {
                service: 'Organizations',
                action: 'enableAWSServiceAccess',
                physicalResourceId: custom_resources_1.PhysicalResourceId.of('EnableAWSServiceAccess'),
                region: 'us-east-1',
                parameters: {
                    ServicePrincipal: 'cloudtrail.amazonaws.com',
                }
            },
            onDelete: {
                service: 'Organizations',
                action: 'disableAWSServiceAccess',
                region: 'us-east-1',
                parameters: {
                    ServicePrincipal: 'cloudtrail.amazonaws.com',
                }
            },
            installLatestAwsSdk: false,
            policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({
                resources: custom_resources_1.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
        const organizationTrailName = 'OrganizationTrail';
        let organizationTrailCreate = new custom_resources_1.AwsCustomResource(this, "OrganizationTrailCreate", {
            onCreate: {
                service: 'CloudTrail',
                action: 'createTrail',
                physicalResourceId: custom_resources_1.PhysicalResourceId.of('OrganizationTrailCreate'),
                parameters: {
                    IsMultiRegionTrail: true,
                    IsOrganizationTrail: true,
                    Name: organizationTrailName,
                    S3BucketName: orgTrailBucket.bucketName
                }
            },
            onDelete: {
                service: 'CloudTrail',
                action: 'deleteTrail',
                parameters: {
                    Name: organizationTrailName
                }
            },
            installLatestAwsSdk: false,
            policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({
                resources: custom_resources_1.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
        organizationTrailCreate.node.addDependency(enableAWSServiceAccess);
        // need to add an explicit dependency on the bucket policy to avoid the creation of the trail before the policy is set up
        if (orgTrailBucket.policy) {
            organizationTrailCreate.node.addDependency(orgTrailBucket.policy);
        }
        organizationTrailCreate.grantPrincipal.addToPrincipalPolicy(aws_iam_1.PolicyStatement.fromJson({
            "Effect": "Allow",
            "Action": [
                "iam:GetRole",
                "organizations:EnableAWSServiceAccess",
                "organizations:ListAccounts",
                "iam:CreateServiceLinkedRole",
                "organizations:DisableAWSServiceAccess",
                "organizations:DescribeOrganization",
                "organizations:ListAWSServiceAccessForOrganization"
            ],
            "Resource": "*"
        }));
        const startLogging = new custom_resources_1.AwsCustomResource(this, "OrganizationTrailStartLogging", {
            onCreate: {
                service: 'CloudTrail',
                action: 'startLogging',
                physicalResourceId: custom_resources_1.PhysicalResourceId.of('OrganizationTrailStartLogging'),
                parameters: {
                    Name: organizationTrailName
                }
            },
            onDelete: {
                service: 'CloudTrail',
                action: 'stopLogging',
                physicalResourceId: custom_resources_1.PhysicalResourceId.of('OrganizationTrailStartLogging'),
                parameters: {
                    Name: organizationTrailName
                }
            },
            installLatestAwsSdk: false,
            policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({
                resources: custom_resources_1.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
        startLogging.node.addDependency(organizationTrailCreate);
    }
}
exports.OrganizationTrail = OrganizationTrail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnYW5pemF0aW9uLXRyYWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3JnYW5pemF0aW9uLXRyYWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTs7O0FBRUYsMkNBQXFDO0FBQ3JDLG9DQUFvQztBQUNwQyxtRUFBOEc7QUFDOUcsK0NBQStEO0FBQy9ELGlEQUFnRjtBQVloRjs7Ozs7OztHQU9HO0FBQ0gsTUFBYSxpQkFBa0IsU0FBUSxzQkFBUztJQUU1QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQThCO1FBQ3BFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLEVBQUMsaUJBQWlCLEVBQUUsMEJBQWlCLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUVySCxjQUFjLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBZSxDQUFDO1lBQ25ELE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQzVCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsVUFBVSxFQUFFLENBQUMsSUFBSSwwQkFBZ0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzlELFNBQVMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7U0FDeEMsQ0FBQyxDQUFDLENBQUM7UUFFSixjQUFjLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBZSxDQUFDO1lBQ25ELE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUN6QixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1lBQ3BCLFVBQVUsRUFBRSxDQUFDLElBQUksMEJBQWdCLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUM5RCxTQUFTLEVBQUUsQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUMsY0FBYyxHQUFHLElB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RTtnQkFDTixhQUFhO2dCQUNiLHNDQUFzQztnQkFDdEMsNEJBQTRCO2dCQUM1Qiw2QkFBNkI7Z0JBQzdCLHVDQUF1QztnQkFDdkMsb0NBQW9DO2dCQUNwQyxtREFBbUQ7YUFDdEQ7WUFDRCxVQUFVLEVBQUUsR0FBRztTQUNsQixDQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFJLElBQUksb0NBQWlCLENBQUMsSUFBSSxFQUM1QywrQkFBK0IsRUFDL0I7WUFDSSxRQUFRLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLFlBQVk7Z0JBQ3JCLE1BQU0sRUFBRSxjQUFjO2dCQUN0QixrQkFBa0IsRUFBRSxxQ0FBa0IsQ0FBQyxFQUFFLENBQUMsK0JBQStCLENBQUM7Z0JBQzFFLFVBQVUsRUFDVjtvQkFDSSxJQUFJLEVBQUUscUJBQXFCO2lCQUM5QjthQUNKO1lBQ0QsUUFBUSxFQUFFO2dCQUNOLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixNQUFNLEVBQUUsYUFBYTtnQkFDckIsa0JBQWtCLEVBQUUscUNBQWtCLENBQUMsRUFBRSxDQUFDLCtCQUErQixDQUFDO2dCQUMxRSxVQUFVLEVBQ1Y7b0JBQ0ksSUFBSSxFQUFFLHFCQUFxQjtpQkFDOUI7YUFDSjtZQUNELG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsTUFBTSxFQUFFLDBDQUF1QixDQUFDLFlBQVksQ0FDeEM7Z0JBQ0ksU0FBUyxFQUFFLDBDQUF1QixDQUFDLFlBQVk7YUFDbEQsQ0FDSjtTQUNKLENBQ0osQ0FBQztRQUNGLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNKO0FBL0pELDhDQStKQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge0NvbnN0cnVjdH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEF3c0N1c3RvbVJlc291cmNlLCBQaHlzaWNhbFJlc291cmNlSWQsIEF3c0N1c3RvbVJlc291cmNlUG9saWN5IH0gZnJvbSBcImF3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXNcIjtcbmltcG9ydCB7IEJ1Y2tldCwgQmxvY2tQdWJsaWNBY2Nlc3MgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgRWZmZWN0LCBQb2xpY3lTdGF0ZW1lbnQsIFNlcnZpY2VQcmluY2lwYWwgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcblxuLyoqXG4gKiBUaGUgcHJvcGVydGllcyBvZiBhbiBPcmdhbml6YXRpb25UcmFpbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIElPcmdhbml6YXRpb25UcmFpbFByb3BzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgSWQgb2YgdGhlIG9yZ2FuaXphdGlvbiB3aGljaCB0aGUgdHJhaWwgd29ya3Mgb25cbiAgICAgKi9cbiAgICBPcmdhbml6YXRpb25JZDogc3RyaW5nXG59XG5cbi8qKlxuICogVGhpcyByZXByZXNlbnRzIGFuIG9yZ2FuaXphdGlvbiB0cmFpbC4gQW4gb3JnYW5pemF0aW9uIHRyYWlsIGxvZ3MgYWxsIGV2ZW50cyBmb3IgYWxsIEFXUyBhY2NvdW50cyBpbiB0aGF0IG9yZ2FuaXphdGlvblxuICogYW5kIHdyaXRlIHRoZW0gaW4gYSBkZWRpY2F0ZWQgUzMgYnVja2V0IGluIHRoZSBtYXN0ZXIgYWNjb3VudCBvZiB0aGUgb3JnYW5pemF0aW9uLiBUbyBkZXBsb3kgdGhpcyBjb25zdHJ1Y3QgeW91IHNob3VsZFxuICogdGhlIGNyZWRlbnRpYWwgb2YgdGhlIG1hc3RlciBhY2NvdW50IG9mIHlvdXIgb3JnYW5pemF0aW9uLiBJdCBkZXBsb3lzIGEgUzMgYnVja2V0LCBlbmFibGVzIGNsb3VkdHJhaWwuYW1hem9uYXdzLmNvbSB0b1xuICogYWNjZXNzIHRoZSBvcmdhbml6YXRpb24gQVBJLCBjcmVhdGVzIGFuIG9yZ2FuaXphdGlvbiB0cmFpbCBhbmRcbiAqIHN0YXJ0IGxvZ2dpbmcuIFRvIGxlYXJuIGFib3V0IEFXUyBDbG91ZCBUcmFpbCBhbmQgb3JnYW5pemF0aW9uIHRyYWlsLFxuICogY2hlY2sgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2F3c2Nsb3VkdHJhaWwvbGF0ZXN0L3VzZXJndWlkZS9jcmVhdGluZy10cmFpbC1vcmdhbml6YXRpb24uaHRtbFxuICovXG5leHBvcnQgY2xhc3MgT3JnYW5pemF0aW9uVHJhaWwgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IElPcmdhbml6YXRpb25UcmFpbFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAgICAgY29uc3Qgb3JnVHJhaWxCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdPcmdhbml6YXRpb25UcmFpbEJ1Y2tldCcsIHtibG9ja1B1YmxpY0FjY2VzczogQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMfSk7XG5cbiAgICAgICAgb3JnVHJhaWxCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6R2V0QnVja2V0QWNsJ10sXG4gICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgU2VydmljZVByaW5jaXBhbCgnY2xvdWR0cmFpbC5hbWF6b25hd3MuY29tJyldLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbb3JnVHJhaWxCdWNrZXQuYnVja2V0QXJuXVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgb3JnVHJhaWxCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6UHV0T2JqZWN0J10sXG4gICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgU2VydmljZVByaW5jaXBhbCgnY2xvdWR0cmFpbC5hbWF6b25hd3MuY29tJyldLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbb3JnVHJhaWxCdWNrZXQuYnVja2V0QXJuICsgJy9BV1NMb2dzLycgKyBwcm9wcy5Pcmdhbml6YXRpb25JZCArICcvKiddLFxuICAgICAgICAgICAgY29uZGl0aW9uczoge1xuICAgICAgICAgICAgICAgIFN0cmluZ0VxdWFsczpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiczM6eC1hbXotYWNsXCI6IFwiYnVja2V0LW93bmVyLWZ1bGwtY29udHJvbFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgb3JnVHJhaWxCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6UHV0T2JqZWN0J10sXG4gICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgU2VydmljZVByaW5jaXBhbCgnY2xvdWR0cmFpbC5hbWF6b25hd3MuY29tJyldLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbb3JnVHJhaWxCdWNrZXQuYnVja2V0QXJuICsgJy9BV1NMb2dzLycgKyBjb3JlLlN0YWNrLm9mKHRoaXMpLmFjY291bnQgKyAnLyonXSxcbiAgICAgICAgICAgIGNvbmRpdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBTdHJpbmdFcXVhbHM6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcInMzOngtYW16LWFjbFwiOiBcImJ1Y2tldC1vd25lci1mdWxsLWNvbnRyb2xcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGNvbnN0IGVuYWJsZUFXU1NlcnZpY2VBY2Nlc3MgPSBuZXcgQXdzQ3VzdG9tUmVzb3VyY2UodGhpcyxcbiAgICAgICAgICAgIFwiRW5hYmxlQVdTU2VydmljZUFjY2Vzc1wiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uQ3JlYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6ICdPcmdhbml6YXRpb25zJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZW5hYmxlQVdTU2VydmljZUFjY2VzcycsIC8vY2FsbCBlbmFibGVBV1NTZXJ2aWNlQWNjZXMgb2YgdGhlIEphdmFzY3JpcHQgU0RLIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NKYXZhU2NyaXB0U0RLL2xhdGVzdC9BV1MvT3JnYW5pemF0aW9ucy5odG1sI2VuYWJsZUFXU1NlcnZpY2VBY2Nlc3MtcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBQaHlzaWNhbFJlc291cmNlSWQub2YoJ0VuYWJsZUFXU1NlcnZpY2VBY2Nlc3MnKSxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJywgLy9BV1MgT3JnYW5pemF0aW9ucyBBUEkgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHVzLWVhc3QtMSBmb3Igcm9vdCBhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNlcnZpY2VQcmluY2lwYWw6ICdjbG91ZHRyYWlsLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkRlbGV0ZToge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2Rpc2FibGVBV1NTZXJ2aWNlQWNjZXNzJywgLy9jYWxsIGRpc2FibGVBV1NTZXJ2aWNlQWNjZXMgb2YgdGhlIEphdmFzY3JpcHQgU0RLIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NKYXZhU2NyaXB0U0RLL2xhdGVzdC9BV1MvT3JnYW5pemF0aW9ucy5odG1sI2Rpc2FibGVBV1NTZXJ2aWNlQWNjZXNzLXByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsIC8vQVdTIE9yZ2FuaXphdGlvbnMgQVBJIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiB1cy1lYXN0LTEgZm9yIHJvb3QgYWN0aW9uc1xuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTZXJ2aWNlUHJpbmNpcGFsOiAnY2xvdWR0cmFpbC5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW5zdGFsbExhdGVzdEF3c1NkazogZmFsc2UsXG4gICAgICAgICAgICAgICAgcG9saWN5OiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuQU5ZX1JFU09VUkNFXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3Qgb3JnYW5pemF0aW9uVHJhaWxOYW1lID0gJ09yZ2FuaXphdGlvblRyYWlsJztcblxuICAgICAgICBsZXQgb3JnYW5pemF0aW9uVHJhaWxDcmVhdGUgPSBuZXcgQXdzQ3VzdG9tUmVzb3VyY2UodGhpcyxcbiAgICAgICAgICAgIFwiT3JnYW5pemF0aW9uVHJhaWxDcmVhdGVcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBvbkNyZWF0ZToge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnQ2xvdWRUcmFpbCcsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2NyZWF0ZVRyYWlsJywgLy9jYWxsIGNyZWF0ZVRyYWlsIG9mIHRoZSBKYXZhc2NyaXB0IFNESyBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vQVdTSmF2YVNjcmlwdFNESy9sYXRlc3QvQVdTL0Nsb3VkVHJhaWwuaHRtbCNjcmVhdGVUcmFpbC1wcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IFBoeXNpY2FsUmVzb3VyY2VJZC5vZignT3JnYW5pemF0aW9uVHJhaWxDcmVhdGUnKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyczpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgSXNNdWx0aVJlZ2lvblRyYWlsOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgSXNPcmdhbml6YXRpb25UcmFpbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIE5hbWU6IG9yZ2FuaXphdGlvblRyYWlsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFMzQnVja2V0TmFtZTogb3JnVHJhaWxCdWNrZXQuYnVja2V0TmFtZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkRlbGV0ZToge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnQ2xvdWRUcmFpbCcsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2RlbGV0ZVRyYWlsJywgLy9jYWxsIGRlbGV0ZVRyYWlsIG9mIHRoZSBKYXZhc2NyaXB0IFNESyBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vQVdTSmF2YVNjcmlwdFNESy9sYXRlc3QvQVdTL0Nsb3VkVHJhaWwuaHRtbCNkZWxldGVUcmFpbC1wcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOYW1lOiBvcmdhbml6YXRpb25UcmFpbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnN0YWxsTGF0ZXN0QXdzU2RrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwb2xpY3k6IEF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyhcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgb3JnYW5pemF0aW9uVHJhaWxDcmVhdGUubm9kZS5hZGREZXBlbmRlbmN5KGVuYWJsZUFXU1NlcnZpY2VBY2Nlc3MpO1xuICAgICAgICAvLyBuZWVkIHRvIGFkZCBhbiBleHBsaWNpdCBkZXBlbmRlbmN5IG9uIHRoZSBidWNrZXQgcG9saWN5IHRvIGF2b2lkIHRoZSBjcmVhdGlvbiBvZiB0aGUgdHJhaWwgYmVmb3JlIHRoZSBwb2xpY3kgaXMgc2V0IHVwXG4gICAgICAgIGlmKG9yZ1RyYWlsQnVja2V0LnBvbGljeSlcbiAgICAgICAge1xuICAgICAgICAgICAgb3JnYW5pemF0aW9uVHJhaWxDcmVhdGUubm9kZS5hZGREZXBlbmRlbmN5KG9yZ1RyYWlsQnVja2V0LnBvbGljeSk7XG4gICAgICAgIH1cblxuICAgICAgICBvcmdhbml6YXRpb25UcmFpbENyZWF0ZS5ncmFudFByaW5jaXBhbC5hZGRUb1ByaW5jaXBhbFBvbGljeShQb2xpY3lTdGF0ZW1lbnQuZnJvbUpzb24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJpYW06R2V0Um9sZVwiLFxuICAgICAgICAgICAgICAgICAgICBcIm9yZ2FuaXphdGlvbnM6RW5hYmxlQVdTU2VydmljZUFjY2Vzc1wiLFxuICAgICAgICAgICAgICAgICAgICBcIm9yZ2FuaXphdGlvbnM6TGlzdEFjY291bnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaWFtOkNyZWF0ZVNlcnZpY2VMaW5rZWRSb2xlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwib3JnYW5pemF0aW9uczpEaXNhYmxlQVdTU2VydmljZUFjY2Vzc1wiLFxuICAgICAgICAgICAgICAgICAgICBcIm9yZ2FuaXphdGlvbnM6RGVzY3JpYmVPcmdhbml6YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJvcmdhbml6YXRpb25zOkxpc3RBV1NTZXJ2aWNlQWNjZXNzRm9yT3JnYW5pemF0aW9uXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgKSk7XG5cbiAgICAgICAgY29uc3Qgc3RhcnRMb2dnaW5nID0gIG5ldyBBd3NDdXN0b21SZXNvdXJjZSh0aGlzLFxuICAgICAgICAgICAgXCJPcmdhbml6YXRpb25UcmFpbFN0YXJ0TG9nZ2luZ1wiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uQ3JlYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6ICdDbG91ZFRyYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnRMb2dnaW5nJywgLy9jYWxsIHN0YXJ0TG9nZ2luZyBvZiB0aGUgSmF2YXNjcmlwdCBTREsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FXU0phdmFTY3JpcHRTREsvbGF0ZXN0L0FXUy9DbG91ZFRyYWlsLmh0bWwjc3RhcnRMb2dnaW5nLXByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogUGh5c2ljYWxSZXNvdXJjZUlkLm9mKCdPcmdhbml6YXRpb25UcmFpbFN0YXJ0TG9nZ2luZycpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOYW1lOiBvcmdhbml6YXRpb25UcmFpbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25EZWxldGU6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZTogJ0Nsb3VkVHJhaWwnLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdzdG9wTG9nZ2luZycsIC8vY2FsbCBzdG9wTG9nZ2luZyBvZiB0aGUgSmF2YXNjcmlwdCBTREsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FXU0phdmFTY3JpcHRTREsvbGF0ZXN0L0FXUy9DbG91ZFRyYWlsLmh0bWwjc3RvcExvZ2dpbmctcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBQaHlzaWNhbFJlc291cmNlSWQub2YoJ09yZ2FuaXphdGlvblRyYWlsU3RhcnRMb2dnaW5nJyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE5hbWU6IG9yZ2FuaXphdGlvblRyYWlsTmFtZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnN0YWxsTGF0ZXN0QXdzU2RrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwb2xpY3k6IEF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyhcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBBd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgc3RhcnRMb2dnaW5nLm5vZGUuYWRkRGVwZW5kZW5jeShvcmdhbml6YXRpb25UcmFpbENyZWF0ZSk7XG4gICAgfVxufSJdfQ==