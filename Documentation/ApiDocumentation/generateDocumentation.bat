cd GoNorthServerSide/docfx
docfx metadata docfx.json
docfx build
cd ../../


jsdoc ../../wwwroot/js -c GoNorthClientSide/jsdoc/jsdocConfig.json -d GoNorthClientSide/generatedDocumentation --verbose