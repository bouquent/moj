service postgresql start
python3 /opt/uoj/judger/judge_client start
cd /opt/server && forever /opt/server/bin/www start &

# update uoj data source
cd /opt/server/data && node update-problemset.js