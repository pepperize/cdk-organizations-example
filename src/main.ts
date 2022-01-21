import { App } from "aws-cdk-lib";
import { ExampleStack } from "./example-stack";

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new ExampleStack(app, "Example", { env: devEnv });

app.synth();
