FROM ubuntu:18.04

COPY server /opt/server 
COPY uoj /opt/uoj
COPY oj_start /opt/

RUN apt-get update
RUN apt-get install -y g++ make curl

RUN cd /opt/uoj/judger/uoj_judger && make

COPY install /opt/install
RUN bash -x /opt/install/init_pg.sh
# Some database operations should be done here, such as building a database and building some tables.

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -x
RUN apt-get install -y nodejs && cd /opt/server/ && npm install && npm install forever -g && cd -

RUN apt-get install -y git zip unzip
RUN apt-get install -y python3 python3-pip && pip3 install requests
RUN apt-get install -y lua5.2

RUN mkdir -p /var/uoj_data && ln -s /var/uoj_data /opt/uoj/judger/uoj_judger/data

# The general framework is as above. Some language dependencies are not installed yet, such as pascal and java.
