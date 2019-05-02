const vehicleModal = require("../../models/vehicle");
const customerModel = require("../../models/customer");

/* ------------Add New Vehicle------------ */
const addNewVehicle = async (req, res) => {
  const { body } = req;
  try {
    const vehicleData = {
      year: parseInt(body.year),
      make: body.make,
      modal: body.modal,
      type: body.type,
      miles: body.miles,
      color: body.color,
      licensePlate: body.licensePlate,
      unit: body.unit,
      vin: body.vin,
      subModal: body.subModal,
      engineSize: body.engineSize,
      productionDate: body.productionDate,
      transmission: body.transmission,
      drivetrain: body.drivetrain,
      notes: body.notes,
      parentId: body.parentId,
      userId: body.userId
    };
    const addVehicleData = new vehicleModal(vehicleData);
    const vehicles = await addVehicleData.save();
    if (body.customerId) {
      // vehicles
      await customerModel.updateOne(
        { _id: body.customerId },
        {
          $push: {
            vehicles: vehicles._id
          }
        }
      );
    }
    return res.status(200).json({
      responsecode: 200,
      message: !body.customerId
        ? "Vehicle data uploaded successfully!"
        : "Vehicle assigned to customer successfully!",
      success: true
    });
  } catch (error) {
    console.log("This is vehicle adding error", error);
    res.status(500).json({
      responsecode: 500,
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/* ------------Add New Vehicle End------------ */

/* ----------------Grt All User List------------ */
const getAllVehicleList = async (req, res) => {
  const { query, currentUser } = req;
  try {
    const limit = parseInt(query.limit || 10);
    const page = parseInt(query.page);
    const offset = page < 1 ? 0 : (page - 1) * limit;
    const searchValue = query.search;
    const sort = query.sort;
    const status = query.status;
    let sortBy = {};
    switch (sort) {
      case "loginasc":
        sortBy = {
          updatedAt: -1
        };
        break;
      case "nasc":
        sortBy = {
          firstName: 1,
          lastName: 1
        };
        break;
      case "ndesc":
        sortBy = {
          firstName: -1,
          lastName: 1
        };
        break;
      default:
        sortBy = {
          createdAt: -1
        };
        break;
    }
    let condition = {};
    condition["$and"] = [
      {
        $or: [
          {
            parentId: currentUser.id
          },
          {
            parentId: currentUser.parentId || currentUser.id
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
      },
      {
        _id: { $ne: currentUser.id }
      }
    ];
    if (searchValue) {
      condition["$and"].push({
        $or: [
          {
            type: {
              label: {
                $regex: new RegExp(searchValue.trim(), "i")
              }
            }
          },
          {
            make: {
              $regex: new RegExp(searchValue.trim(), "i")
            }
          },
          {
            modal: {
              $regex: new RegExp(searchValue.trim(), "i")
            }
          }
        ]
      });
    }

    if (typeof status !== "undefined") {
      condition["$and"].push({ status: status });
    }
    const getAllVehicle = await vehicleModal
      .find({
        ...condition
      })
      .sort(sortBy)
      .skip(offset)
      .limit(limit);
    const getAllVehicleCount = await vehicleModal.countDocuments({
      ...condition
    });
    return res.status(200).json({
      responsecode: 200,
      data: getAllVehicle,
      totalVehicles: getAllVehicleCount,
      success: true
    });
  } catch (error) {
    console.log("this is get all vehicle error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/* List Of all vehicles end */

/* update the vehicle */
const updateVehicleDetails = async (req, res) => {
  const { body } = req;
  try {
    if (!body.data.vehicleId) {
      return res.status(400).json({
        responsecode: 400,
        message: "Vehicle id is required.",
        success: false
      });
    } else {
      const today = new Date()
      const updateVehicleDetails = await vehicleModal.findByIdAndUpdate(
        body.data.vehicleId,
        {
          $set: body.data,
          updatedAt: today
        }
      );
      if (!updateVehicleDetails) {
        return res.status(400).json({
          responsecode: 400,
          message: "Error updating customer details.",
          success: false
        });
      } else {
        return res.status(200).json({
          responsecode: 200,
          message: "Vehicle details updated successfully!",
          success: false
        });
      }
    }
  } catch (error) {
    console.log("This is update Customer error", error);
    return res.status(500).json({
      responsecode: 500,
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};
/* end of update vehicle */

/* Delete Customer */
const deleteVehicle = async ({ body }, res) => {
  try {
    const data = await vehicleModal.updateMany(
      {
        _id: { $in: body.vehicleId }
      },
      {
        $set: {
          isDeleted: true
        }
      }
    );
    return res.status(200).json({
      message: "Vehicle deleted successfully!",
      data
    });
  } catch (error) {
    console.log("this is get all vehicle error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
  // try {
  //   const { vehicleId } = params;
  //   const data = await vehicleModal.findByIdAndUpdate(vehicleId, {
  //     isDeleted: true
  //   });
  //   return res.status(200).json({
  //     message: "Vehicle deleted successfully!",
  //     data,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     message: error.message ? error.message : "Unexpected error occure.",
  //     success: false,
  //   });
  // }
};
/* Delete Customer */

/* Update vehicle status */
const updateStatus = async ({ body }, res) => {
  try {
    const data = await vehicleModal.updateMany(
      {
        _id: { $in: body.vehicles }
      },
      {
        $set: {
          status: body.status
        }
      }
    );
    return res.status(200).json({
      message: body.status
        ? "Vehicle Activated successfully!"
        : "Vehicle Inactivated successfully!",
      data
    });
  } catch (error) {
    console.log("this is get all vehicle error", error);
    return res.status(500).json({
      message: error.message ? error.message : "Unexpected error occure.",
      success: false
    });
  }
};

module.exports = {
  addNewVehicle,
  getAllVehicleList,
  updateVehicleDetails,
  deleteVehicle,
  updateStatus
};
