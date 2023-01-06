let key_str = require('../config/config_verifier')
const crypto = require('crypto')

function get_encode_str(rand_str, timestamp, key_str)
{
    rand_str = rand_str + ':' + parseInt(timestamp).toString(16) + ':' + key_str;
	console.log(rand_str);
//    let rev = crypto.createHash('md5').update(rand_str).digest('base64');
	let rev = crypto.createHash('md5').update(rand_str).digest('hex');
    console.log(rev);
    return rev;
}

function verify(rand_str, timestamp, ans_str)
{
    let nowTime = Date.now().valueOf();
	nowTime = parseInt(parseInt(nowTime)/1000).toString(16);
	console.log(nowTime, ' ', timestamp);
    if(nowTime > timestamp && nowTime - timestamp > 120*1000) return false;
	let check_str =  get_encode_str(rand_str, timestamp, key_str);
	console.log('rev_str: ', ans_str);
	console.log('chk_str: ', check_str);
    if(ans_str === check_str) return true;
    else return false;
}

module.exports = {verify};


