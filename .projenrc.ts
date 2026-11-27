import { AwsCdkTypeScriptApp } from "@pepperize/projen-awscdk-app-ts";
import { awscdk, javascript } from "projen";
const project = new AwsCdkTypeScriptApp({
  cdkVersion: "2.278.0",
  defaultReleaseBranch: "main",
  authorName: "Patrick Florek",
  authorEmail: "patrick.florek@gmail.com",
  name: "@pepperize/cdk-organizations-example",
  repository: "https://github.com/pepperize/cdk-organizations-example.git",

  projenrcTs: true,
  minNodeVersion: "22.13.0",
  workflowNodeVersion: "24.x",
  jestOptions: {
    jestVersion: "^30",
  },
  packageManager: javascript.NodePackageManager.YARN_CLASSIC,

  deps: ["@pepperize/cdk-organizations@^0.8.0", "aws-bootstrap-kit@^0.7.8", "@seeebiii/ses-verify-identities@^4.2.3"],
  typescriptVersion: "~6.0",
  devDeps: ["@pepperize/projen-awscdk-app-ts@~0.1.2", "@types/node@^22"],

  requireApproval: awscdk.ApprovalLevel.NEVER,
});

project.synth();
