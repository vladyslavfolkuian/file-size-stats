const fs = require('fs').promises;
const path = require('path');
const { getFileSize, formatFileSize } = require('./utils');

const getFilesRecursively = async (dir, filter = () => true) => {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });

  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      results = results.concat(await getFilesRecursively(fullPath, filter));
    } else if (filter(fullPath)) {
      const size = await getFileSize(fullPath);
      results.push({ name: path.basename(fullPath), size: formatFileSize(size), sizeInBytes: size });
    }
  }
  return results;
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

  return {
    files: [...gameFiles, ...gameMobileFiles],
    totalSize: formatFileSize(gameTotalSize + gameMobileTotalSize),
    totalSizeInBytes: gameTotalSize + gameMobileTotalSize,
  };
};

const processDirectory = async (dir) => {
  const subDirs = ['animations', 'sounds', 'images', 'exported'];
  const results = {};

  for (const subDir of subDirs) {
    const fullPath = path.join(dir, subDir);

    if (subDir === 'exported') {
      results[subDir] = await processExportedFolder(fullPath);
    } else {
      const files = await getFilesRecursively(fullPath);
      const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);
      results[subDir] = {
        files,
        totalSize: formatFileSize(totalSize),
        totalSizeInBytes: totalSize
      };
    }

    console.log(`Analyzing folder: ${fullPath}`);
  }

  return results;
};

module.exports = processDirectory;
