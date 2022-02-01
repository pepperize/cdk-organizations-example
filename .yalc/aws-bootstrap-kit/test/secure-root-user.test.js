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
const aws_cdk_lib_1 = require("aws-cdk-lib");
const secure_root_user_1 = require("../lib/secure-root-user");
test("Get 2FA and Access key rules", () => {
    const stack = new aws_cdk_lib_1.Stack();
    new secure_root_user_1.SecureRootUser(stack, "secureRootUser", 'test@amazon.com');
    assert_1.expect(stack).to(assert_1.haveResource("AWS::Config::ConfigRule", {
        Source: {
            Owner: "AWS",
            SourceIdentifier: 'ROOT_ACCOUNT_MFA_ENABLED'
        }
    }));
    assert_1.expect(stack).to(assert_1.haveResource("AWS::Config::ConfigRule", {
        Source: {
            Owner: "AWS",
            SourceIdentifier: 'IAM_ROOT_ACCESS_KEY_CHECK'
        }
    }));
    assert_1.expect(stack).to(assert_1.haveResource("AWS::SNS::Topic"));
    assert_1.expect(stack).to(assert_1.haveResource("AWS::IAM::Role", {
        "AssumeRolePolicyDocument": {
            "Statement": [
                {
                    "Action": "sts:AssumeRole",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": [
                            "events.amazonaws.com",
                            "ssm.amazonaws.com"
                        ]
                    }
                }
            ],
            "Version": "2012-10-17"
        }
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLXJvb3QtdXNlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VjdXJlLXJvb3QtdXNlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTs7QUFFRiw0Q0FBa0U7QUFDbEUsNkNBQWtDO0FBQ2xDLDhEQUF1RDtBQUV2RCxJQUFJLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQUssRUFBRSxDQUFDO0lBRTFCLElBQUksaUNBQWMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUUvRCxlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLHlCQUF5QixFQUFFO1FBQ3RDLE1BQU0sRUFBRTtZQUNOLEtBQUssRUFBRSxLQUFLO1lBQ1osZ0JBQWdCLEVBQUUsMEJBQTBCO1NBQzdDO0tBQ0YsQ0FBQyxDQUNILENBQUM7SUFDRixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLHlCQUF5QixFQUFFO1FBQ3RDLE1BQU0sRUFBRTtZQUNOLEtBQUssRUFBRSxLQUFLO1lBQ1osZ0JBQWdCLEVBQUUsMkJBQTJCO1NBQzlDO0tBQ0YsQ0FBQyxDQUNILENBQUM7SUFFRixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLGlCQUFpQixDQUFDLENBQ2hDLENBQUM7SUFFRixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLGdCQUFnQixFQUFFO1FBQzdCLDBCQUEwQixFQUFFO1lBQzFCLFdBQVcsRUFBRTtnQkFDWDtvQkFDRSxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixRQUFRLEVBQUUsT0FBTztvQkFDakIsV0FBVyxFQUFFO3dCQUNYLFNBQVMsRUFBRTs0QkFDVCxzQkFBc0I7NEJBQ3RCLG1CQUFtQjt5QkFDcEI7cUJBQ0Y7aUJBQ0Y7YUFDRjtZQUNELFNBQVMsRUFBRSxZQUFZO1NBQ3hCO0tBQ0YsQ0FBQyxDQUNILENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge2V4cGVjdCBhcyBleHBlY3RDREssIGhhdmVSZXNvdXJjZX0gZnJvbSBcIkBhd3MtY2RrL2Fzc2VydFwiO1xuaW1wb3J0IHtTdGFja30gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQge1NlY3VyZVJvb3RVc2VyfSBmcm9tIFwiLi4vbGliL3NlY3VyZS1yb290LXVzZXJcIjtcblxudGVzdChcIkdldCAyRkEgYW5kIEFjY2VzcyBrZXkgcnVsZXNcIiwgKCkgPT4ge1xuICBjb25zdCBzdGFjayA9IG5ldyBTdGFjaygpO1xuXG4gIG5ldyBTZWN1cmVSb290VXNlcihzdGFjaywgXCJzZWN1cmVSb290VXNlclwiLCAndGVzdEBhbWF6b24uY29tJyk7XG5cbiAgZXhwZWN0Q0RLKHN0YWNrKS50byhcbiAgICBoYXZlUmVzb3VyY2UoXCJBV1M6OkNvbmZpZzo6Q29uZmlnUnVsZVwiLCB7XG4gICAgICBTb3VyY2U6IHtcbiAgICAgICAgT3duZXI6IFwiQVdTXCIsXG4gICAgICAgIFNvdXJjZUlkZW50aWZpZXI6ICdST09UX0FDQ09VTlRfTUZBX0VOQUJMRUQnXG4gICAgICB9XG4gICAgfSlcbiAgKTtcbiAgZXhwZWN0Q0RLKHN0YWNrKS50byhcbiAgICBoYXZlUmVzb3VyY2UoXCJBV1M6OkNvbmZpZzo6Q29uZmlnUnVsZVwiLCB7XG4gICAgICBTb3VyY2U6IHtcbiAgICAgICAgT3duZXI6IFwiQVdTXCIsXG4gICAgICAgIFNvdXJjZUlkZW50aWZpZXI6ICdJQU1fUk9PVF9BQ0NFU1NfS0VZX0NIRUNLJ1xuICAgICAgfVxuICAgIH0pXG4gICk7XG5cbiAgZXhwZWN0Q0RLKHN0YWNrKS50byhcbiAgICBoYXZlUmVzb3VyY2UoXCJBV1M6OlNOUzo6VG9waWNcIilcbiAgKTtcblxuICBleHBlY3RDREsoc3RhY2spLnRvKFxuICAgIGhhdmVSZXNvdXJjZShcIkFXUzo6SUFNOjpSb2xlXCIsIHtcbiAgICAgIFwiQXNzdW1lUm9sZVBvbGljeURvY3VtZW50XCI6IHtcbiAgICAgICAgXCJTdGF0ZW1lbnRcIjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwiQWN0aW9uXCI6IFwic3RzOkFzc3VtZVJvbGVcIixcbiAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgIFwiUHJpbmNpcGFsXCI6IHtcbiAgICAgICAgICAgICAgXCJTZXJ2aWNlXCI6IFtcbiAgICAgICAgICAgICAgICBcImV2ZW50cy5hbWF6b25hd3MuY29tXCIsXG4gICAgICAgICAgICAgICAgXCJzc20uYW1hem9uYXdzLmNvbVwiXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIFwiVmVyc2lvblwiOiBcIjIwMTItMTAtMTdcIlxuICAgICAgfVxuICAgIH0pXG4gICk7XG59KTtcbiJdfQ==