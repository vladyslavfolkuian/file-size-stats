const path = require('path');
const processDirectory = require('./processDirectory');

const main = async () => {
  const baseDir = process.argv[2] || 'assets';
  const fullPath = path.resolve(__dirname, '..', baseDir);
  console.log(`Processing directory: '${fullPath}'...`);

  const results = await processDirectory(fullPath);
  console.log('Analysis results:', JSON.stringify(results, null, 2));
};

main();
