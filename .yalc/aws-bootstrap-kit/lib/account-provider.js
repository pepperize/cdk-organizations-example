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
exports.AccountProvider = void 0;
const path = require("path");
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const cr = require("aws-cdk-lib/custom-resources");
/**
 * A Custom Resource provider capable of creating AWS Accounts
 */
class AccountProvider extends aws_cdk_lib_1.NestedStack {
    constructor(scope, id) {
        super(scope, id);
        const code = lambda.Code.fromAsset(path.join(__dirname, 'account-handler'));
        // Issues UpdateTable API calls
        this.onEventHandler = new lambda.Function(this, 'OnEventHandler', {
            code,
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.onEventHandler',
            timeout: aws_cdk_lib_1.Duration.minutes(5),
        });
        this.onEventHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'organizations:CreateAccount',
                'organizations:TagResource'
            ],
            resources: ['*'],
        }));
        // Checks if account is ready
        this.isCompleteHandler = new lambda.Function(this, 'IsCompleteHandler', {
            code,
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.isCompleteHandler',
            timeout: aws_cdk_lib_1.Duration.seconds(30),
        });
        this.isCompleteHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'organizations:CreateAccount',
                'organizations:DescribeCreateAccountStatus',
                'organizations:TagResource'
            ],
            resources: ['*'],
        }));
        this.provider = new cr.Provider(this, 'AccountProvider', {
            onEventHandler: this.onEventHandler,
            isCompleteHandler: this.isCompleteHandler,
            queryInterval: aws_cdk_lib_1.Duration.seconds(10),
        });
    }
    /**
     * Creates a stack-singleton resource provider nested stack.
     */
    static getOrCreate(scope) {
        const stack = aws_cdk_lib_1.Stack.of(scope);
        const uid = '@aws-cdk/aws-bootstrap-kit.AccountProvider';
        return stack.node.tryFindChild(uid) || new AccountProvider(stack, uid);
    }
}
exports.AccountProvider = AccountProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFjY291bnQtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7OztFQWNFOzs7QUFHRiw2QkFBNkI7QUFDN0IsMkNBQTJDO0FBQzNDLGlEQUFpRDtBQUNqRCw2Q0FBMkQ7QUFDM0QsbURBQW1EO0FBR25EOztHQUVHO0FBQ0gsTUFBYSxlQUFnQixTQUFRLHlCQUFXO0lBeUI5QyxZQUFvQixLQUFnQixFQUFFLEVBQVU7UUFDOUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFFNUUsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNoRSxJQUFJO1lBQ0osT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLE9BQU8sRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQy9CLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixPQUFPLEVBQUU7Z0JBQ1AsNkJBQTZCO2dCQUM3QiwyQkFBMkI7YUFDNUI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUNILENBQUM7UUFFSiw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdEUsSUFBSTtZQUNKLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxPQUFPLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1NBQzlCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQ2xDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixPQUFPLEVBQUU7Z0JBQ0wsNkJBQTZCO2dCQUM3QiwyQ0FBMkM7Z0JBQzNDLDJCQUEyQjthQUM1QjtZQUNILFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztTQUNqQixDQUFDLENBQ0gsQ0FBQztRQUVKLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN2RCxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtZQUN6QyxhQUFhLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1NBQ3BDLENBQUMsQ0FBQztJQUNMLENBQUM7SUF2RUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQWdCO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLG1CQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLE1BQU0sR0FBRyxHQUFHLDRDQUE0QyxDQUFDO1FBQ3pELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFvQixJQUFJLElBQUksZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1RixDQUFDO0NBaUVGO0FBekVELDBDQXlFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge0NvbnN0cnVjdH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgRHVyYXRpb24sIE5lc3RlZFN0YWNrLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGNyIGZyb20gJ2F3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMnO1xuXG5cbi8qKlxuICogQSBDdXN0b20gUmVzb3VyY2UgcHJvdmlkZXIgY2FwYWJsZSBvZiBjcmVhdGluZyBBV1MgQWNjb3VudHNcbiAqL1xuZXhwb3J0IGNsYXNzIEFjY291bnRQcm92aWRlciBleHRlbmRzIE5lc3RlZFN0YWNrIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBzdGFjay1zaW5nbGV0b24gcmVzb3VyY2UgcHJvdmlkZXIgbmVzdGVkIHN0YWNrLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRPckNyZWF0ZShzY29wZTogQ29uc3RydWN0KSB7XG4gICAgY29uc3Qgc3RhY2sgPSBTdGFjay5vZihzY29wZSk7XG4gICAgY29uc3QgdWlkID0gJ0Bhd3MtY2RrL2F3cy1ib290c3RyYXAta2l0LkFjY291bnRQcm92aWRlcic7XG4gICAgcmV0dXJuIHN0YWNrLm5vZGUudHJ5RmluZENoaWxkKHVpZCkgYXMgQWNjb3VudFByb3ZpZGVyIHx8IG5ldyBBY2NvdW50UHJvdmlkZXIoc3RhY2ssIHVpZCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGN1c3RvbSByZXNvdXJjZSBwcm92aWRlci5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBwcm92aWRlcjogY3IuUHJvdmlkZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBvbkV2ZW50IGhhbmRsZXJcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBvbkV2ZW50SGFuZGxlcjogbGFtYmRhLkZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBUaGUgaXNDb21wbGV0ZSBoYW5kbGVyXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaXNDb21wbGV0ZUhhbmRsZXI6IGxhbWJkYS5GdW5jdGlvbjtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgY29kZSA9IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnYWNjb3VudC1oYW5kbGVyJykpO1xuXG4gICAgLy8gSXNzdWVzIFVwZGF0ZVRhYmxlIEFQSSBjYWxsc1xuICAgIHRoaXMub25FdmVudEhhbmRsZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdPbkV2ZW50SGFuZGxlcicsIHtcbiAgICAgIGNvZGUsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTRfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5vbkV2ZW50SGFuZGxlcicsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5vbkV2ZW50SGFuZGxlci5hZGRUb1JvbGVQb2xpY3koXG4gICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnb3JnYW5pemF0aW9uczpDcmVhdGVBY2NvdW50JyxcbiAgICAgICAgICAgICdvcmdhbml6YXRpb25zOlRhZ1Jlc291cmNlJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgLy8gQ2hlY2tzIGlmIGFjY291bnQgaXMgcmVhZHlcbiAgICB0aGlzLmlzQ29tcGxldGVIYW5kbGVyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSXNDb21wbGV0ZUhhbmRsZXInLCB7XG4gICAgICBjb2RlLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE0X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaXNDb21wbGV0ZUhhbmRsZXInLFxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmlzQ29tcGxldGVIYW5kbGVyLmFkZFRvUm9sZVBvbGljeShcbiAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgJ29yZ2FuaXphdGlvbnM6Q3JlYXRlQWNjb3VudCcsXG4gICAgICAgICAgICAgICdvcmdhbml6YXRpb25zOkRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1cycsXG4gICAgICAgICAgICAgICdvcmdhbml6YXRpb25zOlRhZ1Jlc291cmNlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICB0aGlzLnByb3ZpZGVyID0gbmV3IGNyLlByb3ZpZGVyKHRoaXMsICdBY2NvdW50UHJvdmlkZXInLCB7XG4gICAgICBvbkV2ZW50SGFuZGxlcjogdGhpcy5vbkV2ZW50SGFuZGxlcixcbiAgICAgIGlzQ29tcGxldGVIYW5kbGVyOiB0aGlzLmlzQ29tcGxldGVIYW5kbGVyLFxuICAgICAgcXVlcnlJbnRlcnZhbDogRHVyYXRpb24uc2Vjb25kcygxMCksXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==