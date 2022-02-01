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
const path = require("path");
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
/**
 * A Custom Resource provider capable of validating emails
 */
class ValidateEmailProvider extends aws_cdk_lib_1.NestedStack {
    /**
     * Constructor
     *
     * @param scope The parent Construct instantiating this construct
     * @param id This instance name
     */
    constructor(scope, id, props) {
        super(scope, id);
        const code = lambda.Code.fromAsset(path.join(__dirname, "validate-email-handler"));
        const onEventHandler = new lambda.Function(this, "OnEventHandler", {
            code,
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "index.onEventHandler",
            timeout: aws_cdk_lib_1.Duration.minutes(5)
        });
        onEventHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ["ses:verifyEmailIdentity"],
            resources: ["*"]
        }));
        const isCompleteHandler = new lambda.Function(this, "IsCompleteHandler", {
            code,
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "index.isCompleteHandler",
            timeout: props.timeout ? props.timeout : aws_cdk_lib_1.Duration.minutes(10)
        });
        isCompleteHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ["ses:getIdentityVerificationAttributes"],
            resources: ["*"]
        }));
        this.provider = new custom_resources_1.Provider(this, "EmailValidationProvider", {
            onEventHandler: onEventHandler,
            isCompleteHandler: isCompleteHandler,
            queryInterval: aws_cdk_lib_1.Duration.seconds(10)
        });
    }
    /**
     * Creates a stack-singleton resource provider nested stack.
     */
    static getOrCreate(scope, props) {
        const stack = aws_cdk_lib_1.Stack.of(scope);
        const uid = "aws-cdk-lib/aws-bootstrap-kit.ValidateEmailProvider";
        return (stack.node.tryFindChild(uid) ||
            new ValidateEmailProvider(stack, uid, props));
    }
}
exports.default = ValidateEmailProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZW1haWwtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2YWxpZGF0ZS1lbWFpbC1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBY0U7O0FBR0YsNkJBQTZCO0FBQzdCLDJDQUEyQztBQUMzQyxpREFBaUQ7QUFDakQsNkNBQXVFO0FBQ3ZFLG1FQUF3RDtBQU14RDs7R0FFRztBQUNILE1BQXFCLHFCQUFzQixTQUFRLHlCQUFXO0lBa0I1RDs7Ozs7T0FLRztJQUNILFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBaUM7UUFDekUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsd0JBQXdCLENBQUMsQ0FDL0MsQ0FBQztRQUVGLE1BQU0sY0FBYyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDakUsSUFBSTtZQUNKLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHNCQUFzQjtZQUMvQixPQUFPLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzdCLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxlQUFlLENBQzVCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztZQUNwQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUNILENBQUM7UUFFRixNQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdkUsSUFBSTtZQUNKLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1NBQzlELENBQUMsQ0FBQztRQUVILGlCQUFpQixDQUFDLGVBQWUsQ0FDL0IsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxDQUFDLHVDQUF1QyxDQUFDO1lBQ2xELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztTQUNqQixDQUFDLENBQ0gsQ0FBQztRQUVGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSwyQkFBUSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUM1RCxjQUFjLEVBQUUsY0FBYztZQUM5QixpQkFBaUIsRUFBRSxpQkFBaUI7WUFDcEMsYUFBYSxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztTQUNwQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBMUREOztPQUVHO0lBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFnQixFQUFFLEtBQWlDO1FBQzNFLE1BQU0sS0FBSyxHQUFHLG1CQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLE1BQU0sR0FBRyxHQUFHLHFEQUFxRCxDQUFDO1FBQ2xFLE9BQU8sQ0FDSixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQTJCO1lBQ3ZELElBQUkscUJBQXFCLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FDN0MsQ0FBQztJQUNKLENBQUM7Q0FpREY7QUFqRUQsd0NBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiwgU3RhY2ssIE5lc3RlZFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gXCJhd3MtY2RrLWxpYi9jdXN0b20tcmVzb3VyY2VzXCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUVtYWlsUHJvdmlkZXJQcm9wcyBleHRlbmRzIFN0YWNrUHJvcHMge1xuICB0aW1lb3V0PzogRHVyYXRpb247XG59XG4vKipcbiAqIEEgQ3VzdG9tIFJlc291cmNlIHByb3ZpZGVyIGNhcGFibGUgb2YgdmFsaWRhdGluZyBlbWFpbHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsaWRhdGVFbWFpbFByb3ZpZGVyIGV4dGVuZHMgTmVzdGVkU3RhY2sge1xuICAvKipcbiAgICogVGhlIGN1c3RvbSByZXNvdXJjZSBwcm92aWRlci5cbiAgICovXG4gIHJlYWRvbmx5IHByb3ZpZGVyOiBQcm92aWRlcjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHN0YWNrLXNpbmdsZXRvbiByZXNvdXJjZSBwcm92aWRlciBuZXN0ZWQgc3RhY2suXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldE9yQ3JlYXRlKHNjb3BlOiBDb25zdHJ1Y3QsIHByb3BzOiBWYWxpZGF0ZUVtYWlsUHJvdmlkZXJQcm9wcykge1xuICAgIGNvbnN0IHN0YWNrID0gU3RhY2sub2Yoc2NvcGUpO1xuICAgIGNvbnN0IHVpZCA9IFwiYXdzLWNkay1saWIvYXdzLWJvb3RzdHJhcC1raXQuVmFsaWRhdGVFbWFpbFByb3ZpZGVyXCI7XG4gICAgcmV0dXJuIChcbiAgICAgIChzdGFjay5ub2RlLnRyeUZpbmRDaGlsZCh1aWQpIGFzIFZhbGlkYXRlRW1haWxQcm92aWRlcikgfHxcbiAgICAgIG5ldyBWYWxpZGF0ZUVtYWlsUHJvdmlkZXIoc3RhY2ssIHVpZCwgcHJvcHMpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0gc2NvcGUgVGhlIHBhcmVudCBDb25zdHJ1Y3QgaW5zdGFudGlhdGluZyB0aGlzIGNvbnN0cnVjdFxuICAgKiBAcGFyYW0gaWQgVGhpcyBpbnN0YW5jZSBuYW1lXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogVmFsaWRhdGVFbWFpbFByb3ZpZGVyUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgY29kZSA9IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcbiAgICAgIHBhdGguam9pbihfX2Rpcm5hbWUsIFwidmFsaWRhdGUtZW1haWwtaGFuZGxlclwiKVxuICAgICk7XG5cbiAgICBjb25zdCBvbkV2ZW50SGFuZGxlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJPbkV2ZW50SGFuZGxlclwiLCB7XG4gICAgICBjb2RlLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE0X1gsXG4gICAgICBoYW5kbGVyOiBcImluZGV4Lm9uRXZlbnRIYW5kbGVyXCIsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDUpXG4gICAgfSk7XG5cbiAgICBvbkV2ZW50SGFuZGxlci5hZGRUb1JvbGVQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGFjdGlvbnM6IFtcInNlczp2ZXJpZnlFbWFpbElkZW50aXR5XCJdLFxuICAgICAgICByZXNvdXJjZXM6IFtcIipcIl1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGNvbnN0IGlzQ29tcGxldGVIYW5kbGVyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIklzQ29tcGxldGVIYW5kbGVyXCIsIHtcbiAgICAgIGNvZGUsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTRfWCxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaXNDb21wbGV0ZUhhbmRsZXJcIixcbiAgICAgIHRpbWVvdXQ6IHByb3BzLnRpbWVvdXQgPyBwcm9wcy50aW1lb3V0IDogRHVyYXRpb24ubWludXRlcygxMClcbiAgICB9KTtcblxuICAgIGlzQ29tcGxldGVIYW5kbGVyLmFkZFRvUm9sZVBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgYWN0aW9uczogW1wic2VzOmdldElkZW50aXR5VmVyaWZpY2F0aW9uQXR0cmlidXRlc1wiXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdXG4gICAgICB9KVxuICAgICk7XG5cbiAgICB0aGlzLnByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKHRoaXMsIFwiRW1haWxWYWxpZGF0aW9uUHJvdmlkZXJcIiwge1xuICAgICAgb25FdmVudEhhbmRsZXI6IG9uRXZlbnRIYW5kbGVyLFxuICAgICAgaXNDb21wbGV0ZUhhbmRsZXI6IGlzQ29tcGxldGVIYW5kbGVyLFxuICAgICAgcXVlcnlJbnRlcnZhbDogRHVyYXRpb24uc2Vjb25kcygxMClcbiAgICB9KTtcbiAgfVxufVxuIl19