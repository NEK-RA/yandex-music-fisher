const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const manifest = require('../src/manifest.json');
const pack = require('../package.json');

const platform = process.argv[2]; // chrome, opera, firefox, edge
const distFolder = path.join(path.dirname(__dirname), 'dist');
const platformFolder = path.join(distFolder, platform);

function readDirSync(dir, filelist) {
    const files = fs.readdirSync(dir);

    filelist = filelist || [];
    files.forEach(file => {
        const relativePath = dir + file;

        if (fs.statSync(relativePath).isDirectory()) {
            filelist = readDirSync(`${relativePath}/`, filelist);
        } else {
            filelist.push({
                path: relativePath,
                data: fs.readFileSync(relativePath)
            });
        }
    });
    return filelist;
}

function createManifest() {
    manifest.version = pack.version;
    if (platform === 'firefox') {
        manifest.applications = {
            gecko: {
                id: 'yandex-music-fisher@egoroof.ru',
                strict_min_version: '52.0'
            }
        };
    }
    if (platform === 'chrome') {
        manifest.permissions.push('downloads.shelf');
        manifest.minimum_chrome_version = '55.0';
        manifest.incognito = 'split';
    }
    if (platform === 'opera') {
        manifest.minimum_opera_version = '42.0';
        manifest.incognito = 'split';
    }
    if (platform === 'edge') {
        manifest.author = 'egoroof';
        // todo min version?
    }

    fs.writeFileSync(path.join(platformFolder, 'manifest.json'), JSON.stringify(manifest));
    console.log('+ manifest.json');
}

function createArchive() {
    const list = readDirSync(`${platformFolder}/`);
    const zip = new JSZip();

    list.forEach(file => {
        zip.file(file.path.replace(`${platformFolder}/`, ''), file.data);
    });

    zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 9
        }
    }).then(buffer => {
        const archiveName = `yandex-music-fisher_${pack.version}_${platform}.zip`;
        fs.writeFileSync(path.join(distFolder, archiveName), buffer);
        console.log(`+ ${archiveName}`);
    }).catch(e => {
        console.error(e);
        process.exit(1);
    });
}

createManifest();
createArchive();
