const fs = require('fs').promises;
const path = require('path');
const { getFileSize, formatFileSize } = require('./utils');

const getFilesRecursively = async (dir, filter = () => true) => {
  let results = [];
  try {
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
  } catch (error) {
    console.error(`Error reading directory '${dir}':`, error.message);
  }
  return results;
};

const processAnimationsFolder = async (dir) => {
  const subDirs = await fs.readdir(dir, { withFileTypes: true });
  const results = {};

  for (const subDir of subDirs) {
    if (subDir.isDirectory()) {
      const subDirPath = path.join(dir, subDir.name);
      const files = await getFilesRecursively(subDirPath);
      const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);

      results[subDir.name] = {
        // files,
        totalSize: formatFileSize(totalSize),
        totalSizeInBytes: totalSize
      };

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

  return {
    // files: [...gameFiles, ...gameMobileFiles],
    totalSize: formatFileSize(gameTotalSize + gameMobileTotalSize),
    totalSizeInBytes: gameTotalSize + gameMobileTotalSize,
  };
};

const processDirectory = async (dir) => {
  const subDirs = ['animations', 'sounds', 'images', 'exported'];
  const results = {};

  for (const subDir of subDirs) {
    const fullPath = path.join(dir, subDir);

    if (!(await fs.stat(fullPath).catch(() => false))) {
      console.warn(`Skipping missing directory: ${fullPath}`);
      continue;
    }

    try {
      if (subDir === 'animations') {
        results[subDir] = await processAnimationsFolder(fullPath);
      } else if (subDir === 'exported') {
        results[subDir] = await processExportedFolder(fullPath);
      } else {
        const files = await getFilesRecursively(fullPath);
        const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);
        results[subDir] = {
          // files,
          totalSize: formatFileSize(totalSize),
          totalSizeInBytes: totalSize
        };
      }

      console.log(`Analyzing folder: ${fullPath}`);
    } catch (error) {
      console.error(`Error processing folder '${fullPath}':`, error.message);
    }
  }

  return results;
};

module.exports = processDirectory;
