import { routerReducer } from "react-router-redux";
import { combineReducers } from "redux";

import { handleActions } from "redux-actions";

import { usersReducer } from "./Users";
import { tiresReducer } from "./Tires";
import { profileInfoReducer } from "./ProfileInfo";
import { matrixListReducer } from "./MatrixList";
import { fleetReducer } from "./FleetList";
import { rateStandardListReducer } from "./RateStandard";
import { customerInfoReducer, customerListReducer } from "./Customer";
import { vehicleAddInfoReducer, vehicleListReducer } from "./Vehicles";
import { modelInfoReducer } from "./ModelOperation";
import { vendorsReducer } from "./Vendors"

export const mainReducer = handleActions(
  {
    SHOW_LOADER: (state, action) => ({
      showLoader: true,
    }),
    HIDE_LOADER: (state, action) => ({
      showLoader: false,
    }),
  },
  {
    showLoader: false,
  }
);

const AppReducer = combineReducers({
  mainReducer,
  usersReducer,
  tiresReducer,
  profileInfoReducer,
  matrixListReducer,
  fleetReducer,
  rateStandardListReducer,
  customerInfoReducer,
  modelInfoReducer,
  customerListReducer,
  vehicleAddInfoReducer,
  vehicleListReducer,
  vendorsReducer,
  routing: routerReducer,

});

export default AppReducer;
