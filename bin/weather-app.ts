#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WeatherAppStack } from '../lib/weather-app-stack';

const app = new cdk.App();
new WeatherAppStack(app, 'WeatherAppStack');