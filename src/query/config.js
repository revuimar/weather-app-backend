require('dotenv').config()
const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.query(
    `
    CREATE SEQUENCE IF NOT EXISTS public.stats_id_seq
        INCREMENT 1
        START 1
        MINVALUE 0
        MAXVALUE 9223372036854775807
        CACHE 1;
        
    ALTER SEQUENCE public.stats_id_seq
        OWNER TO communicator;
        
    CREATE TABLE IF NOT EXISTS public.stats
    (
        id bigint NOT NULL DEFAULT nextval('stats_id_seq'::regclass),
        data jsonb NOT NULL,
        CONSTRAINT stats_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    ALTER SEQUENCE public.stats_id_seq
        OWNER TO communicator;
    
    CREATE TABLE IF NOT EXISTS public.users
    (
        id uuid NOT NULL,
        login character(64) COLLATE pg_catalog."default",
        email character(128) COLLATE pg_catalog."default",
        password character(60) COLLATE pg_catalog."default",
        CONSTRAINT users_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    
    ALTER TABLE public.users
        OWNER to communicator;
    
    `).then((res) => {
        console.log("succesful initialisation");
    //pool.end();
    })
    .catch((err) => {
        console.log(err);
        pool.end();
    });

module.exports = { pool }
