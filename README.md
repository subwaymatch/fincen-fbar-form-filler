# FBAR Form Filler

This script fills the Report of Foreign Bank and Financial Accounts (FBAR) form programatically. This script takes two input files:

1. `.xlsx` file containing a list of foreign bank account information
2. `profile.json` that contains the filer information.

This script is NOT intended for general use. Use it only as a reference.

## Configuration

Update or create `config/default.ts` with the format shown below.

```typescript
module.exports = {
  puppeteerConfig: {
    chromeExecutablePath:
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  },
  inputDataDirectoryPath: "input-data/john-doe",
};
```

## Running script

```bash
$ npm run start
```

## Watch using `nodemon`

```bash
$ npm run watch
```
