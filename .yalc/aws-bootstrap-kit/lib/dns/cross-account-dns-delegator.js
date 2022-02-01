"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossAccountDNSDelegator = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const constructs_1 = require("constructs");
const core = require("aws-cdk-lib");
const route53 = require("aws-cdk-lib/aws-route53");
const cross_account_zone_delegation_record_1 = require("./cross-account-zone-delegation-record");
/**
 * TODO: propose this to fix https://github.com/aws/aws-cdk/issues/8776 High-level construct that creates: 1. A public hosted zone in the current account 2. A record name in the hosted zone id of target account.
 *
 * Usage:
 * Create a role with the following permission:
 * {
 *       "Sid": "VisualEditor0",
 *       "Effect": "Allow",
 *       "Action": [
 *           "route53:GetHostedZone",
 *           "route53:ChangeResourceRecordSets"
 *       ],
 *       "Resource": "arn:aws:route53:::hostedzone/ZXXXXXXXXX"
 * }
 *
 * Then use the construct like this:
 *
 * const crossAccountDNSDelegatorProps: ICrossAccountDNSDelegatorProps = {
 *       targetAccount: '1234567890',
 *       targetRoleToAssume: 'DelegateRecordUpdateRoleInThatAccount',
 *       targetHostedZoneId: 'ZXXXXXXXXX',
 *       zoneName: 'subdomain.mydomain.com',
 * };
 *
 * new CrossAccountDNSDelegator(this, 'CrossAccountDNSDelegatorStack', crossAccountDNSDelegatorProps);
 */
class CrossAccountDNSDelegator extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { targetAccount, targetRoleToAssume, targetHostedZoneId, zoneName, } = props;
        const hostedZone = new route53.HostedZone(this, 'HostedZone', {
            zoneName: zoneName
        });
        this.hostedZone = hostedZone;
        const delegatedNameServers = hostedZone.hostedZoneNameServers;
        const currentAccountId = core.Stack.of(this).account;
        new cross_account_zone_delegation_record_1.CrossAccountZoneDelegationRecord(this, 'CrossAccountZoneDelegationRecord', {
            targetAccount: targetAccount,
            targetRoleToAssume: targetRoleToAssume,
            targetHostedZoneId: targetHostedZoneId,
            recordName: zoneName,
            toDelegateNameServers: delegatedNameServers,
            currentAccountId: currentAccountId
        });
    }
}
exports.CrossAccountDNSDelegator = CrossAccountDNSDelegator;
_a = JSII_RTTI_SYMBOL_1;
CrossAccountDNSDelegator[_a] = { fqn: "aws-bootstrap-kit.CrossAccountDNSDelegator", version: "0.4.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3MtYWNjb3VudC1kbnMtZGVsZWdhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3Jvc3MtYWNjb3VudC1kbnMtZGVsZWdhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMkNBQXFDO0FBQ3JDLG9DQUFvQztBQUNwQyxtREFBbUQ7QUFDbkQsaUdBQXdGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFleEYsTUFBYSx3QkFBeUIsU0FBUSxzQkFBUztJQUVuRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXFDO1FBQzNFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxFQUNGLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLFFBQVEsR0FDWCxHQUFHLEtBQUssQ0FBQztRQUVWLE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzFELFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRTdCLE1BQU0sb0JBQW9CLEdBQWEsVUFBVSxDQUFDLHFCQUFzQixDQUFDO1FBRXpFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3JELElBQUksdUVBQWdDLENBQUMsSUFBSSxFQUFFLGtDQUFrQyxFQUFFO1lBQzNFLGFBQWEsRUFBRSxhQUFhO1lBQzVCLGtCQUFrQixFQUFFLGtCQUFrQjtZQUN0QyxrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsVUFBVSxFQUFFLFFBQVE7WUFDcEIscUJBQXFCLEVBQUUsb0JBQW9CO1lBQzNDLGdCQUFnQixFQUFFLGdCQUFnQjtTQUNyQyxDQUFDLENBQUM7SUFDUCxDQUFDOztBQTdCTCw0REE4QkMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgcm91dGU1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQge0Nyb3NzQWNjb3VudFpvbmVEZWxlZ2F0aW9uUmVjb3JkfSBmcm9tIFwiLi9jcm9zcy1hY2NvdW50LXpvbmUtZGVsZWdhdGlvbi1yZWNvcmRcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgSUNyb3NzQWNjb3VudEROU0RlbGVnYXRvclByb3BzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB0YXJnZXRBY2NvdW50Pzogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHRhcmdldFJvbGVUb0Fzc3VtZT86IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB0YXJnZXRIb3N0ZWRab25lSWQ/OiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB6b25lTmFtZTogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIENyb3NzQWNjb3VudEROU0RlbGVnYXRvciBleHRlbmRzIENvbnN0cnVjdCB7XG4gICAgcmVhZG9ubHkgaG9zdGVkWm9uZTogcm91dGU1My5Ib3N0ZWRab25lO1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBJQ3Jvc3NBY2NvdW50RE5TRGVsZWdhdG9yUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICB0YXJnZXRBY2NvdW50LFxuICAgICAgICAgICAgdGFyZ2V0Um9sZVRvQXNzdW1lLFxuICAgICAgICAgICAgdGFyZ2V0SG9zdGVkWm9uZUlkLFxuICAgICAgICAgICAgem9uZU5hbWUsXG4gICAgICAgIH0gPSBwcm9wcztcblxuICAgICAgICBjb25zdCBob3N0ZWRab25lID0gbmV3IHJvdXRlNTMuSG9zdGVkWm9uZSh0aGlzLCAnSG9zdGVkWm9uZScsIHtcbiAgICAgICAgICAgIHpvbmVOYW1lOiB6b25lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmhvc3RlZFpvbmUgPSBob3N0ZWRab25lO1xuXG4gICAgICAgIGNvbnN0IGRlbGVnYXRlZE5hbWVTZXJ2ZXJzOiBzdHJpbmdbXSA9IGhvc3RlZFpvbmUuaG9zdGVkWm9uZU5hbWVTZXJ2ZXJzITtcblxuICAgICAgICBjb25zdCBjdXJyZW50QWNjb3VudElkID0gY29yZS5TdGFjay5vZih0aGlzKS5hY2NvdW50O1xuICAgICAgICBuZXcgQ3Jvc3NBY2NvdW50Wm9uZURlbGVnYXRpb25SZWNvcmQodGhpcywgJ0Nyb3NzQWNjb3VudFpvbmVEZWxlZ2F0aW9uUmVjb3JkJywge1xuICAgICAgICAgICAgdGFyZ2V0QWNjb3VudDogdGFyZ2V0QWNjb3VudCxcbiAgICAgICAgICAgIHRhcmdldFJvbGVUb0Fzc3VtZTogdGFyZ2V0Um9sZVRvQXNzdW1lLFxuICAgICAgICAgICAgdGFyZ2V0SG9zdGVkWm9uZUlkOiB0YXJnZXRIb3N0ZWRab25lSWQsXG4gICAgICAgICAgICByZWNvcmROYW1lOiB6b25lTmFtZSxcbiAgICAgICAgICAgIHRvRGVsZWdhdGVOYW1lU2VydmVyczogZGVsZWdhdGVkTmFtZVNlcnZlcnMsXG4gICAgICAgICAgICBjdXJyZW50QWNjb3VudElkOiBjdXJyZW50QWNjb3VudElkXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==