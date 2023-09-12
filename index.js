const TOML = require('@iarna/toml');
const fs = require('fs/promises');


async function updateInstance(instance) {
    try {
        const wellKnownResponse = await fetch("https://" + instance.domain + "/.well-known/matrix/server");
        const technicalDomain = await getTechnicalDomain(wellKnownResponse) ?? instance.domain;
        const versionResponse = await fetch("https://" + technicalDomain + "/_matrix/federation/v1/version");

        const { software, version } = await getInstanceSoftwareAndVersion(versionResponse);
        instance.software = software;
        instance.version = version;

        return instance;
    } catch (error) {
        throw Error(`Error when updating ${instance.title} ${error}`);
    }
}

async function getTechnicalDomain(wellKnownResponse) {
    if (!wellKnownResponse.ok) {
        return null;
    }
    const response = await wellKnownResponse.json();
    if ('m.server' in response) {
        return response['m.server'];
    } else {
        return null;
    }
}

async function getInstanceSoftwareAndVersion(versionResponse) {
    if (!versionResponse.ok) {
        throw new Error("Version endpoint didn't return a 2XX")
    }
    const response = await versionResponse.json();
    if ('server' in response && 'name' in response.server && 'version' in response.server) {
        return {
            software: response.server.name,
            version: response.server.version,
        }
    } else {
        throw new Error("server.name and server.version not present in the version response");
    }
}


async function main() {
    const data = await fs.readFile('./instances.toml', 'utf-8');
    const parsed = TOML.parse(data);

    const promises = parsed.instances.map(instance => updateInstance(instance));
    await Promise.allSettled(promises);

    const serialized = TOML.stringify(parsed);
    fs.writeFile('./instances.toml', serialized);
}

main().then(() => {
    console.log('Script completed with no errors');
}).catch((ex) => {
    process.exit = 1
    console.error('Script failed to run', ex);
})
