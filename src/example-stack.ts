import { Account, Organization, OrganizationalUnit } from "@pepperize/cdk-organizations";
import { VerifySesEmailAddress } from "@seeebiii/ses-verify-identities";
import { SecureRootUser } from "aws-bootstrap-kit";
import { ConfigRecorder } from "aws-bootstrap-kit/lib/aws-config-recorder";
import { OrganizationTrail } from "aws-bootstrap-kit/lib/organization-trail";
import { Annotations, Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface OrganizationStackProps extends StackProps {
  /**
   * Email of the new AWS Account
   */
  email: string;
}

export class ExampleStack extends Stack {
  public constructor(scope: Construct, id: string, props: OrganizationStackProps) {
    super(scope, id, props);

    const { email } = props;

    if (this.region != "us-east-1") {
      Annotations.of(this).addError("AWS Organizations is only in region us-east-1 available.");
    }

    // Create or import an organization
    const organization = new Organization(this, "Organization", {}); // default: FeatureSet.ALL

    // Enabling SSM AWS Service access to be able to register delegated adminstrator
    organization.enableAwsServiceAccess("ssm.amazonaws.com");
    organization.enableAwsServiceAccess("config-multiaccountsetup.amazonaws.com");

    // Create an organizational unit (OU)
    const organizationalUnit = new OrganizationalUnit(this, "ExampleOU", {
      parent: organization.root,
      organizationalUnitName: "example",
    });

    // Split email
    const accountName = "example";
    const emailPrefix = email.split("@", 2)[0];
    const domain = email.split("@", 2)[1];
    const accountEmail = `${emailPrefix}+${accountName}@${domain}`;

    // Create an account, nested in the example organizational unit
    const account = new Account(this, "Example", {
      accountName: accountName,
      email: accountEmail,
      parent: organizationalUnit,
    });
    const verifySesEmailAddress = new VerifySesEmailAddress(this, "VerifyEmail", {
      emailAddress: accountEmail,
      region: this.region,
    });
    verifySesEmailAddress.node.addDependency(account);

    // Apply bootstrap kit
    const organizationTrail = new OrganizationTrail(this, "OrganizationTrail", {
      OrganizationId: organization.organizationId,
    });
    organizationTrail.node.addDependency(organization);
    const configRecorder = new ConfigRecorder(this, "ConfigRecorder");
    configRecorder.node.addDependency(organization);
    const secureRootUser = new SecureRootUser(this, "SecureRootUser", email);
    secureRootUser.node.addDependency(organization);

    // Adding tags
    Tags.of(this).add("ExampleTagKey", "ExampleTagValue", {});
  }
}
