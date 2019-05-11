import { toast } from "react-toastify";
import { createLogic } from "redux-logic";
import { AppConfig } from "../config/AppConfig";
import { ApiHelper } from "../helpers/ApiHelper";
import { logger } from "../helpers/Logger";
import {
  showLoader,
  hideLoader,
  usersActions,
  getUsersListSuccess,
  getUsersList,
  modelOpenRequest,
  addUserSuccess,
  editUserSuccess
} from "./../actions";
import { DefaultErrorMessage } from "../config/Constants";

const getUsersLogic = createLogic({
  type: usersActions.GET_USER_LIST,
  async process({ action }, dispatch, done) {
    dispatch(
      getUsersListSuccess({
        isLoading: true,
        users: []
      })
    );
    let api = new ApiHelper();
    let result = await api.FetchFromServer("/user", "/", "GET", true, {
      ...action.payload,
      limit: AppConfig.ITEMS_PER_PAGE
    });
    if (result.isError) {
      dispatch(
        getUsersListSuccess({
          isLoading: false,
          users: []
        })
      );
      done();
      return;
    } else {
      dispatch(hideLoader());
      dispatch(
        getUsersListSuccess({
          isLoading: false,
          users: result.data.data,
          totalUsers: result.data.totalUsers
        })
      );
      done();
    }
  }
});

const addUsersLogic = createLogic({
  type: usersActions.ADD_USER,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/auth",
      "/createUser",
      "POST",
      true,
      undefined,
      action.payload
    );
    if (result.isError) {
      toast.error(result.messages[0] || DefaultErrorMessage);
      dispatch(hideLoader());
      done();
      return;
    } else {
      toast.success(result.messages[0]);
      dispatch(
        modelOpenRequest({
          modelDetails: {
            addUserModal: false
          }
        })
      );
      dispatch(addUserSuccess());
      dispatch(hideLoader());
      done();
    }
  }
});
const editUsersLogic = createLogic({
  type: usersActions.EDIT_USER,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/auth",
      ["/updateUser", action.payload.id].join("/"),
      "PUT",
      true,
      undefined,
      action.payload.data
    );
    if (result.isError) {
      toast.error(result.messages[0] || DefaultErrorMessage);
      dispatch(hideLoader());
      done();
      return;
    } else {
      toast.success(result.messages[0]);

      dispatch(
        modelOpenRequest({
          modelDetails: {
            editUserModal: false
          }
        })
      );
      dispatch(hideLoader());
      dispatch(editUserSuccess())
      done();
    }
  }
});
const deleteUserLogic = createLogic({
  type: usersActions.DELETE_USER,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/user",
      "/delete",
      "POST",
      true,
      undefined,
      action.payload
    );
    if (result.isError) {
      toast.error(result.messages[0] || DefaultErrorMessage);
      dispatch(hideLoader());
      done();
      return;
    } else {
      toast.success(result.messages[0]);
      dispatch(hideLoader());
      delete action.payload.userId;
      dispatch(
        getUsersList({
          ...action.payload
        })
      );
      done();
    }
  }
});
const updateUserStatusLogic = createLogic({
  type: usersActions.UPDATE_USER_STATUS,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/user",
      "/updateStatus",
      "POST",
      true,
      undefined,
      action.payload
    );
    if (result.isError) {
      toast.error(result.messages[0] || DefaultErrorMessage);
      dispatch(hideLoader());
      done();
      return;
    } else {
      dispatch(hideLoader());
      delete action.payload.users;
      delete action.payload.status;
      dispatch(
        getUsersList({
          ...action.payload
        })
      );

      toast.success(result.messages[0]);
      done();
    }
  }
});

export const UsersLogic = [
  getUsersLogic,
  addUsersLogic,
  deleteUserLogic,
  editUsersLogic,
  updateUserStatusLogic
];
