FROM centos:7

COPY server /opt/server 
COPY uoj /opt/uoj
COPY up /opt/

RUN yum install -y gcc-c++ make curl
RUN cd /opt/uoj/judger/uoj_judger && make

COPY install /opt/install
RUN bash -x /opt/install/install_pg.sh
# Some database operations should be done here, such as building a database and building some tables.

RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash -x
RUN yum -y install nodejs && cd /opt/server/ && npm install && cd -

RUN yum -y install git zip unzip
RUN yum -y install python3 && pip3 install requests
RUN yum -y install lua

RUN mkdir -p /var/uoj_data_copy && ln -s /var/uoj_data_copy /opt/uoj/judger/uoj_judger/uoj_data_copy

# The general framework is as above. Some language dependencies are not installed yet, such as pascal and java.
