CREATE ROLE communicator WITH LOGIN PASSWORD 'password';
ALTER ROLE communicator CREATEDB;
--login as user
--psql -d postgres -U communicator
CREATE DATABASE weather;

