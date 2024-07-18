const fs = require('fs');
const { formatBytes } = require('./formatHelper');

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

module.exports = {
  getFileStats
};
