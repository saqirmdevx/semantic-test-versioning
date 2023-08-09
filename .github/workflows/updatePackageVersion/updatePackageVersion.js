const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const readPackageJsonAndUpdateVersion = (filePath, newVersion) => {
  // Reading package.json
  const packageJson = fs.readFileSync(
    path.join(__dirname, `${filePath}/package.json`),
    'utf8'
  );

  if (!packageJson) {
    throw new Error('package.json not found');
  }

  // Updating package.json
  const packageJsonObject = JSON.parse(packageJson);
  packageJsonObject.version = newVersion;
  fs.writeFileSync(
    path.join(__dirname, `${filePath}/package.json`),
    JSON.stringify(packageJsonObject, null, 2),
    'utf8'
  );
};

const updatePackageJsonVersion = async () => {
  try {
    const { default: semanticRelease } = await import('semantic-release');
    const result = await semanticRelease({
      plugins: ['@semantic-release/git'],
      dryRun: true,
    });

    if (!result) {
      return;
    }

    // next release version of prerelease branch consists of {version}-{postfix}
    const newVersion = result.nextRelease.version;

    core.setOutput('NEW_VERSION', newVersion);
    core.setOutput('NEW_CHANGES', result.nextRelease.notes);

    readPackageJsonAndUpdateVersion('../../../apps/web', newVersion);
    readPackageJsonAndUpdateVersion('../../../apps/docs', newVersion);
  } catch (error) {
    console.error('The automated release failed with %O', error);
    throw error;
  }
};

module.exports = {
  updatePackageJsonVersion,
};
