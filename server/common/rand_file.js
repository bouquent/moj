const fs = require('fs');

function randAvaiableSubmissionFileName()
{
    let num = getRandomInt(10000);
    if( !file_exists( "/opt/server/data/submissions/" + num))
    {
       fs.mkdir("/opt/server/data/submissions/" + num, (err) => { if(err) throw err; });
    }
    return randAvaiableFileName("/opt/server/data/submissions/"+num+"/"); // should end with '/'
}

function randAvaiableTmpFileName()
{
    return randAvaiableFileName("/opt/server/data/tmp/"); // should end with '/'
}

function file_exists(file)
{
    return fs.existsSync(file);
}

function randAvaiableFileName( dir )
{
    let filename = "";
    do {
        filename = dir + randString(20);
    } while (file_exists(filename));
    return filename;
}

function randString(len, charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
{
    let n_chars = charset.length;
    let str = '';
    for(let i = 0; i < len; i++)
    {
        str += charset[getRandomInt(n_chars)]
    }
    // console.log(str + "\n");
    return str;
}

function getRandomInt(max) 
{
    return Math.floor(Math.random() * max);
}

module.exports = { randAvaiableSubmissionFileName, randAvaiableTmpFileName };
