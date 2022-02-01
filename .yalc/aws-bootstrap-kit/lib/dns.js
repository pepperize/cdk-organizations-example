"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootDns = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const constructs_1 = require("constructs");
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const route53 = require("aws-cdk-lib/aws-route53");
const aws_route53_1 = require("aws-cdk-lib/aws-route53");
const utils = require("./dns/delegation-record-handler/utils");
/**
 * A class creating the main hosted zone and a role assumable by stages account to be able to set sub domain delegation.
 */
class RootDns extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.rootHostedZone = this.createRootHostedZone(props);
        for (const accountIndex in props.stagesAccounts) {
            const account = props.stagesAccounts[accountIndex];
            const stageSubZone = this.createStageSubZone(account, props.rootHostedZoneDNSName);
            this.createDNSAutoUpdateRole(account, stageSubZone);
            if (stageSubZone.hostedZoneNameServers) {
                new route53.RecordSet(this, `${account.accountName}SubZoneDelegationNSRecord`, {
                    recordType: route53.RecordType.NS,
                    target: aws_route53_1.RecordTarget.fromValues(...stageSubZone.hostedZoneNameServers ? stageSubZone.hostedZoneNameServers : ''),
                    recordName: stageSubZone.zoneName,
                    zone: this.rootHostedZone,
                });
            }
        }
        if (props.thirdPartyProviderDNSUsed &&
            this.rootHostedZone.hostedZoneNameServers) {
            new cdk.CfnOutput(this, `NS records`, {
                value: cdk.Fn.join(",", this.rootHostedZone.hostedZoneNameServers),
            });
        }
        else {
            throw new Error("Creation of DNS domain is not yet supported");
            // TODO: implement call to https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Route53Domains.html#registerDomain-property
        }
    }
    createStageSubZone(account, rootHostedZoneDNSName) {
        const subDomainPrefix = utils.getSubdomainPrefix(account.accountName, account.accountStageName);
        return new route53.HostedZone(this, `${subDomainPrefix}StageSubZone`, {
            zoneName: `${subDomainPrefix}.${rootHostedZoneDNSName}`,
        });
    }
    createDNSAutoUpdateRole(account, stageSubZone) {
        const dnsAutoUpdateRole = new iam.Role(this, stageSubZone.zoneName, {
            assumedBy: new iam.AccountPrincipal(account.accountId),
            roleName: utils.getDNSUpdateRoleNameFromSubZoneName(stageSubZone.zoneName)
        });
        dnsAutoUpdateRole.addToPolicy(new iam.PolicyStatement({
            resources: [stageSubZone.hostedZoneArn],
            actions: [
                "route53:GetHostedZone",
                "route53:ChangeResourceRecordSets",
                "route53:TestDNSAnswer",
            ],
        }));
        dnsAutoUpdateRole.addToPolicy(new iam.PolicyStatement({
            resources: ['*'],
            actions: [
                "route53:ListHostedZonesByName"
            ],
        }));
        return dnsAutoUpdateRole;
    }
    createRootHostedZone(props) {
        return new route53.HostedZone(this, "RootHostedZone", {
            zoneName: props.rootHostedZoneDNSName,
        });
    }
}
exports.RootDns = RootDns;
_a = JSII_RTTI_SYMBOL_1;
RootDns[_a] = { fqn: "aws-bootstrap-kit.RootDns", version: "0.4.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZG5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMkNBQXFDO0FBQ3JDLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFDM0MsbURBQW1EO0FBQ25ELHlEQUF1RDtBQUV2RCwrREFBK0Q7Ozs7QUFjL0QsTUFBYSxPQUFRLFNBQVEsc0JBQVM7SUFHcEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFtQjtRQUMzRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZELEtBQUssTUFBTSxZQUFZLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRTtZQUMvQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25ELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FDMUMsT0FBTyxFQUNQLEtBQUssQ0FBQyxxQkFBcUIsQ0FDNUIsQ0FBQztZQUNGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDcEQsSUFBSSxZQUFZLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3RDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FDbkIsSUFBSSxFQUNKLEdBQUcsT0FBTyxDQUFDLFdBQVcsMkJBQTJCLEVBQ2pEO29CQUNFLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ2pDLE1BQU0sRUFBRSwwQkFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQSxDQUFDLENBQUEsWUFBWSxDQUFDLHFCQUFxQixDQUFBLENBQUMsQ0FBQSxFQUFFLENBQUM7b0JBQzVHLFVBQVUsRUFBRSxZQUFZLENBQUMsUUFBUTtvQkFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjO2lCQUMxQixDQUNGLENBQUM7YUFDSDtTQUNGO1FBRUQsSUFDRSxLQUFLLENBQUMseUJBQXlCO1lBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLEVBQ3pDO1lBQ0EsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQ3BDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQzthQUNuRSxDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1lBQy9ELDhIQUE4SDtTQUMvSDtJQUNILENBQUM7SUFFRCxrQkFBa0IsQ0FDaEIsT0FBZ0IsRUFDaEIscUJBQTZCO1FBRTdCLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLGVBQWUsY0FBYyxFQUFFO1lBQ3BFLFFBQVEsRUFBRSxHQUFHLGVBQWUsSUFBSSxxQkFBcUIsRUFBRTtTQUN4RCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsdUJBQXVCLENBQ3JCLE9BQWdCLEVBQ2hCLFlBQWdDO1FBRWhDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFO1lBQ2xFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ3RELFFBQVEsRUFBRSxLQUFLLENBQUMsbUNBQW1DLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztTQUMzRSxDQUFDLENBQUM7UUFFSCxpQkFBaUIsQ0FBQyxXQUFXLENBQzNCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixTQUFTLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDO1lBQ3ZDLE9BQU8sRUFBRTtnQkFDUCx1QkFBdUI7Z0JBQ3ZCLGtDQUFrQztnQkFDbEMsdUJBQXVCO2FBQ3hCO1NBQ0YsQ0FBQyxDQUNILENBQUM7UUFDRixpQkFBaUIsQ0FBQyxXQUFXLENBQzNCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN0QixTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDaEIsT0FBTyxFQUFFO2dCQUNQLCtCQUErQjthQUNoQztTQUNGLENBQUMsQ0FDSCxDQUFDO1FBQ0YsT0FBTyxpQkFBaUIsQ0FBQztJQUMzQixDQUFDO0lBRUQsb0JBQW9CLENBQUMsS0FBbUI7UUFDdEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3BELFFBQVEsRUFBRSxLQUFLLENBQUMscUJBQXFCO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7O0FBckZILDBCQXNGQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHtDb25zdHJ1Y3R9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyByb3V0ZTUzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtcm91dGU1M1wiO1xuaW1wb3J0IHsgUmVjb3JkVGFyZ2V0IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1yb3V0ZTUzXCI7XG5pbXBvcnQge0FjY291bnR9IGZyb20gJy4vYWNjb3VudCc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL2Rucy9kZWxlZ2F0aW9uLXJlY29yZC1oYW5kbGVyL3V0aWxzJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIFJvb3REbnNQcm9wcyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHN0YWdlc0FjY291bnRzOiBBY2NvdW50W107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcm9vdEhvc3RlZFpvbmVETlNOYW1lOiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHRoaXJkUGFydHlQcm92aWRlckROU1VzZWQ/OiBib29sZWFuO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgUm9vdERucyBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHJvb3RIb3N0ZWRab25lOiByb3V0ZTUzLklIb3N0ZWRab25lO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBSb290RG5zUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgIHRoaXMucm9vdEhvc3RlZFpvbmUgPSB0aGlzLmNyZWF0ZVJvb3RIb3N0ZWRab25lKHByb3BzKTtcblxuICAgIGZvciAoY29uc3QgYWNjb3VudEluZGV4IGluIHByb3BzLnN0YWdlc0FjY291bnRzKSB7XG4gICAgICBjb25zdCBhY2NvdW50ID0gcHJvcHMuc3RhZ2VzQWNjb3VudHNbYWNjb3VudEluZGV4XTtcbiAgICAgIGNvbnN0IHN0YWdlU3ViWm9uZSA9IHRoaXMuY3JlYXRlU3RhZ2VTdWJab25lKFxuICAgICAgICBhY2NvdW50LFxuICAgICAgICBwcm9wcy5yb290SG9zdGVkWm9uZUROU05hbWVcbiAgICAgICk7XG4gICAgICB0aGlzLmNyZWF0ZUROU0F1dG9VcGRhdGVSb2xlKGFjY291bnQsIHN0YWdlU3ViWm9uZSk7XG4gICAgICBpZiAoc3RhZ2VTdWJab25lLmhvc3RlZFpvbmVOYW1lU2VydmVycykge1xuICAgICAgICBuZXcgcm91dGU1My5SZWNvcmRTZXQoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBgJHthY2NvdW50LmFjY291bnROYW1lfVN1YlpvbmVEZWxlZ2F0aW9uTlNSZWNvcmRgLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJlY29yZFR5cGU6IHJvdXRlNTMuUmVjb3JkVHlwZS5OUyxcbiAgICAgICAgICAgIHRhcmdldDogUmVjb3JkVGFyZ2V0LmZyb21WYWx1ZXMoLi4uc3RhZ2VTdWJab25lLmhvc3RlZFpvbmVOYW1lU2VydmVycz9zdGFnZVN1YlpvbmUuaG9zdGVkWm9uZU5hbWVTZXJ2ZXJzOicnKSxcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IHN0YWdlU3ViWm9uZS56b25lTmFtZSxcbiAgICAgICAgICAgIHpvbmU6IHRoaXMucm9vdEhvc3RlZFpvbmUsXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHByb3BzLnRoaXJkUGFydHlQcm92aWRlckROU1VzZWQgJiZcbiAgICAgIHRoaXMucm9vdEhvc3RlZFpvbmUuaG9zdGVkWm9uZU5hbWVTZXJ2ZXJzXG4gICAgKSB7XG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBgTlMgcmVjb3Jkc2AsIHtcbiAgICAgICAgdmFsdWU6IGNkay5Gbi5qb2luKFwiLFwiLCB0aGlzLnJvb3RIb3N0ZWRab25lLmhvc3RlZFpvbmVOYW1lU2VydmVycyksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3JlYXRpb24gb2YgRE5TIGRvbWFpbiBpcyBub3QgeWV0IHN1cHBvcnRlZFwiKTtcbiAgICAgIC8vIFRPRE86IGltcGxlbWVudCBjYWxsIHRvIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NKYXZhU2NyaXB0U0RLL2xhdGVzdC9BV1MvUm91dGU1M0RvbWFpbnMuaHRtbCNyZWdpc3RlckRvbWFpbi1wcm9wZXJ0eVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZVN0YWdlU3ViWm9uZShcbiAgICBhY2NvdW50OiBBY2NvdW50LFxuICAgIHJvb3RIb3N0ZWRab25lRE5TTmFtZTogc3RyaW5nXG4gICk6IHJvdXRlNTMuSG9zdGVkWm9uZSB7XG4gICAgY29uc3Qgc3ViRG9tYWluUHJlZml4ID0gdXRpbHMuZ2V0U3ViZG9tYWluUHJlZml4KGFjY291bnQuYWNjb3VudE5hbWUsIGFjY291bnQuYWNjb3VudFN0YWdlTmFtZSk7XG4gICAgcmV0dXJuIG5ldyByb3V0ZTUzLkhvc3RlZFpvbmUodGhpcywgYCR7c3ViRG9tYWluUHJlZml4fVN0YWdlU3ViWm9uZWAsIHtcbiAgICAgIHpvbmVOYW1lOiBgJHtzdWJEb21haW5QcmVmaXh9LiR7cm9vdEhvc3RlZFpvbmVETlNOYW1lfWAsXG4gICAgfSk7XG4gIH1cblxuICBjcmVhdGVETlNBdXRvVXBkYXRlUm9sZShcbiAgICBhY2NvdW50OiBBY2NvdW50LFxuICAgIHN0YWdlU3ViWm9uZTogcm91dGU1My5Ib3N0ZWRab25lXG4gICkge1xuICAgIGNvbnN0IGRuc0F1dG9VcGRhdGVSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIHN0YWdlU3ViWm9uZS56b25lTmFtZSwge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLkFjY291bnRQcmluY2lwYWwoYWNjb3VudC5hY2NvdW50SWQpLFxuICAgICAgcm9sZU5hbWU6IHV0aWxzLmdldEROU1VwZGF0ZVJvbGVOYW1lRnJvbVN1YlpvbmVOYW1lKHN0YWdlU3ViWm9uZS56b25lTmFtZSlcbiAgICB9KTtcblxuICAgIGRuc0F1dG9VcGRhdGVSb2xlLmFkZFRvUG9saWN5KFxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICByZXNvdXJjZXM6IFtzdGFnZVN1YlpvbmUuaG9zdGVkWm9uZUFybl0sXG4gICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICBcInJvdXRlNTM6R2V0SG9zdGVkWm9uZVwiLFxuICAgICAgICAgIFwicm91dGU1MzpDaGFuZ2VSZXNvdXJjZVJlY29yZFNldHNcIixcbiAgICAgICAgICBcInJvdXRlNTM6VGVzdEROU0Fuc3dlclwiLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICApO1xuICAgIGRuc0F1dG9VcGRhdGVSb2xlLmFkZFRvUG9saWN5KFxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgXCJyb3V0ZTUzOkxpc3RIb3N0ZWRab25lc0J5TmFtZVwiXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuIGRuc0F1dG9VcGRhdGVSb2xlO1xuICB9XG5cbiAgY3JlYXRlUm9vdEhvc3RlZFpvbmUocHJvcHM6IFJvb3REbnNQcm9wcykge1xuICAgIHJldHVybiBuZXcgcm91dGU1My5Ib3N0ZWRab25lKHRoaXMsIFwiUm9vdEhvc3RlZFpvbmVcIiwge1xuICAgICAgem9uZU5hbWU6IHByb3BzLnJvb3RIb3N0ZWRab25lRE5TTmFtZSxcbiAgICB9KTtcbiAgfVxufVxuIl19