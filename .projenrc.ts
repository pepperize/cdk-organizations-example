import { AwsCdkTypeScriptApp } from "@pepperize/projen-awscdk-app-ts";
import { awscdk } from "projen";
const project = new AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  authorName: "Patrick Florek",
  authorEmail: "patrick.florek@gmail.com",
  name: "@pepperize/cdk-organizations-example",
  repository: "https://github.com/pepperize/cdk-organizations-example.git",

  projenrcTs: true,

  deps: ["@pepperize/cdk-organizations", "aws-bootstrap-kit", "@seeebiii/ses-verify-identities"],
  devDeps: ["@pepperize/projen-awscdk-app-ts@~0.0.603"],

  requireApproval: awscdk.ApprovalLevel.NEVER,
});

project.synth();
