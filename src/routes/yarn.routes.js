// src/routes/yarn.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/yarn.controller");

router.get("/messages", ctrl.getMessages);
router.post("/message", ctrl.postMessage);

module.exports = router;
