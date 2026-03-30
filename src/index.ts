#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";

const program = new Command();

program
    .name('pg-migrate')
    .description('Simple Postgres migration runner')
    .version('1.0.0');

program
    .command('up')
    .description('Run all pending migrations')
    .action(async () => {
        console.log(chalk.blue('Running pending migrations...'));
    })

program
    .command('down')
    .description('Roll back the last migration')
    .action(async () => {
        console.log(chalk.yellow('Rolling back the last migration...'));
    });

program.parse();