import { createLogic } from "redux-logic";
import { ApiHelper } from "../helpers/ApiHelper";
import {
  profileInfoActions,
  profileInfoStarted,
  profileInfoSuccess,
  redirectTo,
  updateCompanyLogoSuccess,
  showLoader,
  hideLoader
} from "./../actions";
import { logger } from "../helpers/Logger";
import { toast } from "react-toastify";

const profileInfoLogic = createLogic({
  type: profileInfoActions.PROFILE_INFO_REQUEST,
  cancelType: profileInfoActions.PROFILE_INFO_FAILED,
  async process({ action }, dispatch, done) {
    dispatch(
      profileInfoStarted({
        profileInfo: {},
        isLoading: true
      })
    );
    let api = new ApiHelper();
    let result = await api.FetchFromServer("/user", "/getProfile", "GET", true);
    if (result.isError) {
      dispatch(
        redirectTo({
          path: "/login"
        })
      );
      localStorage.removeItem("token");
      done();
      return;
    } else {
      dispatch(
        profileInfoSuccess({
          profileInfo: result.data.data,
          isLoading: false
        })
      );
      done();
    }
  }
});

const updateCompanyLogoLogic = createLogic({
  type: profileInfoActions.UPDATE_COMPANY_LOGO,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    const { payload } = action;
    logger(payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/auth",
      "/image-upload",
      "POST",
      true,
      undefined,
      action.payload
    );
    logger(result);
    dispatch(hideLoader());
    if (result.isError) {
      toast.error(result.messages[0]);
      done();
      return;
    } else {
      // toast.success(result.messages[0]);
      dispatch(
        updateCompanyLogoSuccess({
          shopLogo: result.data.imageUploadData
        })
      );
      done();
    }
  }
});
const updateCompanyDetailsLogic = createLogic({
  type: profileInfoActions.UPDATE_COMPANY_DETAILS,
  async process({ action, getState }, dispatch, done) {
    dispatch(showLoader());
    const { profileInfoReducer } = getState();
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/auth",
      "/company-setup",
      "POST",
      true,
      undefined,
      action.payload
    );
    if (result.isError) {
      toast.error(result.messages[0]);
      dispatch(hideLoader());
      done();
      return;
    } else {
      toast.success(result.messages[0]);
      dispatch(
        profileInfoSuccess({
          isLoading: false,
          profileInfo: {
            ...profileInfoReducer.profileInfo,
            ...result.data.info
          }
        })
      );
      dispatch(hideLoader());
      done();
    }
  }
});
export const ProfileInfoLogic = [
  profileInfoLogic,
  updateCompanyLogoLogic,
  updateCompanyDetailsLogic
];
