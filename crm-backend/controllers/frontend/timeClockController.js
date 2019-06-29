const TimeClock = require("../../models/timeClock");
const OrderModal = require("../../models/order");
const mongoose = require("mongoose");
const commonValidation = require("../../common");
const { validationResult } = require("express-validator/check");
const cron = require("node-cron");
const moment = require('moment');
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
    let startTime = body.startDateTime.split(':')
    let dateDuration;
    dateDuration = new Date(body.date);
    dateDuration.setHours(parseInt(startTime[0]));
    dateDuration.setMinutes(parseInt(startTime[1]));
    const startDate = dateDuration.toISOString();

    let endTime = body.endDateTime.split(':')
    let dateDurationEnd;
    dateDurationEnd = new Date(body.date);
    dateDurationEnd.setHours(parseInt(endTime[0]));
    dateDurationEnd.setMinutes(parseInt(endTime[1]));
    const endDate = dateDurationEnd.toISOString();

    const duration = moment(body.duration, 'HH:mm:ss: A').diff(moment().startOf('day'), 'seconds');
    const timeLogsData = {
      type: body.type,
      technicianId: mongoose.Types.ObjectId(body.technicianId),
      startDateTime: startDate,
      endDateTime: endDate,
      activity: body.activity,
      duration: duration,
      date: body.date,
      total: body.total,
      orderId: mongoose.Types.ObjectId(body.orderId),
      userId: mongoose.Types.ObjectId(currentUser.id),
      parentId: currentUser.parentId
        ? mongoose.Types.ObjectId(currentUser.parentId)
        : mongoose.Types.ObjectId(currentUser.id),
      isDeleted: false,
      notes: body.notes
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
      message: "Time log added successfully!",
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
  if (timeClocks[`${technicianId}-${serviceId}`]) {
    return res.status(400).json({
      message: "This user is already working on something else"
    });
  }
  await TimeClock.create({
    technicianId,
    serviceId,
    orderId,
    startDateTime: Date.now()
  });
  timeClocks[`${technicianId}-${serviceId}`] = cron.schedule(
    "* * * * * *",
    async () => {
      console.log("running a task every minute");
      await TimeClock.updateOne(
        {
          technicianId,
          serviceId,
          orderId
        },
        {
          duration: {
            $inc: 1
          }
        }
      );
    }
  );
  return res.status(200).json({
    message: "Timer log started successfully!"
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
      orderId,
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
const updateTimeLogOfTechnician = async (req, res) => {
  const { body, currentUser } = req
  try {
    let timeLogsData
    if (body.startDateTime) {
      let startTime = body.startDateTime.split(':')
      let dateDuration;
      dateDuration = new Date(body.date);
      dateDuration.setHours(parseInt(startTime[0]));
      dateDuration.setMinutes(parseInt(startTime[1]));
      const startDate = dateDuration.toISOString();

      let endTime = body.endDateTime.split(':')
      let dateDurationEnd;
      dateDurationEnd = new Date(body.date);
      dateDurationEnd.setHours(parseInt(endTime[0]));
      dateDurationEnd.setMinutes(parseInt(endTime[1]));
      const endDate = dateDurationEnd.toISOString();

      const duration = moment(body.duration, 'HH:mm:ss: A').diff(moment().startOf('day'), 'seconds');
      timeLogsData = {
        type: body.type,
        technicianId: mongoose.Types.ObjectId(body.technicianId),
        startDateTime: startDate,
        endDateTime: endDate,
        activity: body.activity,
        duration: duration,
        date: body.date,
        total: body.total,
        orderId: mongoose.Types.ObjectId(body.orderId),
        userId: mongoose.Types.ObjectId(currentUser.id),
        parentId: currentUser.parentId
          ? mongoose.Types.ObjectId(currentUser.parentId)
          : mongoose.Types.ObjectId(currentUser.id),
        isDeleted: false,
        notes: body.notes
      };
    } else {
      timeLogsData = {
        isDeleted: body.isDeleted
      }
    }
    await TimeClock.findByIdAndUpdate(body._id, {
      $set: timeLogsData
    })
    return res.status(200).json({
      message: "Time log updated successfully",
      success: true
    })
  } catch (error) {
    console.log("this is update timelog error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
}
/**
 *
 */
module.exports = {
  addTimeLogs,
  startTimer,
  getTimeLogByTechnician,
  updateTimeLogOfTechnician
};
