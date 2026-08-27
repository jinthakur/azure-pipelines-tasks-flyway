# ADO FLYWAY Extension by AYQ

The tasks in this extension allow for running flyway cli commands from both the Build and Release pipelines in Azure DevOps.
An installer is also provided. 

## Flyway Official Definition
> Flyway is an open-source database migration tool. It strongly favors simplicity and convention over configuration.
> It is based around just 7 basic commands: Migrate, Clean, Info, Validate, Undo, Baseline and Repair.
> Migrations can be written in SQL (database-specific syntax (such as PL/SQL, T-SQL, ...) is supported) or Java (for advanced data transformations or dealing with LOBs).

## Flyway Official Documentation

https://flywaydb.org/documentation/

## Supported Databases

Flyway ships with JDBC drivers for the following databases by default:

- Aurora MySQL
- Aurora PostgreSQL
- CockroachDB
- Derby
- Firebird
- H2
- HSQLDB
- MariaDB
- MySQL
- Percona XtraDB
- PostgreSQL
- SQLite
- SQL Server
- Sybase ASE

## Supported Commands

The Flyway CLI task supports executing the following commands:

**Community (free)**
- init, add, info, validate, repair, baseline, check -code, list-engines, migrate, clean

**Teams (requires a Flyway Teams license)**
- undo, check -dryrun

**Enterprise (requires a Flyway Enterprise license)**
- auth, check -changes, check -drift, diff, diff -text, generate, model, prepare, deploy, snapshot

Teams/Enterprise commands require a license key, supplied via the task's `License Key` input.

## Compatible with Linux and Windows Build Agents

The tasks can execute on windows and linux build agent operating systems **including Ubuntu and Windows**.

## Separate Task for Flyway Installation

The dedicated `Flyway Installer` task allows for complete control over how frequently and on which agents flyway is installed.
This installer should be used before a CLI tasks.

## FlywayCLI configuration form

- Command: first select the command you want to use, be sure to read Flyway official documentation first. See [Supported Commands](#supported-commands) above for the full list and licensing tier of each.
- SQL scripts directory: directory to scan recursively for migrations scripts
- JDBC URL: the jdbc url to datatabse. Must respect standard format. These formats can be found on Flyway documentation. [Ex for SQL Server](https://flywaydb.org/documentation/database/sqlserver). Not needed for commands that don't connect to a database (init, add, auth, list-engines).
- Datatabse user
- Datatabse password
- Command Options: any option not listed above can be configure here. Have a look at Flyway documentation to know more about [available options](https://flywaydb.org/documentation/commandline/migrate#options)
- License Key: required for Teams/Enterprise-tier commands. See [Redgate's licensing docs](https://documentation.red-gate.com/fd/licensing-164167730.html).