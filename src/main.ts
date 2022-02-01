import { App } from "aws-cdk-lib";
import { ExampleStack } from "./example-stack";

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "us-east-1",
};

const app = new App();

const email = process.env.DEFAULT_EMAIL ?? "your_email+example@gmail.com";
new ExampleStack(app, "Example", {
  email: email,
  env: devEnv,
});

app.synth();
