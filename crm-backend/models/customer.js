const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const  PermissionObject = require("./commonPermission");
const customerSchema = new Schema({
  firstName: {
    type: String,
    default: null
  },
  lastName: {
    type: String,
    default: null
  },
  phoneDetail: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  companyName: {
    type: String,
    default: null
  },
  referralSource: {
    type: String,
    default: null
  },
  fleet: {
    type: Schema.Types.ObjectId,
    ref: "fleet",
    default: null
  },
  address1: {
    type: String,
    default: null
  },
  address2: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  zipCode: {
    type: String,
    default: null
  },
  permission: {
    type: PermissionObject,
    default: null
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    default: null
  },
  status: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Customer", customerSchema);
