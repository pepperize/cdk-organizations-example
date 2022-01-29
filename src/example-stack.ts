import { Account, Organization, OrganizationalUnit } from "@pepperize/cdk-organizations";
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

    // Create an organizational unit (OU)
    const organizationalUnit = new OrganizationalUnit(this, "ExampleOU", {
      parent: organization.root,
      organizationalUnitName: "example",
    });

    // Create an account, nested in the example organizational unit
    new Account(this, "Example", {
      accountName: "example",
      email: email,
      parent: organizationalUnit,
    });

    Tags.of(this).add("ExampleTagKey", "ExampleTagValue", {});
  }
}
