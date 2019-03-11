const spinalCore = require("spinal-core-connectorjs");
const fs = require('fs');
const config = require('./config.json');
const utitlities = require('./utitlities');
const papaparse = require('papaparse');
const ptrLst = require("spinal-env-viewer-graph-service").SPINAL_RELATION_PTR_LST_TYPE;
const file = fs.ReadStream('./csvFile.csv');

const conn = spinalCore.connect(
  `http://${config.user}:${config.password}@${config.host}:${config.port}/`)

spinalCore.load(conn, config.path, async (_file) => {
  let bimObjectMap = await utitlities.getBimObjectMap(_file.graph);
  let endpointMap = await utitlities.getEndpointsMap(_file.graph);

  papaparse.parse(file, {
    complete(results) {
      results.data.forEach(data => {
        let endpointId = data[0] + "_" + data[1];
        let bimsIds = data[2].split("/");
        bimsIds.forEach(bimId => {
          let endpointNode = endpointMap.get(endpointId);
          let bimNode = bimObjectMap.get(bimId);

          if (endpointNode && bimNode) {
            createRelationIfNotExist(endpointNode, bimNode);
          }

        })
      })
    }
  })

})

let createRelationIfNotExist = (endpointNode, bimNode) => {
  let relationName = "hasEndPoint";
  bimNode.getChildren([relationName]).then(children => {
    for (let index = 0; index < children.length; index++) {
      const element = children[index];
      if (element.info.id.get() === endpointNode.info.id.get()) {
        console.log("relation exist");

        return;
      }

    }
    console.log("relation created");

    bimNode.addChild(endpointNode, relationName, ptrLst);
  })
}