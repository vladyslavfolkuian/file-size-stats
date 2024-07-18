const path = require('path');
const fs = require('fs');
const processDirectory = require('./processDirectory');

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
  } catch (error) {
    console.error('Error:', error.message);
  }
};

main();
