import React, { Component } from "react";
import { Redirect } from "react-router-dom";

export default class START extends Component {
  routeToSearchAddress = () => {
    window.location.href = "/searchAddress";
  };

  routeToNavigate = () => {
    window.location.href = "/navigate";
  };

  routeToTrack = () => {
    window.location.href = "/track";
  };

  routeToGeofence = () => {
    window.location.href = "/geofence";
  };

  routeToMultipleRoutes = () => {
    window.location.href = "/multipleroutes";
  };

  render() {
    return (
      <>
        <button onClick={this.routeToSearchAddress}>Get Geocode</button>
        <br />
        <br />
        <button onClick={this.routeToNavigate}>Navigate</button>
        <br />
        <br />
        <button onClick={this.routeToTrack}>Track Device</button>
        <br />
        <br />
        <button onClick={this.routeToGeofence}>Geofencing</button>
        <br />
        <br />
        <button onClick={this.routeToMultipleRoutes}>Multiple Routes</button>
      </>
    );
  }
}
