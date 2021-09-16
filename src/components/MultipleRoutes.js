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
import Pin from "./Pin";
import { Marker } from "react-map-gl";
import * as turf from "@turf/turf";

const axios = require("axios");
export default class MULTIPLEROUTES extends Component {
  state = {
    source: "",
    destination: "",
    waypoints: "",
    sourceGeocode: null,
    destinationGeocode: null,
    waypointsGeocode: null,
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

  waypointPermutations = [];

  handleSourceChange = (e) => {
    this.setState({ source: e.target.value });
  };

  handleDestinationChange = (e) => {
    this.setState({ destination: e.target.value });
  };

  handleWaypointsChange = (e) => {
    this.setState({ waypoints: e.target.value });
  };

  getAllPermutations(arr, r = []) {
    if (arr.length === 0) {
      this.waypointPermutations.push(r);
    } else {
      const first = arr[0];
      for (let i = 0; i <= r.length; i++) {
        this.getAllPermutations(
          arr.slice(1),
          r.slice(0, i).concat([first]).concat(r.slice(i))
        );
      }
    }
  }

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
    let waypoints_split = this.state.waypoints.split("|");
    let waypoints = [];
    for (const waypoint of waypoints_split) {
      waypoints.push(waypoint);
    }
    this.setState({ waypoints: waypoints });
    let lambdaResponse;
    event.preventDefault();
    this.waypointPermutations = [];
    console.log("source:", this.state.source);
    console.log("destination:", this.state.destination);
    const client = await this.createClient();
    console.log("client", client);

    axios
      .get(
        "https://snyy3utk6e.execute-api.us-west-2.amazonaws.com/default/LocationServiceLambda",
        {
          params: {
            source: this.state.source,
            destination: this.state.destination,
            waypoints: JSON.stringify(this.state.waypoints),
            type: "multipleRoutes",
          },
        }
      )
      .then(function (response) {
        // handle success
        console.log("response from lambda", response);
        lambdaResponse = response;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(() => {
        const route = makeLegFeatures(
          lambdaResponse.data.allPossibleRoutes[
            lambdaResponse.data.minimumIndex
          ].route.Legs
        );
        console.log("route:", route);

        this.setState({
          routeLine: turf.featureCollection(route),
          viewport: {
            longitude: lambdaResponse.data.sourceCoordinates[0],
            latitude: lambdaResponse.data.sourceCoordinates[1],
            zoom: 15,
          },
          sourceGeocode: lambdaResponse.data.sourceCoordinates,
          destinationGeocode: lambdaResponse.data.destinationCoordinates,
          waypointsGeocode: lambdaResponse.data.waypointsCoordinates,
          distance:
            lambdaResponse.data.allPossibleRoutes[
              lambdaResponse.data.minimumIndex
            ].route.Summary.Distance.toFixed(2),
          time: lambdaResponse.data.allPossibleRoutes[
            lambdaResponse.data.minimumIndex
          ].route.Summary.DurationSeconds,
          navigated: true,
        });
      });

    // const sourceCoordinates = await searchPlace(
    //   "MyIndex",
    //   client,
    //   this.state.source
    // );

    // const destinationCoordinates = await searchPlace(
    //   "MyIndex",
    //   client,
    //   this.state.destination
    // );

    // let waypointsCoordinates = [];

    // for (const waypoint of this.state.waypoints) {
    //   waypointsCoordinates.push(await searchPlace("MyIndex", client, waypoint));
    // }

    // console.log("source:", sourceCoordinates);
    // console.log("destination:", destinationCoordinates);
    // console.log("waypoints:", waypointsCoordinates);

    // this.getAllPermutations(waypointsCoordinates);

    // console.log("waypointPermutations:", this.waypointPermutations);

    // let allPossibleRoutes = [];
    // let minimumDistance = 99999;
    // let minimumIndex = null;
    // for (const [index, waypoint] of this.waypointPermutations.entries()) {
    //   let routeResp = await calculateRoute(
    //     "MyCalculator",
    //     client,
    //     sourceCoordinates,
    //     destinationCoordinates,
    //     waypoint
    //   );
    //   allPossibleRoutes.push({
    //     distance: routeResp.Summary.Distance,
    //     route: routeResp,
    //   });
    //   if (routeResp.Summary.Distance < minimumDistance) {
    //     minimumDistance = routeResp.Summary.Distance;
    //     minimumIndex = index;
    //   }
    // }

    // console.log("allPossibleRoutes:", allPossibleRoutes);
    // console.log("minimumDistance:", minimumDistance);
    // console.log("minimumIndex", minimumIndex);
  };

  render() {
    let routingDetails;
    let waypointsItems = [];

    if (this.state.navigated) {
      for (const [
        index,
        coordinates,
      ] of this.state.waypointsGeocode.entries()) {
        waypointsItems.push(
          <Marker
            longitude={coordinates[0]}
            latitude={coordinates[1]}
            key={index}
          >
            <Pin text={index + 1} size={20} />
          </Marker>
        );
      }
      routingDetails = {
        routeLine: this.state.routeLine,
        routeLayer: this.state.routeLayer,
        sourceGeocode: this.state.sourceGeocode,
        destinationGeocode: this.state.destinationGeocode,
        waypointsItems: waypointsItems,
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
          <label>
            Waypoints:
            <input
              name="waypoints"
              value={this.state.waypoints}
              onChange={this.handleWaypointsChange}
              type="textarea"
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
