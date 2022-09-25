# CDK Organizations Example

This is an example of creating the AWS Organization, Aws Organizational Unit and AWS Account using cdk.

## Prerequisites

- **[WebStorm](https://www.jetbrains.com/phpstorm/)** or any other IDE for TypeScript development
- A valid **email** (can be your root account one)
  - without "+" in it
  - provided by a provider supporting [subaddressing](https://en.wikipedia.org/wiki/Plus_address) which means supporting '+' email extension (Most providers such as gmail/google, outlook etc. support it. If you're not sure check [this page](https://en.wikipedia.org/wiki/Comparison_of_webmail_providers#Features) "Address modifiers" column or send an email to yourself adding a plus extension such as `myname+test@myemaildomain.com` . if you receive it, you're good).
- A root **AWS account** and IAM account with programmatic access
- **[Node.js](https://nodejs.org/en/download/)**
- **[yarn](https://yarnpkg.com/getting-started/install)**
- **[awscli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)**

## Quick Start

1. ### Create your management account

   Go to [Create an AWS account](https://portal.aws.amazon.com/billing/signup) and register
   Remember your 12-digit account number

2. ### Create your first IAM User

   Go to [IAM console](console.aws.amazon.com/iamv2)
   **Add users** with name `admin`
   Select AWS access type. Check **Access key - Programmatic access** and **Password - AWS Management Console access**

3. ### Create your first IAM Group

   Go to next: permissions
   **Create Group** with `Administrator`
   Attach policy `AdministratorAccess`

4. ### Obtain your credentials

   Skip next: tags
   Go to next: review
   Create your user

   Remember your **Access key ID**, **Secret access key** and **password**

5. ### Configure AWS CLI

   Configure your AWS CLI

   ```shell
   aws configure
   ```

   See also [Configuration basics](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

6. ### Checkout and install

   Clone this repository

   ```shell
   git clone git@github.com:pepperize/cdk-organizations-example.git
   ```

   Install dependencies

   ```shell
   yarn install
   ```

7. ### Deploy the example organization

   Export your management account number and email

   ```shell
   export CDK_DEFAULT_ACCOUNT=<your account i.e. 123456789012>
   export DEFAULT_EMAIL=<your email>
   ```

   Deploy the stack

   ```shell
   yarn deploy
   ```
