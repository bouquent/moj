function compare(s, t)
{
    s = s.replaceAll("\n", ' ');
    s = s.replaceAll("\r", ' ');
    arr_s = s.split(' ');
    var index = arr_s.indexOf(''); // get index if value found otherwise -1
    while (index > -1) { //if found
        arr_s.splice(index, 1);
        index = arr_s.indexOf('')
    }

    t = t.replaceAll("\n", ' ');
    t = t.replaceAll("\r", ' ');
    arr_t = t.split(' ');
    index = arr_t.indexOf('');
    while (index > -1) {
        arr_t.splice(index, 1);
        index = arr_t.indexOf('')
    }

    if( arr_s.length  != arr_t.length ) return 0;
    for(let i = 0; i < arr_s.length; i++)
    {
        if(arr_s[i] != arr_t[i]) return 0;
    }
    return 1;
}

module.exports = compare;
