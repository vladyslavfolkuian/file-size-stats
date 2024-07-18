const path = require('path');
const fs = require('fs');
const { getAllFilesSync } = require('./utils/fileHelper');
const { getFileStats } = require('./utils/statsHelper');
const { formatBytes } = require('./utils/formatHelper');

function processDirectory(directory) {
  const fullDirPath = path.resolve(directory);
  console.log(`Processing directory: '${fullDirPath}'...`);

  let allFiles = [];
  try {
    allFiles = getAllFilesSync(fullDirPath);
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

  const outputFileName = `json/${path.basename(directory)}-stats.json`;
  try {
    fs.writeFileSync(outputFileName, JSON.stringify(output, null, 2));
    console.log(`Output written to ${outputFileName}`);
  } catch (err) {
    console.error(`Error writing output file: ${outputFileName}`, err);
  }
}

module.exports = {
  processDirectory
};
