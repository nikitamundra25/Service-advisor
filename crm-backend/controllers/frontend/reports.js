const { OrderModel } = require("./../../models");
const mongoose = require("mongoose");
const { getDateRanges } = require("./dashboard");
const ObjectId = mongoose.Types.ObjectId;
/**
 *
 */
const getReportsByCustomerdays = async (req, res) => {
  try {
    const { currentUser } = req;
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
      parentId: parentId ? ObjectId(parentId) : ObjectId(id),
      customerId: {
        $exists: true,
        $ne: null
      }
    };
    /*  */
    /*  */
    const response = await OrderModel.aggregate([
      {
        $match: orderStatusCondition
      },
      {
        $group: {
          _id: "$customerId",
          customerId: { $first: "$customerId" }
        }
      }
    ]);
    const result = await OrderModel.populate(response, {
      path: "customerId",
      model: "Customer"
    });
    const resp = [];
    const dates = getDateRanges();
    for (let i = 0; i < result.length; i++) {
      const customer = result[i]._id;
      let due = 0;
      let paid = 0;
      let dataToSend = {
        cusomer: customer,
        customerId: result[i].customerId
      };
      for (const key in dates) {
        if (dates.hasOwnProperty(key)) {
          const date = dates[key];
          const start = new Date(new Date(date.start).setUTCHours(0, 0, 0));
          const end = new Date(new Date(date.end).setUTCHours(23, 59, 59));
          const invoice = await OrderModel.aggregate([
            {
              $match: {
                $and: [
                  {
                    $or: [
                      {
                        userId: ObjectId(id)
                      },
                      {
                        parentId: ObjectId(parentId)
                      }
                    ]
                  },
                  {
                    customerId: ObjectId(customer)
                  },
                  {
                    createdAt: {
                      $gte: start,
                      $lte: end
                    }
                  },
                  {
                    isInvoice: true
                  }
                ]
              }
            },
            {
              $lookup: {
                from: "paymentrecords",
                localField: "paymentId",
                foreignField: "_id",
                as: "payments"
              }
            },
            {
              $unwind: "$payments"
            },
            {
              $unwind: "$payments.payedAmount"
            },
            {
              $group: {
                _id: null,
                paid: { $sum: "$payments.payedAmount.amount" },
                due: { $sum: "$payments.payedAmount.remainingAmount" }
              }
            }
          ]);
          dataToSend[key] = invoice[0]
            ? parseFloat(invoice[0].paid) + parseFloat(invoice[0].due)
            : 0;
          due += invoice[0] ? parseFloat(invoice[0].due) : 0;
          paid += invoice[0] ? parseFloat(invoice[0].paid) : 0;
        }
      }
      resp.push({ ...dataToSend, due, paid });
    }
    return res.status(200).json({
      data: resp,
      message: "Data fetched successfully."
    });
  } catch (error) {
    console.log(
      "=================IN getReportsByCustomerdays==================="
    );
    console.log(error);
    console.log("====================================");
    res.status(500).json({
      message:
        "We are having problem adding part details, please try again after some time."
    });
  }
};
/**
 *
 */
module.exports = {
  getReportsByCustomerdays
};
