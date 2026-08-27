import tasks = require('azure-pipelines-task-lib/task');
import { sanitizeVersion } from './sanitizer'
import * as tools from 'azure-pipelines-tool-lib/tool';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { format } from 'util';
import { v4 as uuidV4 } from 'uuid';
const flywayToolName = "flyway";
const isWindows = os.type().match(/^Win/);

export async function download(inputVersion: string): Promise<string>{
    const version: string = sanitizeVersion(inputVersion);
    var cachedToolPath = tools.findLocalTool(flywayToolName, version);
    if(!cachedToolPath){        
        var url = getDownloadUrl(version);
        console.log("Flyway not installed, downloading from: ", url);
        var ext = os.type() == 'Windows_NT' ? 'zip' : 'tar.gz';
        var fileName = `${flywayToolName}-${version}-${uuidV4()}.${ext}`;
        var zipFolderName = `${flywayToolName}-${version}`;
        console.log("Flyway file name as: ", fileName);
        try{                        
            var downloadPath = await tools.downloadTool(url, fileName);
            console.log("Flyway downloaded to path: ", downloadPath);
        }
        catch (exception){            
            throw new Error(`Flyway download from url '${url}' failed with exception '${exception}'`);
        }
        var unzippedPath
        if(isWindows) {
            unzippedPath = await tools.extractZip(downloadPath);        
        } else {
            //tgz is a tar file packaged using gzip utility
            unzippedPath = await tools.extractTar(downloadPath);
        }
        console.log("Extracted flyway to dir: ", unzippedPath);
        cachedToolPath = await tools.cacheDir(unzippedPath +  '/' + zipFolderName, flywayToolName, version);
        console.log("Flyway installed in path: ", cachedToolPath);
    }

    var flywayPath = findFlyway(cachedToolPath);
    if(!flywayPath){
        throw new Error(`Unable to resolve path to Flyway tool using root '${cachedToolPath}'.`)
    }
    fs.chmodSync(flywayPath, "777");
    return flywayPath;
}

function findFlyway(rootFolder: string) {
    console.log("Resolving path to Flyway tool...");
    var flywayPath = path.join(rootFolder, flywayToolName + getExecutableExtension());
    console.log("Expected Flyway path: ", flywayPath)
    return flywayPath;
}

function getDownloadUrl(version: string): string {
    var url = format("https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline/%s/flyway-commandline-%s-%s", version, version);
    switch(os.type()){
        case 'Linux':
            return format(url, "linux-x64.tar.gz");
        case 'Darwin':
            return format(url, os.arch() === 'arm64' ? "macosx-arm64.tar.gz" : "macosx-x64.tar.gz");
        case 'Windows_NT':
            return format(url, "windows-x64.zip");
        default:
            throw new Error(`Operating system ${os.type()} is not supported.`);
    }
}

function getExecutableExtension(): string {
    if (isWindows) {
        return ".cmd";
    }
    return "";
}