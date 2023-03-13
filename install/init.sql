CREATE ROLE oj_web LOGIN password 'chenzezheng666';
\c - oj_web

CREATE TABLE custom_test_submissions (
  id serial NOT NULL,
  problem_id integer NOT NULL,
  submit_time timestamp with time zone NOT NULL,
  submitter varchar(20) NOT NULL,
  content text NOT NULL,
  judge_time timestamp with time zone DEFAULT NULL,
  result text NOT NULL,
  status varchar(20) NOT NULL,
  status_details varchar(100) DEFAULT '',
  PRIMARY KEY (id)
);

CREATE TABLE submissions (
  id serial  NOT NULL,
  problem_id integer  NOT NULL,
  contest_id integer  DEFAULT NULL,
  submit_time timestamp with time zone NOT NULL,
  submitter varchar(20) NOT NULL,
  content text NOT NULL,
  language varchar(15) NOT NULL,
  tot_size integer NOT NULL,
  judge_time timestamp with time zone DEFAULT NULL,
  result text NOT NULL,
  status varchar(20) NOT NULL,
  result_error varchar(20) DEFAULT NULL,
  score integer DEFAULT NULL,
  used_time integer NOT NULL DEFAULT '0',
  used_memory integer NOT NULL DEFAULT '0',
  is_hidden integer NOT NULL,
  status_details varchar(100) DEFAULT '',
  PRIMARY KEY (id)
);

CREATE TABLE problems (
  id serial NOT NULL,
  title text NOT NULL,
  is_hidden integer NOT NULL DEFAULT '0',
  submission_requirement text,
  extra_config varchar(500) NOT NULL DEFAULT '{"view_content_type":"ALL","view_details_type":"ALL"}',
  ac_num integer NOT NULL DEFAULT '0',
  submit_num integer NOT NULL DEFAULT '0',
  difficulty_level text,
  PRIMARY KEY (id)
);

CREATE TABLE custom_test_output (
  id integer NOT NULL,
  content text,
  PRIMARY KEY (id)
);

CREATE TABLE lock_table(
  lock_name text NOT NULL,
  PRIMARY KEY(lock_name)
);