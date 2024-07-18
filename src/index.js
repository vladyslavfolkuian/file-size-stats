const path = require('path');
const fs = require('fs');
const processDirectory = require('./processDirectory');
const { formatFileSize } = require('./utils'); // Import formatFileSize

const main = async () => {
  try {
    const baseDir = process.argv[2] || 'assets';
    const fullPath = path.resolve(__dirname, '..', baseDir);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Directory '${fullPath}' does not exist.`);
    }

    console.log(`Processing directory: '${fullPath}'...`);
    const results = await processDirectory(fullPath);
    console.log('Analysis results:', JSON.stringify(results, null, 2));

    const totalSizeExportedAndImages = results.exported.totalSizeInBytes + results.images.totalSizeInBytes;
    console.log(`Combined size of 'exported' and 'images': ${results.exported.totalSize} + ${results.images.totalSize} = ${formatFileSize(totalSizeExportedAndImages)}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

main();
