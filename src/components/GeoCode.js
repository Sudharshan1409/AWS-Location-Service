import Amplify, { Auth } from "aws-amplify";
import Location from "aws-sdk/clients/location";
import awsconfig from "../aws-exports";
import React, { Component } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import MAP from "./Map";

Amplify.configure(awsconfig);

console.log("awsconfig", awsconfig);

export default class GEOCODE extends Component {
  state = {
    address: "",
    geocode: "",
    copied: false,
    viewport: {
      longitude: 76.61586000000005,
      latitude: 12.280670000000043,
      zoom: 15,
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

  handleAddressChange = (e) => {
    this.setState({ address: e.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    // console.log(this.state.address)
    const params = {
      IndexName: "MyIndex",
      Text: this.state.address,
    };
    const client = await this.createClient();
    client.searchPlaceIndexForText(params, (err, data) => {
      if (err) console.error(err);
      if (data) {
        // console.log(data.Results)
        const point = data.Results[0].Place.Geometry.Point;
        point.reverse();
        const viewport = {
          longitude: point[1],
          latitude: point[0],
          zoom: 15,
        };
        this.setState({ geocode: point, viewport: viewport });
      }
    });
  };

  render() {
    return (
      <>
        <h1>Enter Address</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Address:
            <input
              name="address"
              value={this.state.address}
              onChange={this.handleAddressChange}
              type="textarea"
              required
            />
          </label>
          <br />
          <br />
          <button>Get Geocode</button>
        </form>
        <br />
        <h2>GEOCODE:</h2>
        <p>
          Latitude: {this.state.geocode[0]}
          <br />
          Longitude: {this.state.geocode[1]}
        </p>
        <CopyToClipboard
          text={this.state.geocode}
          onCopy={() => this.setState({ copied: true })}
        >
          <button>Copy to clipboard with button</button>
        </CopyToClipboard>
        <MAP viewport={this.state.viewport} />
      </>
    );
  }
}
