// Source archives avoid recursively installing the libraries' example projects.
// Metro and TypeScript can consume their source without generated lib/ files.
const fs = require('node:fs')
const path = require('node:path')

for (const name of ['react-native-track-player', 'react-native-file-system', 'react-native-local-media-metadata']) {
  const packagePath = require.resolve(`${name}/package.json`)
  const sourcePath = path.join(path.dirname(packagePath), 'src/index.ts')
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing TypeScript entry point for ${name}`)
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  pkg['react-native'] = 'src/index.ts'
  pkg.types = 'src/index.ts'
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
}
