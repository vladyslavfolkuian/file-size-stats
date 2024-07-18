const fs = require('fs').promises;
const bytes = require('bytes');

const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting file size for '${filePath}':`, error.message);
    return 0;
  }
};

const formatFileSize = (size) => bytes(size);

module.exports = { getFileSize, formatFileSize };
