"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureRootUser = void 0;
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
const config = require("aws-cdk-lib/aws-config");
const sns = require("aws-cdk-lib/aws-sns");
const subs = require("aws-cdk-lib/aws-sns-subscriptions");
const aws_config_recorder_1 = require("./aws-config-recorder");
const iam = require("aws-cdk-lib/aws-iam");
class SecureRootUser extends constructs_1.Construct {
    constructor(scope, id, notificationEmail) {
        super(scope, id);
        // Build notification topic
        const secureRootUserConfigTopic = new sns.Topic(this, 'SecureRootUserConfigTopic');
        secureRootUserConfigTopic.addSubscription(new subs.EmailSubscription(notificationEmail));
        // Enforce MFA
        const configRecorder = new aws_config_recorder_1.ConfigRecorder(this, "ConfigRecorder");
        const enforceMFARule = new config.ManagedRule(this, "EnableRootMfa", {
            identifier: "ROOT_ACCOUNT_MFA_ENABLED",
            maximumExecutionFrequency: config.MaximumExecutionFrequency.TWENTY_FOUR_HOURS,
        });
        // Enforce No root access key
        const enforceNoAccessKeyRule = new config.ManagedRule(this, "NoRootAccessKey", {
            identifier: "IAM_ROOT_ACCESS_KEY_CHECK",
            maximumExecutionFrequency: config.MaximumExecutionFrequency.TWENTY_FOUR_HOURS,
        });
        // Create role used for auto remediation
        const autoRemediationRole = new iam.Role(this, 'AutoRemediationRole', {
            assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal("events.amazonaws.com"), new iam.ServicePrincipal("ssm.amazonaws.com"))
        });
        // See: https://github.com/aws/aws-cdk/issues/16188
        const ssmaAsgRoleAsCfn = autoRemediationRole.node.defaultChild;
        ssmaAsgRoleAsCfn.addOverride('Properties.AssumeRolePolicyDocument.Statement.0.Principal.Service', ['events.amazonaws.com', 'ssm.amazonaws.com']);
        enforceMFARule.node.addDependency(configRecorder);
        enforceNoAccessKeyRule.node.addDependency(configRecorder);
        secureRootUserConfigTopic.grantPublish(autoRemediationRole);
        // Create remediations by notifying owner
        const mfaRemediationInstructionMessage = `Your main account (${core.Stack.of(this).account}) root user still not have MFA activated.\n\t1. Go to https://signin.aws.amazon.com/console and sign in using your root account\n\t2. Go to https://console.aws.amazon.com/iam/home#/security_credentials\n\t3. Activate MFA`;
        this.addNotCompliancyNotificationMechanism(enforceMFARule, autoRemediationRole, secureRootUserConfigTopic, mfaRemediationInstructionMessage);
        const accessKeyRemediationInstructionMessage = `Your main account (${core.Stack.of(this).account}) root user have static access keys.\n\t1. Go to https://signin.aws.amazon.com/console and sign in using your root account\n\t2. Go to https://console.aws.amazon.com/iam/home#/security_credentials\n\t3. Delete your Access keys`;
        this.addNotCompliancyNotificationMechanism(enforceNoAccessKeyRule, autoRemediationRole, secureRootUserConfigTopic, accessKeyRemediationInstructionMessage);
    }
    addNotCompliancyNotificationMechanism(enforceMFARule, autoRemediationRole, secureRootUserConfigTopic, message) {
        new config.CfnRemediationConfiguration(this, `Notification-${enforceMFARule.node.id}`, {
            configRuleName: enforceMFARule.configRuleName,
            targetId: "AWS-PublishSNSNotification",
            targetType: "SSM_DOCUMENT",
            targetVersion: "1",
            automatic: true,
            maximumAutomaticAttempts: 1,
            retryAttemptSeconds: 60,
            parameters: {
                AutomationAssumeRole: {
                    StaticValue: {
                        Values: [
                            autoRemediationRole.roleArn
                        ]
                    }
                },
                TopicArn: {
                    StaticValue: {
                        Values: [
                            secureRootUserConfigTopic.topicArn
                        ]
                    }
                },
                Message: {
                    StaticValue: {
                        Values: [
                            // WARNING: Limited to 256 char
                            message
                        ]
                    }
                }
            }
        });
    }
}
exports.SecureRootUser = SecureRootUser;
_a = JSII_RTTI_SYMBOL_1;
SecureRootUser[_a] = { fqn: "aws-bootstrap-kit.SecureRootUser", version: "0.4.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLXJvb3QtdXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlY3VyZS1yb290LXVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTtBQUNGLDJDQUFxQztBQUNyQyxvQ0FBb0M7QUFDcEMsaURBQWlEO0FBQ2pELDJDQUEyQztBQUMzQywwREFBMEQ7QUFDMUQsK0RBQXFEO0FBQ3JELDJDQUEyQztBQUczQyxNQUFhLGNBQWUsU0FBUSxzQkFBUztJQUMzQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLGlCQUF5QjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLDJCQUEyQjtRQUMzQixNQUFNLHlCQUF5QixHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNuRix5QkFBeUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBR3pGLGNBQWM7UUFDZCxNQUFNLGNBQWMsR0FBRyxJQUFJLG9DQUFjLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFbEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbkUsVUFBVSxFQUFFLDBCQUEwQjtZQUN0Qyx5QkFBeUIsRUFDekIsTUFBTSxDQUFDLHlCQUF5QixDQUFDLGlCQUFpQjtTQUNuRCxDQUFDLENBQUM7UUFFSCw2QkFBNkI7UUFDN0IsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQ25ELElBQUksRUFDSixpQkFBaUIsRUFDakI7WUFDRSxVQUFVLEVBQUUsMkJBQTJCO1lBQ3ZDLHlCQUF5QixFQUN6QixNQUFNLENBQUMseUJBQXlCLENBQUMsaUJBQWlCO1NBQ25ELENBQ0YsQ0FBQztRQUVGLHdDQUF3QztRQUN4QyxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDcEUsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGtCQUFrQixDQUNqQyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxFQUNoRCxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUNoRDtTQUNGLENBQUMsQ0FBQztRQUVILG1EQUFtRDtRQUNuRCxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUEyQixDQUFDO1FBQzlFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxtRUFBbUUsRUFBRSxDQUFDLHNCQUFzQixFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUVqSixjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsRCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTFELHlCQUF5QixDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTVELHlDQUF5QztRQUV6QyxNQUFNLGdDQUFnQyxHQUFHLHNCQUFzQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLDhOQUE4TixDQUFDO1FBQ3pULElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUUseUJBQXlCLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztRQUU3SSxNQUFNLHNDQUFzQyxHQUFHLHNCQUFzQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLG9PQUFvTyxDQUFDO1FBQ3JVLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxzQkFBc0IsRUFBRSxtQkFBbUIsRUFBRSx5QkFBeUIsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO0lBQzdKLENBQUM7SUFHTyxxQ0FBcUMsQ0FBQyxjQUFrQyxFQUFFLG1CQUE2QixFQUFFLHlCQUFvQyxFQUFFLE9BQWU7UUFDcEssSUFBSSxNQUFNLENBQUMsMkJBQTJCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFO1lBQ3JGLGNBQWMsRUFBRSxjQUFjLENBQUMsY0FBYztZQUM3QyxRQUFRLEVBQUUsNEJBQTRCO1lBQ3RDLFVBQVUsRUFBRSxjQUFjO1lBQzFCLGFBQWEsRUFBRSxHQUFHO1lBQ2xCLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysd0JBQXdCLEVBQUUsQ0FBQztZQUMzQixtQkFBbUIsRUFBRSxFQUFFO1lBQ3ZCLFVBQVUsRUFBRTtnQkFDVixvQkFBb0IsRUFBRTtvQkFDcEIsV0FBVyxFQUFFO3dCQUNYLE1BQU0sRUFBRTs0QkFDTixtQkFBbUIsQ0FBQyxPQUFPO3lCQUM1QjtxQkFDRjtpQkFDRjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsV0FBVyxFQUFFO3dCQUNYLE1BQU0sRUFBRTs0QkFDTix5QkFBeUIsQ0FBQyxRQUFRO3lCQUNuQztxQkFDRjtpQkFDRjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsV0FBVyxFQUFFO3dCQUNYLE1BQU0sRUFBRTs0QkFDTiwrQkFBK0I7NEJBQy9CLE9BQU87eUJBQ1I7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7O0FBMUZILHdDQTJGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IHtDb25zdHJ1Y3R9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvbmZpZ1wiO1xuaW1wb3J0ICogYXMgc25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zbnMnO1xuaW1wb3J0ICogYXMgc3VicyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0IHtDb25maWdSZWNvcmRlcn0gZnJvbSBcIi4vYXdzLWNvbmZpZy1yZWNvcmRlclwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5cbmV4cG9ydCBjbGFzcyBTZWN1cmVSb290VXNlciBleHRlbmRzIENvbnN0cnVjdCB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIG5vdGlmaWNhdGlvbkVtYWlsOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgLy8gQnVpbGQgbm90aWZpY2F0aW9uIHRvcGljXG4gICAgY29uc3Qgc2VjdXJlUm9vdFVzZXJDb25maWdUb3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ1NlY3VyZVJvb3RVc2VyQ29uZmlnVG9waWMnKTtcbiAgICBzZWN1cmVSb290VXNlckNvbmZpZ1RvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgc3Vicy5FbWFpbFN1YnNjcmlwdGlvbihub3RpZmljYXRpb25FbWFpbCkpO1xuXG5cbiAgICAvLyBFbmZvcmNlIE1GQVxuICAgIGNvbnN0IGNvbmZpZ1JlY29yZGVyID0gbmV3IENvbmZpZ1JlY29yZGVyKHRoaXMsIFwiQ29uZmlnUmVjb3JkZXJcIik7XG5cbiAgICBjb25zdCBlbmZvcmNlTUZBUnVsZSA9IG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgXCJFbmFibGVSb290TWZhXCIsIHtcbiAgICAgIGlkZW50aWZpZXI6IFwiUk9PVF9BQ0NPVU5UX01GQV9FTkFCTEVEXCIsXG4gICAgICBtYXhpbXVtRXhlY3V0aW9uRnJlcXVlbmN5OlxuICAgICAgY29uZmlnLk1heGltdW1FeGVjdXRpb25GcmVxdWVuY3kuVFdFTlRZX0ZPVVJfSE9VUlMsXG4gICAgfSk7XG5cbiAgICAvLyBFbmZvcmNlIE5vIHJvb3QgYWNjZXNzIGtleVxuICAgIGNvbnN0IGVuZm9yY2VOb0FjY2Vzc0tleVJ1bGUgPSBuZXcgY29uZmlnLk1hbmFnZWRSdWxlKFxuICAgICAgdGhpcyxcbiAgICAgIFwiTm9Sb290QWNjZXNzS2V5XCIsXG4gICAgICB7XG4gICAgICAgIGlkZW50aWZpZXI6IFwiSUFNX1JPT1RfQUNDRVNTX0tFWV9DSEVDS1wiLFxuICAgICAgICBtYXhpbXVtRXhlY3V0aW9uRnJlcXVlbmN5OlxuICAgICAgICBjb25maWcuTWF4aW11bUV4ZWN1dGlvbkZyZXF1ZW5jeS5UV0VOVFlfRk9VUl9IT1VSUyxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIHJvbGUgdXNlZCBmb3IgYXV0byByZW1lZGlhdGlvblxuICAgIGNvbnN0IGF1dG9SZW1lZGlhdGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0F1dG9SZW1lZGlhdGlvblJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uQ29tcG9zaXRlUHJpbmNpcGFsKFxuICAgICAgICAgIG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImV2ZW50cy5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgICAgIG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcInNzbS5hbWF6b25hd3MuY29tXCIpXG4gICAgICApXG4gICAgfSk7XG5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYXdzLWNkay9pc3N1ZXMvMTYxODhcbiAgICBjb25zdCBzc21hQXNnUm9sZUFzQ2ZuID0gYXV0b1JlbWVkaWF0aW9uUm9sZS5ub2RlLmRlZmF1bHRDaGlsZCBhcyBpYW0uQ2ZuUm9sZTtcbiAgICBzc21hQXNnUm9sZUFzQ2ZuLmFkZE92ZXJyaWRlKCdQcm9wZXJ0aWVzLkFzc3VtZVJvbGVQb2xpY3lEb2N1bWVudC5TdGF0ZW1lbnQuMC5QcmluY2lwYWwuU2VydmljZScsIFsnZXZlbnRzLmFtYXpvbmF3cy5jb20nLCAnc3NtLmFtYXpvbmF3cy5jb20nXSk7XG5cbiAgICBlbmZvcmNlTUZBUnVsZS5ub2RlLmFkZERlcGVuZGVuY3koY29uZmlnUmVjb3JkZXIpO1xuICAgIGVuZm9yY2VOb0FjY2Vzc0tleVJ1bGUubm9kZS5hZGREZXBlbmRlbmN5KGNvbmZpZ1JlY29yZGVyKTtcblxuICAgIHNlY3VyZVJvb3RVc2VyQ29uZmlnVG9waWMuZ3JhbnRQdWJsaXNoKGF1dG9SZW1lZGlhdGlvblJvbGUpO1xuXG4gICAgLy8gQ3JlYXRlIHJlbWVkaWF0aW9ucyBieSBub3RpZnlpbmcgb3duZXJcblxuICAgIGNvbnN0IG1mYVJlbWVkaWF0aW9uSW5zdHJ1Y3Rpb25NZXNzYWdlID0gYFlvdXIgbWFpbiBhY2NvdW50ICgke2NvcmUuU3RhY2sub2YodGhpcykuYWNjb3VudH0pIHJvb3QgdXNlciBzdGlsbCBub3QgaGF2ZSBNRkEgYWN0aXZhdGVkLlxcblxcdDEuIEdvIHRvIGh0dHBzOi8vc2lnbmluLmF3cy5hbWF6b24uY29tL2NvbnNvbGUgYW5kIHNpZ24gaW4gdXNpbmcgeW91ciByb290IGFjY291bnRcXG5cXHQyLiBHbyB0byBodHRwczovL2NvbnNvbGUuYXdzLmFtYXpvbi5jb20vaWFtL2hvbWUjL3NlY3VyaXR5X2NyZWRlbnRpYWxzXFxuXFx0My4gQWN0aXZhdGUgTUZBYDtcbiAgICB0aGlzLmFkZE5vdENvbXBsaWFuY3lOb3RpZmljYXRpb25NZWNoYW5pc20oZW5mb3JjZU1GQVJ1bGUsIGF1dG9SZW1lZGlhdGlvblJvbGUsIHNlY3VyZVJvb3RVc2VyQ29uZmlnVG9waWMsIG1mYVJlbWVkaWF0aW9uSW5zdHJ1Y3Rpb25NZXNzYWdlKTtcblxuICAgIGNvbnN0IGFjY2Vzc0tleVJlbWVkaWF0aW9uSW5zdHJ1Y3Rpb25NZXNzYWdlID0gYFlvdXIgbWFpbiBhY2NvdW50ICgke2NvcmUuU3RhY2sub2YodGhpcykuYWNjb3VudH0pIHJvb3QgdXNlciBoYXZlIHN0YXRpYyBhY2Nlc3Mga2V5cy5cXG5cXHQxLiBHbyB0byBodHRwczovL3NpZ25pbi5hd3MuYW1hem9uLmNvbS9jb25zb2xlIGFuZCBzaWduIGluIHVzaW5nIHlvdXIgcm9vdCBhY2NvdW50XFxuXFx0Mi4gR28gdG8gaHR0cHM6Ly9jb25zb2xlLmF3cy5hbWF6b24uY29tL2lhbS9ob21lIy9zZWN1cml0eV9jcmVkZW50aWFsc1xcblxcdDMuIERlbGV0ZSB5b3VyIEFjY2VzcyBrZXlzYDtcbiAgICB0aGlzLmFkZE5vdENvbXBsaWFuY3lOb3RpZmljYXRpb25NZWNoYW5pc20oZW5mb3JjZU5vQWNjZXNzS2V5UnVsZSwgYXV0b1JlbWVkaWF0aW9uUm9sZSwgc2VjdXJlUm9vdFVzZXJDb25maWdUb3BpYywgYWNjZXNzS2V5UmVtZWRpYXRpb25JbnN0cnVjdGlvbk1lc3NhZ2UpO1xuICB9XG5cblxuICBwcml2YXRlIGFkZE5vdENvbXBsaWFuY3lOb3RpZmljYXRpb25NZWNoYW5pc20oZW5mb3JjZU1GQVJ1bGU6IGNvbmZpZy5NYW5hZ2VkUnVsZSwgYXV0b1JlbWVkaWF0aW9uUm9sZTogaWFtLlJvbGUsIHNlY3VyZVJvb3RVc2VyQ29uZmlnVG9waWM6IHNucy5Ub3BpYywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgbmV3IGNvbmZpZy5DZm5SZW1lZGlhdGlvbkNvbmZpZ3VyYXRpb24odGhpcywgYE5vdGlmaWNhdGlvbi0ke2VuZm9yY2VNRkFSdWxlLm5vZGUuaWR9YCwge1xuICAgICAgY29uZmlnUnVsZU5hbWU6IGVuZm9yY2VNRkFSdWxlLmNvbmZpZ1J1bGVOYW1lLFxuICAgICAgdGFyZ2V0SWQ6IFwiQVdTLVB1Ymxpc2hTTlNOb3RpZmljYXRpb25cIixcbiAgICAgIHRhcmdldFR5cGU6IFwiU1NNX0RPQ1VNRU5UXCIsXG4gICAgICB0YXJnZXRWZXJzaW9uOiBcIjFcIixcbiAgICAgIGF1dG9tYXRpYzogdHJ1ZSxcbiAgICAgIG1heGltdW1BdXRvbWF0aWNBdHRlbXB0czogMSxcbiAgICAgIHJldHJ5QXR0ZW1wdFNlY29uZHM6IDYwLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBBdXRvbWF0aW9uQXNzdW1lUm9sZToge1xuICAgICAgICAgIFN0YXRpY1ZhbHVlOiB7XG4gICAgICAgICAgICBWYWx1ZXM6IFtcbiAgICAgICAgICAgICAgYXV0b1JlbWVkaWF0aW9uUm9sZS5yb2xlQXJuXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBUb3BpY0Fybjoge1xuICAgICAgICAgIFN0YXRpY1ZhbHVlOiB7XG4gICAgICAgICAgICBWYWx1ZXM6IFtcbiAgICAgICAgICAgICAgc2VjdXJlUm9vdFVzZXJDb25maWdUb3BpYy50b3BpY0FyblxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgTWVzc2FnZToge1xuICAgICAgICAgIFN0YXRpY1ZhbHVlOiB7XG4gICAgICAgICAgICBWYWx1ZXM6IFtcbiAgICAgICAgICAgICAgLy8gV0FSTklORzogTGltaXRlZCB0byAyNTYgY2hhclxuICAgICAgICAgICAgICBtZXNzYWdlXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==