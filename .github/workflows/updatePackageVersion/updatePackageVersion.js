const fs = require('fs');
const path = require('path');

const readPackageJsonAndUpdateVersion = (filePath, newVersion) => {
  const packageJsonPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    filePath,
    'package.json'
  );
  // Reading package.json
  const packageJson = fs.readFileSync(packageJsonPath, 'utf8');

  if (!packageJson) {
    throw new Error('package.json not found');
  }

  // Updating package.json
  const packageJsonObject = JSON.parse(packageJson);
  if (!packageJsonObject || packageJsonObject.version === newVersion) {
    return;
  }

  packageJsonObject.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
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
      throw new Error('Semantic release failed to provide a result');
    }

    const newVersion = result.nextRelease.version;

    readPackageJsonAndUpdateVersion('apps/docs', newVersion);
    readPackageJsonAndUpdateVersion('apps/web', newVersion);
  } catch (error) {
    console.error('The automated release failed with %O', error);
    throw error;
  }
};

module.exports = {
  updatePackageJsonVersion,
};
