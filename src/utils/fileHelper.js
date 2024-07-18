const fs = require('fs');
const path = require('path');

function getAllFilesSync(directory, fileExtensions = ['.webp', '.json', '.mp3']) {
  let fileList = [];
  try {
    fs.readdirSync(directory).forEach((item) => {
      const fullPath = path.join(directory, item);
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fileList = fileList.concat(getAllFilesSync(fullPath, fileExtensions));
        } else if (fileExtensions.some(ext => fullPath.endsWith(ext))) {
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

module.exports = {
  getAllFilesSync
};
