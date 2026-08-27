import tasks = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');

const commandTokens: { [command: string]: string[] } = {
    init: ['init'],
    add: ['add'],
    info: ['info'],
    validate: ['validate'],
    repair: ['repair'],
    baseline: ['baseline'],
    checkCode: ['check', '-code'],
    listEngines: ['list-engines'],
    migrate: ['migrate'],
    clean: ['clean'],
    undo: ['undo'],
    checkDryrun: ['check', '-dryrun'],
    auth: ['auth'],
    checkChanges: ['check', '-changes'],
    checkDrift: ['check', '-drift'],
    diff: ['diff'],
    diffText: ['diff', '-text'],
    generate: ['generate'],
    model: ['model'],
    prepare: ['prepare'],
    deploy: ['deploy'],
    snapshot: ['snapshot'],
};

const teamsCommands = ['undo', 'checkDryrun'];
const enterpriseCommands = ['auth', 'checkChanges', 'checkDrift', 'diff', 'diffText', 'generate', 'model', 'prepare', 'deploy', 'snapshot'];

async function run() {
    try {
        let tool: trm.ToolRunner;

        const command = tasks.getInput('command', true)!;
        const workingDirectory = tasks.getPathInput('workingDirectory', true);
        const dbUrl = tasks.getInput('url', false);
        const dbUser = tasks.getInput('user', false);
        const dbPassword = tasks.getInput('password', false);
        const commandOptions = tasks.getInput('commandOptions', false);
        const licenseKey = tasks.getInput('licenseKey', false);

        const tokens = commandTokens[command];
        if (!tokens) {
            throw new Error(`Unknown flyway command '${command}'.`);
        }

        if (!licenseKey) {
            if (teamsCommands.includes(command)) {
                console.warn(`Command '${command}' requires a Flyway Teams license. Set the 'License Key' input, or the run will fail with a licensing error.`);
            } else if (enterpriseCommands.includes(command)) {
                console.warn(`Command '${command}' requires a Flyway Enterprise license. Set the 'License Key' input, or the run will fail with a licensing error.`);
            }
        }

        console.log("Flyway command: " + command);
        console.log("Working directory: " + workingDirectory);
        console.log("Database jdbc url: " + dbUrl);
        console.log("Database jdbc user: " + dbUser);
        console.log("Command options: " + commandOptions);

        let cmdPath = tasks.which("flyway", true);
        console.log('Flyway found at path: ' + cmdPath);
        let args: string[] = [];
        args.push('-n');
        args.push('-color=always');
        args.push('-locations=filesystem:'+workingDirectory);
        if (dbUrl) {
            args.push('-url='+dbUrl);
        }
        if (dbUser) {
            args.push('-user='+dbUser);
        }
        if (dbPassword) {
            args.push('-password='+dbPassword);
        }
        if (licenseKey) {
            args.push('-licenseKey='+licenseKey);
        }
        if (commandOptions) {
            let cO = commandOptions.split(' ');
            cO.forEach(v => args.push(v));
        }
        args.push(...tokens);
        tool = tasks.tool(cmdPath)
                    .arg(args);

        await tool.exec();
        tasks.setResult(tasks.TaskResult.Succeeded, "");
    }
    catch (err) {
        tasks.setResult(tasks.TaskResult.Failed, err instanceof Error ? err.message : String(err));
    }
}

run();
