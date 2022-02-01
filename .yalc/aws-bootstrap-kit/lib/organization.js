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
exports.Organization = void 0;
const constructs_1 = require("constructs");
const cr = require("aws-cdk-lib/custom-resources");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
/**
 * This represents an Organization
 */
class Organization extends constructs_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        let org = new cr.AwsCustomResource(this, "orgCustomResource", {
            onCreate: {
                service: 'Organizations',
                action: 'createOrganization',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('Organization.Id'),
                region: 'us-east-1' //AWS Organizations API are only available in us-east-1 for root actions
            },
            onUpdate: {
                service: 'Organizations',
                action: 'describeOrganization',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('Organization.Id'),
                region: 'us-east-1' //AWS Organizations API are only available in us-east-1 for root actions
            },
            onDelete: {
                service: 'Organizations',
                action: 'deleteOrganization',
                region: 'us-east-1' //AWS Organizations API are only available in us-east-1 for root actions
            },
            installLatestAwsSdk: false,
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
        /*the lambda needs to have the iam:CreateServiceLinkedRole permission so that the AWS Organizations service can create
        Service Linked Role on its behalf
        */
        org.grantPrincipal.addToPrincipalPolicy(aws_iam_1.PolicyStatement.fromJson({
            "Sid": "CreateServiceLinkedRoleStatement",
            "Effect": "Allow",
            "Action": "iam:CreateServiceLinkedRole",
            "Resource": "arn:aws:iam::*:role/*",
        }));
        this.id = org.getResponseField('Organization.Id');
        let root = new cr.AwsCustomResource(this, "RootCustomResource", {
            onCreate: {
                service: 'Organizations',
                action: 'listRoots',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('Roots.0.Id'),
                region: 'us-east-1',
            },
            onUpdate: {
                service: 'Organizations',
                action: 'listRoots',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('Roots.0.Id'),
                region: 'us-east-1',
            },
            onDelete: {
                service: 'Organizations',
                action: 'listRoots',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('Roots.0.Id'),
                region: 'us-east-1',
            },
            installLatestAwsSdk: false,
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
        // Enabling SSM AWS Service access to be able to register delegated adminstrator
        const enableSSMAWSServiceAccess = this.enableAWSServiceAccess('ssm.amazonaws.com');
        const enableMultiAccountsSetupAWSServiceAccess = this.enableAWSServiceAccess('config-multiaccountsetup.amazonaws.com');
        enableMultiAccountsSetupAWSServiceAccess.node.addDependency(org);
        enableSSMAWSServiceAccess.node.addDependency(enableMultiAccountsSetupAWSServiceAccess);
        //adding an explicit dependency as CloudFormation won't infer that calling listRoots must be done only when Organization creation is finished as there is no implicit dependency between the
        //2 custom resources
        root.node.addDependency(org);
        this.rootId = root.getResponseField("Roots.0.Id");
    }
    enableAWSServiceAccess(principal) {
        const resourceName = principal === 'ssm.amazonaws.com' ? "EnableSSMAWSServiceAccess" : "EnableMultiAccountsSetup";
        return new cr.AwsCustomResource(this, resourceName, {
            onCreate: {
                service: 'Organizations',
                action: 'enableAWSServiceAccess',
                physicalResourceId: cr.PhysicalResourceId.of(resourceName),
                region: 'us-east-1',
                parameters: {
                    ServicePrincipal: principal,
                }
            },
            onDelete: {
                service: 'Organizations',
                action: 'disableAWSServiceAccess',
                region: 'us-east-1',
                parameters: {
                    ServicePrincipal: principal,
                }
            },
            installLatestAwsSdk: false,
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
    }
}
exports.Organization = Organization;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnYW5pemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3JnYW5pemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTs7O0FBRUYsMkNBQXFDO0FBQ3JDLG1EQUFtRDtBQUNuRCxpREFBcUQ7QUFFckQ7O0dBRUc7QUFDSCxNQUFhLFlBQWEsU0FBUSxzQkFBUztJQVl2QyxZQUFZLEtBQWdCLEVBQUUsRUFBVTtRQUNwQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRWhCLElBQUksR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFDbkMsbUJBQW1CLEVBQ25CO1lBQ0UsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxlQUFlO2dCQUN4QixNQUFNLEVBQUUsb0JBQW9CO2dCQUM1QixrQkFBa0IsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO2dCQUN6RSxNQUFNLEVBQUUsV0FBVyxDQUFDLHdFQUF3RTthQUM3RjtZQUNELFFBQVEsRUFBRTtnQkFDUixPQUFPLEVBQUUsZUFBZTtnQkFDeEIsTUFBTSxFQUFFLHNCQUFzQjtnQkFDOUIsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDekUsTUFBTSxFQUFFLFdBQVcsQ0FBQyx3RUFBd0U7YUFDN0Y7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLE1BQU0sRUFBRSxvQkFBb0I7Z0JBQzVCLE1BQU0sRUFBRSxXQUFXLENBQUMsd0VBQXdFO2FBQzdGO1lBQ0QsbUJBQW1CLEVBQUUsS0FBSztZQUMxQixNQUFNLEVBQUUsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FDN0M7Z0JBQ0UsU0FBUyxFQUFFLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZO2FBQ25ELENBQ0Y7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YUFDRjtZQUNELG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsTUFBTSxFQUFFLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQzdDO2dCQUNFLFNBQVMsRUFBRSxFQUFFLENBQUMsdUJBQXVCLENBQUMsWUFBWTthQUNuRCxDQUNGO1NBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBdElELG9DQXNJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge0NvbnN0cnVjdH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjciBmcm9tICdhd3MtY2RrLWxpYi9jdXN0b20tcmVzb3VyY2VzJztcbmltcG9ydCB7UG9saWN5U3RhdGVtZW50fSAgZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5cbi8qKlxuICogVGhpcyByZXByZXNlbnRzIGFuIE9yZ2FuaXphdGlvblxuICovXG5leHBvcnQgY2xhc3MgT3JnYW5pemF0aW9uIGV4dGVuZHMgQ29uc3RydWN0IHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBJZCBvZiB0aGUgT3JnYW5pemF0aW9uXG4gICAgICovXG4gICAgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRoZSBJZCBvZiB0aGUgcm9vdCBPcmdhbml6YXRpb25hbCBVbml0IG9mIHRoZSBPcmdhbml6YXRpb25cbiAgICAgKi9cbiAgICByZWFkb25seSByb290SWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKVxuXG4gICAgICAgIGxldCBvcmcgPSBuZXcgY3IuQXdzQ3VzdG9tUmVzb3VyY2UodGhpcyxcbiAgICAgICAgICAgIFwib3JnQ3VzdG9tUmVzb3VyY2VcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgb25DcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnY3JlYXRlT3JnYW5pemF0aW9uJyxcbiAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoJ09yZ2FuaXphdGlvbi5JZCcpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScgLy9BV1MgT3JnYW5pemF0aW9ucyBBUEkgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHVzLWVhc3QtMSBmb3Igcm9vdCBhY3Rpb25zXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9uVXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgc2VydmljZTogJ09yZ2FuaXphdGlvbnMnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2Rlc2NyaWJlT3JnYW5pemF0aW9uJyxcbiAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoJ09yZ2FuaXphdGlvbi5JZCcpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScgLy9BV1MgT3JnYW5pemF0aW9ucyBBUEkgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHVzLWVhc3QtMSBmb3Igcm9vdCBhY3Rpb25zXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9uRGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgc2VydmljZTogJ09yZ2FuaXphdGlvbnMnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2RlbGV0ZU9yZ2FuaXphdGlvbicsXG4gICAgICAgICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJyAvL0FXUyBPcmdhbml6YXRpb25zIEFQSSBhcmUgb25seSBhdmFpbGFibGUgaW4gdXMtZWFzdC0xIGZvciByb290IGFjdGlvbnNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaW5zdGFsbExhdGVzdEF3c1NkazogZmFsc2UsXG4gICAgICAgICAgICAgIHBvbGljeTogY3IuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuZnJvbVNka0NhbGxzKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHJlc291cmNlczogY3IuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuQU5ZX1JFU09VUkNFXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICk7XG5cbiAgICAgICAgICAgLyp0aGUgbGFtYmRhIG5lZWRzIHRvIGhhdmUgdGhlIGlhbTpDcmVhdGVTZXJ2aWNlTGlua2VkUm9sZSBwZXJtaXNzaW9uIHNvIHRoYXQgdGhlIEFXUyBPcmdhbml6YXRpb25zIHNlcnZpY2UgY2FuIGNyZWF0ZVxuICAgICAgICAgICBTZXJ2aWNlIExpbmtlZCBSb2xlIG9uIGl0cyBiZWhhbGZcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAgb3JnLmdyYW50UHJpbmNpcGFsLmFkZFRvUHJpbmNpcGFsUG9saWN5KFBvbGljeVN0YXRlbWVudC5mcm9tSnNvbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJTaWRcIjogXCJDcmVhdGVTZXJ2aWNlTGlua2VkUm9sZVN0YXRlbWVudFwiLFxuICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFwiaWFtOkNyZWF0ZVNlcnZpY2VMaW5rZWRSb2xlXCIsXG4gICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCJhcm46YXdzOmlhbTo6Kjpyb2xlLypcIixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIHRoaXMuaWQgPSBvcmcuZ2V0UmVzcG9uc2VGaWVsZCgnT3JnYW5pemF0aW9uLklkJyk7XG5cbiAgICAgICAgICBsZXQgcm9vdCA9IG5ldyBjci5Bd3NDdXN0b21SZXNvdXJjZSh0aGlzLFxuICAgICAgICAgICAgXCJSb290Q3VzdG9tUmVzb3VyY2VcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgb25DcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbGlzdFJvb3RzJyxcbiAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoJ1Jvb3RzLjAuSWQnKSxcbiAgICAgICAgICAgICAgICByZWdpb246ICd1cy1lYXN0LTEnLCAvL0FXUyBPcmdhbml6YXRpb25zIEFQSSBhcmUgb25seSBhdmFpbGFibGUgaW4gdXMtZWFzdC0xIGZvciByb290IGFjdGlvbnNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb25VcGRhdGU6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbGlzdFJvb3RzJyxcbiAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoJ1Jvb3RzLjAuSWQnKSxcbiAgICAgICAgICAgICAgICByZWdpb246ICd1cy1lYXN0LTEnLCAvL0FXUyBPcmdhbml6YXRpb25zIEFQSSBhcmUgb25seSBhdmFpbGFibGUgaW4gdXMtZWFzdC0xIGZvciByb290IGFjdGlvbnNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb25EZWxldGU6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbGlzdFJvb3RzJyxcbiAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoJ1Jvb3RzLjAuSWQnKSxcbiAgICAgICAgICAgICAgICByZWdpb246ICd1cy1lYXN0LTEnLCAvL0FXUyBPcmdhbml6YXRpb25zIEFQSSBhcmUgb25seSBhdmFpbGFibGUgaW4gdXMtZWFzdC0xIGZvciByb290IGFjdGlvbnNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaW5zdGFsbExhdGVzdEF3c1NkazogZmFsc2UsXG4gICAgICAgICAgICAgIHBvbGljeTogY3IuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuZnJvbVNka0NhbGxzKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHJlc291cmNlczogY3IuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuQU5ZX1JFU09VUkNFXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIEVuYWJsaW5nIFNTTSBBV1MgU2VydmljZSBhY2Nlc3MgdG8gYmUgYWJsZSB0byByZWdpc3RlciBkZWxlZ2F0ZWQgYWRtaW5zdHJhdG9yXG4gICAgICAgICAgY29uc3QgZW5hYmxlU1NNQVdTU2VydmljZUFjY2VzcyA9IHRoaXMuZW5hYmxlQVdTU2VydmljZUFjY2Vzcygnc3NtLmFtYXpvbmF3cy5jb20nKTtcbiAgICAgICAgICBjb25zdCBlbmFibGVNdWx0aUFjY291bnRzU2V0dXBBV1NTZXJ2aWNlQWNjZXNzID0gdGhpcy5lbmFibGVBV1NTZXJ2aWNlQWNjZXNzKCdjb25maWctbXVsdGlhY2NvdW50c2V0dXAuYW1hem9uYXdzLmNvbScpO1xuXG4gICAgICAgICAgZW5hYmxlTXVsdGlBY2NvdW50c1NldHVwQVdTU2VydmljZUFjY2Vzcy5ub2RlLmFkZERlcGVuZGVuY3kob3JnKTtcbiAgICAgICAgICBlbmFibGVTU01BV1NTZXJ2aWNlQWNjZXNzLm5vZGUuYWRkRGVwZW5kZW5jeShlbmFibGVNdWx0aUFjY291bnRzU2V0dXBBV1NTZXJ2aWNlQWNjZXNzKTtcblxuICAgICAgICAgIC8vYWRkaW5nIGFuIGV4cGxpY2l0IGRlcGVuZGVuY3kgYXMgQ2xvdWRGb3JtYXRpb24gd29uJ3QgaW5mZXIgdGhhdCBjYWxsaW5nIGxpc3RSb290cyBtdXN0IGJlIGRvbmUgb25seSB3aGVuIE9yZ2FuaXphdGlvbiBjcmVhdGlvbiBpcyBmaW5pc2hlZCBhcyB0aGVyZSBpcyBubyBpbXBsaWNpdCBkZXBlbmRlbmN5IGJldHdlZW4gdGhlXG4gICAgICAgICAgLy8yIGN1c3RvbSByZXNvdXJjZXNcbiAgICAgICAgICByb290Lm5vZGUuYWRkRGVwZW5kZW5jeShvcmcpO1xuXG4gICAgICAgICAgdGhpcy5yb290SWQgPSByb290LmdldFJlc3BvbnNlRmllbGQoXCJSb290cy4wLklkXCIpO1xuICAgIH1cblxuICBwcml2YXRlIGVuYWJsZUFXU1NlcnZpY2VBY2Nlc3MocHJpbmNpcGFsOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXNvdXJjZU5hbWUgPSBwcmluY2lwYWw9PT0nc3NtLmFtYXpvbmF3cy5jb20nP1wiRW5hYmxlU1NNQVdTU2VydmljZUFjY2Vzc1wiOlwiRW5hYmxlTXVsdGlBY2NvdW50c1NldHVwXCI7XG5cbiAgICByZXR1cm4gbmV3IGNyLkF3c0N1c3RvbVJlc291cmNlKHRoaXMsXG4gICAgICByZXNvdXJjZU5hbWUsXG4gICAgICB7XG4gICAgICAgIG9uQ3JlYXRlOiB7XG4gICAgICAgICAgc2VydmljZTogJ09yZ2FuaXphdGlvbnMnLFxuICAgICAgICAgIGFjdGlvbjogJ2VuYWJsZUFXU1NlcnZpY2VBY2Nlc3MnLFxuICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogY3IuUGh5c2ljYWxSZXNvdXJjZUlkLm9mKHJlc291cmNlTmFtZSksXG4gICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICBTZXJ2aWNlUHJpbmNpcGFsOiBwcmluY2lwYWwsXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvbkRlbGV0ZToge1xuICAgICAgICAgIHNlcnZpY2U6ICdPcmdhbml6YXRpb25zJyxcbiAgICAgICAgICBhY3Rpb246ICdkaXNhYmxlQVdTU2VydmljZUFjY2VzcycsXG4gICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICBTZXJ2aWNlUHJpbmNpcGFsOiBwcmluY2lwYWwsXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnN0YWxsTGF0ZXN0QXdzU2RrOiBmYWxzZSxcbiAgICAgICAgcG9saWN5OiBjci5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoXG4gICAgICAgICAge1xuICAgICAgICAgICAgcmVzb3VyY2VzOiBjci5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0VcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cbiAgICApO1xuICB9XG59Il19