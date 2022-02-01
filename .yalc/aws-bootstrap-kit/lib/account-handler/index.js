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
exports.isCompleteHandler = exports.onEventHandler = void 0;
// eslint-disable-line import/no-extraneous-dependencies
const aws_sdk_1 = require("aws-sdk");
/**
 * A function capable of creating an account into an AWS Organisation
 * @param event An event with the following ResourceProperties: Email (coresponding to the account email) and AccountName (corresponding to the account name)
 * @returns Returns a PhysicalResourceId corresponding to the CreateAccount request's id necessary to check the status of the creation
 */
async function onEventHandler(event) {
    var _a;
    console.log("Event: %j", event);
    switch (event.RequestType) {
        case "Create":
            const awsOrganizationsClient = new aws_sdk_1.Organizations({ region: 'us-east-1' });
            try {
                const tags = [];
                Object.keys(event.ResourceProperties).forEach(propertyKey => {
                    if (propertyKey != 'ServiceToken')
                        tags.push({ Key: propertyKey, Value: event.ResourceProperties[propertyKey] });
                });
                const data = await awsOrganizationsClient
                    .createAccount({
                    Email: event.ResourceProperties.Email,
                    AccountName: event.ResourceProperties.AccountName,
                    Tags: tags
                })
                    .promise();
                console.log("create account: %j", data);
                return { PhysicalResourceId: (_a = data.CreateAccountStatus) === null || _a === void 0 ? void 0 : _a.Id };
            }
            catch (error) {
                throw new Error(`Failed to create account: ${error}`);
            }
        case "Update":
            return { PhysicalResourceId: event.PhysicalResourceId, ResourceProperties: event.ResourceProperties };
        default:
            throw new Error(`${event.RequestType} is not a supported operation`);
    }
}
exports.onEventHandler = onEventHandler;
/**
 * A function capable to check if an account creation request has been completed
 * @param event An event containing a PhysicalResourceId corresponding to a CreateAccountRequestId
 * @returns A payload containing the IsComplete Flag requested by cdk Custom Resource fwk to figure out if the resource has been created or failed to be or if it needs to retry
 */
async function isCompleteHandler(event) {
    var _a, _b, _c, _d;
    console.log("Event: %j", event);
    if (!event.PhysicalResourceId) {
        throw new Error("Missing PhysicalResourceId parameter.");
    }
    const awsOrganizationsClient = new aws_sdk_1.Organizations({ region: 'us-east-1' });
    const describeCreateAccountStatusParams = { CreateAccountRequestId: event.PhysicalResourceId };
    const data = await awsOrganizationsClient
        .describeCreateAccountStatus(describeCreateAccountStatusParams).promise();
    console.log("Describe account: %j", data);
    const CreateAccountStatus = (_a = data.CreateAccountStatus) === null || _a === void 0 ? void 0 : _a.State;
    const AccountId = (_b = data.CreateAccountStatus) === null || _b === void 0 ? void 0 : _b.AccountId;
    switch (event.RequestType) {
        case "Create":
            if (CreateAccountStatus === "FAILED") {
                throw new Error(`Error creating the account ${(_c = data.CreateAccountStatus) === null || _c === void 0 ? void 0 : _c.AccountName}, cause: ${(_d = data.CreateAccountStatus) === null || _d === void 0 ? void 0 : _d.FailureReason}`);
            }
            return { IsComplete: CreateAccountStatus === "SUCCEEDED", Data: { AccountId: AccountId } };
        case "Update":
            if (AccountId) {
                console.log(`Add tags: type = ${event.ResourceProperties.AccountType}`);
                const tags = [];
                Object.keys(event.ResourceProperties).forEach(propertyKey => {
                    if (propertyKey != 'ServiceToken')
                        tags.push({ Key: propertyKey, Value: event.ResourceProperties[propertyKey] });
                });
                const tagsUpdateRequestData = await awsOrganizationsClient
                    .tagResource({
                    ResourceId: AccountId,
                    Tags: tags
                })
                    .promise();
                console.log("Updated account tags: %j", tagsUpdateRequestData);
            }
            return { IsComplete: CreateAccountStatus === "SUCCEEDED", Data: { AccountId: AccountId } };
        case "Delete":
            // TODO: figure out what to do here
            throw new Error("DeleteAccount is not a supported operation");
    }
}
exports.isCompleteHandler = isCompleteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBY0U7OztBQVNGLHdEQUF3RDtBQUN4RCxxQ0FBd0M7QUFHeEM7Ozs7R0FJRztBQUVJLEtBQUssVUFBVSxjQUFjLENBQ2xDLEtBQVU7O0lBRVYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFaEMsUUFBUSxLQUFLLENBQUMsV0FBVyxFQUFFO1FBQ3pCLEtBQUssUUFBUTtZQUNYLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7WUFDeEUsSUFBSTtnQkFDRixNQUFNLElBQUksR0FBbUMsRUFBRSxDQUFDO2dCQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxXQUFXLENBQUMsRUFBRTtvQkFDM0QsSUFBSSxXQUFXLElBQUksY0FBYzt3QkFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxFQUFDLENBQUMsQ0FBQztnQkFDbEgsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxzQkFBc0I7cUJBQ3hDLGFBQWEsQ0FBQztvQkFDYixLQUFLLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQUs7b0JBQ3JDLFdBQVcsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsV0FBVztvQkFDakQsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQztxQkFDRCxPQUFPLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLEVBQUUs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QkFBbUIsS0FBSyxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBQyxFQUFFLENBQUM7UUFDN0YsS0FBSyxRQUFRO1lBQ1gsbUNBQW1DO1lBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztLQUNqRTtBQUNILENBQUM7QUE5Q0QsOENBOENDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmltcG9ydCB0eXBlIHtcbiAgSXNDb21wbGV0ZVJlcXVlc3QsXG4gIElzQ29tcGxldGVSZXNwb25zZSxcbiAgT25FdmVudFJlc3BvbnNlLFxufSBmcm9tIFwiYXdzLWNkay1saWIvY3VzdG9tLXJlc291cmNlcy9saWIvcHJvdmlkZXItZnJhbWV3b3JrL3R5cGVzXCI7XG5cbi8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBPcmdhbml6YXRpb25zIH0gZnJvbSBcImF3cy1zZGtcIjtcblxuXG4vKipcbiAqIEEgZnVuY3Rpb24gY2FwYWJsZSBvZiBjcmVhdGluZyBhbiBhY2NvdW50IGludG8gYW4gQVdTIE9yZ2FuaXNhdGlvblxuICogQHBhcmFtIGV2ZW50IEFuIGV2ZW50IHdpdGggdGhlIGZvbGxvd2luZyBSZXNvdXJjZVByb3BlcnRpZXM6IEVtYWlsIChjb3Jlc3BvbmRpbmcgdG8gdGhlIGFjY291bnQgZW1haWwpIGFuZCBBY2NvdW50TmFtZSAoY29ycmVzcG9uZGluZyB0byB0aGUgYWNjb3VudCBuYW1lKVxuICogQHJldHVybnMgUmV0dXJucyBhIFBoeXNpY2FsUmVzb3VyY2VJZCBjb3JyZXNwb25kaW5nIHRvIHRoZSBDcmVhdGVBY2NvdW50IHJlcXVlc3QncyBpZCBuZWNlc3NhcnkgdG8gY2hlY2sgdGhlIHN0YXR1cyBvZiB0aGUgY3JlYXRpb25cbiAqL1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25FdmVudEhhbmRsZXIoXG4gIGV2ZW50OiBhbnlcbik6IFByb21pc2U8T25FdmVudFJlc3BvbnNlPiB7XG4gIGNvbnNvbGUubG9nKFwiRXZlbnQ6ICVqXCIsIGV2ZW50KTtcblxuICBzd2l0Y2ggKGV2ZW50LlJlcXVlc3RUeXBlKSB7XG4gICAgY2FzZSBcIkNyZWF0ZVwiOlxuICAgICAgY29uc3QgYXdzT3JnYW5pemF0aW9uc0NsaWVudCA9IG5ldyBPcmdhbml6YXRpb25zKHtyZWdpb246ICd1cy1lYXN0LTEnfSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0YWdzOiB7IEtleTogc3RyaW5nOyBWYWx1ZTogYW55OyB9W10gPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzKS5mb3JFYWNoKCBwcm9wZXJ0eUtleSA9PiB7XG4gICAgICAgICAgaWYoIHByb3BlcnR5S2V5ICE9ICdTZXJ2aWNlVG9rZW4nICkgdGFncy5wdXNoKHtLZXk6IHByb3BlcnR5S2V5LCBWYWx1ZTogZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzW3Byb3BlcnR5S2V5XX0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGF3c09yZ2FuaXphdGlvbnNDbGllbnRcbiAgICAgICAgLmNyZWF0ZUFjY291bnQoe1xuICAgICAgICAgIEVtYWlsOiBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuRW1haWwsXG4gICAgICAgICAgQWNjb3VudE5hbWU6IGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5BY2NvdW50TmFtZSxcbiAgICAgICAgICBUYWdzOiB0YWdzXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY3JlYXRlIGFjY291bnQ6ICVqXCIsIGRhdGEpO1xuICAgICAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IGRhdGEuQ3JlYXRlQWNjb3VudFN0YXR1cz8uSWQgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSBhY2NvdW50OiAke2Vycm9yfWApO1xuICAgICAgfVxuICAgIGNhc2UgXCJVcGRhdGVcIjpcbiAgICAgIHJldHVybiB7IFBoeXNpY2FsUmVzb3VyY2VJZDogZXZlbnQuUGh5c2ljYWxSZXNvdXJjZUlkLCBSZXNvdXJjZVByb3BlcnRpZXM6IGV2ZW50LlJlc291cmNlUHJvcGVydGllcyB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZXZlbnQuUmVxdWVzdFR5cGV9IGlzIG5vdCBhIHN1cHBvcnRlZCBvcGVyYXRpb25gKTtcbiAgfVxuXG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiBjYXBhYmxlIHRvIGNoZWNrIGlmIGFuIGFjY291bnQgY3JlYXRpb24gcmVxdWVzdCBoYXMgYmVlbiBjb21wbGV0ZWRcbiAqIEBwYXJhbSBldmVudCBBbiBldmVudCBjb250YWluaW5nIGEgUGh5c2ljYWxSZXNvdXJjZUlkIGNvcnJlc3BvbmRpbmcgdG8gYSBDcmVhdGVBY2NvdW50UmVxdWVzdElkXG4gKiBAcmV0dXJucyBBIHBheWxvYWQgY29udGFpbmluZyB0aGUgSXNDb21wbGV0ZSBGbGFnIHJlcXVlc3RlZCBieSBjZGsgQ3VzdG9tIFJlc291cmNlIGZ3ayB0byBmaWd1cmUgb3V0IGlmIHRoZSByZXNvdXJjZSBoYXMgYmVlbiBjcmVhdGVkIG9yIGZhaWxlZCB0byBiZSBvciBpZiBpdCBuZWVkcyB0byByZXRyeVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNDb21wbGV0ZUhhbmRsZXIoXG4gIGV2ZW50OiBJc0NvbXBsZXRlUmVxdWVzdFxuKTogUHJvbWlzZTxJc0NvbXBsZXRlUmVzcG9uc2U+IHtcbiAgY29uc29sZS5sb2coXCJFdmVudDogJWpcIiwgZXZlbnQpO1xuXG4gIGlmKCFldmVudC5QaHlzaWNhbFJlc291cmNlSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIFBoeXNpY2FsUmVzb3VyY2VJZCBwYXJhbWV0ZXIuXCIpO1xuICB9XG5cbiAgY29uc3QgYXdzT3JnYW5pemF0aW9uc0NsaWVudCA9IG5ldyBPcmdhbml6YXRpb25zKHtyZWdpb246ICd1cy1lYXN0LTEnfSk7XG5cbiAgY29uc3QgZGVzY3JpYmVDcmVhdGVBY2NvdW50U3RhdHVzUGFyYW1zIDogT3JnYW5pemF0aW9ucy5EZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNSZXF1ZXN0ID0ge0NyZWF0ZUFjY291bnRSZXF1ZXN0SWQ6IGV2ZW50LlBoeXNpY2FsUmVzb3VyY2VJZH1cbiAgY29uc3QgZGF0YTogT3JnYW5pemF0aW9ucy5EZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNSZXNwb25zZSAgPSBhd2FpdCBhd3NPcmdhbml6YXRpb25zQ2xpZW50XG4gICAgLmRlc2NyaWJlQ3JlYXRlQWNjb3VudFN0YXR1cyhkZXNjcmliZUNyZWF0ZUFjY291bnRTdGF0dXNQYXJhbXMpLnByb21pc2UoKTtcblxuICBjb25zb2xlLmxvZyhcIkRlc2NyaWJlIGFjY291bnQ6ICVqXCIsIGRhdGEpO1xuXG4gIGNvbnN0IENyZWF0ZUFjY291bnRTdGF0dXMgPSBkYXRhLkNyZWF0ZUFjY291bnRTdGF0dXM/LlN0YXRlO1xuICBjb25zdCBBY2NvdW50SWQgPSBkYXRhLkNyZWF0ZUFjY291bnRTdGF0dXM/LkFjY291bnRJZDtcblxuICBzd2l0Y2ggKGV2ZW50LlJlcXVlc3RUeXBlKSB7XG4gICAgY2FzZSBcIkNyZWF0ZVwiOlxuICAgICAgaWYgKENyZWF0ZUFjY291bnRTdGF0dXMgPT09IFwiRkFJTEVEXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBjcmVhdGluZyB0aGUgYWNjb3VudCAke2RhdGEuQ3JlYXRlQWNjb3VudFN0YXR1cz8uQWNjb3VudE5hbWV9LCBjYXVzZTogJHtkYXRhLkNyZWF0ZUFjY291bnRTdGF0dXM/LkZhaWx1cmVSZWFzb259YClcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IElzQ29tcGxldGU6IENyZWF0ZUFjY291bnRTdGF0dXMgPT09IFwiU1VDQ0VFREVEXCIsIERhdGE6IHtBY2NvdW50SWQ6IEFjY291bnRJZH0gfTtcbiAgICBjYXNlIFwiVXBkYXRlXCI6XG4gICAgICBpZihBY2NvdW50SWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYEFkZCB0YWdzOiB0eXBlID0gJHtldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQWNjb3VudFR5cGV9YCk7XG4gICAgICAgIGNvbnN0IHRhZ3M6IHsgS2V5OiBzdHJpbmc7IFZhbHVlOiBhbnk7IH1bXSA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhldmVudC5SZXNvdXJjZVByb3BlcnRpZXMpLmZvckVhY2goIHByb3BlcnR5S2V5ID0+IHtcbiAgICAgICAgICBpZiggcHJvcGVydHlLZXkgIT0gJ1NlcnZpY2VUb2tlbicgKSB0YWdzLnB1c2goe0tleTogcHJvcGVydHlLZXksIFZhbHVlOiBldmVudC5SZXNvdXJjZVByb3BlcnRpZXNbcHJvcGVydHlLZXldfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB0YWdzVXBkYXRlUmVxdWVzdERhdGEgPSBhd2FpdCBhd3NPcmdhbml6YXRpb25zQ2xpZW50XG4gICAgICAgIC50YWdSZXNvdXJjZSh7XG4gICAgICAgICAgUmVzb3VyY2VJZDogQWNjb3VudElkISxcbiAgICAgICAgICBUYWdzOiB0YWdzXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVXBkYXRlZCBhY2NvdW50IHRhZ3M6ICVqXCIsIHRhZ3NVcGRhdGVSZXF1ZXN0RGF0YSk7XG4gICAgICB9XG4gICAgICAgIHJldHVybiB7IElzQ29tcGxldGU6IENyZWF0ZUFjY291bnRTdGF0dXMgPT09IFwiU1VDQ0VFREVEXCIsIERhdGE6IHtBY2NvdW50SWQ6IEFjY291bnRJZH0gfTtcbiAgICBjYXNlIFwiRGVsZXRlXCI6XG4gICAgICAvLyBUT0RPOiBmaWd1cmUgb3V0IHdoYXQgdG8gZG8gaGVyZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGVsZXRlQWNjb3VudCBpcyBub3QgYSBzdXBwb3J0ZWQgb3BlcmF0aW9uXCIpO1xuICB9XG59XG4iXX0=