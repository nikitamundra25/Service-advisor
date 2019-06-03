import { createLogic } from "redux-logic";

import { ApiHelper } from "../helpers/ApiHelper";

import {
  getOrderIdFailed,
  getOrderIdSuccess,
  orderActions,
  showLoader,
  hideLoader,
  redirectTo,
  getOrderListSuccess,
  addOrderSuccess,
  modelOpenRequest,
  updateOrderDetailsSuccess
} from "./../actions";
import { logger } from "../helpers/Logger";
import { toast } from "react-toastify";
import { DefaultErrorMessage } from "../config/Constants";
import { AppRoutes } from "../config/AppRoutes";

/**
 *
 */
const getOrderId = createLogic({
  type: orderActions.GET_ORDER_ID_REQUEST,
  async process({ action }, dispatch, done) {
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/order",
      "/orderId",
      "GET",
      true,
      undefined
    );
    logger(result);
    if (result.isError) {
      toast.error(result.messages[0] || DefaultErrorMessage);
      dispatch(
        getOrderIdFailed({
          orderId: {},
          isLoading: false
        })
      );
    } else {
      dispatch(
        getOrderIdSuccess({
          orderId: result.data.orderId,
          isLoading: false
        })
      );
    }
    done();
  }
});

/**
 *
 */
const getOrdersLogic = createLogic({
  type: orderActions.GET_ORDER_LIST_REQUEST,
  async process({ action }, dispatch, done) {
    let api = new ApiHelper();
    let result = await api.FetchFromServer("/order", "/getOrders", "GET", true);

    if (!result.isError) {
      dispatch(getOrderListSuccess(result.data));
    }
    done();
  }
});

/**
 *
 */

const updateOrderWorkflowStatusLogic = createLogic({
  type: orderActions.REQUEST_ORDER_STATUS_UPDATE,
  async process({ action, getState }, dispatch, done) {
    const { orderReducer } = getState();
    const { orderData, orderStatus } = orderReducer;
    let { orders } = orderData;
    const { orderId, from, to, destinationIndex, sourceIndex } = action.payload;
    if (!orders[to]) {
      orders[to] = [];
    }
    orders[to].push(orders[from][sourceIndex]);
    orders[from].splice(sourceIndex, 1);
    dispatch(getOrderListSuccess({ data: orders, orderStatus }));
    new ApiHelper().FetchFromServer(
      "/order",
      "/updateOrderStatus",
      "POST",
      true,
      undefined,
      {
        orderId,
        orderStatus: to,
        orderIndex: destinationIndex
      }
    );

    done();
  }
});

/**
 *
 */
const addOrderStatusLogic = createLogic({
  type: orderActions.ADD_ORDER_STATUS,
  async process({ action, getState }, dispatch, done) {
    dispatch(showLoader());
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/order",
      "/addOrderStatus",
      "POST",
      true,
      undefined,
      action.payload
    );
    const { orderData, orderStatus } = getState().orderReducer;
    const { orders } = orderData;
    orders[result.data.orderStatus._id] = [];
    orderStatus.push(result.data.orderStatus);
    logger(result);
    dispatch(getOrderListSuccess({ data: orders, orderStatus }));
    dispatch(
      modelOpenRequest({
        modelDetails: {
          addOrderStatusModalOpen: false
        }
      })
    );
    dispatch(hideLoader());
    done();
  }
});

/**
 *
 */
const deleteOrderStatusLogic = createLogic({
  type: orderActions.DELTE_ORDER_STATUS,
  async process({ action, getState }, dispatch, done) {
    let api = new ApiHelper();
    dispatch(showLoader());
    await api.FetchFromServer(
      "/order",
      "/deleteOrderStatus",
      "DELETE",
      true,
      undefined,
      action.payload
    );
    const { statusId, newStatusId } = action.payload;
    const { orderStatus, orderData } = getState().orderReducer;
    const { orders } = orderData;
    const ind = orderStatus.findIndex(d => d._id === statusId);
    orderStatus.splice(ind, 1);
    if (!orders[newStatusId]) {
      orders[newStatusId] = [];
    }
    if (!orders[statusId]) {
      orders[statusId] = [];
    }
    orders[newStatusId] = [...orders[statusId], ...orders[newStatusId]];
    dispatch(getOrderListSuccess({ data: orders, orderStatus }));
    dispatch(hideLoader());
    done();
  }
});
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
/**
 *
 */
const updateOrderOfOrderStatusLogic = createLogic({
  type: orderActions.UPDATE_ORDER_OF_ORDER_STATUS,
  async process({ action, getState }, dispatch, done) {
    const { payload } = action;
    const { from, to } = payload;
    const { orderStatus: oldOrderStatus, orderData } = getState().orderReducer;
    const { orders: data } = orderData;

    const orderStatus = reorder(oldOrderStatus, from.index, to.index);
    logger(orderStatus);
    dispatch(getOrderListSuccess({ data, orderStatus }));
    await new ApiHelper().FetchFromServer(
      "/order",
      "/updateOrderOfOrderStatus",
      "PUT",
      true,
      undefined,
      orderStatus
    );

    done();
  }
});
/**
 *
 */
const addOrderLogic = createLogic({
  type: orderActions.ADD_ORDER_REQUEST,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/order",
      "/addOrder",
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
      dispatch(addOrderSuccess({
        result:result.data.result
      }))
      dispatch(
        redirectTo({
          path: `${AppRoutes.WORKFLOW_ORDER.url.replace(
            ":id",
            `${result.data.result._id}`
          )}`
        })
      );
      dispatch(hideLoader());
      done();
    }
  }
});
/**
 *
 */
const updateOrderDetailsLogic = createLogic({
  type: orderActions.UPDATE_ORDER_DETAILS,
  async process({ action }, dispatch, done) {
    dispatch(showLoader());
    logger(action.payload);
    let api = new ApiHelper();
    let result = await api.FetchFromServer(
      "/order",
      "/updateOrderDetails",
      "PUT",
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
      dispatch(updateOrderDetailsSuccess())
      dispatch(hideLoader());
      done();
    }
  }
});

export const OrderLogic = [
  getOrderId,
  getOrdersLogic,
  deleteOrderStatusLogic,
  addOrderStatusLogic,
  updateOrderWorkflowStatusLogic,
  updateOrderOfOrderStatusLogic,
  addOrderLogic,
  updateOrderDetailsLogic
];
