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
exports.ConfigRecorder = void 0;
const constructs_1 = require("constructs");
const iam = require("aws-cdk-lib/aws-iam");
const s3 = require("aws-cdk-lib/aws-s3");
const cfg = require("aws-cdk-lib/aws-config");
// from https://github.com/aws-samples/aws-startup-blueprint/blob/mainline/lib/aws-config-packs.ts
class ConfigRecorder extends constructs_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        const configBucket = new s3.Bucket(this, 'ConfigBucket', { blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL });
        configBucket.addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            actions: ['*'],
            principals: [new iam.AnyPrincipal()],
            resources: [configBucket.bucketArn, configBucket.arnForObjects('*')],
            conditions: {
                Bool: {
                    'aws:SecureTransport': false,
                },
            },
        }));
        // Attach AWSConfigBucketPermissionsCheck to config bucket
        configBucket.addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('config.amazonaws.com')],
            resources: [configBucket.bucketArn],
            actions: ['s3:GetBucketAcl'],
        }));
        // Attach AWSConfigBucketDelivery to config bucket
        configBucket.addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('config.amazonaws.com')],
            resources: [`${configBucket.bucketArn}/*`],
            actions: ['s3:PutObject'],
            conditions: {
                StringEquals: {
                    's3:x-amz-acl': 'bucket-owner-full-control',
                },
            },
        }));
        new cfg.CfnDeliveryChannel(this, 'ConfigDeliveryChannel', {
            s3BucketName: configBucket.bucketName,
            name: "ConfigDeliveryChannel"
        });
        const configRole = new iam.Role(this, 'ConfigRecorderRole', {
            assumedBy: new iam.ServicePrincipal('config.amazonaws.com'),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSConfigRole')]
        });
        new cfg.CfnConfigurationRecorder(this, 'ConfigRecorder', {
            name: "BlueprintConfigRecorder",
            roleArn: configRole.roleArn,
            recordingGroup: {
                resourceTypes: [
                    "AWS::IAM::User"
                ]
            }
        });
    }
}
exports.ConfigRecorder = ConfigRecorder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWNvbmZpZy1yZWNvcmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF3cy1jb25maWctcmVjb3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7OztFQWNFOzs7QUFFRiwyQ0FBcUM7QUFDckMsMkNBQTJDO0FBQzNDLHlDQUF5QztBQUN6Qyw4Q0FBOEM7QUFHOUMsa0dBQWtHO0FBQ2xHLE1BQWEsY0FBZSxTQUFRLHNCQUFTO0lBRTVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVO1FBQ3JDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFHakIsTUFBTSxZQUFZLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsRUFBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUU5RyxZQUFZLENBQUMsbUJBQW1CLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNkLFVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BDLFNBQVMsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRSxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFO29CQUNKLHFCQUFxQixFQUFFLEtBQUs7aUJBQzdCO2FBQ0Y7U0FDRixDQUFDLENBQ0gsQ0FBQztRQUVGLDBEQUEwRDtRQUMxRCxZQUFZLENBQUMsbUJBQW1CLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLFVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDOUQsU0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztZQUNuQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztTQUM3QixDQUFDLENBQ0gsQ0FBQztRQUVGLGtEQUFrRDtRQUNsRCxZQUFZLENBQUMsbUJBQW1CLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLFVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDOUQsU0FBUyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUM7WUFDMUMsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixZQUFZLEVBQUU7b0JBQ1osY0FBYyxFQUFFLDJCQUEyQjtpQkFDNUM7YUFDRjtTQUNGLENBQUMsQ0FDSCxDQUFDO1FBRUYsSUFBSSxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ3hELFlBQVksRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNyQyxJQUFJLEVBQUUsdUJBQXVCO1NBQzlCLENBQUMsQ0FBQztRQUlILE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDMUQsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUM1RixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDdkQsSUFBSSxFQUFFLHlCQUF5QjtZQUMvQixPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU87WUFDM0IsY0FBYyxFQUFFO2dCQUNkLGFBQWEsRUFBRTtvQkFDYixnQkFBZ0I7aUJBQ2pCO2FBQ0Y7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFyRUQsd0NBcUVDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBjZmcgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvbmZpZyc7XG5cblxuLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYXdzLXNhbXBsZXMvYXdzLXN0YXJ0dXAtYmx1ZXByaW50L2Jsb2IvbWFpbmxpbmUvbGliL2F3cy1jb25maWctcGFja3MudHNcbmV4cG9ydCBjbGFzcyBDb25maWdSZWNvcmRlciBleHRlbmRzIENvbnN0cnVjdCB7XG5cblx0Y29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cblxuICAgIGNvbnN0IGNvbmZpZ0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0NvbmZpZ0J1Y2tldCcsIHtibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMfSk7XG5cbiAgICBjb25maWdCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkRFTlksXG4gICAgICAgIGFjdGlvbnM6IFsnKiddLFxuICAgICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5BbnlQcmluY2lwYWwoKV0sXG4gICAgICAgIHJlc291cmNlczogW2NvbmZpZ0J1Y2tldC5idWNrZXRBcm4sIGNvbmZpZ0J1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgQm9vbDoge1xuICAgICAgICAgICAgJ2F3czpTZWN1cmVUcmFuc3BvcnQnOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIEF0dGFjaCBBV1NDb25maWdCdWNrZXRQZXJtaXNzaW9uc0NoZWNrIHRvIGNvbmZpZyBidWNrZXRcbiAgICBjb25maWdCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdjb25maWcuYW1hem9uYXdzLmNvbScpXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbY29uZmlnQnVja2V0LmJ1Y2tldEFybl0sXG4gICAgICAgIGFjdGlvbnM6IFsnczM6R2V0QnVja2V0QWNsJ10sXG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgLy8gQXR0YWNoIEFXU0NvbmZpZ0J1Y2tldERlbGl2ZXJ5IHRvIGNvbmZpZyBidWNrZXRcbiAgICBjb25maWdCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdjb25maWcuYW1hem9uYXdzLmNvbScpXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbYCR7Y29uZmlnQnVja2V0LmJ1Y2tldEFybn0vKmBdLFxuICAgICAgICBhY3Rpb25zOiBbJ3MzOlB1dE9iamVjdCddLFxuICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgICAnczM6eC1hbXotYWNsJzogJ2J1Y2tldC1vd25lci1mdWxsLWNvbnRyb2wnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgbmV3IGNmZy5DZm5EZWxpdmVyeUNoYW5uZWwodGhpcywgJ0NvbmZpZ0RlbGl2ZXJ5Q2hhbm5lbCcsIHtcbiAgICAgIHMzQnVja2V0TmFtZTogY29uZmlnQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICBuYW1lOiBcIkNvbmZpZ0RlbGl2ZXJ5Q2hhbm5lbFwiXG4gICAgfSk7XG5cblxuXG4gICAgY29uc3QgY29uZmlnUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnQ29uZmlnUmVjb3JkZXJSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2NvbmZpZy5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NDb25maWdSb2xlJyldXG4gICAgfSk7XG5cbiAgICBuZXcgY2ZnLkNmbkNvbmZpZ3VyYXRpb25SZWNvcmRlcih0aGlzLCAnQ29uZmlnUmVjb3JkZXInLCB7XG4gICAgICBuYW1lOiBcIkJsdWVwcmludENvbmZpZ1JlY29yZGVyXCIsXG4gICAgICByb2xlQXJuOiBjb25maWdSb2xlLnJvbGVBcm4sXG4gICAgICByZWNvcmRpbmdHcm91cDoge1xuICAgICAgICByZXNvdXJjZVR5cGVzOiBbXG4gICAgICAgICAgXCJBV1M6OklBTTo6VXNlclwiXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSJdfQ==