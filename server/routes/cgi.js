var express = require('express');
var router = express.Router();
const judge_controller = require('../controller/judge_controller');
const child_process = require('child_process');
const fs = require('fs');
var path = require('path');


// router.post("/submit", judge_controller.submit_answer);

router.get("/update-problemset", (req, res)=>
{
    let script = `${path.join(__dirname, "..", "/scripts")}/update.cgi`;

    if (!fs.existsSync(script)) {
        res.status(500).send("Missing update.cgi");
        return;
    }

    let cmdStr = `/bin/bash ${script}`;
    let ret = child_process.execSync(cmdStr);
    res.status(200).end("OK\n");
});

router.get("/health_check", (req, res)=>
{
	res.end('health');
});

module.exports = router;
