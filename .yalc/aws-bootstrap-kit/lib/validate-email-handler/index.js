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
const aws_sdk_1 = require("aws-sdk");
aws_sdk_1.config.update({ region: "us-east-1" });
/**
 * A function that send a verification email
 * @param event An event with the following ResourceProperties: email (coresponding to the root email)
 * @returns Returns a PhysicalResourceId
 */
async function onEventHandler(event) {
    console.log("Event: %j", event);
    if (event.RequestType === "Create") {
        const ses = new aws_sdk_1.SES();
        await ses
            .verifyEmailIdentity({ EmailAddress: event.ResourceProperties.email })
            .promise();
        return { PhysicalResourceId: 'validateEmail' };
    }
    if (event.RequestType === "Delete") {
        return { PhysicalResourceId: event.PhysicalResourceId };
    }
}
exports.onEventHandler = onEventHandler;
/**
 * A function that checks email has been verified
 * @param event An event with the following ResourceProperties: email (coresponding to the root email)
 * @returns A payload containing the IsComplete Flag requested by cdk Custom Resource to figure out if the email has been verified and if not retries later
 */
async function isCompleteHandler(event) {
    var _a;
    console.log("Event: %j", event);
    if (!event.PhysicalResourceId) {
        throw new Error("Missing PhysicalResourceId parameter.");
    }
    const email = event.ResourceProperties.email;
    if (event.RequestType === "Create") {
        const ses = new aws_sdk_1.SES();
        const response = await ses
            .getIdentityVerificationAttributes({
            Identities: [email]
        })
            .promise();
        return {
            IsComplete: ((_a = response.VerificationAttributes[email]) === null || _a === void 0 ? void 0 : _a.VerificationStatus) === "Success"
        };
    }
    if (event.RequestType === "Delete") {
        return { IsComplete: true };
    }
}
exports.isCompleteHandler = isCompleteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBY0U7OztBQUVGLHFDQUFzQztBQU90QyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBRXZDOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsY0FBYyxDQUNsQyxLQUFVO0lBRVYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFaEMsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sR0FBRzthQUNOLG1CQUFtQixDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNyRSxPQUFPLEVBQUUsQ0FBQztRQUViLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsQ0FBQztLQUNoRDtJQUVELElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUU7UUFDbEMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQ3pEO0FBQ0gsQ0FBQztBQWpCRCx3Q0FpQkM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLGlCQUFpQixDQUNyQyxLQUF3Qjs7SUFFeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRTtRQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7S0FDMUQ7SUFFRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO0lBQzdDLElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUU7UUFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxhQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUc7YUFDdkIsaUNBQWlDLENBQUM7WUFDakMsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQ3BCLENBQUM7YUFDRCxPQUFPLEVBQUUsQ0FBQztRQUViLE9BQU87WUFDTCxVQUFVLEVBQ1IsT0FBQSxRQUFRLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLDBDQUFFLGtCQUFrQixNQUFLLFNBQVM7U0FDM0UsQ0FBQztLQUNIO0lBQ0QsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUNsQyxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO0tBQzdCO0FBQ0gsQ0FBQztBQTFCRCw4Q0EwQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIikuXG5Zb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgU0VTLCBjb25maWcgfSBmcm9tIFwiYXdzLXNka1wiO1xuaW1wb3J0IHR5cGUge1xuICBJc0NvbXBsZXRlUmVxdWVzdCxcbiAgSXNDb21wbGV0ZVJlc3BvbnNlLFxuICBPbkV2ZW50UmVzcG9uc2Vcbn0gZnJvbSBcImF3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMvbGliL3Byb3ZpZGVyLWZyYW1ld29yay90eXBlc1wiO1xuXG5jb25maWcudXBkYXRlKHsgcmVnaW9uOiBcInVzLWVhc3QtMVwiIH0pO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCBzZW5kIGEgdmVyaWZpY2F0aW9uIGVtYWlsXG4gKiBAcGFyYW0gZXZlbnQgQW4gZXZlbnQgd2l0aCB0aGUgZm9sbG93aW5nIFJlc291cmNlUHJvcGVydGllczogZW1haWwgKGNvcmVzcG9uZGluZyB0byB0aGUgcm9vdCBlbWFpbClcbiAqIEByZXR1cm5zIFJldHVybnMgYSBQaHlzaWNhbFJlc291cmNlSWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uRXZlbnRIYW5kbGVyKFxuICBldmVudDogYW55XG4pOiBQcm9taXNlPE9uRXZlbnRSZXNwb25zZSB8IHZvaWQ+IHtcbiAgY29uc29sZS5sb2coXCJFdmVudDogJWpcIiwgZXZlbnQpO1xuXG4gIGlmIChldmVudC5SZXF1ZXN0VHlwZSA9PT0gXCJDcmVhdGVcIikge1xuICAgIGNvbnN0IHNlcyA9IG5ldyBTRVMoKTtcbiAgICBhd2FpdCBzZXNcbiAgICAgIC52ZXJpZnlFbWFpbElkZW50aXR5KHsgRW1haWxBZGRyZXNzOiBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuZW1haWwgfSlcbiAgICAgIC5wcm9taXNlKCk7XG5cbiAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6ICd2YWxpZGF0ZUVtYWlsJyB9O1xuICB9XG5cbiAgaWYgKGV2ZW50LlJlcXVlc3RUeXBlID09PSBcIkRlbGV0ZVwiKSB7XG4gICAgcmV0dXJuIHsgUGh5c2ljYWxSZXNvdXJjZUlkOiBldmVudC5QaHlzaWNhbFJlc291cmNlSWQgfTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCBjaGVja3MgZW1haWwgaGFzIGJlZW4gdmVyaWZpZWRcbiAqIEBwYXJhbSBldmVudCBBbiBldmVudCB3aXRoIHRoZSBmb2xsb3dpbmcgUmVzb3VyY2VQcm9wZXJ0aWVzOiBlbWFpbCAoY29yZXNwb25kaW5nIHRvIHRoZSByb290IGVtYWlsKVxuICogQHJldHVybnMgQSBwYXlsb2FkIGNvbnRhaW5pbmcgdGhlIElzQ29tcGxldGUgRmxhZyByZXF1ZXN0ZWQgYnkgY2RrIEN1c3RvbSBSZXNvdXJjZSB0byBmaWd1cmUgb3V0IGlmIHRoZSBlbWFpbCBoYXMgYmVlbiB2ZXJpZmllZCBhbmQgaWYgbm90IHJldHJpZXMgbGF0ZXJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzQ29tcGxldGVIYW5kbGVyKFxuICBldmVudDogSXNDb21wbGV0ZVJlcXVlc3Rcbik6IFByb21pc2U8SXNDb21wbGV0ZVJlc3BvbnNlIHwgdm9pZD4ge1xuICBjb25zb2xlLmxvZyhcIkV2ZW50OiAlalwiLCBldmVudCk7XG5cbiAgaWYgKCFldmVudC5QaHlzaWNhbFJlc291cmNlSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIFBoeXNpY2FsUmVzb3VyY2VJZCBwYXJhbWV0ZXIuXCIpO1xuICB9XG5cbiAgY29uc3QgZW1haWwgPSBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuZW1haWw7XG4gIGlmIChldmVudC5SZXF1ZXN0VHlwZSA9PT0gXCJDcmVhdGVcIikge1xuICAgIGNvbnN0IHNlcyA9IG5ldyBTRVMoKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlc1xuICAgICAgLmdldElkZW50aXR5VmVyaWZpY2F0aW9uQXR0cmlidXRlcyh7XG4gICAgICAgIElkZW50aXRpZXM6IFtlbWFpbF1cbiAgICAgIH0pXG4gICAgICAucHJvbWlzZSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIElzQ29tcGxldGU6XG4gICAgICAgIHJlc3BvbnNlLlZlcmlmaWNhdGlvbkF0dHJpYnV0ZXNbZW1haWxdPy5WZXJpZmljYXRpb25TdGF0dXMgPT09IFwiU3VjY2Vzc1wiXG4gICAgfTtcbiAgfVxuICBpZiAoZXZlbnQuUmVxdWVzdFR5cGUgPT09IFwiRGVsZXRlXCIpIHtcbiAgICByZXR1cm4geyBJc0NvbXBsZXRlOiB0cnVlIH07XG4gIH1cbn1cbiJdfQ==