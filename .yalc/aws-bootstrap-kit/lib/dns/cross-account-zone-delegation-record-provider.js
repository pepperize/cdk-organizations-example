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
exports.CrossAccountZoneDelegationRecordProvider = void 0;
const constructs_1 = require("constructs");
const path = require("path");
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const cr = require("aws-cdk-lib/custom-resources");
/**
 * A Custom Resource provider capable of creating a NS record with zone delegation
 * to the given name servers
 *
 * Note that there is no API to check the status of record creation.
 * Thus, we do not implement the `IsComplete` handler here.
 * The newly created record will be temporarily pending (a few seconds).
 */
class CrossAccountZoneDelegationRecordProvider extends constructs_1.Construct {
    constructor(scope, id, roleArnToAssume) {
        super(scope, id);
        const code = lambda.Code.fromAsset(path.join(__dirname, 'delegation-record-handler'));
        // Handle CREATE/UPDATE/DELETE cross account
        this.onEventHandler = new lambda.Function(this, 'OnEventHandler', {
            code,
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.onEventHandler',
            timeout: aws_cdk_lib_1.Duration.minutes(5),
            description: 'Cross-account zone delegation record OnEventHandler'
        });
        // Allow to assume DNS account's updater role
        // roleArn, if not provided will be resolved in the lambda itself but still need to be allowed to assume it.
        this.onEventHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: [roleArnToAssume ? roleArnToAssume : '*'],
        }));
        //Allow to retrieve dynamically the zoneId and the target accountId
        this.onEventHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ['route53:listHostedZonesByName', 'organizations:ListAccounts'],
            resources: ['*'],
        }));
        this.provider = new cr.Provider(this, 'CrossAccountZoneDelegationRecordProvider', {
            onEventHandler: this.onEventHandler,
        });
    }
}
exports.CrossAccountZoneDelegationRecordProvider = CrossAccountZoneDelegationRecordProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3MtYWNjb3VudC16b25lLWRlbGVnYXRpb24tcmVjb3JkLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3Jvc3MtYWNjb3VudC16b25lLWRlbGVnYXRpb24tcmVjb3JkLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTs7O0FBRUYsMkNBQXFDO0FBQ3JDLDZCQUE2QjtBQUM3QiwyQ0FBMkM7QUFDM0MsaURBQWlEO0FBQ2pELDZDQUF1QztBQUN2QyxtREFBbUQ7QUFFbkQ7Ozs7Ozs7R0FPRztBQUNILE1BQWEsd0NBQXlDLFNBQVEsc0JBQVM7SUFXbkUsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxlQUF3QjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUV0Riw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzlELElBQUk7WUFDSixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM1QixXQUFXLEVBQUUscURBQXFEO1NBQ3JFLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3Qyw0R0FBNEc7UUFDNUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQy9CLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNwQixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQixTQUFTLEVBQUUsQ0FBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1NBQ3hELENBQUMsQ0FDTCxDQUFDO1FBRUYsbUVBQW1FO1FBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUMvQixJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDcEIsT0FBTyxFQUFFLENBQUMsK0JBQStCLEVBQUUsNEJBQTRCLENBQUM7WUFDeEUsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FDTCxDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLDBDQUEwQyxFQUFFO1lBQzlFLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztTQUN0QyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE5Q0QsNEZBOENDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGNyIGZyb20gJ2F3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMnO1xuXG4vKipcbiAqIEEgQ3VzdG9tIFJlc291cmNlIHByb3ZpZGVyIGNhcGFibGUgb2YgY3JlYXRpbmcgYSBOUyByZWNvcmQgd2l0aCB6b25lIGRlbGVnYXRpb25cbiAqIHRvIHRoZSBnaXZlbiBuYW1lIHNlcnZlcnNcbiAqXG4gKiBOb3RlIHRoYXQgdGhlcmUgaXMgbm8gQVBJIHRvIGNoZWNrIHRoZSBzdGF0dXMgb2YgcmVjb3JkIGNyZWF0aW9uLlxuICogVGh1cywgd2UgZG8gbm90IGltcGxlbWVudCB0aGUgYElzQ29tcGxldGVgIGhhbmRsZXIgaGVyZS5cbiAqIFRoZSBuZXdseSBjcmVhdGVkIHJlY29yZCB3aWxsIGJlIHRlbXBvcmFyaWx5IHBlbmRpbmcgKGEgZmV3IHNlY29uZHMpLlxuICovXG5leHBvcnQgY2xhc3MgQ3Jvc3NBY2NvdW50Wm9uZURlbGVnYXRpb25SZWNvcmRQcm92aWRlciBleHRlbmRzIENvbnN0cnVjdCB7XG4gICAgLyoqXG4gICAgICogVGhlIGN1c3RvbSByZXNvdXJjZSBwcm92aWRlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvdmlkZXI6IGNyLlByb3ZpZGVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG9uRXZlbnQgaGFuZGxlclxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSBvbkV2ZW50SGFuZGxlcjogbGFtYmRhLkZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcm9sZUFyblRvQXNzdW1lPzogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAgICAgY29uc3QgY29kZSA9IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnZGVsZWdhdGlvbi1yZWNvcmQtaGFuZGxlcicpKTtcblxuICAgICAgICAvLyBIYW5kbGUgQ1JFQVRFL1VQREFURS9ERUxFVEUgY3Jvc3MgYWNjb3VudFxuICAgICAgICB0aGlzLm9uRXZlbnRIYW5kbGVyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnT25FdmVudEhhbmRsZXInLCB7XG4gICAgICAgICAgICBjb2RlLFxuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE0X1gsXG4gICAgICAgICAgICBoYW5kbGVyOiAnaW5kZXgub25FdmVudEhhbmRsZXInLFxuICAgICAgICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3Jvc3MtYWNjb3VudCB6b25lIGRlbGVnYXRpb24gcmVjb3JkIE9uRXZlbnRIYW5kbGVyJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBbGxvdyB0byBhc3N1bWUgRE5TIGFjY291bnQncyB1cGRhdGVyIHJvbGVcbiAgICAgICAgLy8gcm9sZUFybiwgaWYgbm90IHByb3ZpZGVkIHdpbGwgYmUgcmVzb2x2ZWQgaW4gdGhlIGxhbWJkYSBpdHNlbGYgYnV0IHN0aWxsIG5lZWQgdG8gYmUgYWxsb3dlZCB0byBhc3N1bWUgaXQuXG4gICAgICAgIHRoaXMub25FdmVudEhhbmRsZXIuYWRkVG9Sb2xlUG9saWN5KFxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnc3RzOkFzc3VtZVJvbGUnXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsgcm9sZUFyblRvQXNzdW1lID8gcm9sZUFyblRvQXNzdW1lIDogJyonXSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLy9BbGxvdyB0byByZXRyaWV2ZSBkeW5hbWljYWxseSB0aGUgem9uZUlkIGFuZCB0aGUgdGFyZ2V0IGFjY291bnRJZFxuICAgICAgICB0aGlzLm9uRXZlbnRIYW5kbGVyLmFkZFRvUm9sZVBvbGljeShcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ3JvdXRlNTM6bGlzdEhvc3RlZFpvbmVzQnlOYW1lJywgJ29yZ2FuaXphdGlvbnM6TGlzdEFjY291bnRzJ10sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5wcm92aWRlciA9IG5ldyBjci5Qcm92aWRlcih0aGlzLCAnQ3Jvc3NBY2NvdW50Wm9uZURlbGVnYXRpb25SZWNvcmRQcm92aWRlcicsIHtcbiAgICAgICAgICAgIG9uRXZlbnRIYW5kbGVyOiB0aGlzLm9uRXZlbnRIYW5kbGVyLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=