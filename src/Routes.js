import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import PageNotFound from "./components/PageNotFound";
import GEOCODE from "./components/GeoCode";
import NAVIGATE from "./components/Navigate";
import START from "./components/Start";
import TRACK from "./components/Tracker";
import GEOFENCE from "./components/Geofencing";
import MULTIPLEROUTES from "./components/MultipleRoutes";

const AppRoutes = () => {
  const routeToHome = () => {
    window.location.href = "/";
  };
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact={true}>
            <center>
              <START />
            </center>
          </Route>
          <Route path="/searchAddress" exact={true}>
            <i
              className="fas fa-angle-double-left"
              style={{ paddingLeft: "100px", fontSize: "40px" }}
              onClick={routeToHome}
            ></i>
            <center>
              <GEOCODE />
            </center>
          </Route>
          <Route path="/navigate" exact={true}>
            <i
              className="fas fa-angle-double-left"
              style={{ paddingLeft: "100px", fontSize: "40px" }}
              onClick={routeToHome}
            ></i>
            <center>
              <NAVIGATE />
            </center>
          </Route>
          <Route path="/multipleroutes" exact={true}>
            <i
              className="fas fa-angle-double-left"
              style={{ paddingLeft: "100px", fontSize: "40px" }}
              onClick={routeToHome}
            ></i>
            <center>
              <MULTIPLEROUTES />
            </center>
          </Route>
          <Route path="/track" exact={true}>
            <i
              className="fas fa-angle-double-left"
              style={{ paddingLeft: "100px", fontSize: "40px" }}
              onClick={routeToHome}
            ></i>
            <center>
              <TRACK
                trackerDeviceId={`device_${Math.floor(Date.now() / 1000)}`}
              />
            </center>
          </Route>
          <Route path="/geofence" exact={true}>
            <i
              className="fas fa-angle-double-left"
              style={{ paddingLeft: "100px", fontSize: "40px" }}
              onClick={routeToHome}
            ></i>
            <center>
              <GEOFENCE />
            </center>
          </Route>
          <Route path="*" exact={true}>
            <i
              className="fas fa-angle-double-left"
              style={{ paddingLeft: "100px", fontSize: "40px" }}
              onClick={routeToHome}
            ></i>
            <center>
              <PageNotFound />
            </center>
          </Route>
        </Switch>
      </BrowserRouter>
    </>
  );
};

export default AppRoutes;
