import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ExampleStack } from "../src/example-stack";

describe("OrganizationStack", () => {
  it("Should have snapshot", () => {
    const app = new App();
    const stack = new ExampleStack(app, "test", {});

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

  it("Should an organization custom resource", () => {
    const app = new App();
    const stack = new ExampleStack(app, "test", {});

    const template = Template.fromStack(stack);
    template.resourceCountIs("Custom::Organization_Organization", 1);
    template.resourceCountIs("Custom::Organization_Root", 1);
  });
});
