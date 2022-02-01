"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.AccountType = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
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
const constructs_1 = require("constructs");
const core = require("aws-cdk-lib");
const account_provider_1 = require("./account-provider");
const cr = require("aws-cdk-lib/custom-resources");
const ssm = require("aws-cdk-lib/aws-ssm");
var AccountType;
(function (AccountType) {
    AccountType["CICD"] = "CICD";
    AccountType["DNS"] = "DNS";
    AccountType["STAGE"] = "STAGE";
    AccountType["PLAYGROUND"] = "PLAYGROUND";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
/**
 * An AWS Account.
 */
class Account extends constructs_1.Construct {
    constructor(scope, id, accountProps) {
        var _b, _c;
        super(scope, id);
        const accountProvider = account_provider_1.AccountProvider.getOrCreate(this);
        let account = new core.CustomResource(this, `Account-${accountProps.name}`, {
            serviceToken: accountProvider.provider.serviceToken,
            resourceType: "Custom::AccountCreation",
            properties: {
                Email: accountProps.email,
                AccountName: accountProps.name,
                AccountType: accountProps.type,
                StageName: accountProps.stageName,
                StageOrder: (_b = accountProps.stageOrder) === null || _b === void 0 ? void 0 : _b.toString(),
                HostedServices: accountProps.hostedServices ? accountProps.hostedServices.join(':') : undefined
            },
        });
        let accountId = account.getAtt("AccountId").toString();
        accountProps.id = accountId;
        this.accountName = accountProps.name;
        this.accountId = accountId;
        this.accountStageName = accountProps.stageName;
        new ssm.StringParameter(this, `${accountProps.name}-AccountDetails`, {
            description: `Details of ${accountProps.name}`,
            parameterName: `/accounts/${accountProps.name}`,
            stringValue: JSON.stringify(accountProps),
        });
        if (accountProps.parentOrganizationalUnitId) {
            let parent = new cr.AwsCustomResource(this, "ListParentsCustomResource", {
                onCreate: {
                    service: "Organizations",
                    action: "listParents",
                    physicalResourceId: cr.PhysicalResourceId.fromResponse("Parents.0.Id"),
                    region: "us-east-1",
                    parameters: {
                        ChildId: accountId,
                    },
                },
                onUpdate: {
                    service: "Organizations",
                    action: "listParents",
                    physicalResourceId: cr.PhysicalResourceId.fromResponse("Parents.0.Id"),
                    region: "us-east-1",
                    parameters: {
                        ChildId: accountId,
                    },
                },
                onDelete: {
                    service: "Organizations",
                    action: "listParents",
                    physicalResourceId: cr.PhysicalResourceId.fromResponse("Parents.0.Id"),
                    region: "us-east-1",
                    parameters: {
                        ChildId: accountId,
                    },
                },
                policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                    resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
                }),
            });
            new cr.AwsCustomResource(this, "MoveAccountCustomResource", {
                onCreate: {
                    service: "Organizations",
                    action: "moveAccount",
                    physicalResourceId: cr.PhysicalResourceId.of(accountId),
                    region: "us-east-1",
                    parameters: {
                        AccountId: accountId,
                        DestinationParentId: accountProps.parentOrganizationalUnitId,
                        SourceParentId: parent.getResponseField("Parents.0.Id"),
                    },
                },
                policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                    resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
                }),
            });
            // Enabling Organizations listAccounts call for auto resolution of stages and DNS accounts Ids and Names
            if (accountProps.type === AccountType.CICD) {
                this.registerAsDelegatedAdministrator(accountId, 'ssm.amazonaws.com');
            }
            else {
                // Switching to another principal to workaround the max number of delegated administrators (which is set to 3 by default).
                const needsToBeDelegatedForDNSZOneNameResolution = (_c = this.node.tryGetContext('domain_name')) !== null && _c !== void 0 ? _c : false;
                if (needsToBeDelegatedForDNSZOneNameResolution)
                    this.registerAsDelegatedAdministrator(accountId, 'config-multiaccountsetup.amazonaws.com');
            }
        }
    }
    registerAsDelegatedAdministrator(accountId, servicePrincipal) {
        new cr.AwsCustomResource(this, "registerDelegatedAdministrator", {
            onCreate: {
                service: 'Organizations',
                action: 'registerDelegatedAdministrator',
                physicalResourceId: cr.PhysicalResourceId.of('registerDelegatedAdministrator'),
                region: 'us-east-1',
                parameters: {
                    AccountId: accountId,
                    ServicePrincipal: servicePrincipal
                }
            },
            onDelete: {
                service: 'Organizations',
                action: 'deregisterDelegatedAdministrator',
                physicalResourceId: cr.PhysicalResourceId.of('registerDelegatedAdministrator'),
                region: 'us-east-1',
                parameters: {
                    AccountId: accountId,
                    ServicePrincipal: servicePrincipal
                }
            },
            installLatestAwsSdk: false,
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
    }
}
exports.Account = Account;
_a = JSII_RTTI_SYMBOL_1;
Account[_a] = { fqn: "aws-bootstrap-kit.Account", version: "0.4.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTtBQUVGLDJDQUFxQztBQUNyQyxvQ0FBb0M7QUFDcEMseURBQXFEO0FBQ3JELG1EQUFtRDtBQUNuRCwyQ0FBMkM7QUF5QjNDLElBQVksV0FLWDtBQUxELFdBQVksV0FBVztJQUNyQiw0QkFBYSxDQUFBO0lBQ2IsMEJBQVcsQ0FBQTtJQUNYLDhCQUFlLENBQUE7SUFDZix3Q0FBeUIsQ0FBQTtBQUMzQixDQUFDLEVBTFcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFLdEI7Ozs7QUFHRCxNQUFhLE9BQVEsU0FBUSxzQkFBUztJQU1wQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLFlBQTJCOztRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sZUFBZSxHQUFHLGtDQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFELElBQUksT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FDbkMsSUFBSSxFQUNKLFdBQVcsWUFBWSxDQUFDLElBQUksRUFBRSxFQUM5QjtZQUNFLFlBQVksRUFBRSxlQUFlLENBQUMsUUFBUSxDQUFDLFlBQVk7WUFDbkQsWUFBWSxFQUFFLHlCQUF5QjtZQUN2QyxVQUFVLEVBQUU7Z0JBQ1YsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLO2dCQUN6QixXQUFXLEVBQUUsWUFBWSxDQUFDLElBQUk7Z0JBQzlCLFdBQVcsRUFBRSxZQUFZLENBQUMsSUFBSTtnQkFDOUIsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO2dCQUNqQyxVQUFVLFFBQUUsWUFBWSxDQUFDLFVBQVUsMENBQUUsUUFBUSxFQUFFO2dCQUMvQyxjQUFjLEVBQUUsWUFBWSxDQUFDLGNBQWMsQ0FBQSxDQUFDLENBQUEsWUFBWSxDQUFD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QzdDO2dCQUNFLFNBQVMsRUFBRSxFQUFFLENBQUMsdUJBQXVCLENBQUMsWUFBWTthQUNuRCxDQUNGO1NBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQzs7QUFuSkgsMEJBb0pDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBBY2NvdW50UHJvdmlkZXIgfSBmcm9tIFwiLi9hY2NvdW50LXByb3ZpZGVyXCI7XG5pbXBvcnQgKiBhcyBjciBmcm9tIFwiYXdzLWNkay1saWIvY3VzdG9tLXJlc291cmNlc1wiO1xuaW1wb3J0ICogYXMgc3NtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc3NtXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBJQWNjb3VudFByb3BzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIGVtYWlsOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBuYW1lOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgdHlwZT86IEFjY291bnRUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgc3RhZ2VOYW1lPzogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHN0YWdlT3JkZXI/OiBudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIGhvc3RlZFNlcnZpY2VzPzogc3RyaW5nW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHBhcmVudE9yZ2FuaXphdGlvbmFsVW5pdElkPzogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcGFyZW50T3JnYW5pemF0aW9uYWxVbml0TmFtZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBpZD86IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gQWNjb3VudFR5cGUge1xuICBDSUNEID0gXCJDSUNEXCIsXG4gIEROUyA9IFwiRE5TXCIsXG4gIFNUQUdFID0gXCJTVEFHRVwiLFxuICBQTEFZR1JPVU5EID0gXCJQTEFZR1JPVU5EXCJcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIEFjY291bnQgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGFjY291bnROYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFjY291bnRJZDogc3RyaW5nO1xuICByZWFkb25seSBhY2NvdW50U3RhZ2VOYW1lPzogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIGFjY291bnRQcm9wczogSUFjY291bnRQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCBhY2NvdW50UHJvdmlkZXIgPSBBY2NvdW50UHJvdmlkZXIuZ2V0T3JDcmVhdGUodGhpcyk7XG5cbiAgICBsZXQgYWNjb3VudCA9IG5ldyBjb3JlLkN1c3RvbVJlc291cmNlKFxuICAgICAgdGhpcyxcbiAgICAgIGBBY2NvdW50LSR7YWNjb3VudFByb3BzLm5hbWV9YCxcbiAgICAgIHtcbiAgICAgICAgc2VydmljZVRva2VuOiBhY2NvdW50UHJvdmlkZXIucHJvdmlkZXIuc2VydmljZVRva2VuLFxuICAgICAgICByZXNvdXJjZVR5cGU6IFwiQ3VzdG9tOjpBY2NvdW50Q3JlYXRpb25cIixcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIEVtYWlsOiBhY2NvdW50UHJvcHMuZW1haWwsXG4gICAgICAgICAgQWNjb3VudE5hbWU6IGFjY291bnRQcm9wcy5uYW1lLFxuICAgICAgICAgIEFjY291bnRUeXBlOiBhY2NvdW50UHJvcHMudHlwZSxcbiAgICAgICAgICBTdGFnZU5hbWU6IGFjY291bnRQcm9wcy5zdGFnZU5hbWUsXG4gICAgICAgICAgU3RhZ2VPcmRlcjogYWNjb3VudFByb3BzLnN0YWdlT3JkZXI/LnRvU3RyaW5nKCksXG4gICAgICAgICAgSG9zdGVkU2VydmljZXM6IGFjY291bnRQcm9wcy5ob3N0ZWRTZXJ2aWNlcz9hY2NvdW50UHJvcHMuaG9zdGVkU2VydmljZXMuam9pbignOicpOnVuZGVmaW5lZFxuICAgICAgICB9LFxuICAgICAgfVxuICAgICk7XG5cbiAgICBsZXQgYWNjb3VudElkID0gYWNjb3VudC5nZXRBdHQoXCJBY2NvdW50SWRcIikudG9TdHJpbmcoKTtcblxuICAgIGFjY291bnRQcm9wcy5pZCA9IGFjY291bnRJZDtcbiAgICB0aGlzLmFjY291bnROYW1lID0gYWNjb3VudFByb3BzLm5hbWU7XG4gICAgdGhpcy5hY2NvdW50SWQgPSBhY2NvdW50SWQ7XG4gICAgdGhpcy5hY2NvdW50U3RhZ2VOYW1lID0gYWNjb3VudFByb3BzLnN0YWdlTmFtZTtcblxuICAgIG5ldyBzc20uU3RyaW5nUGFyYW1ldGVyKHRoaXMsIGAke2FjY291bnRQcm9wcy5uYW1lfS1BY2NvdW50RGV0YWlsc2AsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBgRGV0YWlscyBvZiAke2FjY291bnRQcm9wcy5uYW1lfWAsXG4gICAgICBwYXJhbWV0ZXJOYW1lOiBgL2FjY291bnRzLyR7YWNjb3VudFByb3BzLm5hbWV9YCxcbiAgICAgIHN0cmluZ1ZhbHVlOiBKU09OLnN0cmluZ2lmeShhY2NvdW50UHJvcHMpLFxuICAgIH0pO1xuXG4gICAgaWYgKGFjY291bnRQcm9wcy5wYXJlbnRPcmdhbml6YXRpb25hbFVuaXRJZCkge1xuICAgICAgbGV0IHBhcmVudCA9IG5ldyBjci5Bd3NDdXN0b21SZXNvdXJjZSh0aGlzLCBcIkxpc3RQYXJlbnRzQ3VzdG9tUmVzb3VyY2VcIiwge1xuICAgICAgICBvbkNyZWF0ZToge1xuICAgICAgICAgIHNlcnZpY2U6IFwiT3JnYW5pemF0aW9uc1wiLFxuICAgICAgICAgIGFjdGlvbjogXCJsaXN0UGFyZW50c1wiLFxuICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogY3IuUGh5c2ljYWxSZXNvdXJjZUlkLmZyb21SZXNwb25zZShcbiAgICAgICAgICAgIFwiUGFyZW50cy4wLklkXCJcbiAgICAgICAgICApLFxuICAgICAgICAgIHJlZ2lvbjogXCJ1cy1lYXN0LTFcIiwgLy9BV1MgT3JnYW5pemF0aW9ucyBBUEkgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHVzLWVhc3QtMSBmb3Igcm9vdCBhY3Rpb25zXG4gICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgQ2hpbGRJZDogYWNjb3VudElkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIG9uVXBkYXRlOiB7XG4gICAgICAgICAgc2VydmljZTogXCJPcmdhbml6YXRpb25zXCIsXG4gICAgICAgICAgYWN0aW9uOiBcImxpc3RQYXJlbnRzXCIsXG4gICAgICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBjci5QaHlzaWNhbFJlc291cmNlSWQuZnJvbVJlc3BvbnNlKFxuICAgICAgICAgICAgXCJQYXJlbnRzLjAuSWRcIlxuICAgICAgICAgICksXG4gICAgICAgICAgcmVnaW9uOiBcInVzLWVhc3QtMVwiLCAvL0FXUyBPcmdhbml6YXRpb25zIEFQSSBhcmUgb25seSBhdmFpbGFibGUgaW4gdXMtZWFzdC0xIGZvciByb290IGFjdGlvbnNcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICBDaGlsZElkOiBhY2NvdW50SWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgb25EZWxldGU6IHtcbiAgICAgICAgICBzZXJ2aWNlOiBcIk9yZ2FuaXphdGlvbnNcIixcbiAgICAgICAgICBhY3Rpb246IFwibGlzdFBhcmVudHNcIixcbiAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoXG4gICAgICAgICAgICBcIlBhcmVudHMuMC5JZFwiXG4gICAgICAgICAgKSxcbiAgICAgICAgICByZWdpb246IFwidXMtZWFzdC0xXCIsIC8vQVdTIE9yZ2FuaXphdGlvbnMgQVBJIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiB1cy1lYXN0LTEgZm9yIHJvb3QgYWN0aW9uc1xuICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgIENoaWxkSWQ6IGFjY291bnRJZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBwb2xpY3k6IGNyLkF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyh7XG4gICAgICAgICAgcmVzb3VyY2VzOiBjci5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0UsXG4gICAgICAgIH0pLFxuICAgICAgfSk7XG5cbiAgICAgIG5ldyBjci5Bd3NDdXN0b21SZXNvdXJjZShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgXCJNb3ZlQWNjb3VudEN1c3RvbVJlc291cmNlXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBvbkNyZWF0ZToge1xuICAgICAgICAgICAgc2VydmljZTogXCJPcmdhbml6YXRpb25zXCIsXG4gICAgICAgICAgICBhY3Rpb246IFwibW92ZUFjY291bnRcIixcbiAgICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogY3IuUGh5c2ljYWxSZXNvdXJjZUlkLm9mKGFjY291bnRJZCksXG4gICAgICAgICAgICByZWdpb246IFwidXMtZWFzdC0xXCIsIC8vQVdTIE9yZ2FuaXphdGlvbnMgQVBJIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiB1cy1lYXN0LTEgZm9yIHJvb3QgYWN0aW9uc1xuICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBBY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgICAgICAgRGVzdGluYXRpb25QYXJlbnRJZDogYWNjb3VudFByb3BzLnBhcmVudE9yZ2FuaXphdGlvbmFsVW5pdElkLFxuICAgICAgICAgICAgICBTb3VyY2VQYXJlbnRJZDogcGFyZW50LmdldFJlc3BvbnNlRmllbGQoXCJQYXJlbnRzLjAuSWRcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcG9saWN5OiBjci5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoe1xuICAgICAgICAgICAgcmVzb3VyY2VzOiBjci5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5BTllfUkVTT1VSQ0UsXG4gICAgICAgICAgfSksXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIC8vIEVuYWJsaW5nIE9yZ2FuaXphdGlvbnMgbGlzdEFjY291bnRzIGNhbGwgZm9yIGF1dG8gcmVzb2x1dGlvbiBvZiBzdGFnZXMgYW5kIEROUyBhY2NvdW50cyBJZHMgYW5kIE5hbWVzXG4gICAgICBpZiAoYWNjb3VudFByb3BzLnR5cGUgPT09IEFjY291bnRUeXBlLkNJQ0QpIHtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFzRGVsZWdhdGVkQWRtaW5pc3RyYXRvcihhY2NvdW50SWQsICdzc20uYW1hem9uYXdzLmNvbScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAvLyBTd2l0Y2hpbmcgdG8gYW5vdGhlciBwcmluY2lwYWwgdG8gd29ya2Fyb3VuZCB0aGUgbWF4IG51bWJlciBvZiBkZWxlZ2F0ZWQgYWRtaW5pc3RyYXRvcnMgKHdoaWNoIGlzIHNldCB0byAzIGJ5IGRlZmF1bHQpLlxuICAgICAgIGNvbnN0IG5lZWRzVG9CZURlbGVnYXRlZEZvckROU1pPbmVOYW1lUmVzb2x1dGlvbiA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdkb21haW5fbmFtZScpID8/IGZhbHNlO1xuICAgICAgIGlmKG5lZWRzVG9CZURlbGVnYXRlZEZvckROU1pPbmVOYW1lUmVzb2x1dGlvbilcbiAgICAgICAgdGhpcy5yZWdpc3RlckFzRGVsZWdhdGVkQWRtaW5pc3RyYXRvcihhY2NvdW50SWQsICdjb25maWctbXVsdGlhY2NvdW50c2V0dXAuYW1hem9uYXdzLmNvbScpO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJBc0RlbGVnYXRlZEFkbWluaXN0cmF0b3IoYWNjb3VudElkOiBzdHJpbmcsIHNlcnZpY2VQcmluY2lwYWw6IHN0cmluZykge1xuICAgIG5ldyBjci5Bd3NDdXN0b21SZXNvdXJjZSh0aGlzLFxuICAgICAgXCJyZWdpc3RlckRlbGVnYXRlZEFkbWluaXN0cmF0b3JcIixcbiAgICAgIHtcbiAgICAgICAgb25DcmVhdGU6IHtcbiAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgYWN0aW9uOiAncmVnaXN0ZXJEZWxlZ2F0ZWRBZG1pbmlzdHJhdG9yJywgLy8gaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FXU0phdmFTY3JpcHRTREsvbGF0ZXN0L0FXUy9Pcmdhbml6YXRpb25zLmh0bWwjcmVnaXN0ZXJEZWxlZ2F0ZWRBZG1pbmlzdHJhdG9yLXByb3BlcnR5XG4gICAgICAgICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBjci5QaHlzaWNhbFJlc291cmNlSWQub2YoJ3JlZ2lzdGVyRGVsZWdhdGVkQWRtaW5pc3RyYXRvcicpLFxuICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsIC8vQVdTIE9yZ2FuaXphdGlvbnMgQVBJIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiB1cy1lYXN0LTEgZm9yIHJvb3QgYWN0aW9uc1xuICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgIEFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgICAgICAgU2VydmljZVByaW5jaXBhbDogc2VydmljZVByaW5jaXBhbFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25EZWxldGU6IHtcbiAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgYWN0aW9uOiAnZGVyZWdpc3RlckRlbGVnYXRlZEFkbWluaXN0cmF0b3InLCAvLyBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vQVdTSmF2YVNjcmlwdFNESy9sYXRlc3QvQVdTL09yZ2FuaXphdGlvbnMuaHRtbCNkZXJlZ2lzdGVyRGVsZWdhdGVkQWRtaW5pc3RyYXRvci1wcm9wZXJ0eVxuICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogY3IuUGh5c2ljYWxSZXNvdXJjZUlkLm9mKCdyZWdpc3RlckRlbGVnYXRlZEFkbWluaXN0cmF0b3InKSxcbiAgICAgICAgICByZWdpb246ICd1cy1lYXN0LTEnLCAvL0FXUyBPcmdhbml6YXRpb25zIEFQSSBhcmUgb25seSBhdmFpbGFibGUgaW4gdXMtZWFzdC0xIGZvciByb290IGFjdGlvbnNcbiAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICBBY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgICAgIFNlcnZpY2VQcmluY2lwYWw6IHNlcnZpY2VQcmluY2lwYWxcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGluc3RhbGxMYXRlc3RBd3NTZGs6IGZhbHNlLFxuICAgICAgICBwb2xpY3k6IGNyLkF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyhcbiAgICAgICAgICB7XG4gICAgICAgICAgICByZXNvdXJjZXM6IGNyLkF3c0N1c3RvbVJlc291cmNlUG9saWN5LkFOWV9SRVNPVVJDRVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfVxuICAgICk7XG4gIH1cbn1cbiJdfQ==