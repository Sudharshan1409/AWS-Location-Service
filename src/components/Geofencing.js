import React, { Component } from "react";
import { Auth } from "aws-amplify";
import Location from "aws-sdk/clients/location";
import awsconfig from "../aws-exports";
import MAP from "./Map";

import shoppingCenters from "../geofence.json";

export default class GEOFENCE extends Component {
  state = {
    viewport: {
      longitude: 76.61586000000005,
      latitude: 12.280670000000043,
      zoom: 15,
    },
    shoppingCentersDataLayer: {
      id: "att-data",
      type: "fill",
      paint: {
        "fill-color": "blue",
        "fill-opacity": 0.3,
      },
    },
  };

  createClient = async () => {
    const credentials = await Auth.currentCredentials();
    console.log("credentials", credentials);
    const client = new Location({
      credentials,
      region: awsconfig.aws_project_region,
    });
    return client;
  };

  render() {
    let geofencingDetails = {
      shoppingCentersDataLayer: this.state.shoppingCentersDataLayer,
      shoppingCenters: shoppingCenters,
    };
    return (
      <div className="container">
        <div>
          <MAP
            viewport={this.state.viewport}
            geofencingDetails={geofencingDetails}
          />
        </div>
      </div>
    );
  }
}
