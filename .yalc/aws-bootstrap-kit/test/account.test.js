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
const account_1 = require("../lib/account");
const aws_cdk_lib_1 = require("aws-cdk-lib");
test("HappyCase no DNS don't set delegation", () => {
    const stack = new aws_cdk_lib_1.Stack();
    new account_1.Account(stack, "myAccount", {
        email: "fakeEmail",
        name: "fakeAccountName",
        parentOrganizationalUnitId: "fakeOUId",
    });
    assert_1.expect(stack).to(assert_1.haveResource("Custom::AccountCreation", {
        Email: "fakeEmail",
        AccountName: "fakeAccountName",
    }));
    assert_1.expect(stack).to(assert_1.countResourcesLike("Custom::AWS", 0, {
        "Create": {
            "Fn::Join": [
                "",
                [
                    "{\"service\":\"Organizations\",\"action\":\"registerDelegatedAdministrator\",\"physicalResourceId\":{\"id\":\"registerDelegatedAdministrator\"},\"region\":\"us-east-1\",\"parameters\":{\"AccountId\":\"",
                    {
                        "Fn::GetAtt": [
                            "myAccountAccountfakeAccountNameA6CEFA53",
                            "AccountId"
                        ]
                    },
                    "\",\"ServicePrincipal\":\"config-multiaccountsetup.amazonaws.com\"}}"
                ]
            ]
        }
    }));
});
test("HappyCase with DNS create admin delegation", () => {
    const stack = new aws_cdk_lib_1.Stack();
    stack.node.setContext("domain_name", "example.com");
    new account_1.Account(stack, "myAccount", {
        email: "fakeEmail",
        name: "fakeAccountName",
        parentOrganizationalUnitId: "fakeOUId",
    });
    assert_1.expect(stack).to(assert_1.haveResource("Custom::AccountCreation", {
        Email: "fakeEmail",
        AccountName: "fakeAccountName",
    }));
    assert_1.expect(stack).to(assert_1.countResourcesLike("Custom::AWS", 1, {
        "Create": {
            "Fn::Join": [
                "",
                [
                    "{\"service\":\"Organizations\",\"action\":\"registerDelegatedAdministrator\",\"physicalResourceId\":{\"id\":\"registerDelegatedAdministrator\"},\"region\":\"us-east-1\",\"parameters\":{\"AccountId\":\"",
                    {
                        "Fn::GetAtt": [
                            "myAccountAccountfakeAccountNameA6CEFA53",
                            "AccountId"
                        ]
                    },
                    "\",\"ServicePrincipal\":\"config-multiaccountsetup.amazonaws.com\"}}"
                ]
            ]
        }
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWNjb3VudC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTs7QUFFRiw0Q0FBd0Y7QUFDeEYsNENBQXlDO0FBQ3pDLDZDQUFvQztBQUVwQyxJQUFJLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO0lBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQUssRUFBRSxDQUFBO0lBQ3pCLElBQUksaUJBQU8sQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFO1FBQzlCLEtBQUssRUFBRSxXQUFXO1FBQ2xCLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsMEJBQTBCLEVBQUUsVUFBVTtLQUN2QyxDQUFDLENBQUM7SUFFSCxlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLHlCQUF5QixFQUFFO1FBQ3RDLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFdBQVcsRUFBRSxpQkFBaUI7S0FDL0IsQ0FBQyxDQUNILENBQUM7SUFFRixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLDJCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUU7UUFDdkQsUUFBUSxFQUFFO1lBQ1IsVUFBVSxFQUFFO2dCQUNWLEVBQUU7Z0JBQ0Y7b0JBQ0UsMk1BQTJNO29CQUMzTTt3QkFDRSxZQUFZLEVBQUU7NEJBQ1oseUNBQXlDOzRCQUN6QyxXQUFXO3lCQUNaO3FCQUNGO29CQUNELHNFQUFzRTtpQkFDdkU7YUFDRjtTQUNGO0tBRUYsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUdILElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7SUFDdEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxtQkFBSyxFQUFFLENBQUM7SUFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3BELElBQUksaUJBQU8sQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFO1FBQzlCLEtBQUssRUFBRSxXQUFXO1FBQ2xCLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsMEJBQTBCLEVBQUUsVUFBVTtLQUN2QyxDQUFDLENBQUM7SUFFSCxlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUNqQixxQkFBWSxDQUFDLHlCQUF5QixFQUFFO1FBQ3RDLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFdBQVcsRUFBRSxpQkFBaUI7S0FDL0IsQ0FBQyxDQUNILENBQUM7SUFFRixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLDJCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUU7UUFDdkQsUUFBUSxFQUFFO1lBQ1IsVUFBVSxFQUFFO2dCQUNWLEVBQUU7Z0JBQ0Y7b0JBQ0UsMk1BQTJNO29CQUMzTTt3QkFDRSxZQUFZLEVBQUU7NEJBQ1oseUNBQXlDOzRCQUN6QyxXQUFXO3lCQUNaO3FCQUNGO29CQUNELHNFQUFzRTtpQkFDdkU7YUFDRjtTQUNGO0tBRUYsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbllvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBleHBlY3QgYXMgZXhwZWN0Q0RLLCBoYXZlUmVzb3VyY2UsIGNvdW50UmVzb3VyY2VzTGlrZSB9IGZyb20gXCJAYXdzLWNkay9hc3NlcnRcIjtcbmltcG9ydCB7IEFjY291bnQgfSBmcm9tIFwiLi4vbGliL2FjY291bnRcIjtcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbnRlc3QoXCJIYXBweUNhc2Ugbm8gRE5TIGRvbid0IHNldCBkZWxlZ2F0aW9uXCIsICgpID0+IHtcbiAgY29uc3Qgc3RhY2sgPSBuZXcgU3RhY2soKVxuICBuZXcgQWNjb3VudChzdGFjaywgXCJteUFjY291bnRcIiwge1xuICAgIGVtYWlsOiBcImZha2VFbWFpbFwiLFxuICAgIG5hbWU6IFwiZmFrZUFjY291bnROYW1lXCIsXG4gICAgcGFyZW50T3JnYW5pemF0aW9uYWxVbml0SWQ6IFwiZmFrZU9VSWRcIixcbiAgfSk7XG5cbiAgZXhwZWN0Q0RLKHN0YWNrKS50byhcbiAgICBoYXZlUmVzb3VyY2UoXCJDdXN0b206OkFjY291bnRDcmVhdGlvblwiLCB7XG4gICAgICBFbWFpbDogXCJmYWtlRW1haWxcIixcbiAgICAgIEFjY291bnROYW1lOiBcImZha2VBY2NvdW50TmFtZVwiLFxuICAgIH0pXG4gICk7XG5cbiAgZXhwZWN0Q0RLKHN0YWNrKS50byhjb3VudFJlc291cmNlc0xpa2UoXCJDdXN0b206OkFXU1wiLCAwLCB7XG4gICAgXCJDcmVhdGVcIjoge1xuICAgICAgXCJGbjo6Sm9pblwiOiBbXG4gICAgICAgIFwiXCIsXG4gICAgICAgIFtcbiAgICAgICAgICBcIntcXFwic2VydmljZVxcXCI6XFxcIk9yZ2FuaXphdGlvbnNcXFwiLFxcXCJhY3Rpb25cXFwiOlxcXCJyZWdpc3RlckRlbGVnYXRlZEFkbWluaXN0cmF0b3JcXFwiLFxcXCJwaHlzaWNhbFJlc291cmNlSWRcXFwiOntcXFwiaWRcXFwiOlxcXCJyZWdpc3RlckRlbGVnYXRlZEFkbWluaXN0cmF0b3JcXFwifSxcXFwicmVnaW9uXFxcIjpcXFwidXMtZWFzdC0xXFxcIixcXFwicGFyYW1ldGVyc1xcXCI6e1xcXCJBY2NvdW50SWRcXFwiOlxcXCJcIixcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIkZuOjpHZXRBdHRcIjogW1xuICAgICAgICAgICAgICBcIm15QWNjb3VudEFjY291bnRmYWtlQWNjb3VudE5hbWVBNkNFRkE1M1wiLFxuICAgICAgICAgICAgICBcIkFjY291bnRJZFwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIlxcXCIsXFxcIlNlcnZpY2VQcmluY2lwYWxcXFwiOlxcXCJjb25maWctbXVsdGlhY2NvdW50c2V0dXAuYW1hem9uYXdzLmNvbVxcXCJ9fVwiXG4gICAgICAgIF1cbiAgICAgIF1cbiAgICB9XG5cbiAgfSkpO1xufSk7XG5cblxudGVzdChcIkhhcHB5Q2FzZSB3aXRoIEROUyBjcmVhdGUgYWRtaW4gZGVsZWdhdGlvblwiLCAoKSA9PiB7XG4gIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKCk7XG4gIHN0YWNrLm5vZGUuc2V0Q29udGV4dChcImRvbWFpbl9uYW1lXCIsIFwiZXhhbXBsZS5jb21cIik7XG4gIG5ldyBBY2NvdW50KHN0YWNrLCBcIm15QWNjb3VudFwiLCB7XG4gICAgZW1haWw6IFwiZmFrZUVtYWlsXCIsXG4gICAgbmFtZTogXCJmYWtlQWNjb3VudE5hbWVcIixcbiAgICBwYXJlbnRPcmdhbml6YXRpb25hbFVuaXRJZDogXCJmYWtlT1VJZFwiLFxuICB9KTtcblxuICBleHBlY3RDREsoc3RhY2spLnRvKFxuICAgIGhhdmVSZXNvdXJjZShcIkN1c3RvbTo6QWNjb3VudENyZWF0aW9uXCIsIHtcbiAgICAgIEVtYWlsOiBcImZha2VFbWFpbFwiLFxuICAgICAgQWNjb3VudE5hbWU6IFwiZmFrZUFjY291bnROYW1lXCIsXG4gICAgfSlcbiAgKTtcblxuICBleHBlY3RDREsoc3RhY2spLnRvKGNvdW50UmVzb3VyY2VzTGlrZShcIkN1c3RvbTo6QVdTXCIsIDEsIHtcbiAgICBcIkNyZWF0ZVwiOiB7XG4gICAgICBcIkZuOjpKb2luXCI6IFtcbiAgICAgICAgXCJcIixcbiAgICAgICAgW1xuICAgICAgICAgIFwie1xcXCJzZXJ2aWNlXFxcIjpcXFwiT3JnYW5pemF0aW9uc1xcXCIsXFxcImFjdGlvblxcXCI6XFxcInJlZ2lzdGVyRGVsZWdhdGVkQWRtaW5pc3RyYXRvclxcXCIsXFxcInBoeXNpY2FsUmVzb3VyY2VJZFxcXCI6e1xcXCJpZFxcXCI6XFxcInJlZ2lzdGVyRGVsZWdhdGVkQWRtaW5pc3RyYXRvclxcXCJ9LFxcXCJyZWdpb25cXFwiOlxcXCJ1cy1lYXN0LTFcXFwiLFxcXCJwYXJhbWV0ZXJzXFxcIjp7XFxcIkFjY291bnRJZFxcXCI6XFxcIlwiLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwiRm46OkdldEF0dFwiOiBbXG4gICAgICAgICAgICAgIFwibXlBY2NvdW50QWNjb3VudGZha2VBY2NvdW50TmFtZUE2Q0VGQTUzXCIsXG4gICAgICAgICAgICAgIFwiQWNjb3VudElkXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiXFxcIixcXFwiU2VydmljZVByaW5jaXBhbFxcXCI6XFxcImNvbmZpZy1tdWx0aWFjY291bnRzZXR1cC5hbWF6b25hd3MuY29tXFxcIn19XCJcbiAgICAgICAgXVxuICAgICAgXVxuICAgIH1cblxuICB9KSk7XG59KTsiXX0=