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
const AWS = require("aws-sdk-mock");
const sinon = require("sinon");
const lib_1 = require("../lib");
const account_handler_1 = require("../lib/account-handler");
AWS.setSDK(require.resolve("aws-sdk"));
const createEvent = {
    RequestType: "Create",
    ServiceToken: "fakeToken",
    ResponseURL: "fakeUrl",
    StackId: "fakeStackId",
    RequestId: "fakeReqId",
    LogicalResourceId: "fakeLogicalId",
    ResourceType: "Custom::AccountCreation",
    ResourceProperties: {
        ServiceToken: "fakeToken",
        Email: "fakeAlias+fakeStage@amazon.com",
        AccountName: "Workload-fakeStage",
        AccountType: lib_1.AccountType.STAGE,
        StageName: "stage1",
        StageOrder: "1",
        HostedServices: "app1:app2:app3"
    },
};
const isCompleteCreateEvent = {
    RequestType: "Create",
    ServiceToken: "fakeToken",
    ResponseURL: "fakeUrl",
    StackId: "fakeStackId",
    RequestId: "fakeReqId",
    LogicalResourceId: "fakeLogicalId",
    ResourceType: "Custom::AccountCreation",
    ResourceProperties: {
        ServiceToken: "fakeToken",
    },
    PhysicalResourceId: "fakeRequestCreateAccountStatusId"
};
const updateEvent = {
    ...createEvent,
    RequestType: "Update",
    PhysicalResourceId: "fakeRequestCreateAccountStatusId"
};
const isCompleteUpdateEvent = {
    ...isCompleteCreateEvent,
    RequestType: "Update",
    ResourceProperties: {
        ServiceToken: updateEvent.ResourceProperties.ServiceToken,
        AccountType: updateEvent.ResourceProperties.AccountType,
        StageName: updateEvent.ResourceProperties.StageName,
        StageOrder: updateEvent.ResourceProperties.StageOrder,
        HostedServices: updateEvent.ResourceProperties.HostedServices
    }
};
afterEach(() => {
    AWS.restore();
});
test("on event creates account for Create requests", async () => {
    const createAccountRequestId = "fakeReqId";
    const createAccountMock = sinon.fake.resolves({
        CreateAccountStatus: { Id: createAccountRequestId },
    });
    AWS.mock("Organizations", "createAccount", createAccountMock);
    const data = await account_handler_1.onEventHandler(createEvent);
    sinon.assert.calledWith(createAccountMock, {
        Email: "fakeAlias+fakeStage@amazon.com",
        AccountName: "Workload-fakeStage",
        Tags: [
            {
                Key: "Email",
                Value: "fakeAlias+fakeStage@amazon.com"
            },
            {
                Key: "AccountName",
                Value: "Workload-fakeStage"
            },
            {
                Key: 'AccountType',
                Value: createEvent.ResourceProperties.AccountType
            },
            {
                Key: 'StageName',
                Value: createEvent.ResourceProperties.StageName
            },
            {
                Key: 'StageOrder',
                Value: createEvent.ResourceProperties.StageOrder.toString()
            },
            {
                Key: 'HostedServices',
                Value: createEvent.ResourceProperties.HostedServices
            }
        ],
    });
    expect(data).toEqual({
        PhysicalResourceId: createAccountRequestId,
    });
});
test("on update event does not call createAccount for Update requests but forward properties to isCompleteHandler for tag updates", async () => {
    const createAccountMock = sinon.fake.resolves({});
    AWS.mock("Organizations", "createAccount", createAccountMock);
    const data = await account_handler_1.onEventHandler(updateEvent);
    sinon.assert.notCalled(createAccountMock);
    expect(data).toEqual({
        PhysicalResourceId: updateEvent.PhysicalResourceId,
        ResourceProperties: updateEvent.ResourceProperties
    });
});
test("is complete for create throw without requestId", async () => {
    const describeCreateAccountStatusMock = sinon.fake.resolves({});
    AWS.mock("Organizations", "describeCreateAccountStatus", describeCreateAccountStatusMock);
    try {
        await account_handler_1.isCompleteHandler({
            RequestType: "Create",
            ServiceToken: "fakeToken",
            ResponseURL: "fakeUrl",
            StackId: "fakeStackId",
            RequestId: "fakeReqId",
            LogicalResourceId: "fakeLogicalId",
            ResourceType: "Custom::AccountCreation",
            ResourceProperties: {
                ServiceToken: "fakeToken",
            },
            PhysicalResourceId: undefined
        });
        sinon.assert.fail();
    }
    catch (error) {
        sinon.assert.notCalled(describeCreateAccountStatusMock);
        expect(error.message).toEqual("Missing PhysicalResourceId parameter.");
    }
});
test("is complete for create returns false when account creation is in progress", async () => {
    const describeCreateAccountStatusMock = sinon.fake.resolves({
        CreateAccountStatus: "INPROGRESS",
    });
    AWS.mock("Organizations", "describeCreateAccountStatus", describeCreateAccountStatusMock);
    const data = await account_handler_1.isCompleteHandler(isCompleteCreateEvent);
    expect(data.IsComplete).toBeFalsy;
});
test("is complete for create returns true when account creation is complete", async () => {
    var _a;
    const describeCreateAccountStatusMock = sinon.fake.resolves({
        CreateAccountStatus: {
            State: "SUCCEEDED",
            AccountId: "fakeAccountId"
        }
    });
    AWS.mock("Organizations", "describeCreateAccountStatus", describeCreateAccountStatusMock);
    const data = await account_handler_1.isCompleteHandler(isCompleteCreateEvent);
    expect(data.IsComplete).toBeTruthy;
    expect((_a = data.Data) === null || _a === void 0 ? void 0 : _a.AccountId).toEqual("fakeAccountId");
});
test("is complete for update updates tags of the account", async () => {
    var _a;
    const describeCreateAccountStatusMock = sinon.fake.resolves({
        CreateAccountStatus: {
            State: "SUCCEEDED",
            AccountId: "fakeAccountId"
        }
    });
    const tagResourceMock = sinon.fake.resolves({});
    AWS.mock("Organizations", "describeCreateAccountStatus", describeCreateAccountStatusMock);
    AWS.mock("Organizations", "tagResource", tagResourceMock);
    const data = await account_handler_1.isCompleteHandler(isCompleteUpdateEvent);
    expect(data.IsComplete).toBeTruthy;
    expect((_a = data.Data) === null || _a === void 0 ? void 0 : _a.AccountId).toEqual("fakeAccountId");
    sinon.assert.calledWith(tagResourceMock, {
        ResourceId: "fakeAccountId",
        Tags: [
            {
                Key: 'AccountType',
                Value: createEvent.ResourceProperties.AccountType
            },
            {
                Key: 'StageName',
                Value: createEvent.ResourceProperties.StageName
            },
            {
                Key: 'StageOrder',
                Value: createEvent.ResourceProperties.StageOrder.toString()
            },
            {
                Key: 'HostedServices',
                Value: createEvent.ResourceProperties.HostedServices
            }
        ],
    });
});
test("is complete for delete  throws", async () => {
    const describeCreateAccountStatusMock = sinon.fake.resolves({});
    AWS.mock("Organizations", "describeCreateAccountStatus", describeCreateAccountStatusMock);
    try {
        await account_handler_1.isCompleteHandler({
            ...isCompleteCreateEvent,
            RequestType: "Delete",
        });
    }
    catch (error) {
        expect(error.message).toEqual("DeleteAccount is not a supported operation");
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1wcm92aWRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWNjb3VudC1wcm92aWRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFjRTs7QUFHRixvQ0FBb0M7QUFDcEMsK0JBQStCO0FBQy9CLGdDQUFxQztBQUNyQyw0REFBMkU7QUFFM0UsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsTUFBTSxXQUFXLEdBQW1CO0lBQ2xDLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLFlBQVksRUFBRSxXQUFXO0lBQ3pCLFdBQVcsRUFBRSxTQUFTO0lBQ3RCLE9BQU8sRUFBRSxhQUFhO0lBQ3RCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLGlCQUFpQixFQUFFLGVBQWU7SUFDbEMsWUFBWSxFQUFFLHlCQUF5QjtJQUN2QyxrQkFBa0IsRUFBRTtRQUNsQixZQUFZLEVBQUUsV0FBVztRQUN6QixLQUFLLEVBQUUsZ0NBQWdDO1FBQ3ZDLFdBQVcsRUFBRSxvQkFBb0I7UUFDakMsV0FBVyxFQUFFLGlCQUFXLENBQUMsS0FBSztRQUM5QixTQUFTLEVBQUUsUUFBUTtRQUNuQixVQUFVLEVBQUUsR0FBRztRQUNmLGNBQWMsRUFBRSxnQkFBZ0I7S0FDakM7Q0FDRixDQUFDO0FBR0YsTUFBTSxxQkFBcUIsR0FBc0I7SUFDL0MsV0FBVyxFQUFFLFFBQVE7SUFDckIsWUFBWSxFQUFFLFdBQVc7SUFDekIsV0FBVyxFQUFFLFNBQVM7SUFDdEIsT0FBTyxFQUFFLGFBQWE7SUFDdEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsaUJBQWlCLEVBQUUsZUFBZTtJQUNsQyxZQUFZLEVBQUUseUJBQXlCO0lBQ3ZDLGtCQUFrQixFQUFFO1FBQ2xCLFlBQVksRUFBRSxXQUFXO0tBQzFCO0lBQ0Qsa0JBQWtCLEVBQUUsa0NBQWtDO0NBQ3ZELENBQUE7QUFFRCxNQUFN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LEdBQUcscUJBQXFCO1lBQ3hCLFdBQVcsRUFBRSxRQUFRO1NBQ3RCLENBQUMsQ0FBQztLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0tBQzdFO0FBQ0gsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIikuXG5Zb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgT25FdmVudFJlcXVlc3QsIElzQ29tcGxldGVSZXF1ZXN0IH0gZnJvbSBcImF3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMvbGliL3Byb3ZpZGVyLWZyYW1ld29yay90eXBlc1wiO1xuaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrLW1vY2tcIjtcbmltcG9ydCAqIGFzIHNpbm9uIGZyb20gXCJzaW5vblwiO1xuaW1wb3J0IHsgQWNjb3VudFR5cGUgfSBmcm9tIFwiLi4vbGliXCI7XG5pbXBvcnQgeyBpc0NvbXBsZXRlSGFuZGxlciwgb25FdmVudEhhbmRsZXIgfSBmcm9tIFwiLi4vbGliL2FjY291bnQtaGFuZGxlclwiO1xuXG5BV1Muc2V0U0RLKHJlcXVpcmUucmVzb2x2ZShcImF3cy1zZGtcIikpO1xuXG5jb25zdCBjcmVhdGVFdmVudDogT25FdmVudFJlcXVlc3QgPSB7XG4gIFJlcXVlc3RUeXBlOiBcIkNyZWF0ZVwiLFxuICBTZXJ2aWNlVG9rZW46IFwiZmFrZVRva2VuXCIsXG4gIFJlc3BvbnNlVVJMOiBcImZha2VVcmxcIixcbiAgU3RhY2tJZDogXCJmYWtlU3RhY2tJZFwiLFxuICBSZXF1ZXN0SWQ6IFwiZmFrZVJlcUlkXCIsXG4gIExvZ2ljYWxSZXNvdXJjZUlkOiBcImZha2VMb2dpY2FsSWRcIixcbiAgUmVzb3VyY2VUeXBlOiBcIkN1c3RvbTo6QWNjb3VudENyZWF0aW9uXCIsXG4gIFJlc291cmNlUHJvcGVydGllczoge1xuICAgIFNlcnZpY2VUb2tlbjogXCJmYWtlVG9rZW5cIixcbiAgICBFbWFpbDogXCJmYWtlQWxpYXMrZmFrZVN0YWdlQGFtYXpvbi5jb21cIixcbiAgICBBY2NvdW50TmFtZTogXCJXb3JrbG9hZC1mYWtlU3RhZ2VcIixcbiAgICBBY2NvdW50VHlwZTogQWNjb3VudFR5cGUuU1RBR0UsXG4gICAgU3RhZ2VOYW1lOiBcInN0YWdlMVwiLFxuICAgIFN0YWdlT3JkZXI6IFwiMVwiLFxuICAgIEhvc3RlZFNlcnZpY2VzOiBcImFwcDE6YXBwMjphcHAzXCJcbiAgfSxcbn07XG5cblxuY29uc3QgaXNDb21wbGV0ZUNyZWF0ZUV2ZW50OiBJc0NvbXBsZXRlUmVxdWVzdCA9IHtcbiAgUmVxdWVzdFR5cGU6IFwiQ3JlYXRlXCIsXG4gIFNlcnZpY2VUb2tlbjogXCJmYWtlVG9rZW5cIixcbiAgUmVzcG9uc2VVUkw6IFwiZmFrZVVybFwiLFxuICBTdGFja0lkOiBcImZha2VTdGFja0lkXCIsXG4gIFJlcXVlc3RJZDogXCJmYWtlUmVxSWRcIixcbiAgTG9naWNhbFJlc291cmNlSWQ6IFwiZmFrZUxvZ2ljYWxJZFwiLFxuICBSZXNvdXJjZVR5cGU6IFwiQ3VzdG9tOjpBY2NvdW50Q3JlYXRpb25cIixcbiAgUmVzb3VyY2VQcm9wZXJ0aWVzOiB7XG4gICAgU2VydmljZVRva2VuOiBcImZha2VUb2tlblwiLFxuICB9LFxuICBQaHlzaWNhbFJlc291cmNlSWQ6IFwiZmFrZVJlcXVlc3RDcmVhdGVBY2NvdW50U3RhdHVzSWRcIlxufVxuXG5jb25zdCB1cGRhdGVFdmVudDogT25FdmVudFJlcXVlc3QgPSB7XG4gIC4uLiBjcmVhdGVFdmVudCxcbiAgUmVxdWVzdFR5cGU6IFwiVXBkYXRlXCIsXG4gIFBoeXNpY2FsUmVzb3VyY2VJZDogXCJmYWtlUmVxdWVzdENyZWF0ZUFjY291bnRTdGF0dXNJZFwiXG59XG5jb25zdCBpc0NvbXBsZXRlVXBkYXRlRXZlbnQ6IElzQ29tcGxldGVSZXF1ZXN0ID0ge1xuICAuLi4gaXNDb21wbGV0ZUNyZWF0ZUV2ZW50LFxuICBSZXF1ZXN0VHlwZTogXCJVcGRhdGVcIixcbiAgUmVzb3VyY2VQcm9wZXJ0aWVzOiB7XG4gICAgU2VydmljZVRva2VuOiAgdXBkYXRlRXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLlNlcnZpY2VUb2tlbixcbiAgICBBY2NvdW50VHlwZTogdXBkYXRlRXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkFjY291bnRUeXBlLFxuICAgIFN0YWdlTmFtZTogdXBkYXRlRXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLlN0YWdlTmFtZSxcbiAgICBTdGFnZU9yZGVyOiB1cGRhdGVFdmVudC5SZXNvdXJjZVByb3BlcnRpZXMuU3RhZ2VPcmRlcixcbiAgICBIb3N0ZWRTZXJ2aWNlczogdXBkYXRlRXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkhvc3RlZFNlcnZpY2VzXG4gIH1cbn1cblxuYWZ0ZXJFYWNoKCgpID0+IHtcbiAgQVdTLnJlc3RvcmUoKTtcbn0pO1xuXG50ZXN0KFwib24gZXZlbnQgY3JlYXRlcyBhY2NvdW50IGZvciBDcmVhdGUgcmVxdWVzdHNcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBjcmVhdGVBY2NvdW50UmVxdWVzdElkID0gXCJmYWtlUmVxSWRcIjtcbiAgY29uc3QgY3JlYXRlQWNjb3VudE1vY2sgPSBzaW5vbi5mYWtlLnJlc29sdmVzKHtcbiAgICBDcmVhdGVBY2NvdW50U3RhdHVzOiB7IElkOiBjcmVhdGVBY2NvdW50UmVxdWVzdElkIH0sXG4gIH0pO1xuXG4gIEFXUy5tb2NrKFwiT3JnYW5pemF0aW9uc1wiLCBcImNyZWF0ZUFjY291bnRcIiwgY3JlYXRlQWNjb3VudE1vY2spO1xuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBvbkV2ZW50SGFuZGxlcihjcmVhdGVFdmVudCk7XG5cbiAgc2lub24uYXNzZXJ0LmNhbGxlZFdpdGgoY3JlYXRlQWNjb3VudE1vY2ssIHtcbiAgICBFbWFpbDogXCJmYWtlQWxpYXMrZmFrZVN0YWdlQGFtYXpvbi5jb21cIixcbiAgICBBY2NvdW50TmFtZTogXCJXb3JrbG9hZC1mYWtlU3RhZ2VcIixcbiAgICBUYWdzOiBbXG4gICAgICB7XG4gICAgICAgIEtleTogXCJFbWFpbFwiLFxuICAgICAgICBWYWx1ZTogXCJmYWtlQWxpYXMrZmFrZVN0YWdlQGFtYXpvbi5jb21cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgS2V5OiBcIkFjY291bnROYW1lXCIsXG4gICAgICAgIFZhbHVlOiBcIldvcmtsb2FkLWZha2VTdGFnZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBLZXk6ICdBY2NvdW50VHlwZScsXG4gICAgICAgIFZhbHVlOiBjcmVhdGVFdmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQWNjb3VudFR5cGVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIEtleTogJ1N0YWdlTmFtZScsXG4gICAgICAgIFZhbHVlOiBjcmVhdGVFdmVudC5SZXNvdXJjZVByb3BlcnRpZXMuU3RhZ2VOYW1lXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBLZXk6ICdTdGFnZU9yZGVyJyxcbiAgICAgICAgVmFsdWU6IGNyZWF0ZUV2ZW50LlJlc291cmNlUHJvcGVydGllcy5TdGFnZU9yZGVyLnRvU3RyaW5nKClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIEtleTogJ0hvc3RlZFNlcnZpY2VzJyxcbiAgICAgICAgVmFsdWU6IGNyZWF0ZUV2ZW50LlJlc291cmNlUHJvcGVydGllcy5Ib3N0ZWRTZXJ2aWNlc1xuICAgICAgfVxuICAgIF0sXG4gIH0pO1xuXG4gIGV4cGVjdChkYXRhKS50b0VxdWFsKHtcbiAgICBQaHlzaWNhbFJlc291cmNlSWQ6IGNyZWF0ZUFjY291bnRSZXF1ZXN0SWQsXG4gIH0pO1xufSk7XG5cbnRlc3QoXCJvbiB1cGRhdGUgZXZlbnQgZG9lcyBub3QgY2FsbCBjcmVhdGVBY2NvdW50IGZvciBVcGRhdGUgcmVxdWVzdHMgYnV0IGZvcndhcmQgcHJvcGVydGllcyB0byBpc0NvbXBsZXRlSGFuZGxlciBmb3IgdGFnIHVwZGF0ZXNcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBjcmVhdGVBY2NvdW50TW9jayA9IHNpbm9uLmZha2UucmVzb2x2ZXMoe30pO1xuXG4gIEFXUy5tb2NrKFwiT3JnYW5pemF0aW9uc1wiLCBcImNyZWF0ZUFjY291bnRcIiwgY3JlYXRlQWNjb3VudE1vY2spO1xuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBvbkV2ZW50SGFuZGxlcih1cGRhdGVFdmVudCk7XG4gICAgc2lub24uYXNzZXJ0Lm5vdENhbGxlZChjcmVhdGVBY2NvdW50TW9jayk7XG4gICAgZXhwZWN0KGRhdGEpLnRvRXF1YWwoe1xuICAgICAgUGh5c2ljYWxSZXNvdXJjZUlkOiB1cGRhdGVFdmVudC5QaHlzaWNhbFJlc291cmNlSWQsXG4gICAgICBSZXNvdXJjZVByb3BlcnRpZXM6IHVwZGF0ZUV2ZW50LlJlc291cmNlUHJvcGVydGllc1xuICAgIH0pO1xufSk7XG5cbnRlc3QoXCJpcyBjb21wbGV0ZSBmb3IgY3JlYXRlIHRocm93IHdpdGhvdXQgcmVxdWVzdElkXCIsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgZGVzY3JpYmVDcmVhdGVBY2NvdW50U3RhdHVzTW9jayA9IHNpbm9uLmZha2UucmVzb2x2ZXMoe30pO1xuXG4gIEFXUy5tb2NrKFxuICAgIFwiT3JnYW5pemF0aW9uc1wiLFxuICAgIFwiZGVzY3JpYmVDcmVhdGVBY2NvdW50U3RhdHVzXCIsXG4gICAgZGVzY3JpYmVDcmVhdGVBY2NvdW50U3RhdHVzTW9ja1xuICApO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgaXNDb21wbGV0ZUhhbmRsZXIoe1xuICAgICAgUmVxdWVzdFR5cGU6IFwiQ3JlYXRlXCIsXG4gICAgICBTZXJ2aWNlVG9rZW46IFwiZmFrZVRva2VuXCIsXG4gICAgICBSZXNwb25zZVVSTDogXCJmYWtlVXJsXCIsXG4gICAgICBTdGFja0lkOiBcImZha2VTdGFja0lkXCIsXG4gICAgICBSZXF1ZXN0SWQ6IFwiZmFrZVJlcUlkXCIsXG4gICAgICBMb2dpY2FsUmVzb3VyY2VJZDogXCJmYWtlTG9naWNhbElkXCIsXG4gICAgICBSZXNvdXJjZVR5cGU6IFwiQ3VzdG9tOjpBY2NvdW50Q3JlYXRpb25cIixcbiAgICAgIFJlc291cmNlUHJvcGVydGllczoge1xuICAgICAgICBTZXJ2aWNlVG9rZW46IFwiZmFrZVRva2VuXCIsXG4gICAgICB9LFxuICAgICAgUGh5c2ljYWxSZXNvdXJjZUlkOiB1bmRlZmluZWRcbiAgICB9KTtcbiAgICBzaW5vbi5hc3NlcnQuZmFpbCgpO1xuICB9ICBjYXRjaCAoZXJyb3IpIHtcbiAgICBzaW5vbi5hc3NlcnQubm90Q2FsbGVkKGRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c01vY2spO1xuICAgIGV4cGVjdChlcnJvci5tZXNzYWdlKS50b0VxdWFsKFwiTWlzc2luZyBQaHlzaWNhbFJlc291cmNlSWQgcGFyYW1ldGVyLlwiKTtcbiAgfVxufSk7XG5cbnRlc3QoXCJpcyBjb21wbGV0ZSBmb3IgY3JlYXRlIHJldHVybnMgZmFsc2Ugd2hlbiBhY2NvdW50IGNyZWF0aW9uIGlzIGluIHByb2dyZXNzXCIsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgZGVzY3JpYmVDcmVhdGVBY2NvdW50U3RhdHVzTW9jayA9IHNpbm9uLmZha2UucmVzb2x2ZXMoe1xuICAgIENyZWF0ZUFjY291bnRTdGF0dXM6IFwiSU5QUk9HUkVTU1wiLFxuICB9KTtcblxuICBBV1MubW9jayhcbiAgICBcIk9yZ2FuaXphdGlvbnNcIixcbiAgICBcImRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c1wiLFxuICAgIGRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c01vY2tcbiAgKTtcblxuICBjb25zdCBkYXRhID0gYXdhaXQgaXNDb21wbGV0ZUhhbmRsZXIoaXNDb21wbGV0ZUNyZWF0ZUV2ZW50KTtcblxuICBleHBlY3QoZGF0YS5Jc0NvbXBsZXRlKS50b0JlRmFsc3k7XG59KTtcblxudGVzdChcImlzIGNvbXBsZXRlIGZvciBjcmVhdGUgcmV0dXJucyB0cnVlIHdoZW4gYWNjb3VudCBjcmVhdGlvbiBpcyBjb21wbGV0ZVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c01vY2sgPSBzaW5vbi5mYWtlLnJlc29sdmVzKHtcbiAgICBDcmVhdGVBY2NvdW50U3RhdHVzOiB7XG4gICAgICAgIFN0YXRlOiBcIlNVQ0NFRURFRFwiLFxuICAgICAgICBBY2NvdW50SWQ6IFwiZmFrZUFjY291bnRJZFwiXG4gICAgfVxuICB9KTtcblxuICBBV1MubW9jayhcbiAgICBcIk9yZ2FuaXphdGlvbnNcIixcbiAgICBcImRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c1wiLFxuICAgIGRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c01vY2tcbiAgKTtcblxuICBjb25zdCBkYXRhID0gYXdhaXQgaXNDb21wbGV0ZUhhbmRsZXIoaXNDb21wbGV0ZUNyZWF0ZUV2ZW50KTtcblxuICBleHBlY3QoZGF0YS5Jc0NvbXBsZXRlKS50b0JlVHJ1dGh5O1xuICBleHBlY3QoZGF0YS5EYXRhPy5BY2NvdW50SWQpLnRvRXF1YWwoXCJmYWtlQWNjb3VudElkXCIpO1xufSk7XG5cbnRlc3QoXCJpcyBjb21wbGV0ZSBmb3IgdXBkYXRlIHVwZGF0ZXMgdGFncyBvZiB0aGUgYWNjb3VudFwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1c01vY2sgPSBzaW5vbi5mYWtlLnJlc29sdmVzKHtcbiAgICBDcmVhdGVBY2NvdW50U3RhdHVzOiB7XG4gICAgICAgIFN0YXRlOiBcIlNVQ0NFRURFRFwiLFxuICAgICAgICBBY2NvdW50SWQ6IFwiZmFrZUFjY291bnRJZFwiXG4gICAgfVxuICB9KTtcbiAgY29uc3QgdGFnUmVzb3VyY2VNb2NrID0gc2lub24uZmFrZS5yZXNvbHZlcyh7fSk7XG5cbiAgQVdTLm1vY2soXG4gICAgXCJPcmdhbml6YXRpb25zXCIsXG4gICAgXCJkZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNcIixcbiAgICBkZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNNb2NrXG4gICk7XG5cbiAgQVdTLm1vY2soXG4gICAgXCJPcmdhbml6YXRpb25zXCIsXG4gICAgXCJ0YWdSZXNvdXJjZVwiLFxuICAgIHRhZ1Jlc291cmNlTW9ja1xuICApO1xuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBpc0NvbXBsZXRlSGFuZGxlcihpc0NvbXBsZXRlVXBkYXRlRXZlbnQpO1xuXG4gIGV4cGVjdChkYXRhLklzQ29tcGxldGUpLnRvQmVUcnV0aHk7XG4gIGV4cGVjdChkYXRhLkRhdGE/LkFjY291bnRJZCkudG9FcXVhbChcImZha2VBY2NvdW50SWRcIik7XG5cbiAgc2lub24uYXNzZXJ0LmNhbGxlZFdpdGgodGFnUmVzb3VyY2VNb2NrLCB7XG4gICAgUmVzb3VyY2VJZDogXCJmYWtlQWNjb3VudElkXCIsXG4gICAgVGFnczogW1xuICAgICAge1xuICAgICAgICBLZXk6ICdBY2NvdW50VHlwZScsXG4gICAgICAgIFZhbHVlOiBjcmVhdGVFdmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQWNjb3VudFR5cGVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIEtleTogJ1N0YWdlTmFtZScsXG4gICAgICAgIFZhbHVlOiBjcmVhdGVFdmVudC5SZXNvdXJjZVByb3BlcnRpZXMuU3RhZ2VOYW1lXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBLZXk6ICdTdGFnZU9yZGVyJyxcbiAgICAgICAgVmFsdWU6IGNyZWF0ZUV2ZW50LlJlc291cmNlUHJvcGVydGllcy5TdGFnZU9yZGVyLnRvU3RyaW5nKClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIEtleTogJ0hvc3RlZFNlcnZpY2VzJyxcbiAgICAgICAgVmFsdWU6IGNyZWF0ZUV2ZW50LlJlc291cmNlUHJvcGVydGllcy5Ib3N0ZWRTZXJ2aWNlc1xuICAgICAgfVxuICAgIF0sXG4gIH0pO1xufSk7XG5cbnRlc3QoXCJpcyBjb21wbGV0ZSBmb3IgZGVsZXRlICB0aHJvd3NcIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBkZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNNb2NrID0gc2lub24uZmFrZS5yZXNvbHZlcyh7fSk7XG5cbiAgQVdTLm1vY2soXG4gICAgXCJPcmdhbml6YXRpb25zXCIsXG4gICAgXCJkZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNcIixcbiAgICBkZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNNb2NrXG4gICk7XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBpc0NvbXBsZXRlSGFuZGxlcih7XG4gICAgICAuLi5pc0NvbXBsZXRlQ3JlYXRlRXZlbnQsXG4gICAgICBSZXF1ZXN0VHlwZTogXCJEZWxldGVcIixcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBleHBlY3QoZXJyb3IubWVzc2FnZSkudG9FcXVhbChcIkRlbGV0ZUFjY291bnQgaXMgbm90IGEgc3VwcG9ydGVkIG9wZXJhdGlvblwiKTtcbiAgfVxufSk7XG4iXX0=