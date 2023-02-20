const fs = require('fs');
var path = require('path');
const pg = require('../DB/pg');
const execSync = require('child_process').execSync;

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

async function main()
{
	var map_new = JSON.parse(fs.readFileSync(path.join(__dirname, 'moj-problem-set/md5_list.json')));
	var map = JSON.parse(fs.readFileSync(path.join(__dirname, 'md5_list.json')));
	if (map == map_new) {
		return ;
	}
	let fNames = Object.keys(map_new);
	for(let i in fNames)
	{
		let fName = fNames[i];
		let fname_arr = fName.split('.');
		let flag_of_lock = false;
		try
		{
			if( typeof map[fName] == 'undefined')
			{
				// copy new problem
				flag_of_lock = await lock(fName);
				execSync(`bash /opt/server/scripts/copy.sh '${fname_arr[0]}'`);
				flag_of_lock = await unlock(fName);
				map[fName] = {};
				map[fName]['md5'] = map_new[fName]['md5'];
				if(fname_arr[fname_arr.length-1] == 'zip')
                {
					let params = [Number(fname_arr[0]), fname_arr[1],'[{"name":"answer","type":"source code","file_name":"answer.code"}]','{"view_content_type":"ALL","view_details_type":"ALL"}'];
					await pg.query("INSERT INTO problems (id, title, is_hidden, submission_requirement, extra_config) values ($1, $2, 0, $3, $4);", params);
				}
				console.log(fName, 'was created');
			}
			else if(map[fName]['md5'] != map_new[fName]['md5'])
			{
				//modify existing problem 
				flag_of_lock = await lock(fName);
				execSync(`bash /opt/server/scripts/copy.sh '${fname_arr[0]}'`);
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
	fs.writeFile('md5_list.json', JSON.stringify(map), (err) => { if(err) {  console.error(err); return; } else console.log('done'); });
}

main()