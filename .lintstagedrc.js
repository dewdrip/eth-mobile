const path = require("path");

const buildExpoEslintCommand = () => `cd packages/expo && yarn lint --fix`;

const buildHardhatEslintCommand = (filenames) =>
  `cd packages/hardhat && npx eslint --config ./.eslintrc.json --ignore-path ./.eslintignore --rule 'prettier/prettier: off' ${filenames
    .map((f) => path.relative(path.join("packages", "hardhat"), f))
    .join(" ")}`;

module.exports = {
  "packages/expo/**/*.{ts,tsx}": [buildExpoEslintCommand],
  "packages/hardhat/**/*.{ts,tsx}": [buildHardhatEslintCommand],
};
