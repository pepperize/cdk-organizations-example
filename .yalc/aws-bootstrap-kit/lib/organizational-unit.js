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
exports.OrganizationalUnit = void 0;
const constructs_1 = require("constructs");
const cr = require("aws-cdk-lib/custom-resources");
class OrganizationalUnit extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        let ou = new cr.AwsCustomResource(this, "OUCustomResource", {
            onCreate: {
                service: 'Organizations',
                action: 'createOrganizationalUnit',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('OrganizationalUnit.Id'),
                region: 'us-east-1',
                parameters: {
                    Name: props.Name,
                    ParentId: props.ParentId
                }
            },
            onUpdate: {
                service: 'Organizations',
                action: 'updateOrganizationalUnit',
                physicalResourceId: cr.PhysicalResourceId.fromResponse('OrganizationalUnit.Id'),
                region: 'us-east-1',
                parameters: {
                    Name: props.Name,
                    OrganizationalUnitId: new cr.PhysicalResourceIdReference()
                }
            },
            onDelete: {
                service: 'Organizations',
                action: 'deleteOrganizationalUnit',
                region: 'us-east-1',
                parameters: {
                    OrganizationalUnitId: new cr.PhysicalResourceIdReference()
                }
            },
            installLatestAwsSdk: false,
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
            })
        });
        this.id = ou.getResponseField("OrganizationalUnit.Id");
    }
}
exports.OrganizationalUnit = OrganizationalUnit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnYW5pemF0aW9uYWwtdW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9yZ2FuaXphdGlvbmFsLXVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7OztFQWNFOzs7QUFFRiwyQ0FBcUM7QUFDckMsbURBQW1EO0FBT25ELE1BQWEsa0JBQW1CLFNBQVEsc0JBQVM7SUFJN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE4QjtRQUNwRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBR2YsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUNwQyxrQkFBa0IsRUFDbEI7WUFDRSxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLE1BQU0sRUFBRSwwQkFBMEI7Z0JBQ2xDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLENBQUM7Z0JBQy9FLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixVQUFVLEVBQ1I7b0JBQ0UsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7aUJBQ3pCO2FBQ0o7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLE1BQU0sRUFBRSwwQkFBMEI7Z0JBQ2xDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLENBQUM7Z0JBQy9FLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixVQUFVLEVBQ1I7b0JBQ0UsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtpQkFDM0Q7YUFDSjtZQUNELFFBQVEsRUFBRTtnQkFDUixPQUFPLEVBQUUsZUFBZTtnQkFDeEIsTUFBTSxFQUFFLDBCQUEwQjtnQkFDbEMsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLFVBQVUsRUFDUjtvQkFDRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtpQkFDM0Q7YUFDSjtZQUNELG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsTUFBTSxFQUFFLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQzdDO2dCQUNFLFNBQVMsRUFBRSxFQUFFLENBQUMsdUJBQXVCLENBQUMsWUFBWTthQUNuRCxDQUNGO1NBQ0YsQ0FDRixDQUFDO1FBRUosSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0o7QUFyREQsZ0RBcURDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGNyIGZyb20gJ2F3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9yZ2FuaXphdGlvbmFsVW5pdFByb3BzIHtcbiAgICBOYW1lOiBzdHJpbmcsXG4gICAgUGFyZW50SWQ6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgT3JnYW5pemF0aW9uYWxVbml0IGV4dGVuZHMgQ29uc3RydWN0IHtcblxuICAgIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogT3JnYW5pemF0aW9uYWxVbml0UHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuXG4gICAgICAgICAgbGV0IG91ID0gbmV3IGNyLkF3c0N1c3RvbVJlc291cmNlKHRoaXMsXG4gICAgICAgICAgICBcIk9VQ3VzdG9tUmVzb3VyY2VcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgb25DcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnY3JlYXRlT3JnYW5pemF0aW9uYWxVbml0JywgLy9Ac2VlIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NKYXZhU2NyaXB0U0RLL2xhdGVzdC9BV1MvT3JnYW5pemF0aW9ucy5odG1sI2NyZWF0ZU9yZ2FuaXphdGlvbmFsVW5pdC1wcm9wZXJ0eVxuICAgICAgICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogY3IuUGh5c2ljYWxSZXNvdXJjZUlkLmZyb21SZXNwb25zZSgnT3JnYW5pemF0aW9uYWxVbml0LklkJyksXG4gICAgICAgICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJywgLy9BV1MgT3JnYW5pemF0aW9ucyBBUEkgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHVzLWVhc3QtMSBmb3Igcm9vdCBhY3Rpb25zXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczpcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgTmFtZTogcHJvcHMuTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgUGFyZW50SWQ6IHByb3BzLlBhcmVudElkXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9uVXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgc2VydmljZTogJ09yZ2FuaXphdGlvbnMnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3VwZGF0ZU9yZ2FuaXphdGlvbmFsVW5pdCcsIC8vQHNlZSBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vQVdTSmF2YVNjcmlwdFNESy9sYXRlc3QvQVdTL09yZ2FuaXphdGlvbnMuaHRtbCN1cGRhdGVPcmdhbml6YXRpb25hbFVuaXQtcHJvcGVydHlcbiAgICAgICAgICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IGNyLlBoeXNpY2FsUmVzb3VyY2VJZC5mcm9tUmVzcG9uc2UoJ09yZ2FuaXphdGlvbmFsVW5pdC5JZCcpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsIC8vQVdTIE9yZ2FuaXphdGlvbnMgQVBJIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiB1cy1lYXN0LTEgZm9yIHJvb3QgYWN0aW9uc1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6XG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE5hbWU6IHByb3BzLk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIE9yZ2FuaXphdGlvbmFsVW5pdElkOiBuZXcgY3IuUGh5c2ljYWxSZXNvdXJjZUlkUmVmZXJlbmNlKClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgb25EZWxldGU6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlOiAnT3JnYW5pemF0aW9ucycsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZGVsZXRlT3JnYW5pemF0aW9uYWxVbml0JywgLy9Ac2VlIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NKYXZhU2NyaXB0U0RLL2xhdGVzdC9BV1MvT3JnYW5pemF0aW9ucy5odG1sI2RlbGV0ZU9yZ2FuaXphdGlvbmFsVW5pdC1wcm9wZXJ0eVxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsIC8vQVdTIE9yZ2FuaXphdGlvbnMgQVBJIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiB1cy1lYXN0LTEgZm9yIHJvb3QgYWN0aW9uc1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6XG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE9yZ2FuaXphdGlvbmFsVW5pdElkOiBuZXcgY3IuUGh5c2ljYWxSZXNvdXJjZUlkUmVmZXJlbmNlKClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaW5zdGFsbExhdGVzdEF3c1NkazogZmFsc2UsXG4gICAgICAgICAgICAgIHBvbGljeTogY3IuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuZnJvbVNka0NhbGxzKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHJlc291cmNlczogY3IuQXdzQ3VzdG9tUmVzb3VyY2VQb2xpY3kuQU5ZX1JFU09VUkNFXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG91LmdldFJlc3BvbnNlRmllbGQoXCJPcmdhbml6YXRpb25hbFVuaXQuSWRcIik7XG4gICAgfVxufSJdfQ==