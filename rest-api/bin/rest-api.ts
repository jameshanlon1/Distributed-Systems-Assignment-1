#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { RestAPIStack } from "../lib/rest-api-stack";

const app = new cdk.App();
new RestAPIStack(app, "Assignment1", { env: { region: "eu-west-1" } });
