const { AwsCdkTypeScriptApp } = require("@pepperize/projen-awscdk-app-ts");
const { awscdk } = require("projen");
const project = new AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  authorName: "Patrick Florek",
  authorEmail: "patrick.florek@gmail.com",
  name: "@pepperize/cdk-organizations-example",
  repositoryUrl: "https://github.com/pepperize/cdk-organizations-example.git",

  deps: [
    "@pepperize/cdk-organizations",
    "aws-bootstrap-kit@file:.yalc/aws-bootstrap-kit",
    "@seeebiii/ses-verify-identities",
  ],
  devDeps: ["@pepperize/projen-awscdk-app-ts"],

  requireApproval: awscdk.ApprovalLevel.NEVER,
});

project.gitignore.include(".yalc/");
project.gitignore.include("yalc.lock");
project.eslint.addIgnorePattern(".yalc/");
project.jest.addIgnorePattern(".yalc/");

project.synth();
