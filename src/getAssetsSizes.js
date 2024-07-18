const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const minimist = require('minimist');

const knownParams = ['showFiles', 'help'];
const startParams = minimist(process.argv.slice(2));

const showHelp = () => {
  console.log(`
Usage: getAssetsSizes.js

Options:
  --showFiles   Set show files in folder.
  --help        Show this help message.

Example:
  npm run getAssetsSizes --options
  `);
}

if (startParams.help) {
  showHelp();
  process.exit(0);
}

const unknownParams = Object.keys(startParams).filter(key => !knownParams.includes(key) && key !== '_');
if (unknownParams.length > 0) {
  console.error('\x1b[31m', `Unknown parameter(s): ${unknownParams.join(', ')}`, '\x1b[0m');
  showHelp();
  process.exit(1);
}

const getFileSize = async (filePath) => {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting file size for '${filePath}':`, error.message);
    return 0;
  }
};

const formatFileSize = (size) => (size / 1024 / 1024).toFixed(2) + ' MB';

const getFilesRecursively = async (dir, filter = () => true) => {
  let results = [];
  try {
    const list = await fsPromises.readdir(dir, { withFileTypes: true });

    for (const dirent of list) {
      const fullPath = path.join(dir, dirent.name);

      if (dirent.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath, filter));
      } else if (filter(fullPath)) {
        const size = await getFileSize(fullPath);
        results.push({ name: path.basename(fullPath), size: formatFileSize(size), sizeInBytes: size });
      }
    }
  } catch (error) {
    console.error(`Error reading directory '${dir}':`, error.message);
  }
  return results;
};

const processAnimationsFolder = async (dir) => {
  const subDirs = await fsPromises.readdir(dir, { withFileTypes: true });
  const results = {};

  for (const subDir of subDirs) {
    if (subDir.isDirectory()) {
      const subDirPath = path.join(dir, subDir.name);

      const filterFiles1x = (file) => file.includes('1.0x') && (file.endsWith('.webp') || file.endsWith('.atla'));
      const files1x = await getFilesRecursively(subDirPath, filterFiles1x);

      let files;
      if (files1x.length > 0) {
        const jsonFile = (await getFilesRecursively(subDirPath, (file) => file.endsWith('.json'))).find(Boolean);
        files = [...files1x, jsonFile].filter(Boolean);
      } else {
        files = await getFilesRecursively(subDirPath);
      }

      const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);

      if (startParams.showFiles) {
        results[subDir.name] = {
          files,
          totalSize: formatFileSize(totalSize),
          totalSizeInBytes: totalSize
        };
      } else {
        results[subDir.name] = {
          totalSize: formatFileSize(totalSize),
          totalSizeInBytes: totalSize
        };
      }

      console.log(`Analyzing folder: ${subDirPath}`);
    }
  }

  const totalSize = Object.values(results).reduce((acc, subDir) => acc + subDir.totalSizeInBytes, 0);

  return {
    subFolders: results,
    totalSize: formatFileSize(totalSize),
    totalSizeInBytes: totalSize
  };
};

const processExportedFolder = async (dir) => {
  const gamePath = path.join(dir, 'game');
  const gameMobilePath = path.join(dir, 'gameMobile');
  const flaLibPaths = ['game.fla_lib', 'gameMobile.fla_lib'];

  const filterFiles = (file) => !flaLibPaths.some(libPath => file.includes(libPath)) && file.includes('@1.0x');

  const gameFiles = (await getFilesRecursively(gamePath, filterFiles)).filter(Boolean);
  const gameMobileFiles = (await getFilesRecursively(gameMobilePath, filterFiles)).filter(Boolean);

  const gameTotalSize = gameFiles.reduce((acc, file) => acc + file.sizeInBytes, 0);
  const gameMobileTotalSize = gameMobileFiles.reduce((acc, file) => acc + file.sizeInBytes, 0);

  if (startParams.showFiles) {
    return {
      files: [...gameFiles, ...gameMobileFiles],
      totalSize: formatFileSize(gameTotalSize + gameMobileTotalSize),
      totalSizeInBytes: gameTotalSize + gameMobileTotalSize,
    };
  } else {
    return {
      totalSize: formatFileSize(gameTotalSize + gameMobileTotalSize),
      totalSizeInBytes: gameTotalSize + gameMobileTotalSize,
    };
  }
};

const getAssetsSizes = async (dir) => {
  const subDirs = ['animations', 'sounds', 'images', 'exported'];
  const results = { staticMedia: { images: {}, exported: {}, totalSize: 0, totalSizeInBytes: 0 } };

  for (const subDir of subDirs) {
    const fullPath = path.join(dir, subDir);

    if (!(await fsPromises.stat(fullPath).catch(() => false))) {
      console.warn(`Skipping missing directory: ${fullPath}`);
      continue;
    }

    try {
      if (subDir === 'animations') {
        results[subDir] = await processAnimationsFolder(fullPath);
      } else if (subDir === 'exported') {
        results.staticMedia.exported = await processExportedFolder(fullPath);
      } else if (subDir === 'images') {
        const files = await getFilesRecursively(fullPath);
        const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);
        if (startParams.showFiles) {
          results.staticMedia.images = {
            files,
            totalSize: formatFileSize(totalSize),
            totalSizeInBytes: totalSize
          };
        } else {
          results.staticMedia.images = {
            totalSize: formatFileSize(totalSize),
            totalSizeInBytes: totalSize
          };
        }
      } else {

        const files = await getFilesRecursively(fullPath);
        const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);

        if (startParams.showFiles) {
          results[subDir] = {
            files,
            totalSize: formatFileSize(totalSize),
            totalSizeInBytes: totalSize
          };
        } else {
          results[subDir] = {
            totalSize: formatFileSize(totalSize),
            totalSizeInBytes: totalSize
          };
        }
      }

      const staticMediaSize = (results.staticMedia.images.totalSizeInBytes ?? 0) + (results.staticMedia.exported.totalSizeInBytes ?? 0);
      results.staticMedia.totalSize = formatFileSize(staticMediaSize);
      results.staticMedia.totalSizeInBytes = staticMediaSize;

      console.log(`Analyzing folder: ${fullPath}`);
    } catch (error) {
      console.error(`Error processing folder '${fullPath}':`, error.message);
    }
  }

  return results;
};

const main = async () => {
  try {
    const baseDir = 'assets';
    const fullPath = path.resolve(__dirname, '..', baseDir);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Directory '${fullPath}' does not exist.`);
    }

    console.log(`Processing directory: '${fullPath}'...`);
    const results = await getAssetsSizes(fullPath);
    console.log('Analysis results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
};

main();
