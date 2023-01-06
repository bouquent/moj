const verifier = require("../common/verifier");
const fs = require('fs');
const pg = require('../DB/pg');
const { once } = require('events');
const compare = require("../common/compare");
const rand_file = require('../common/rand_file');
var archiver = require('archiver');
var xml2json = require('xml2js');
var parser = new xml2json.Parser();

// Save the submitted code to a local file and save the submission information into the database
exports.submit_answer = async function(req, res)
{

	console.log(req.headers);
	if(!isset(req.headers['rand-str']) || !isset(req.headers['timestamp']) || !isset(req.headers['encoded-str'])) 
    {
		console.log('need more headers');
        res.end('need more headers');
        return;
    }
    if( !verifier.verify(req.headers['rand-str'], req.headers['timestamp'], req.headers['encoded-str']) )
    {
        res.end("verification failed\n");
        return;
    }

    let problem = await pg.query("SELECT * FROM problems WHERE id = $1;", [req.query.problemId]);
    if(problem.rows.length == 0) 
    {
        res.end("Wow, Hacker TvT\n");
        return;
    }
    problem = problem.rows[0];
    problem['submission_requirement'] = JSON.parse(problem['submission_requirement']);
    console.log(problem['submission_requirement']);
	
	console.log(req.body);
    var langId = isset(req.body['langId'])?req.body['langId']:2;
    if(langId == 1) langId = "C";
    else if(langId == 2) langId = "C++";
    else if(langId == 3) langId = "Pascal";
    else if(langId == 4) langId = "Java8";
    else if(langId == 11) langId = "Python3";
    else if(langId == 12) langId = "Lua";
    else 
    {
		console.log('invalid languge ID');
        res.end("invalid languge ID");
        return;
    }

    let result = { "status": "Waiting" };
    let result_json = JSON.stringify(result);

    let tot_size = 0;
    let zip_file_name = "";
    if( req.body['submitType'] == 1 )
    {
        zip_file_name = rand_file.randAvaiableSubmissionFileName();
    }
    else if( req.body['submitType'] == 2 )
    {
        zip_file_name = rand_file.randAvaiableTmpFileName();
    }
    else 
    {
        req.end("invalid submitType");
        return;
    }

    var zip = archiver('zip');
    var output = fs.createWriteStream(zip_file_name); //should handle error.
    zip.pipe(output);

    let content = {};
    content['file_name'] = zip_file_name;
    content['config'] = [];
    if( problem['submission_requirement'][0]['type'] == "source code" )
        content['config'].push([problem['submission_requirement'][0]['name'] + "_language", langId]);

    content['config'].push(["problem_id", req.query.problemId]);
    
    zip.append(req.body['content'], { name: 'answer.code' });
    
    if( req.body['submitType'] == 1 )
    {
        zip.finalize(function(err, bytes) { if(err) throw err; tot_size += bytes; }  );
        content = JSON.stringify(content)
        if(tot_size > 50 * 1024) 
        {
            res.end("too big source code");
            return;
        }
        try
        {
            var id = await pg.query("select nextval('submissions_id_seq');");

            let sql = "insert into submissions (id, problem_id, submit_time, submitter, content, language, tot_size, status, result, is_hidden) values ($1, $2, now(), 'nameless', $3, $4, $5, $6, $7, $8);";
            let params = [id.rows[0].nextval, problem['id'], content, langId, tot_size, result['status'], result_json, problem['is_hidden']];

            const rev = await pg.query(sql, params);
			res.setHeader("Content-Type", "application/json");
            res.end("{ \"submissionId\": " + id.rows[0].nextval + " }\n");
        } 
        catch (err)
        {
            console.log("Error to connect db: " + err + " | " + JSON.stringify(err), "error"); 
            res.status(500).send("");
        }
    }
    else if( req.body['submitType'] == 2 )
    {
        zip.append(req.body['selfInput'], {name: 'input.txt'}); //output stream did not close explicitly, maybe not safe.
        content['config'].push(['custom_test', 'on']);
        zip.finalize( function(err, bytes) { if(err) throw err; tot_size += bytes; }  );
        content = JSON.stringify(content)
        try
        {
            var id = await pg.query("select nextval('custom_test_submissions_id_seq');");

            console.log("insert into custom_test_submissions (problem_id, submit_time, submitter, content, status, result) values ("+
            problem['id'] + ", now(), 'nameless', '" + content +"', '" + result['status'] + "', '" + result_json + "');");
            
            let sql = "insert into custom_test_output (id, content) values ($1, $2);";
            let params = [id.rows[0].nextval, req.body['selfOutput']];
            await pg.query(sql, params);

            sql = "insert into custom_test_submissions (id, problem_id, submit_time, submitter, content, status, result, status_details, judge_time) values ($1, $2, now(), 'nameless', $3, $4, $5, '', null);";
            params = [ id.rows[0].nextval, problem['id'], content, result['status'], result_json ];
            await pg.query(sql, params);
			res.setHeader("Content-Type", "application/json");
            res.end("{ \"submissionId\": " + id.rows[0].nextval + " }\n");
        }
        catch (err)
        {
            console.log("Error to connect db: " + err + " | " + JSON.stringify(err), "error"); 
            res.status(500).send("");
        }
    }

};

// Request the status of submitted code
exports.get_status = async function(req, res)
{
	console.log(req.headers);
	res.setHeader("Content-Type", "application/json");

	if(!isset(req.headers['rand-str']) || !isset(req.headers['timestamp']) || !isset(req.headers['encoded-str'])) 
    {
        res.end('need more headers');
        return;
    }
    if( !verifier.verify(req.headers['rand-str'], req.headers['timestamp'], req.headers['encoded-str']) )
    {
        res.end("verification failed\n");
        return;
    }

	if( !isset(req.query.submitType) || ( req.query.submitType != 1 && req.query.submitType != 2) ) 
	{
		res.end("invalid input");
		return;
	}	
	let submission = {};
	if( req.query.submitType == 1)
	{
    	submission = await pg.query("SELECT * FROM submissions WHERE id = $1;", [req.query.submissionId]);
	}
	else 
	{
		submission = await pg.query("SELECT * FROM custom_test_submissions WHERE id = $1;", [req.query.submissionId]);
	}
    if(submission.rows.length == 0) 
    {
        res.end("Wow, Hacker TvT\n");
        return;
    }
    submission = submission.rows[0];
    
    if(submission['status'] != 'Judged')
    {
        res.end("{ \"status\": 0 }");
        return;
    }

	let result = JSON.parse(submission['result']);
	
    if(result['status'] != 'Judged')
    {
        res.end('{ "status": 0 }');
    }
	
	let returnValue = {}; 
	returnValue.timeConsumptionMs = (isset(result['time'])?result['time']:0);
	returnValue.memoryConsumptionKbs = (isset(result['memory'])?result['memory']:0);

	
	if( isset(result['error']  ))
	{
		returnValue.status = 12;
		result['details'] = JSON.stringify(result['details']);
		returnValue.memo = { stdout:'', stderr:result['details'], userSolutionPrintContent:'', outputContent:''  };
		returnValue.rightCaseNum = 0;
		returnValue.allCaseNum = 1;
		res.end(JSON.stringify(returnValue));
		return;
	}

    // let resultDom = new dom().parseFromString(result['details']);
    parser.parseString(result['details'], async function(err, result)
    {   
	    let result_status = [0, 0, 0, 0, 0, 0, 0]; //enum {RE, TLE, MLE, WA, OLE, DS, AC}  
        if(req.query.submitType==1)  
        {
            tests = result.tests.test;
            for(let i = 0; i < tests.length; i++)
            {
                let value = tests[i].$.info;
                if( value == 'Runtime Error' ) result_status[0]++;
                else if( value == 'Time Limit Exceeded' ) result_status[1]++;
                else if( value == 'Memory Limit Exceeded' ) result_status[2]++;
                else if( value == 'Wrong Answer' ) result_status[3]++;
                else if( value == 'Output Limit Exceeded' ) result_status[4]++;
                else if( value == 'Dangerous Syscalls' ) result_status[5]++;
                else if( value == 'Accepted' ) result_status[6]++;
            }
            if(result_status[0] != 0) returnValue.status = 3;
            else if(result_status[1]!=0) returnValue.status = 6;
            else if(result_status[2]!=0) returnValue.status = 7;
            else if(result_status[3]!=0) returnValue.status = 4;
            else if(result_status[4]!=0) returnValue.status = 4;
            else if(result_status[5]!=0) returnValue.status = 4;
            else if(result_status[6]==tests.length) returnValue.status = 5;

            returnValue.rightCaseNum = result_status[6];
            returnValue.allCaseNum = tests.length;
            returnValue.memo = { stdout:'', stderr:'', userSolutionPrintContent: '', outputContent:''  };
            
        }
        else 
        {
            let test = result.tests['custom-test'][0];
            returnValue.allCaseNum = 1;
            let rev_out = '';
			console.log(test);
            if(test.$.info == 'Success')
            {
                let sql = "SELECT content FROM custom_test_output WHERE id = $1;";
                let params = [req.query.submissionId];
                let custom = await pg.query(sql, params);
				console.log(custom);
				custom = custom.rows[0].content;
                rev_out = test.out[0];
                if (custom == "The result of each time is uncertain") {
                    returnValue.status = 5;
                    returnValue.rightCaseNum = 1;
                } else {
                    returnValue.rightCaseNum = compare(custom, rev_out);
				    if(returnValue.rightCaseNum == 1) returnValue.status = 5;
				    else returnValue.status = 4;
                }
            }
            else 
            {
				returnValue.status = 4;
				let value = test.$.info;
                if( value == 'Runtime Error' ) returnValue.status = 3;
                else if( value == 'Time Limit Exceeded' ) returnValue.status = 6;
                returnValue.rightCaseNum = 0;
                rev_out = test.$.info;
            }
            returnValue.memo = { stdout:'', stderr:'', userSolutionPrintContent: rev_out, outputContent:''  };
        }

        console.log(JSON.stringify(returnValue));
        res.end(JSON.stringify(returnValue));
    }.bind({'req': req, 'res': res, 'returnValue': returnValue}));
}


exports.fetch_and_send = async function(req, res)
{
    let data = req.body;

    while( isset( req.body['submit'] ) ) //submit judge result to database
    {
        if( data['is_custom_test'] != undefined )
        {
            let submission = await pg.query("select submitter, status, content, result, problem_id from custom_test_submissions where id = $1;", [data['id']]);
            console.log("It is custom test");
            if(submission.rows.length == 0) 
            {
                break;
            }
            submission = submission.rows[0];
            if(submission['status'] != 'Judging') {
                break;
            }
	    console.log(submission);
            content = JSON.parse(submission['content']);
            result = JSON.parse(data['result']);
            if (isset(result["error"])) {
                let sql = "update custom_test_submissions set status = $1, result = $2 where id = $3;";
                let params = [result['status'], JSON.stringify(result), data['id']];
                await pg.query(sql, params);
            } else {
                let sql = "update custom_test_submissions set status = $1, result = $2 where id = $3;";
                let params = [result['status'], JSON.stringify(result), data['id']];
                await pg.query(sql, params);
            }
            await pg.query("update submissions set status_details = '' where id = $1;", [data['id']]);
        }
        else 
        {
            let submission = await pg.query("SELECT * FROM submissions WHERE id = $1;", [data['id']]);
            console.log("It is a common submission");
	    if(submission.rows.length == 0) 
            {
                break;
            }
            submission = submission.rows[0];
            if(submission['status'] != 'Judging' && submission['status'] != 'Judged, Judging') {
                break;
            }

            let content = JSON.parse(submission['content']);


            let result = JSON.parse(data['result']);
            if (result["error"] != undefined) {
                let sql = "update submissions set status = $1, result_error = $2, result = $3, score = null, used_time = 0, used_memory = 0 where id = $4;";
                let params = [result['status'], result['error'], JSON.stringify(result), data['id']];
                await pg.query(sql, params);
            } else {
                let sql = "update submissions set status = $1, result_error = null, result = $2, score = $3, used_time = $4, used_memory = $5 where id = $6;";
                let params = [ result['status'], JSON.stringify(result), result['score'], result['time'], result['memory'], data['id']];
                await pg.query(sql, params);
            }
        }
        await pg.query("update submissions set status_details = '' where id = $1;", [data['id']]);
        break;
    }
    
    if( isset(req.body['update-status']) )
    {
		if (isset(req.body['is_custom_test'])) {
            await pg.query("update custom_test_submissions set status_details = $1 where id = $2;", [data['status'], data['id']]);
		} else {
			await pg.query("update submissions set status_details = $1 where id = $2;", [data['status'], data['id']]);
		}
        res.end('');
        return;
    }

    if(isset(data['fetch_new']) && data['fetch_new'] == 0)
    {
        res.end("Nothing to judge")
        return 0-0; //nothing to judge.
    }
    
    let query_result = 'nothing';
    do
    {
		query_result = await querySubmissionToJudge('Waiting', "judge_time = now(), status = 'Judging'");
		if (query_result != 'nothing') {
            break;
		}

		query_result = await queryCustomTestSubmissionToJudge();
		if (query_result != 'nothing') {
			break;
		}
		
		query_result = await querySubmissionToJudge('Judged, Waiting', "status = 'Judged, Judging'");
		if (query_result != 'nothing') {
			break;
		}
    } while(false);
    if(query_result == 'nothing') 
    {
        res.end("Nothing to judge");
        return;
    }
    query_result.id = parseInt(query_result.id);
    query_result.problem_id = parseInt(query_result.problem_id);
    query_result.content = query_result.content;
    //query_result.problem_mtime = fs.statSync('./data/problems/' + query_result.problem_id + '/' + query_result.problem_id + '.zip' );
    query_result = JSON.stringify(query_result);
    res.end(query_result);
    return;
}

function isset(val)
{
    return (typeof val != "undefined");
}

async function querySubmissionToJudge(status, set_field)
{
    let result = await pg.query("select id, problem_id, content from submissions where status = $1 order by id limit 1;", [status]);
    if(result.rows.length != 1) return 'nothing';
    result = result.rows[0];
    let tmp = await pg.query("update submissions set " + set_field + " where id = $1 and status = $2;", [result['id'], status]);
    if(tmp.rowCount != 1) result = 'nothing';
    return result;
}

async function queryCustomTestSubmissionToJudge()
{
    let result = await pg.query("select id, problem_id, content from custom_test_submissions where judge_time is null order by id limit 1;");
    if(result.rows.length != 1) return 'nothing';
    result = result.rows[0];
    let tmp = await pg.query("update custom_test_submissions set judge_time = now(), status = 'Judging' where id = $1 and judge_time is null;", [result['id']]);
    if(tmp.rowCount != 1) result = 'nothing';
    result['is_custom_test'] = '';
    return result;
}

exports.download_file = function(req, res)
{
    let file_name = "";
    let download_file = "";
    console.log('type -> ', req.query.type);
    switch (req.query.type)
    {
        case 'submission':
	console.log('id -> ', req.query.id);
	console.log('rand -> ', req.query.rand_str_id);
        file_name = "/data/submissions/" + req.query.id + "/" + req.query.rand_str_id;
        download_file = "submission.zip";
        break;
        case 'tmp':
        file_name = "/data/tmp/" + req.query.rand_str_id;
        download_file = "tmp";
        break;
        case 'problem':
        file_name = '/data/problems/' + req.query.id +'/'+ req.query.id + ".zip";
        download_file = req.query.id  + ".zip";
        break;
        default:
        res.end('invalid source');
        return;
    }
    
    let options = {
        headers: {
        "Content-Disposition": "attachment; filename=" + download_file
        }
    };
    res.sendFile("/opt/server" +file_name, options);
}


