# FBAR Form Filler

This script fills the Report of Foreign Bank and Financial Accounts (FBAR) form programmatically using [Puppeteer](https://github.com/puppeteer/puppeteer). It targets the current [FinCEN FBAR filing form](https://bsaefiling.fincen.gov/file/fbar/html) (FinCEN Report 114).

![fbar-form-screenshot](https://user-images.githubusercontent.com/1064036/230695154-a7707382-4781-49ff-8dad-28bf9ac2551b.png)

This script takes two input files:

1. `.xlsx` file containing a list of foreign bank account information
2. `profile.json` that contains the filer information.

This script is NOT intended for general use. I've created it to take care of annual FBAR filing.

## Requirements

- Node.js version 22 or newer
- npm
- Chrome

## Configuration

Update or create `config/default.ts` with the format shown below.

```typescript
module.exports = {
  puppeteerConfig: {
    chromeExecutablePath:
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  },
  inputDataDirectoryPath: "input-data/john-doe",
  usdToKrwExchangeRate: 1300.0,
};
```

- `puppeteerConfig.chromeExecutablePath`: Path to Chrome executable
- `inputDataDirectoryPath`: Path to filer data and profile
- `usdToKrwExchangeRate`: USD to KRW exchange rate

## Running script

```bash
$ npm run start
```

## Watch using `nodemon`

```bash
$ npm run watch
```
