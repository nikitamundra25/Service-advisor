const TimeClock = require("../../models/timeClock");
const UserModel = require("../../models/user");
const OrderModal = require("../../models/order");
const mongoose = require("mongoose");

const commonValidation = require("../../common");
const { validationResult } = require("express-validator/check");
const cron = require("node-cron");
const timeClocks = {};
/**
 *
 */
const addTimeLogs = async (req, res) => {
  const { body, currentUser } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: commonValidation.formatValidationErr(errors.mapped(), true),
      success: false
    });
  }
  try {
    const Duration = body.endDateTime - body.startDateTime;
    const timeLogsData = {
      type: body.type,
      technicianId: mongoose.Types.ObjectId(body.technicianId),
      vehicleId: mongoose.Types.ObjectId(body.vehicleId),
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      activity: mongoose.Types.ObjectId(body.activity),
      duration: Duration,
      orderId: mongoose.Types.ObjectId(body.orderId),
      userId: mongoose.Types.ObjectId(currentUser.id),
      parentId: currentUser.parentId
        ? mongoose.Types.ObjectId(currentUser.parentId)
        : mongoose.Types.ObjectId(currentUser.id),
      isDeleted: false
    };
    const timeLogElements = new TimeClock(timeLogsData);
    await timeLogElements.save();
    const result2 = await OrderModal.find({
      _id: body.orderId
    });
    const payload = {
      timeClockId: [
        {
          timeClockId: timeLogElements._id
        }
      ]
    };
    if (result2[0].timeClockId && result2[0].timeClockId.length) {
      for (let index = 0; index < result2[0].timeClockId.length; index++) {
        const element = result2[0].timeClockId[index];
        payload.timeClockId.push({
          timeClockId: element.timeClockId
        });
      }
    }
    await OrderModal.findByIdAndUpdate(body.orderId, {
      $set: payload
    });
    return res.status(200).json({
      message: "Time logged successfully!",
      success: true
    });
  } catch (error) {
    console.log("this is add Message Chat error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

/**
 *
 */
const startTimer = async (req, res) => {
  const { body } = req;
  const { technicianId, serviceId, orderId } = body;
  if (timeClocks[`${technicianId}`]) {
    return res.status(400).json({
      message: "This technician is already working on something else."
    });
  }
  await TimeClock.create({
    type: "timeclock",
    technicianId,
    serviceId,
    orderId,
    startDateTime: Date.now()
  });
  await UserModel.updateOne(
    {
      _id: technicianId
    },
    {
      $set: {
        currentlyWorking: {
          serviceId,
          orderId
        }
      }
    }
  );
  timeClocks[`${technicianId}`] = cron.schedule("* * * * * *", async () => {
    console.log("running a task every seond");
    await TimeClock.updateOne(
      {
        technicianId,
        serviceId,
        orderId
      },
      {
        $inc: {
          duration: 1
        }
      }
    );
  });
  return res.status(200).json({
    message: "Timer log started successfully!"
  });
};

/**
 *
 */
const stopTimer = async (req, res) => {
  const { body } = req;
  const { technicianId, serviceId } = body;
  if (timeClocks[`${technicianId}`]) {
    // return res.status(400).json({
    //   message: "This technician is not working on any task."
    // });
    timeClocks[`${technicianId}`].destroy();
  }
  await TimeClock.updateOne(
    {
      technicianId,
      serviceId
    },
    {
      $set: {
        endDateTime: Date.now()
      }
    }
  );
  await UserModel.updateOne(
    {
      _id: technicianId
    },
    {
      $set: {
        currentlyWorking: {}
      }
    }
  );
  return res.status(200).json({
    message: "Timer log stopped successfully!"
  });
};

/**
 *
 */
const getTimeLogByTechnician = async (req, res) => {
  try {
    const { query } = req;
    const { technicianId, serviceId, orderId } = query;
    const result = await TimeClock.findOne({
      technicianId,
      serviceId,
      orderId
    });
    return res.status(200).json({
      message: "Timer get success!",
      data: result || {}
    });
  } catch (error) {
    console.log("this is add", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
const getTimeLogByOrderId = async (req, res) => {
  try {
    const { query } = req;
    const { orderId } = query;
    const result = await TimeClock.find({
      orderId
    });
    return res.status(200).json({
      message: "Timer get success!",
      data: result || []
    });
  } catch (error) {
    console.log("this is add", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
const switchService = async (req, res) => {
  try {
    const { body } = req;
    const { technicianId, serviceId, orderId, oldService } = body;
    if (timeClocks[`${technicianId}`]) {
      timeClocks[`${technicianId}`].destroy();
    }
    await TimeClock.updateOne(
      {
        technicianId,
        oldService
      },
      {
        $set: {
          endDateTime: Date.now()
        }
      }
    );
    await TimeClock.create({
      type: "timeclock",
      technicianId,
      serviceId,
      orderId,
      startDateTime: Date.now()
    });
    await UserModel.updateOne(
      {
        _id: technicianId
      },
      {
        $set: {
          currentlyWorking: {
            serviceId,
            orderId
          }
        }
      }
    );
    timeClocks[`${technicianId}`] = cron.schedule("* * * * * *", async () => {
      console.log("running a task every seond");
      await TimeClock.updateOne(
        {
          technicianId,
          serviceId,
          orderId
        },
        {
          $inc: {
            duration: 1
          }
        }
      );
    });
    return res.status(200).json({
      message: "Techinician Service Changed success!"
    });
  } catch (error) {
    console.log("this is add", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/**
 *
 */
module.exports = {
  addTimeLogs,
  startTimer,
  getTimeLogByTechnician,
  getTimeLogByOrderId,
  stopTimer,
  switchService
};
