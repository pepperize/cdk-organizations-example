"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateEmail = void 0;
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
const aws_cdk_lib_1 = require("aws-cdk-lib");
const validate_email_provider_1 = require("./validate-email-provider");
/**
 * Email Validation.
 */
class ValidateEmail extends constructs_1.Construct {
    /**
     * Constructor.
     *
     * @param scope The parent Construct instantiating this construct.
     * @param id This instance name.
     */
    constructor(scope, id, props) {
        super(scope, id);
        const [prefix, domain] = props.email.split("@");
        if (prefix === null || prefix === void 0 ? void 0 : prefix.includes("+")) {
            throw new Error("Root Email should be without + in it");
        }
        const subAddressedEmail = prefix + "+aws@" + domain;
        const { provider } = validate_email_provider_1.default.getOrCreate(this, { timeout: props.timeout });
        new aws_cdk_lib_1.CustomResource(this, "EmailValidateResource", {
            serviceToken: provider.serviceToken,
            resourceType: "Custom::EmailValidation",
            properties: {
                email: subAddressedEmail
            }
        });
    }
}
exports.ValidateEmail = ValidateEmail;
_a = JSII_RTTI_SYMBOL_1;
ValidateEmail[_a] = { fqn: "aws-bootstrap-kit.ValidateEmail", version: "0.4.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2YWxpZGF0ZS1lbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBOzs7Ozs7Ozs7Ozs7OztFQWNFO0FBRUYsMkNBQXFDO0FBQ3JDLDZDQUF1RDtBQUN2RCx1RUFBOEQ7Ozs7QUFVOUQsTUFBYSxhQUFjLFNBQVEsc0JBQVM7Ozs7Ozs7SUFFMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFaEQsSUFBSSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDekQ7UUFFRCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sR0FBRyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRXBELE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxpQ0FBcUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBRXZGLElBQUksNEJBQWMsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDaEQsWUFBWSxFQUFFLFFBQVEsQ0FBQyxZQUFZO1lBQ25DLFlBQVksRUFBRSx5QkFBeUI7WUFDdkMsVUFBVSxFQUFFO2dCQUNWLEtBQUssRUFBRSxpQkFBaUI7YUFDekI7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDOztBQXRCSCxzQ0F1QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIikuXG5Zb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtDb25zdHJ1Y3R9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ3VzdG9tUmVzb3VyY2UsIER1cmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgVmFsaWRhdGVFbWFpbFByb3ZpZGVyIGZyb20gXCIuL3ZhbGlkYXRlLWVtYWlsLXByb3ZpZGVyXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlRW1haWxQcm9wcyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBlbWFpbDogc3RyaW5nO1xuICByZWFkb25seSB0aW1lb3V0PzogRHVyYXRpb247XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFZhbGlkYXRlRW1haWwgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFZhbGlkYXRlRW1haWxQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCBbcHJlZml4LCBkb21haW5dID0gcHJvcHMuZW1haWwuc3BsaXQoXCJAXCIpO1xuXG4gICAgaWYgKHByZWZpeD8uaW5jbHVkZXMoXCIrXCIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSb290IEVtYWlsIHNob3VsZCBiZSB3aXRob3V0ICsgaW4gaXRcIik7XG4gICAgfVxuXG4gICAgY29uc3Qgc3ViQWRkcmVzc2VkRW1haWwgPSBwcmVmaXggKyBcIithd3NAXCIgKyBkb21haW47XG5cbiAgICBjb25zdCB7IHByb3ZpZGVyIH0gPSBWYWxpZGF0ZUVtYWlsUHJvdmlkZXIuZ2V0T3JDcmVhdGUodGhpcywge3RpbWVvdXQ6IHByb3BzLnRpbWVvdXR9KTtcblxuICAgIG5ldyBDdXN0b21SZXNvdXJjZSh0aGlzLCBcIkVtYWlsVmFsaWRhdGVSZXNvdXJjZVwiLCB7XG4gICAgICBzZXJ2aWNlVG9rZW46IHByb3ZpZGVyLnNlcnZpY2VUb2tlbixcbiAgICAgIHJlc291cmNlVHlwZTogXCJDdXN0b206OkVtYWlsVmFsaWRhdGlvblwiLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBlbWFpbDogc3ViQWRkcmVzc2VkRW1haWxcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19