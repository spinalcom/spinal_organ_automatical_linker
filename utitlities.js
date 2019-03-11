let config = require("./config.json");
let geographicService = require("spinal-env-viewer-context-geographic-service")
  .default.constants;

let bmsNetwork = require("spinal-model-bmsnetwork");

module.exports = {
  getBimObjectMap(graph) {
    return graph.getContext(config.geographic).then(context => {
      if (typeof context === "undefined")
        return;
      return context.find(geographicService.GEOGRAPHIC_RELATIONS, (node) => {
        return node.getType().get() === geographicService.EQUIPMENT_TYPE;
      }).then(bimObjects => {
        let bimMap = new Map();
        bimObjects.forEach(element => {
          let name = element.info.name.get();
          let id = JSON.parse(name.match(/\[.*\]/))[0];
          bimMap.set(id.toString(), element);
        });

        return bimMap;
      })
    })

  },
  getEndpointsMap(graph) {
    return graph.getContext(config.network).then(net => {
      if (typeof net === "undefined") return;

      let relationNames = [bmsNetwork.SpinalBmsDevice.relationName,
        bmsNetwork.SpinalBmsEndpointGroup
        .relationName, bmsNetwork.SpinalBmsEndpoint.relationName
      ];

      console.log("relationNames", relationNames);


      return net.find(relationNames, (node) => {
        return node.getType().get() === bmsNetwork.SpinalBmsEndpoint.nodeTypeName
      }).then(endpoints => {

        let endpointMap = new Map();
        endpoints.forEach(endpoint => {
          let id = endpoint.info.idNetwork.get();
          endpointMap.set(id, endpoint);
        })
        return endpointMap;
      })
    })
  }
}