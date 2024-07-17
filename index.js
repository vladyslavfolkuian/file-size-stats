const fs = require('fs');
const path = require('path');

function listFilesSync(directory) {
  let fileList = [];
  try {
    fs.readdirSync(directory).forEach((item) => {
      const fullPath = path.join(directory, item);
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fileList = fileList.concat(listFilesSync(fullPath));
        } else if (fullPath.endsWith('.webp') || fullPath.endsWith('.json') || fullPath.endsWith('.mp3')) {
          fileList.push(fullPath);
        }
      } catch (err) {
        console.error(`Error reading item stats: ${fullPath}`, err);
      }
    });
  } catch (err) {
    console.error(`Error reading directory: ${directory}`, err);
  }
  return fileList;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileStats(filePath) {
  try {
    const size = fs.statSync(filePath).size;
    return {
      filePath,
      size,
      formattedSize: formatBytes(size),
    };
  } catch (err) {
    console.error(`Error getting file stats: ${filePath}`, err);
    return { filePath, size: 0, formattedSize: 'Error' };
  }
}

const directories = process.argv.slice(2);

directories.forEach((dir) => {
  const fullDirPath = path.resolve(dir);
  console.log(`Processing directory: '${fullDirPath}'...`);

  let allFiles = [];
  try {
    allFiles = listFilesSync(fullDirPath);
    console.log(`Found ${allFiles.length} files`);
  } catch (err) {
    console.error(`Error listing files in directory: ${fullDirPath}`, err);
    return;
  }

  const filesWithStats = allFiles.map(getFileStats);
  const totalSize = filesWithStats.reduce((sum, file) => sum + file.size, 0);

  const output = {
    files: filesWithStats,
    totalSize: formatBytes(totalSize),
    totalSizeInBytes: totalSize,
  };

  const outputFileName = `json/${path.basename(dir)}-files-size.json`;
  try {
    fs.writeFileSync(outputFileName, JSON.stringify(output, null, 2));
    console.log(`Output written to ${outputFileName}`);
  } catch (err) {
    console.error(`Error writing output file: ${outputFileName}`, err);
  }
});
