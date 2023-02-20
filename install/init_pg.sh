# Install PostgreSQL:
apt-get install -y postgresql-10
service postgresql start

su postgres -c "psql -c \"ALTER role postgres with password 'chenzezheng666';\""

PGPASSWORD=chenzezheng666 psql -U postgres -h 127.0.0.1 -p 5432 -d postgres -f /opt/install/init.sql
