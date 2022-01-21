const { AwsCdkTypeScriptApp } = require("@pepperize/projen-awscdk-app-ts");
const { awscdk } = require("projen");
const project = new AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  authorName: "Patrick Florek",
  authorEmail: "patrick.florek@gmail.com",
  name: "@pepperize/cdk-organizations-example",
  repositoryUrl: "https://github.com/pepperize/cdk-organizations-example.git",

  deps: ["@pepperize/cdk-organizations"],
  devDeps: ["@pepperize/projen-awscdk-app-ts"],

  requireApproval: awscdk.ApprovalLevel.NEVER,
});
project.synth();
