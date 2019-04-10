import { toast } from "react-toastify";
import { createLogic } from "redux-logic";
import { ApiHelper } from "../helpers/ApiHelper";
import { logger } from "../helpers/Logger";
import { showLoader, hideLoader, fleetListActions } from "./../actions";

const getFleetListLogic = createLogic({
  type: fleetListActions.FLEET_LIST_REQUEST,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/user",
      "/list",
      "GET",
      true,
      action.payload,
      undefined
    );
    if (result.isError) {
      toast.error(result.messages[0]);
      dispatch(hideLoader());
      done();
      return;
    } else {
      dispatch(hideLoader());
      done();
    }
  }
});

const addFleetLogic = createLogic({
  type: fleetActions.ADD_FLEET,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    
    // dispatch(hideLoader());
    done();
  }
});

export const FleetLogic = [getFleetListLogic, addFleetLogic];
