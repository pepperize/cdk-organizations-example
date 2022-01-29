# CDK Organizations Example

This is an example of creating the AWS Organization, Aws Organizational Unit and AWS Account using cdk.

## Prerequisites

- **[WebStorm](https://www.jetbrains.com/phpstorm/)**: ^2021.2 or any other IDE for TypeScript development,
- A valid **email** (can be your root account one)
    - without "+" in it
    - provided by a provider supporting [subaddressing](https://en.wikipedia.org/wiki/Plus_address) which means supporting '+' email extension (Most providers such as gmail/google, outlook etc. support it. If you're not sure check [this page](https://en.wikipedia.org/wiki/Comparison_of_webmail_providers#Features) "Address modifiers" column or send an email to yourself adding a plus extension such as `myname+test@myemaildomain.com` . if you receive it, you're good).
- A root **AWS account** and IAM account with programmatic access
- **[Node.js](https://nodejs.org/download/release/v14.6.0/)**: ^16.6.2,
- **[npm](https://www.npmjs.com/package/npm/v/6.14.6)**: ^7.20.3 (Comes bundled with Node.js),
- **[awscli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)** ^1.20.31.

## Quick Start

- go to example-stack.ts and create an account with your email:
```typescript
new Account(this, "Example", {
  accountName: "example",
  email: "your_email+example@gmail.com",
  parent: organizationalUnit
});
```

```shell
yarn install
```

```shell
npx projen
```

```shell
yarn deploy
```