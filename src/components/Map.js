import { Auth } from "aws-amplify";
import Location from "aws-sdk/clients/location";
import awsconfig from "../aws-exports";
import React, { Component } from "react";
import { Signer } from "@aws-amplify/core";
import Pin from "./Pin";

import ReactMapGL, {
  NavigationControl,
  Source,
  Layer,
  Marker,
} from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";

const axios = require("axios");

export default class MAP extends Component {
  state = {
    credentials: null,
    viewport: null,
    marker: null,
    client: null,
    mapName: "MyMap",
  };

  fetchCredentials = async () => {
    this.setState({ credentials: await Auth.currentUserCredentials() });
  };

  setViewport = (viewport) => {
    this.setState({ viewport: viewport });
  };

  onMarkerDragEnd = (event) => {
    console.log("drag event", event);
    this.setState({
      marker: {
        longitude: event.lngLat[0],
        latitude: event.lngLat[1],
      },
    });
    console.log(this.state);
  };

  createClient = async () => {
    const credentials = await Auth.currentCredentials();
    const client = new Location({
      credentials,
      region: awsconfig.aws_project_region,
    });
    this.setState({ client: client });
  };

  componentDidMount = () => {
    this.setState({
      viewport: this.props.viewport,
      marker: this.props.viewport,
    });
    this.fetchCredentials();
    this.createClient();
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.viewport.latitude !== this.props.viewport.latitude) {
      this.setState({
        viewport: this.props.viewport,
        marker: this.props.viewport,
      });
    }

    const state_copy = this.state;
    const props_copy = this.props;

    async function evaluateGeofence() {
      if (!state_copy.client || !props_copy.geofencingDetails) return;

      const params = {
        CollectionName: "MyGeofenceCollection",
        DeviceId: "geofencingTestDevice",
        Position: JSON.stringify([
          state_copy.marker.longitude,
          state_copy.marker.latitude,
        ]),
        type: "geofence",
      };
      axios
        .get(
          "https://snyy3utk6e.execute-api.us-west-2.amazonaws.com/default/LocationServiceLambda",
          {
            params: params,
          }
        )
        .then(function (response) {
          // handle success
          console.log("response from lambda", response);
        })
        .catch(function (error) {
          // handle error
          console.log("error while calling api", error);
        });
    }

    evaluateGeofence();
  };

  transformRequest = (credentials) => (url, resourceType) => {
    // Resolve to an AWS URL
    if (resourceType === "Style" && !url?.includes("://")) {
      url = `https://maps.geo.${awsconfig.aws_project_region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }

    // Only sign AWS requests (with the signature as part of the query string)
    if (url?.includes("amazonaws.com")) {
      return {
        url: Signer.signUrl(url, {
          access_key: credentials.accessKeyId,
          secret_key: credentials.secretAccessKey,
          session_token: credentials.sessionToken,
        }),
      };
    }

    // Don't sign
    return { url: url || "" };
  };

  render() {
    return (
      <div>
        <header>
          <h1>Location</h1>
        </header>
        {this.state.credentials ? (
          <ReactMapGL
            {...this.state.viewport}
            width="80vw"
            height="80vh"
            transformRequest={this.transformRequest(this.state.credentials)}
            mapStyle={this.state.mapName}
            onViewportChange={this.setViewport}
          >
            <div style={{ position: "absolute", left: 20, top: 20 }}>
              {/* react-map-gl v5 doesn't support dragging the compass to change bearing */}
              <NavigationControl showCompass={false} />
            </div>
            {this.props.routingDetails ? (
              <>
                <Marker
                  longitude={this.props.routingDetails.sourceGeocode[0]}
                  latitude={this.props.routingDetails.sourceGeocode[1]}
                  offsetTop={-20}
                  offsetLeft={-10}
                >
                  <Pin size={20} />
                </Marker>
                <Marker
                  longitude={this.props.routingDetails.destinationGeocode[0]}
                  latitude={this.props.routingDetails.destinationGeocode[1]}
                  offsetTop={-20}
                  offsetLeft={-10}
                >
                  <Pin size={20} />
                </Marker>
                {this.props.routingDetails.waypointsItems}
                <Source
                  id="routeLine"
                  type="geojson"
                  data={this.props.routingDetails.routeLine}
                >
                  <Layer {...this.props.routingDetails.routeLayer} />
                </Source>
              </>
            ) : (
              <>
                <Marker
                  longitude={this.state.marker.longitude}
                  latitude={this.state.marker.latitude}
                  offsetTop={-20}
                  offsetLeft={-10}
                  draggable
                  onDragStart={console.log}
                  onDrag={console.log}
                  onDragEnd={this.onMarkerDragEnd}
                >
                  <Pin size={20} />
                </Marker>
              </>
            )}

            {this.props.geofencingDetails ? (
              <>
                <Source
                  id="shoppingCenters"
                  type="geojson"
                  data={this.props.geofencingDetails.shoppingCenters}
                >
                  <Layer
                    {...this.props.geofencingDetails.shoppingCentersDataLayer}
                  />
                </Source>
              </>
            ) : (
              <></>
            )}

            {this.props.trackerMarkers ? (
              <>{this.props.trackerMarkers}</>
            ) : (
              <></>
            )}
          </ReactMapGL>
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
    );
  }
}
