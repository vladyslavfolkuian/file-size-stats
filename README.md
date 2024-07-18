## Installation

Install dependencies:


```npm i file-size-stats```


## Usage

1. Create a ``json`` folder in the root of your project where all the ``.json`` files you have created will be stored

2. Add to script ``getFileSizeStats`` in the ``package.json``:

```code
"scripts": {
    "getFileSizeStats": "node $(find ./ -path '*/file-size-stats/src/index.js')"
  },
```

3. Run the script ```npm run getFileSizeStats [folder-name]```

Replace ```[folder-name]``` with the directory you want to analyze.

## Example

Running ```npm run getFileSizeStats [folder-name]``` will generate a JSON file ```[folder-name]-stats.json``` with content similar to:

```json
{
  "files": [
    {
      "filePath": "[folder-name]/file1.json",
      "size": 1024,
      "formattedSize": "1 KiB"
    },
    {
      "filePath": "[folder-name]/file2.webp",
      "size": 500,
      "formattedSize": "500 Bytes"
    },
    {
      "filePath": "[folder-name]/subfolder/file3.webp",
      "size": 2048,
      "formattedSize": "2 KiB"
    }
  ],
  "totalSize": "3.50 KiB",
  "totalSizeInBytes": 3572
}
```
**Author**: vladyslavfolkuian
