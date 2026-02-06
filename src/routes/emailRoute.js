const emailController = require("../controllers/email.controller");
const express = require("express");
const router = express.Router();
//api/email
router.get("/recordatorio", emailController.enviarRecordatorio);

module.exports = router;