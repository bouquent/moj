var express = require('express');
var router = express.Router();
const judge_controller = require('../controller/judge_controller');

// router.post("/submit", judge_controller.submit_answer);

router.post("/submit", judge_controller.submit_answer);
router.post("/submits", judge_controller.fetch_and_send);
router.post("/download", judge_controller.download_file);
router.get("/status", judge_controller.get_status);

module.exports = router;
