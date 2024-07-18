const fs = require('fs').promises;
const bytes = require('bytes');

const getFileSize = async (filePath) => {
  const stats = await fs.stat(filePath);
  return stats.size;
};

function formatFileSize(size) {
  return bytes(size);
}

module.exports = { getFileSize, formatFileSize };
