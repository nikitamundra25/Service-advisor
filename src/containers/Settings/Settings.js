import React, { Component, Suspense } from "react";
// import { Route, Switch } from "react-router-dom";
import { Row, Col } from "reactstrap";
import Loader from "../Loader/Loader";

const Sidebar = React.lazy(() => import("./Sidebar"));
// const Users = React.lazy(() => import("./Users"));
// const Customers = React.lazy(() => import("./Customers"));

const SettingsNav = [
  {
    heading: true,
    icon: "fa fa-cog",
    name: "Settings",
  },
  {
    icon: "fa fa-users",
    name: "Users",
    link: "/settings/users",
  },
  {
    heading: true,
    icon: "fa fa-users",
    name: "List",
  },
  {
    icon: "fa fa-users",
    name: "Customers",
    link: "/settings/customers",
  },
  
];
// export const SettingRoutes = [
//   { path: "/settings/users", name: "Users", component: Users },
//   { path: "/settings/customers", name: "Customers", component: Customers },
// ];
class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm={"2"}>
            <Suspense fallback={<Loader />}>
              <Sidebar navItems={SettingsNav} />
            </Suspense>
          </Col>
          <Col sm={"10"}>
            <Suspense fallback={<Loader />}>
              {/* <Switch>
                {SettingRoutes.map((route, idx) => {
                  return route.component ? (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={props => <route.component {...props} />}
                    />
                  ) : null;
                })}
              </Switch> */}
            </Suspense>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Settings;
