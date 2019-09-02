const Orders = require("../../models/order");
const OrderStatus = require("../../models/orderStatus");
const { defaultOrderStatus } = require("./../../data");
const mongoose = require("mongoose");

/* get order number */
const countOrderNumber = async (req, res) => {
  try {
    const result = await Orders.countDocuments();
    return res.status(200).json({
      orderId: parseInt(result) + 1,
      success: true,
      result
    });
  } catch (error) {
    console.log("this is order count error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

/* create new order */
const createNewOrder = async (req, res) => {
  const { body, currentUser } = req;
  try {
    const { id, parentId } = currentUser;
    const result = await Orders.countDocuments({
      userId: currentUser.id,
      parentId: currentUser.parentId ? currentUser.parentId : currentUser.id
    });
    const condition = {
      $or: [
        {
          isDeleted: false
        },
        {
          isDeleted: {
            $exists: false
          }
        }
      ],
      parentId: parentId ? parentId : id
    };
    let orderStatus = await OrderStatus.find(condition, {
      name: 1,
      isInvoice: 1
    }).sort({ orderIndex: 1 });
    if (!orderStatus.length) {
      defaultOrderStatus.forEach(e => {
        e.parentId = condition.parentId;
      });
      await OrderStatus.insertMany(defaultOrderStatus);
      orderStatus = await OrderStatus.find(condition, {
        name: 1,
        isInvoice: 1
      });
    }
    const workflowStatus = orderStatus[0]._id;
    const orderConst = {
      orderName: body.orderName,
      customerId: body.customerId
        ? mongoose.Types.ObjectId(body.customerId)
        : null,
      vehicleId: body.vehicleId
        ? mongoose.Types.ObjectId(body.vehicleId)
        : null,
      serviceId: body.serviceId,
      inspectionId: body.inspectionId,
      timeClockId: body.timeClockId
        ? mongoose.Types.ObjectId(body.timeClockId)
        : [],
      messageId: body.messageId ? mongoose.Types.ObjectId(body.messageId) : [],
      orderId: result + 1,
      userId: currentUser.id,
      parentId: currentUser.parrentId ? currentUser.parrentId : currentUser.id,
      workflowStatus,
      isDeleted: false
    };
    const orderData = new Orders(orderConst);
    await orderData.save();
    return res.status(200).json({
      message: "Order created successfully",
      result: orderData,
      success: true
    });
  } catch (error) {
    console.log("this is create order error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

/**
 * Owner: Sonu
 * Created: 21-05-2019 16:53
 * @param req
 * @param res
 * @returns []
 */
const listOrders = async (req, res) => {
  try {
    const { currentUser, query } = req;
    const { search: searchValue, customerId } = query;
    const { id, parentId } = currentUser;
    const orderStatusCondition = {
      $or: [
        {
          isDeleted: false
        },
        {
          isDeleted: {
            $exists: false
          }
        }
      ],
      parentId: parentId ? parentId : id
    };
    const condition = {
      $and: [
        {
          $or: [
            {
              isDeleted: false
            },
            {
              isDeleted: {
                $exists: false
              }
            }
          ]
        },
        { parentId: parentId ? parentId : id }
      ]
    };
    if (customerId) {
      condition["$and"].push({
        customerId: mongoose.Types.ObjectId(customerId)
      });
    }
    if (searchValue) {
      condition["$and"].push({
        $or: [
          {
            orderName: {
              $regex: new RegExp(searchValue.trim(), "i")
            }
          }
        ]
      });
    }
    const result = await Orders.find(condition).populate(
      "customerId vehicleId serviceId.serviceId inspectionId.inspectionId messageId.messageId customerCommentId"
    );
    let orderStatus = await OrderStatus.find(orderStatusCondition, {
      name: 1,
      isInvoice: 1
    }).sort({ orderIndex: "asc" });
    if (!orderStatus.length) {
      defaultOrderStatus.forEach(e => {
        e.parentId = condition.parentId;
      });
      await OrderStatus.insertMany(defaultOrderStatus);
      orderStatus = await OrderStatus.find(orderStatusCondition, {
        name: 1,
        isInvoice: 1
      }).sort({ orderIndex: 1 });
    }
    let response = {};

    result.forEach(element => {
      const { workflowStatus: status } = element;
      if (!response[status]) {
        response[status] = [element];
      } else {
        response[status].push(element);
      }
    });
    return res.status(200).json({
      message: "Data fetched successfully",
      data: response,
      orderStatus
    });
  } catch (error) {
    console.log("Error while fetching list of orders", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

/**
 *
 */
const updateOrderWorkflowStatus = async (req, res) => {
  try {
    const { body, currentUser } = req;
    const { id, parentId } = currentUser;
    const { orderId, orderStatus, orderIndex } = body;
    await Orders.updateOne(
      {
        parentId: id || parentId,
        _id: orderId
      },
      {
        $set: {
          workflowStatus: mongoose.Types.ObjectId(orderStatus),
          orderIndex
        }
      }
    );

    return res.status(200).json({
      message: "Order status updated successfully!"
    });
  } catch (error) {
    console.log("Error while fetching list of orders", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

/**
 *
 */
const addOrderStatus = async (req, res) => {
  try {
    const { body, currentUser } = req;
    const { id, parentId } = currentUser;
    const { name } = body;
    const orderStatus = new OrderStatus({
      name,
      parentId: id || parentId
    });
    const newOrderStatus = await orderStatus.save();

    return res.status(200).json({
      message: "Order status added successfully!",
      orderStatus: newOrderStatus
    });
  } catch (error) {
    console.log("Error while fetching list of orders", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
const deleteOrderStatus = async (req, res) => {
  try {
    const { body, currentUser } = req;
    const { id, parentId } = currentUser;
    const { statusId, newStatusId } = body;
    await Orders.updateOne(
      {
        parentId: id || parentId,
        workflowStatus: mongoose.Types.ObjectId(statusId)
      },
      {
        $set: {
          workflowStatus: mongoose.Types.ObjectId(newStatusId)
        }
      }
    );
    await OrderStatus.updateOne(
      {
        parentId: id || parentId,
        _id: mongoose.Types.ObjectId(statusId)
      },
      {
        $set: {
          isDeleted: true
        }
      }
    );

    return res.status(200).json({
      message: "Order status deleted successfully!"
    });
  } catch (error) {
    console.log("Error while fetching list of orders", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
const updateWorkflowStatusOrder = async (req, res) => {
  try {
    const { body, currentUser } = req;
    const { id, parentId } = currentUser;
    for (let i = 0; i < body.length; i++) {
      const element = body[i];
      await OrderStatus.updateOne(
        {
          parentId: id || parentId,
          _id: mongoose.Types.ObjectId(element._id)
        },
        {
          $set: {
            orderIndex: i
          }
        }
      );
    }
    return res.status(200).json({
      message: "Reordered successfully!"
    });
  } catch (error) {
    console.log("Error while fetching list of orders", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
const updateOrderDetails = async (req, res) => {
  const { body } = req;
  try {
    await Orders.findByIdAndUpdate(body._id, {
      $set: body
    });
    return res.status(200).json({
      message: "Order Updated Successfully!",
      success: true
    });
  } catch (error) {
    console.log("Error while updating orders details", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/* get order details */
const getOrderDetails = async (req, res) => {
  const { query, currentUser } = req;
  try {
    const id = currentUser.id;
    const parentId = currentUser.parentId || currentUser.id;
    const searchValue = query.search;
    const orderId = query._id;
    const customerId = query.customerId;
    const vehicleId = query.vehicleId;
    let condition = {};
    condition["$and"] = [
      {
        $or: [
          {
            parentId: mongoose.Types.ObjectId(id)
          },
          {
            parentId: mongoose.Types.ObjectId(parentId)
          },
          {
            _id: mongoose.Types.ObjectId(orderId)
          }
        ]
      },
      {
        $or: [
          {
            isDeleted: {
              $exists: false
            }
          },
          {
            isDeleted: false
          }
        ]
      }
    ];
    if (searchValue) {
      condition["$and"].push({
        $or: [
          {
            orderName: {
              $regex: new RegExp(searchValue.trim(), "i")
            }
          },
          {
            _id: mongoose.Types.ObjectId(orderId)
          }
        ]
      });
    }
    if (orderId) {
      condition["$and"].push({
        $or: [
          {
            _id: mongoose.Types.ObjectId(orderId)
          }
        ]
      });
    }
    if (customerId) {
      condition["$and"].push({
        $or: [
          {
            customerId: mongoose.Types.ObjectId(customerId)
          }
        ]
      });
    }
    if (vehicleId) {
      condition["$and"].push({
        $or: [
          {
            vehicleId: mongoose.Types.ObjectId(vehicleId)
          }
        ]
      });
    }
    const result2 = await Orders.find(condition).populate({
      path:
        "customerId vehicleId serviceId.serviceId inspectionId.inspectionId messageId.messageId customerCommentId timeClockId paymentId"
    });
    const result1 = await Orders.populate(result2, {
      path:
        "serviceId.serviceId.technician timeClockId.technicianId timeClockId.orderId customerId.fleet"
    });
    const resultExtended = await Orders.populate(result1, {
      path: "timeClockId.orderId.vehicleId"
    });
    const result = resultExtended;
    const serviceData = [],
      inspectionData = [],
      messageData = [],
      messageNotes = [],
      timeLogData = [],
      paymentData = [];
    if (result[0]) {
      if (result[0].serviceId && result[0].serviceId.length) {
        for (let index = 0; index < result[0].serviceId.length; index++) {
          const element = result[0].serviceId[index];
          serviceData.push(element.serviceId);
        }
      }
      if (result[0].inspectionId && result[0].inspectionId.length) {
        for (let index = 0; index < result[0].inspectionId.length; index++) {
          const element = result[0].inspectionId[index];
          inspectionData.push(element.inspectionId);
        }
      }
      if (result[0].messageId && result[0].messageId.length) {
        for (let index = 0; index < result[0].messageId.length; index++) {
          const element = result[0].messageId[index];
          if (
            element.messageId &&
            element.messageId.receiverId.toString() ===
            currentUser.id.toString()
          ) {
            element.messageId.isSender = false;
          }
          if (
            element.messageId.isInternalNotes &&
            !element.messageId.isDeleted
          ) {
            messageNotes.push(element.messageId);
          }
          messageData.push(element.messageId);
        }
      }
      if (result[0].timeClockId && result[0].timeClockId.length) {
        for (let index = 0; index < result[0].timeClockId.length; index++) {
          const element = result[0].timeClockId[index];
          if (!element.isDeleted) {
            timeLogData.push(element);
          }
        }
      }
      if (result[0].paymentId && result[0].paymentId.length) {
        for (let index = 0; index < result[0].paymentId.length; index++) {
          const element = result[0].paymentId[index];
          if (!element.isDeleted) {
            paymentData.push(element);
          }
        }
      }
    }
    return res.status(200).json({
      data: result,
      serviceResult: serviceData,
      inspectionResult: inspectionData,
      messageResult: messageData,
      messageNotes: messageNotes,
      timeClockResult: timeLogData,
      paymentResult: paymentData,
      customerCommentData: result[0] ? result[0].customerCommentId : [],
      success: true
    });
  } catch (error) {
    console.log("this is get label error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
const deleteOrder = async (req, res) => {
  try {
    const { body, currentUser } = req;
    const { id, parentId } = currentUser;
    const { id: orderID } = body;
    await Orders.updateOne(
      {
        parentId: id || parentId,
        _id: mongoose.Types.ObjectId(orderID)
      },
      {
        $set: {
          isDeleted: true
        }
      }
    );
    return res.status(200).json({
      message: "Order deleted successfully!"
    });
  } catch (error) {
    console.log("Error while fetching list of orders", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

module.exports = {
  countOrderNumber,
  createNewOrder,
  listOrders,
  updateOrderWorkflowStatus,
  addOrderStatus,
  deleteOrderStatus,
  updateWorkflowStatusOrder,
  updateOrderDetails,
  getOrderDetails,
  deleteOrder
};
