import React, { Component, useCallback } from "react";
import Amplify, { Auth } from "aws-amplify";
import Location from "aws-sdk/clients/location";
import awsconfig from "../aws-exports";
import MAP from "./Map";
import {
  searchPlace,
  calculateRoute,
  makeLegFeatures,
} from "./RoutingCalculator";
import * as turf from "@turf/turf";

export default class NAVIGATE extends Component {
  state = {
    source: "",
    destination: "",
    sourceGeocode: null,
    destinationGeocode: null,
    distance: "",
    time: "",
    routeLine: turf.featureCollection([]),
    viewport: {
      longitude: 76.61586000000005,
      latitude: 12.280670000000043,
      zoom: 15,
    },
    routeLayer: {
      type: "line",
      layout: {
        "line-join": "round",
      },
      paint: {
        "line-color": "green",
        "line-width": 3,
      },
    },
    navigated: false,
  };

  handleSourceChange = (e) => {
    this.setState({ source: e.target.value });
  };

  handleDestinationChange = (e) => {
    this.setState({ destination: e.target.value });
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

  handleSubmit = async (event) => {
    event.preventDefault();
    console.log("source:", this.state.source);
    console.log("destination:", this.state.destination);
    const client = await this.createClient();
    const sourceCoordinates = await searchPlace(
      "MyIndex",
      client,
      this.state.source
    );
    const destinationCoordinates = await searchPlace(
      "MyIndex",
      client,
      this.state.destination
    );

    console.log("source:", sourceCoordinates);
    console.log("destination:", destinationCoordinates);

    const routeResp = await calculateRoute(
      "MyCalculator",
      client,
      sourceCoordinates,
      destinationCoordinates
    );

    console.log("routes:", routeResp);

    const route = makeLegFeatures(routeResp.Legs);
    console.log("route:", route);

    this.setState({
      routeLine: turf.featureCollection(route),
      viewport: {
        longitude: sourceCoordinates[0],
        latitude: sourceCoordinates[1],
        zoom: 15,
      },
      sourceGeocode: sourceCoordinates,
      destinationGeocode: destinationCoordinates,
      distance: routeResp.Summary.Distance.toFixed(2),
      time: routeResp.Summary.DurationSeconds,
      navigated: true,
    });
  };

  render() {
    let routingDetails;
    if (this.state.navigated) {
      routingDetails = {
        routeLine: this.state.routeLine,
        routeLayer: this.state.routeLayer,
        sourceGeocode: this.state.sourceGeocode,
        destinationGeocode: this.state.destinationGeocode,
      };
    } else {
      routingDetails = null;
    }
    console.log("routing details", routingDetails);
    return (
      <div className="container">
        <form onSubmit={this.handleSubmit}>
          <label>
            Source:
            <input
              name="source"
              value={this.state.source}
              onChange={this.handleSourceChange}
              type="textarea"
              required
            />
          </label>
          <br />
          <br />
          <label>
            Destination:
            <input
              name="destination"
              value={this.state.destination}
              onChange={this.handleDestinationChange}
              type="textarea"
              required
            />
          </label>
          <br />
          <br />
          <button>Get Route</button>
          <h3>Distance:</h3>
          {this.state.distance ? this.state.distance + " Miles" : ""}
          <h3>Time Required:</h3>
          {this.state.time
            ? Math.floor(this.state.time / 3600) +
              " Hour " +
              Math.round((this.state.time % 3600) / 60) +
              " Minutes"
            : ""}
        </form>
        <div>
          <MAP viewport={this.state.viewport} routingDetails={routingDetails} />
        </div>
      </div>
    );
  }
}
