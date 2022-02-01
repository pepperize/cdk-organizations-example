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
require("@aws-cdk/assert/jest");
const lib_1 = require("../lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const package_json_1 = require("../package.json");
const awsOrganizationsStackProps = {
    email: "test@test.com",
    nestedOU: [
        {
            name: "SDLC",
            accounts: [
                {
                    name: "Account1",
                    stageName: 'theStage',
                },
                {
                    name: "Account2"
                }
            ]
        },
        {
            name: "Prod",
            accounts: [
                {
                    name: "Account3"
                }
            ]
        }
    ]
};
test("when I define 1 OU with 2 accounts and 1 OU with 1 account then the stack should have 2 OU constructs and 3 account constructs", () => {
    const stack = new aws_cdk_lib_1.Stack();
    let awsOrganizationsStackProps;
    awsOrganizationsStackProps = {
        email: "test@test.com",
        nestedOU: [
            {
                name: 'SDLC',
                accounts: [
                    {
                        name: 'Account1',
                        type: lib_1.AccountType.PLAYGROUND,
                        hostedServices: ['app1', 'app2']
                    },
                    {
                        name: 'Account2',
                        type: lib_1.AccountType.STAGE,
                        stageOrder: 1,
                        stageName: 'stage1',
                        hostedServices: ['app1', 'app2']
                    }
                ]
            },
            {
                name: 'Prod',
                accounts: [
                    {
                        name: 'Account3',
                        type: lib_1.AccountType.STAGE,
                        stageOrder: 2,
                        stageName: 'stage2',
                        hostedServices: ['app1', 'app2']
                    }
                ]
            }
        ]
    };
    const awsOrganizationsStack = new lib_1.AwsOrganizationsStack(stack, "AWSOrganizationsStack", awsOrganizationsStackProps);
    expect(awsOrganizationsStack.templateOptions.description).toMatch(`(version:${package_json_1.version})`);
    expect(awsOrganizationsStack).toHaveResource("Custom::AWS", {
        "Create": JSON.stringify({
            "service": "Organizations",
            "action": "createOrganization",
            "physicalResourceId": {
                "responsePath": "Organization.Id"
            },
            "region": "us-east-1"
        }),
        "Delete": JSON.stringify({
            "service": "Organizations",
            "action": "deleteOrganization",
            "region": "us-east-1"
        })
    });
    expect(awsOrganizationsStack).toHaveResource("Custom::AWS", {
        "Create": {
            "Fn::Join": [
                "",
                [
                    "{\"service\":\"Organizations\",\"action\":\"createOrganizationalUnit\",\"physicalResourceId\":{\"responsePath\":\"OrganizationalUnit.Id\"},\"region\":\"us-east-1\",\"parameters\":{\"Name\":\"Prod\",\"ParentId\":\"",
                    {
                        "Fn::GetAtt": [
                            "OrganizationRootCustomResource9416950B",
                            "Roots.0.Id"
                        ]
                    },
                    "\"}}"
                ]
            ]
        },
    });
    expect(awsOrganizationsStack).toHaveResource("Custom::AccountCreation", {
        "Email": {
            "Fn::Join": [
                "",
                [
                    "test+Account1-",
                    {
                        "Ref": "AWS::AccountId"
                    },
                    "@test.com"
                ]
            ]
        },
        "AccountName": "Account1",
        "AccountType": lib_1.AccountType.PLAYGROUND,
        "HostedServices": "app1:app2"
    });
    expect(awsOrganizationsStack).toHaveResource("Custom::AccountCreation", {
        "Email": {
            "Fn::Join": [
                "",
                [
                    "test+Account2-",
                    {
                        "Ref": "AWS::AccountId"
                    },
                    "@test.com"
                ]
            ]
        },
        "AccountName": "Account2",
        "AccountType": lib_1.AccountType.STAGE,
        "StageName": "stage1",
        "StageOrder": "1",
        "HostedServices": "app1:app2"
    });
    expect(awsOrganizationsStack).toHaveResource("Custom::AWS", {
        "Create": {
            "Fn::Join": [
                "",
                [
                    "{\"service\":\"Organizations\",\"action\":\"createOrganizationalUnit\",\"physicalResourceId\":{\"responsePath\":\"OrganizationalUnit.Id\"},\"region\":\"us-east-1\",\"parameters\":{\"Name\":\"Prod\",\"ParentId\":\"",
                    {
                        "Fn::GetAtt": [
                            "OrganizationRootCustomResource9416950B",
                            "Roots.0.Id"
                        ]
                    },
                    "\"}}"
                ]
            ]
        }
    });
    expect(awsOrganizationsStack).toHaveResource("Custom::AccountCreation", {
        "Email": {
            "Fn::Join": [
                "",
                [
                    "test+Account3-",
                    {
                        "Ref": "AWS::AccountId"
                    },
                    "@test.com"
                ]
            ]
        },
        "AccountName": "Account3",
        "AccountType": lib_1.AccountType.STAGE,
        "StageName": "stage2",
        "StageOrder": "2",
        "HostedServices": "app1:app2"
    });
});
test("should create root domain zone and stage based domain if rootHostedZoneDNSName is specified ", () => {
    const awsOrganizationsStack = new lib_1.AwsOrganizationsStack(new aws_cdk_lib_1.Stack(), "AWSOrganizationsStack", {
        ...awsOrganizationsStackProps,
        rootHostedZoneDNSName: "yourdomain.com"
    });
    expect(awsOrganizationsStack).toHaveResource("AWS::Route53::HostedZone", {
        Name: "yourdomain.com."
    });
    expect(awsOrganizationsStack).toCountResources("AWS::Route53::RecordSet", 3);
    expect(awsOrganizationsStack).toCountResources("AWS::Route53::HostedZone", 4);
    expect(awsOrganizationsStack).toHaveResource("AWS::Route53::RecordSet", {
        Name: "thestage.yourdomain.com.",
        Type: "NS"
    });
    expect(awsOrganizationsStack).toHaveResource("AWS::Route53::RecordSet", {
        Name: "account2.yourdomain.com.",
        Type: "NS"
    });
    expect(awsOrganizationsStack).toHaveResource("AWS::Route53::RecordSet", {
        Name: "account3.yourdomain.com.",
        Type: "NS"
    });
    expect(awsOrganizationsStack).toHaveResource("AWS::Route53::HostedZone", {
        Name: "account3.yourdomain.com."
    });
    expect(awsOrganizationsStack).toHaveResource("AWS::IAM::Role", {
        RoleName: "account2.yourdomain.com-dns-update"
    });
});
test("should not create any zone if no domain is provided", () => {
    const awsOrganizationsStack = new lib_1.AwsOrganizationsStack(new aws_cdk_lib_1.Stack(), "AWSOrganizationsStack", {
        ...awsOrganizationsStackProps,
    });
    expect(awsOrganizationsStack).toCountResources("AWS::Route53::HostedZone", 0);
});
test("should have have email validation stack with forceEmailVerification set to true", () => {
    const awsOrganizationsStack = new lib_1.AwsOrganizationsStack(new aws_cdk_lib_1.Stack(), "AWSOrganizationsStack", { ...awsOrganizationsStackProps, forceEmailVerification: true });
    expect(awsOrganizationsStack).toHaveResource("Custom::EmailValidation");
});
test("should not have have email validation stack with forceEmailVerification set to false", () => {
    const awsOrganizationsStack = new lib_1.AwsOrganizationsStack(new aws_cdk_lib_1.Stack(), "AWSOrganizationsStack", { ...awsOrganizationsStackProps, forceEmailVerification: false });
    expect(awsOrganizationsStack).not.toHaveResource("Custom::EmailValidation");
});
test("should have have email validation stack by default without setting forceEmailVerification", () => {
    const awsOrganizationsStack = new lib_1.AwsOrganizationsStack(new aws_cdk_lib_1.Stack(), "AWSOrganizationsStack", awsOrganizationsStackProps);
    expect(awsOrganizationsStack).toHaveResource("Custom::EmailValidation");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLW9yZ2FuaXphdGlvbnMtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF3cy1vcmdhbml6YXRpb25zLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7OztFQWNFOztBQUVGLGdDQUE4QjtBQUM5QixnQ0FBd0Y7QUFDeEYsNkNBQW9DO0FBQ3BDLGtEQUF3QztBQUV4QyxNQUFNLDBCQUEwQixHQUErQjtJQUM3RCxLQUFLLEVBQUUsZUFBZTtJQUN0QixRQUFRLEVBQUU7UUFDUjtZQUNFLElBQUksRUFBRSxNQUFNO1lBQ1osUUFBUSxFQUFFO2dCQUNSO29CQUNFLElBQUksRUFBRSxVQUFVO29CQUNoQixTQUFTLEVBQUUsVUFBVTtpQkFDdEI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFVBQVU7aUJBQ2pCO2FBQ0Y7U0FDRjtRQUNEO1lBQ0UsSUFBSSxFQUFFLE1BQU07WUFDWixRQUFRLEVBQUU7Z0JBQ1I7b0JBQ0UsSUFBSSxFQUFFLFVBQVU7aUJBQ2pCO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQztBQUVGLElBQUksQ0FBQyxnSUFBZ0ksRUFBRSxHQUFHLEVBQUU7SUFFeEksTUFBTSxLQUFLLEdBQUcsSUFBSSxtQkFBSyxFQUFFLENBQUM7SUFDMUIsSUFBSSwwQkFBc0QsQ0FBQztJQUMzRCwwQkFBMEIsR0FBRztRQUN6QixLQUFLLEVBQUUsZUFBZTtRQUN0QixRQUFRLEVBQUU7WUFDTjtnQkFDSSxJQUFJLEVBQUUsTUFBTTtnQkFDWixRQUFRLEVBQUU7b0JBQ047d0JBQ0ksSUFBSSxFQUFFLFVBQVU7d0JBQ2hCLElBQUksRUFBRSxpQkFBVyxDQUFDLFVBQVU7d0JBQzVCLGNBQWMsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7cUJBQ25DO29CQUNEO3dCQUNJLElBQUksRUFBRSxVQUFVO3dCQUNoQixJQUFJLEVBQUUsaUJBQVcsQ0FBQyxLQUFLO3dCQUN2QixVQUFVLEVBQUUs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LENBQUMsc0ZBQXNGLEVBQUUsR0FBRyxFQUFFO0lBRWhHLE1BQU0scUJBQXFCLEdBQUcsSUFBSSwyQkFBcUIsQ0FDckQsSUFBSSxtQkFBSyxFQUFFLEVBQ1gsdUJBQXVCLEVBQ3ZCLEVBQUMsR0FBRywwQkFBMEIsRUFBRSxzQkFBc0IsRUFBRSxLQUFLLEVBQUMsQ0FDL0QsQ0FBQztJQUVGLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUM5RSxDQUFDLENBQUMsQ0FBQTtBQUVGLElBQUksQ0FBQywyRkFBMkYsRUFBRSxHQUFHLEVBQUU7SUFDckcsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLDJCQUFxQixDQUNyRCxJQUFJLG1CQUFLLEVBQUUsRUFDWCx1QkFBdUIsRUFDdkIsMEJBQTBCLENBQzNCLENBQUM7SUFFRixNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgXCJAYXdzLWNkay9hc3NlcnQvamVzdFwiO1xuaW1wb3J0IHsgQWNjb3VudFR5cGUsIEF3c09yZ2FuaXphdGlvbnNTdGFjaywgQXdzT3JnYW5pemF0aW9uc1N0YWNrUHJvcHMgfSBmcm9tIFwiLi4vbGliXCI7XG5pbXBvcnQgeyBTdGFjayB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHt2ZXJzaW9ufSBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG5jb25zdCBhd3NPcmdhbml6YXRpb25zU3RhY2tQcm9wczogQXdzT3JnYW5pemF0aW9uc1N0YWNrUHJvcHMgPSB7XG4gIGVtYWlsOiBcInRlc3RAdGVzdC5jb21cIixcbiAgbmVzdGVkT1U6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIlNETENcIixcbiAgICAgIGFjY291bnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIkFjY291bnQxXCIsXG4gICAgICAgICAgc3RhZ2VOYW1lOiAndGhlU3RhZ2UnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJBY2NvdW50MlwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFwiUHJvZFwiLFxuICAgICAgYWNjb3VudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwiQWNjb3VudDNcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdXG59O1xuXG50ZXN0KFwid2hlbiBJIGRlZmluZSAxIE9VIHdpdGggMiBhY2NvdW50cyBhbmQgMSBPVSB3aXRoIDEgYWNjb3VudCB0aGVuIHRoZSBzdGFjayBzaG91bGQgaGF2ZSAyIE9VIGNvbnN0cnVjdHMgYW5kIDMgYWNjb3VudCBjb25zdHJ1Y3RzXCIsICgpID0+IHtcblxuICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gICAgbGV0IGF3c09yZ2FuaXphdGlvbnNTdGFja1Byb3BzOiBBd3NPcmdhbml6YXRpb25zU3RhY2tQcm9wcztcbiAgICBhd3NPcmdhbml6YXRpb25zU3RhY2tQcm9wcyA9IHtcbiAgICAgICAgZW1haWw6IFwidGVzdEB0ZXN0LmNvbVwiLFxuICAgICAgICBuZXN0ZWRPVTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTRExDJyxcbiAgICAgICAgICAgICAgICBhY2NvdW50czogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQWNjb3VudDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogQWNjb3VudFR5cGUuUExBWUdST1VORCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RlZFNlcnZpY2VzOiBbJ2FwcDEnLCAnYXBwMiddXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBY2NvdW50MicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBBY2NvdW50VHlwZS5TVEFHRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlT3JkZXI6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdzdGFnZTEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9zdGVkU2VydmljZXM6IFsnYXBwMScsICdhcHAyJ11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ1Byb2QnLFxuICAgICAgICAgICAgICAgIGFjY291bnRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBY2NvdW50MycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBBY2NvdW50VHlwZS5TVEFHRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlT3JkZXI6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdzdGFnZTInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9zdGVkU2VydmljZXM6IFsnYXBwMScsICdhcHAyJ11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cblxuICAgIGNvbnN0IGF3c09yZ2FuaXphdGlvbnNTdGFjayA9IG5ldyBBd3NPcmdhbml6YXRpb25zU3RhY2soc3RhY2ssIFwiQVdTT3JnYW5pemF0aW9uc1N0YWNrXCIsIGF3c09yZ2FuaXphdGlvbnNTdGFja1Byb3BzKTtcblxuICAgIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2sudGVtcGxhdGVPcHRpb25zLmRlc2NyaXB0aW9uKS50b01hdGNoKGAodmVyc2lvbjoke3ZlcnNpb259KWApO1xuXG4gICAgZXhwZWN0KGF3c09yZ2FuaXphdGlvbnNTdGFjaykudG9IYXZlUmVzb3VyY2UoXCJDdXN0b206OkFXU1wiLCB7XG4gICAgICAgIFwiQ3JlYXRlXCI6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIFwic2VydmljZVwiOiBcIk9yZ2FuaXphdGlvbnNcIixcbiAgICAgICAgICAgIFwiYWN0aW9uXCI6IFwiY3JlYXRlT3JnYW5pemF0aW9uXCIsXG4gICAgICAgICAgICBcInBoeXNpY2FsUmVzb3VyY2VJZFwiOiB7XG4gICAgICAgICAgICAgIFwicmVzcG9uc2VQYXRoXCI6IFwiT3JnYW5pemF0aW9uLklkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlZ2lvblwiOiBcInVzLWVhc3QtMVwiXG4gICAgICAgICAgfSksXG4gICAgICAgICAgXCJEZWxldGVcIjogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgXCJzZXJ2aWNlXCI6IFwiT3JnYW5pemF0aW9uc1wiLFxuICAgICAgICAgICAgXCJhY3Rpb25cIjogXCJkZWxldGVPcmdhbml6YXRpb25cIixcbiAgICAgICAgICAgIFwicmVnaW9uXCI6IFwidXMtZWFzdC0xXCJcbiAgICAgICAgICB9KVxuICAgIH0pO1xuXG5cbiAgICBleHBlY3QoYXdzT3JnYW5pemF0aW9uc1N0YWNrKS50b0hhdmVSZXNvdXJjZShcIkN1c3RvbTo6QVdTXCIsIHtcbiAgICAgICAgXCJDcmVhdGVcIjoge1xuICAgICAgICAgIFwiRm46OkpvaW5cIjogW1xuICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgXCJ7XFxcInNlcnZpY2VcXFwiOlxcXCJPcmdhbml6YXRpb25zXFxcIixcXFwiYWN0aW9uXFxcIjpcXFwiY3JlYXRlT3JnYW5pemF0aW9uYWxVbml0XFxcIixcXFwicGh5c2ljYWxSZXNvdXJjZUlkXFxcIjp7XFxcInJlc3BvbnNlUGF0aFxcXCI6XFxcIk9yZ2FuaXphdGlvbmFsVW5pdC5JZFxcXCJ9LFxcXCJyZWdpb25cXFwiOlxcXCJ1cy1lYXN0LTFcXFwiLFxcXCJwYXJhbWV0ZXJzXFxcIjp7XFxcIk5hbWVcXFwiOlxcXCJQcm9kXFxcIixcXFwiUGFyZW50SWRcXFwiOlxcXCJcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJGbjo6R2V0QXR0XCI6IFtcbiAgICAgICAgICAgICAgICBcIk9yZ2FuaXphdGlvblJvb3RDdXN0b21SZXNvdXJjZTk0MTY5NTBCXCIsXG4gICAgICAgICAgICAgICAgXCJSb290cy4wLklkXCJcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiXFxcIn19XCJcbiAgICAgICAgICBdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBleHBlY3QoYXdzT3JnYW5pemF0aW9uc1N0YWNrKS50b0hhdmVSZXNvdXJjZShcIkN1c3RvbTo6QWNjb3VudENyZWF0aW9uXCIsIHtcbiAgICAgICAgXCJFbWFpbFwiOiB7XG4gICAgICAgICAgXCJGbjo6Sm9pblwiOiBbXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcInRlc3QrQWNjb3VudDEtXCIsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlJlZlwiOiBcIkFXUzo6QWNjb3VudElkXCJcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXCJAdGVzdC5jb21cIlxuICAgICAgICAgICAgXVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgXCJBY2NvdW50TmFtZVwiOiBcIkFjY291bnQxXCIsXG4gICAgICAgIFwiQWNjb3VudFR5cGVcIjogQWNjb3VudFR5cGUuUExBWUdST1VORCxcbiAgICAgICAgXCJIb3N0ZWRTZXJ2aWNlc1wiOiBcImFwcDE6YXBwMlwiXG4gICAgfSk7XG5cbiAgICBleHBlY3QoYXdzT3JnYW5pemF0aW9uc1N0YWNrKS50b0hhdmVSZXNvdXJjZShcIkN1c3RvbTo6QWNjb3VudENyZWF0aW9uXCIsIHtcbiAgICAgICAgXCJFbWFpbFwiOiB7XG4gICAgICAgICAgICBcIkZuOjpKb2luXCI6IFtcbiAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwidGVzdCtBY2NvdW50Mi1cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcIlJlZlwiOiBcIkFXUzo6QWNjb3VudElkXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiQHRlc3QuY29tXCJcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJBY2NvdW50TmFtZVwiOiBcIkFjY291bnQyXCIsXG4gICAgICAgICAgXCJBY2NvdW50VHlwZVwiOiBBY2NvdW50VHlwZS5TVEFHRSxcbiAgICAgICAgICBcIlN0YWdlTmFtZVwiOiBcInN0YWdlMVwiLFxuICAgICAgICAgIFwiU3RhZ2VPcmRlclwiOiBcIjFcIixcbiAgICAgICAgICBcIkhvc3RlZFNlcnZpY2VzXCI6IFwiYXBwMTphcHAyXCJcbiAgICB9KTtcblxuICAgIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQ3VzdG9tOjpBV1NcIiwge1xuICAgICAgICBcIkNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJGbjo6Sm9pblwiOiBbXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcIntcXFwic2VydmljZVxcXCI6XFxcIk9yZ2FuaXphdGlvbnNcXFwiLFxcXCJhY3Rpb25cXFwiOlxcXCJjcmVhdGVPcmdhbml6YXRpb25hbFVuaXRcXFwiLFxcXCJwaHlzaWNhbFJlc291cmNlSWRcXFwiOntcXFwicmVzcG9uc2VQYXRoXFxcIjpcXFwiT3JnYW5pemF0aW9uYWxVbml0LklkXFxcIn0sXFxcInJlZ2lvblxcXCI6XFxcInVzLWVhc3QtMVxcXCIsXFxcInBhcmFtZXRlcnNcXFwiOntcXFwiTmFtZVxcXCI6XFxcIlByb2RcXFwiLFxcXCJQYXJlbnRJZFxcXCI6XFxcIlwiLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJGbjo6R2V0QXR0XCI6IFtcbiAgICAgICAgICAgICAgICAgIFwiT3JnYW5pemF0aW9uUm9vdEN1c3RvbVJlc291cmNlOTQxNjk1MEJcIixcbiAgICAgICAgICAgICAgICAgIFwiUm9vdHMuMC5JZFwiXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBcIlxcXCJ9fVwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBlY3QoYXdzT3JnYW5pemF0aW9uc1N0YWNrKS50b0hhdmVSZXNvdXJjZShcIkN1c3RvbTo6QWNjb3VudENyZWF0aW9uXCIsIHtcbiAgICAgICAgXCJFbWFpbFwiOiB7XG4gICAgICAgICAgICBcIkZuOjpKb2luXCI6IFtcbiAgICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwidGVzdCtBY2NvdW50My1cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcIlJlZlwiOiBcIkFXUzo6QWNjb3VudElkXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwiQHRlc3QuY29tXCJcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJBY2NvdW50TmFtZVwiOiBcIkFjY291bnQzXCIsXG4gICAgICAgICAgXCJBY2NvdW50VHlwZVwiOiBBY2NvdW50VHlwZS5TVEFHRSxcbiAgICAgICAgICBcIlN0YWdlTmFtZVwiOiBcInN0YWdlMlwiLFxuICAgICAgICAgIFwiU3RhZ2VPcmRlclwiOiBcIjJcIixcbiAgICAgICAgICBcIkhvc3RlZFNlcnZpY2VzXCI6IFwiYXBwMTphcHAyXCJcbiAgICB9KTtcblxufSk7XG5cbnRlc3QoXCJzaG91bGQgY3JlYXRlIHJvb3QgZG9tYWluIHpvbmUgYW5kIHN0YWdlIGJhc2VkIGRvbWFpbiBpZiByb290SG9zdGVkWm9uZUROU05hbWUgaXMgc3BlY2lmaWVkIFwiLCAoKSA9PiB7XG4gIGNvbnN0IGF3c09yZ2FuaXphdGlvbnNTdGFjayA9IG5ldyBBd3NPcmdhbml6YXRpb25zU3RhY2soXG4gICAgbmV3IFN0YWNrKCksXG4gICAgXCJBV1NPcmdhbml6YXRpb25zU3RhY2tcIixcbiAgICB7XG4gICAgICAuLi5hd3NPcmdhbml6YXRpb25zU3RhY2tQcm9wcyxcbiAgICAgIHJvb3RIb3N0ZWRab25lRE5TTmFtZTogXCJ5b3VyZG9tYWluLmNvbVwiXG4gICAgfVxuICApO1xuXG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQVdTOjpSb3V0ZTUzOjpIb3N0ZWRab25lXCIse1xuICAgIE5hbWU6IFwieW91cmRvbWFpbi5jb20uXCJcbiAgfSk7XG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvQ291bnRSZXNvdXJjZXMoXCJBV1M6OlJvdXRlNTM6OlJlY29yZFNldFwiLDMpO1xuICBleHBlY3QoYXdzT3JnYW5pemF0aW9uc1N0YWNrKS50b0NvdW50UmVzb3VyY2VzKFwiQVdTOjpSb3V0ZTUzOjpIb3N0ZWRab25lXCIsNCk7XG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQVdTOjpSb3V0ZTUzOjpSZWNvcmRTZXRcIix7XG4gICAgTmFtZTogXCJ0aGVzdGFnZS55b3VyZG9tYWluLmNvbS5cIixcbiAgICBUeXBlOiBcIk5TXCJcbiAgfSk7XG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQVdTOjpSb3V0ZTUzOjpSZWNvcmRTZXRcIix7XG4gICAgTmFtZTogXCJhY2NvdW50Mi55b3VyZG9tYWluLmNvbS5cIixcbiAgICBUeXBlOiBcIk5TXCJcbiAgfSk7XG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQVdTOjpSb3V0ZTUzOjpSZWNvcmRTZXRcIix7XG4gICAgTmFtZTogXCJhY2NvdW50My55b3VyZG9tYWluLmNvbS5cIixcbiAgICBUeXBlOiBcIk5TXCJcbiAgfSk7XG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQVdTOjpSb3V0ZTUzOjpIb3N0ZWRab25lXCIse1xuICAgIE5hbWU6IFwiYWNjb3VudDMueW91cmRvbWFpbi5jb20uXCJcbiAgfSk7XG5cbiAgZXhwZWN0KGF3c09yZ2FuaXphdGlvbnNTdGFjaykudG9IYXZlUmVzb3VyY2UoXCJBV1M6OklBTTo6Um9sZVwiLHtcbiAgICBSb2xlTmFtZTogXCJhY2NvdW50Mi55b3VyZG9tYWluLmNvbS1kbnMtdXBkYXRlXCJcbiAgfSk7XG59KTtcblxudGVzdChcInNob3VsZCBub3QgY3JlYXRlIGFueSB6b25lIGlmIG5vIGRvbWFpbiBpcyBwcm92aWRlZFwiLCAoKSA9PiB7XG4gIGNvbnN0IGF3c09yZ2FuaXphdGlvbnNTdGFjayA9IG5ldyBBd3NPcmdhbml6YXRpb25zU3RhY2soXG4gICAgbmV3IFN0YWNrKCksXG4gICAgXCJBV1NPcmdhbml6YXRpb25zU3RhY2tcIixcbiAgICB7XG4gICAgICAuLi5hd3NPcmdhbml6YXRpb25zU3RhY2tQcm9wcyxcbiAgICB9XG4gICk7XG5cbiAgZXhwZWN0KGF3c09yZ2FuaXphdGlvbnNTdGFjaykudG9Db3VudFJlc291cmNlcyhcIkFXUzo6Um91dGU1Mzo6SG9zdGVkWm9uZVwiLDApO1xufSk7XG5cbnRlc3QoXCJzaG91bGQgaGF2ZSBoYXZlIGVtYWlsIHZhbGlkYXRpb24gc3RhY2sgd2l0aCBmb3JjZUVtYWlsVmVyaWZpY2F0aW9uIHNldCB0byB0cnVlXCIsICgpID0+IHtcblxuICBjb25zdCBhd3NPcmdhbml6YXRpb25zU3RhY2sgPSBuZXcgQXdzT3JnYW5pemF0aW9uc1N0YWNrKFxuICAgIG5ldyBTdGFjaygpLFxuICAgIFwiQVdTT3JnYW5pemF0aW9uc1N0YWNrXCIsXG4gICAgey4uLmF3c09yZ2FuaXphdGlvbnNTdGFja1Byb3BzLCBmb3JjZUVtYWlsVmVyaWZpY2F0aW9uOiB0cnVlfVxuICApO1xuXG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQ3VzdG9tOjpFbWFpbFZhbGlkYXRpb25cIik7XG59KVxuXG50ZXN0KFwic2hvdWxkIG5vdCBoYXZlIGhhdmUgZW1haWwgdmFsaWRhdGlvbiBzdGFjayB3aXRoIGZvcmNlRW1haWxWZXJpZmljYXRpb24gc2V0IHRvIGZhbHNlXCIsICgpID0+IHtcblxuICBjb25zdCBhd3NPcmdhbml6YXRpb25zU3RhY2sgPSBuZXcgQXdzT3JnYW5pemF0aW9uc1N0YWNrKFxuICAgIG5ldyBTdGFjaygpLFxuICAgIFwiQVdTT3JnYW5pemF0aW9uc1N0YWNrXCIsXG4gICAgey4uLmF3c09yZ2FuaXphdGlvbnNTdGFja1Byb3BzLCBmb3JjZUVtYWlsVmVyaWZpY2F0aW9uOiBmYWxzZX1cbiAgKTtcblxuICBleHBlY3QoYXdzT3JnYW5pemF0aW9uc1N0YWNrKS5ub3QudG9IYXZlUmVzb3VyY2UoXCJDdXN0b206OkVtYWlsVmFsaWRhdGlvblwiKTtcbn0pXG5cbnRlc3QoXCJzaG91bGQgaGF2ZSBoYXZlIGVtYWlsIHZhbGlkYXRpb24gc3RhY2sgYnkgZGVmYXVsdCB3aXRob3V0IHNldHRpbmcgZm9yY2VFbWFpbFZlcmlmaWNhdGlvblwiLCAoKSA9PiB7XG4gIGNvbnN0IGF3c09yZ2FuaXphdGlvbnNTdGFjayA9IG5ldyBBd3NPcmdhbml6YXRpb25zU3RhY2soXG4gICAgbmV3IFN0YWNrKCksXG4gICAgXCJBV1NPcmdhbml6YXRpb25zU3RhY2tcIixcbiAgICBhd3NPcmdhbml6YXRpb25zU3RhY2tQcm9wc1xuICApO1xuXG4gIGV4cGVjdChhd3NPcmdhbml6YXRpb25zU3RhY2spLnRvSGF2ZVJlc291cmNlKFwiQ3VzdG9tOjpFbWFpbFZhbGlkYXRpb25cIik7XG59KTsiXX0=