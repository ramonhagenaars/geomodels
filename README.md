[![Build Status](https://travis-ci.org/ramonhagenaars/geomodels.svg?branch=master)](https://travis-ci.org/ramonhagenaars/geomodels)
[![DeepScan grade](https://deepscan.io/api/projects/2171/branches/11531/badge/grade.svg)](https://deepscan.io/dashboard#view=project&pid=2171&bid=11531)

# geomodels
Javascript classes that can be parsed to and from GeoJson.

## Installation
```
npm install geomodels
```

## Getting started
The GeoModels module can be used on the server-side with Node.js as well as in the browser.

### Node apps
Import 'geomodels' in your script. For example:
```
const GeoPoint = require("geomodels").GeoPoint;
```

You can now use the imported class. For example:
```
const p = new GeoPoint(52.090694, 5.121312);
console.log(p.toJSON());
```

### Frontend apps
Include `geomodels.js` from the 'frontend' directory. For example:
```
<script type="text/javascript" src="node_modules/geomodels/dist/frontend/geomodels.js"></script>
```

You can now use the geomodel classes. For example:
```
const GeoPoint = geomodels.GeoPoint;
const p = new GeoPoint(52.090694, 5.121312);
console.log(p.toJSON());
```

## Linting, building, testing, code coverage
To start, make sure that all dependencies are met:
```
npm install
```

To run all tasks subsequently, use:
```
npm run build
```

For linting, use:
```
npm run lint
```

For building, use:
```
npm run mkdirs
npm run build-frontend
npm run build-backend
```

For testing you need to build first. Then use:
```
npm run test
```

For analysing the code test coverage, use:
```
npm run coverage
```
