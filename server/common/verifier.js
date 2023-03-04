let verify_data = require('../config/config_verifier')
const crypto = require('crypto')

function get_encode_str(verify_str, timestamp, key_str)
{
    verify_str = verify_str + ':' + parseInt(timestamp).toString(16) + ':' + key_str;
    let rev = crypto.createHash('md5').update(verify_str).digest('hex');
    return rev;
}

function verify(timestamp, ans_str)
{
    let nowTime = Date.now().valueOf();
    nowTime = parseInt(parseInt(nowTime)/1000).toString();
    if(nowTime > timestamp && nowTime - timestamp > 120 * 1000) return false;
    let key_str = verify_data["key_str"];
    let verify_str_arr = verify_data["verify_str_arr"];
    for (let i in verify_str_arr) {
        let check_str =  get_encode_str(verify_str_arr[i], timestamp, key_str);
        if(ans_str === check_str) return true;
    }
    return false;
}

module.exports = {verify};


