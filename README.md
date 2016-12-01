# npm-link-local
like npm link, but just local (npm install and symlink to node-modules)

# Install
```
npm i -g npm-link-local
```

# Usage
```
npm-link-local /first/module /second/module
//OR
npm-link-local relative/path
```

You can also use --relative to make a symlink with a relative path

```
npm-link-local ~/Projects/test --relative
```

You can also use --dev to do a full npm install in the modules you are link

```
npm-link-local ~/Projects/test --dev
```

You can also use --skip to skip the npm install

```
npm-link-local ~/Projects/test --skip
```

# TODO
Tests
