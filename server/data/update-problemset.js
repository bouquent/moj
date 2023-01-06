const fs = require('fs');
var path = require('path');
const pg = require('../DB/pg');
const execSync = require('child_process').execSync;

main()

async function main()
{
	var map_new = JSON.parse(fs.readFileSync(path.join(__dirname, 'online-judge-problem-set/md5_list.json')));
	var map = JSON.parse(fs.readFileSync(path.join(__dirname, 'md5_list.json')));
	let fNames = Object.keys(map_new);
	console.log('hello wolrd')
	console.log(map);
	console.log(map_new);
	console.log(fNames)
	for(let i in fNames)
	{
		let fName = fNames[i];
		console.log(fName);	
		let arr = fName.split('.');
		console.log(arr);
		let flag_of_lock = false;
		try
		{
		if(isset(map[fName]) && map[fName] == map_new[fName])
		{
			console.log(fName, 'was not modified');
			return;
		}
		if(!isset(map[fName]))
		{
			flag_of_lock = await lock(fName);
			execSync(`bash /opt/server/scripts/copy.sh '${arr[0]}'`);
			flag_of_lock = await unlock(fName);
			map[fName] = {};
			map[fName]['md5'] = map_new[fName]['md5'];
			if(arr[arr.length-1] == 'zip')
			{
				if(!isNumber(arr[0])) return;
				let params = [Number(arr[0]), arr[1],'[{"name":"answer","type":"source code","file_name":"answer.code"}]','{"view_content_type":"ALL","view_details_type":"ALL"}'];
				await pg.query("INSERT INTO problems (id, title, is_hidden, submission_requirement, extra_config) values ($1, $2, 0, $3, $4);", params);
			}
			console.log(fName, 'was created');
		}
		else if(map[fName]['md5'] != map_new[fName]['md5'])
		{
			flag_of_lock = await lock(fName);
			execSync(`bash /opt/server/scripts/copy.sh '${arr[0]}'`);
			flag_of_lock = await unlock(fName);
			map[fName]['md5'] = map_new[fName]['md5'];
			console.log(fName, 'was modified');
		}
		}
		catch(err)
		{
		if(flag_of_lock == true) flag_of_lock = await unlock(fName);
		console.error(err);
		throw err;
		}
	}
	console.log(map);
	fs.writeFile('md5_list.json', JSON.stringify(map), (err) => { if(err) {  console.error(err); return; } else console.log('done'); });
}


//Below are all functions

function isNumber(str)
{
    let leadingZeroFlag = true;
    for(let i = 0; i < str.length; ++i)
    {
        if(leadingZeroFlag && str[i] == '0') return false;
        else leadingZeroFlag = false;
        if(str[i] > '0' && str[i] < '9') continue;
        else return false;
    }
    return true;
}

async function lock(str)
{
    while(1)
    {
        try
        {
            let sql = "INSERT INTO lock_table (lock_name) values ($1);";
            let params = [str];
            await pg.query(sql, params);
            break;
        }
        catch(err)
        {
            throw err;
        }
    }
	return true;
}

async function unlock(str)
{
    while(1)
    {
        try 
        {
            let sql = "DELETE FROM lock_table WHERE lock_name = $1;";
            let params = [str];
            await pg.query(sql, params);
            break;    
        } 
        catch (err) 
        {
            sleep(1);
            throw err;            
        }
    }
	return false;
}

function isset(value)
{
    return typeof value != 'undefined';
}

