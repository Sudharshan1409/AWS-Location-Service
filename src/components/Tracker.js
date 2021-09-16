import React, { useState, useEffect } from "react";
import MAP from "./Map";
import Amplify, { Auth } from "aws-amplify";

import awsconfig from "../aws-exports";
import useInterval from "./useInterval";
import Pin from "./Pin";

import ReactMapGL, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Location from "aws-sdk/clients/location";
const axios = require("axios");

function Track(props) {
  const handleClick = (event) => {
    event.preventDefault();
    props.trackDevice();
  };

  return (
    <div className="container">
      <div className="input-group">
        <div className="input-group-append">
          <button
            onClick={handleClick}
            className="btn btn-primary"
            type="submit"
          >
            Track
          </button>
        </div>
      </div>
    </div>
  );
}

const App = (props) => {
  const [viewport, setViewport] = useState({
    longitude: 76.61586000000005,
    latitude: 12.280670000000043,
    zoom: 15,
  });

  const [devPosMarkers, setDevPosMarkers] = useState([]);
  const [client, setClient] = useState(null);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      setCredentials(await Auth.currentUserCredentials());
    };

    fetchCredentials();

    const createClient = async () => {
      const credentials = await Auth.currentCredentials();
      const client = new Location({
        credentials,
        region: awsconfig.aws_project_region,
      });
      setClient(client);
    };

    createClient();
  }, []);

  useInterval(() => {
    // updateDevicePosition();
    getDevicePosition();
  }, 10000);

  const getDevicePosition = () => {
    setDevPosMarkers([]);

    axios
      .get(
        "https://snyy3utk6e.execute-api.us-west-2.amazonaws.com/default/LocationServiceLambda",
        {
          params: {
            DeviceId: props.trackerDeviceId,
            TrackerName: "MyTracker",
            type: "tracker",
          },
        }
      )
      .then(function (response) {
        // handle success
        console.log("response from lambda", response);
        let tempPosMarkers = [];
        for (const [
          index,
          value,
        ] of response.data.devicePositionsList.entries()) {
          tempPosMarkers.push({
            index: index,
            long: value[0],
            lat: value[1],
          });
        }

        setDevPosMarkers(tempPosMarkers);

        console.log("DevPosMarkers", devPosMarkers);

        const pos = tempPosMarkers.length - 1;

        setViewport({
          longitude: tempPosMarkers[pos].long,
          latitude: tempPosMarkers[pos].lat,
          zoom: 15,
        });
      })
      .catch(function (error) {
        // handle error
        console.log("error while calling api", error);
      });
  };

  const trackerMarkers = React.useMemo(
    () =>
      devPosMarkers.map((pos) => (
        <Marker key={pos.index} longitude={pos.long} latitude={pos.lat}>
          <Pin text={pos.index + 1} size={20} />
        </Marker>
      )),
    [devPosMarkers]
  );

  return (
    <>
      <h2>Tracking</h2>
      <div>
        <Track trackDevice={getDevicePosition} />
      </div>
      <div>
        <MAP viewport={viewport} trackerMarkers={trackerMarkers} />
      </div>
    </>
  );
};

export default App;
