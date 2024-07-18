## Installation

Install dependencies:

```npm i file-size-stats```

Add to script ``getFileSizeStats`` in the ``package.json``

```code
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "getFileSizeStats": "node $(find ./ -path '*/file-size-stats/src/index.js')"
  },
```

## Usage

```npm run getFileSizeStats [folder-name]```

Replace ```[folder-name]``` with the directory you want to analyze.

## Example

Running ```npm run getFileSizeStats [folder-name]``` will generate a JSON file ```[folder-name]-stats.json``` with content similar to:

```json
{
  "files": [
    {
      "filePath": "myFolder/file1.json",
      "size": 1024,
      "formattedSize": "1 KiB"
    },
    {
      "filePath": "myFolder/file2.webp",
      "size": 500,
      "formattedSize": "500 Bytes"
    },
    {
      "filePath": "myFolder/subfolder/file3.webp",
      "size": 2048,
      "formattedSize": "2 KiB"
    }
  ],
  "totalSize": "3.50 KiB",
  "totalSizeInBytes": 3572
}
```
**Author**: vladyslavfolkuian
