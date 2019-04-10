import { toast } from "react-toastify";
import { createLogic } from "redux-logic";
import { AppConfig } from "../config/AppConfig";
import { ApiHelper } from "../helpers/ApiHelper";
import { logger } from "../helpers/Logger";
import {
  showLoader,
  hideLoader,
  customersAddActions,
  customerAddSuccess,
  customerAddFailed,
  customerAddStarted
} from "./../actions";

const addCustomerLogic = createLogic({
  type: customersAddActions.CUSTOMER_ADD_REQUEST,
  cancelType: customersAddActions.CUSTOMER_ADD_FAILED,
  async process({ getState, action }, dispatch, done) {
    const profileStateData = getState().profileInfoReducer;

    let data = action.payload;
    data.parentId = profileStateData.profileInfo.parentId;    
    data.userId = profileStateData.profileInfo._id;   
    dispatch(showLoader());
    logger(action.payload);
    dispatch(
      customerAddStarted({
        customerAddInfo: []
      })
    );
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/customer",
      "/createCustomer",
      "POST",
      true,
      undefined,
      data
    );
    if (result.isError) {
        dispatch(
          customerAddFailed({
            customerAddInfo: []
          })
        );
      toast.error(result.messages[0]);
      dispatch(hideLoader());
      done();
      return;
    } else {
      toast.success(result.messages[0]);
      dispatch(
        customerAddSuccess({
          customerAddInfo: result.data.data
        })
      );
      dispatch(hideLoader());
      done();
    }
  }
});
export const CustomersLogic = [addCustomerLogic];
