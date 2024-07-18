const { processDirectory } = require('./processDirectory');

function main() {
  const directories = process.argv.slice(2);

  directories.forEach(processDirectory);
}

main();
