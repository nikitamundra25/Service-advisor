const express = require("express");
const router = express.Router();
const serviceController = require("../../controllers/frontend/serviceController");
const token = require("../../common/token");

/* ----------Add new Service------------ */
router.post("/addService", token.authorisedUser, serviceController.addNewService);

/* get all canned services */
router.get("/cannedServiceList", token.authorisedUser, serviceController.getAllCannedServices);

/* add new canned service */
router.post("/addCanned", token.authorisedUser, serviceController.addNewCannedService)
module.exports = router;
