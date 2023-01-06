'use strict'

const { Pool } = require('pg');
const config_pg = require('../config/config_pg');

const pool = new Pool(config_pg);

function query(sql_text, params)
{
    return pool.query(sql_text, params);
}

module.exports = { query };