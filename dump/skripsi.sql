--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: appointment_appointment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.appointment_appointment_status_enum AS ENUM (
    'scheduled',
    'checkin',
    'doctor queue',
    'pharmacy queue',
    'cashier queue',
    'done',
    'cancel'
);


ALTER TYPE public.appointment_appointment_status_enum OWNER TO postgres;

--
-- Name: fixed_schedule_day_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.fixed_schedule_day_enum AS ENUM (
    'SENIN',
    'SELASA',
    'RABU',
    'KAMIS',
    'JUMAT',
    'SABTU',
    'MINGGU'
);


ALTER TYPE public.fixed_schedule_day_enum OWNER TO postgres;

--
-- Name: patient_gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_gender_enum AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public.patient_gender_enum OWNER TO postgres;

--
-- Name: patient_id_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_id_type_enum AS ENUM (
    'PASSPORT',
    'DRIVER_LICENSE',
    'NATIONAL_ID'
);


ALTER TYPE public.patient_id_type_enum OWNER TO postgres;

--
-- Name: schedule_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.schedule_status_enum AS ENUM (
    'ready',
    'in review',
    'cancelled',
    'changed',
    'finish'
);


ALTER TYPE public.schedule_status_enum OWNER TO postgres;

--
-- Name: schedule_temp_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.schedule_temp_status_enum AS ENUM (
    'waiting',
    'approved',
    'cancelled'
);


ALTER TYPE public.schedule_temp_status_enum OWNER TO postgres;

--
-- Name: schedule_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.schedule_type_enum AS ENUM (
    'special',
    'regular'
);


ALTER TYPE public.schedule_type_enum OWNER TO postgres;

--
-- Name: staff_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.staff_role_enum AS ENUM (
    'DOCTOR',
    'PHARMACIST',
    'CASHIER',
    'MANAGEMENT'
);


ALTER TYPE public.staff_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    id integer NOT NULL,
    booking_code character varying NOT NULL,
    booking_qr character varying NOT NULL,
    appointment_status public.appointment_appointment_status_enum DEFAULT 'scheduled'::public.appointment_appointment_status_enum NOT NULL,
    is_check_in boolean DEFAULT false NOT NULL,
    check_in_time time without time zone,
    finish_time time without time zone,
    consultation_fee numeric(10,2),
    pharmacy_fee numeric(10,2),
    notes character varying,
    rating integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    global_queue integer,
    medical_record_id integer,
    doctor_queue_id integer,
    pharmacy_queue_id integer,
    cashier_queue_id integer,
    schedule_id integer,
    patient_id integer
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_id_seq OWNER TO postgres;

--
-- Name: appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_id_seq OWNED BY public.appointment.id;


--
-- Name: auth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth (
    id integer NOT NULL,
    email character varying,
    phone_number character varying NOT NULL,
    password character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    patient_id integer
);


ALTER TABLE public.auth OWNER TO postgres;

--
-- Name: auth_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_id_seq OWNER TO postgres;

--
-- Name: auth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_id_seq OWNED BY public.auth.id;


--
-- Name: cashier_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashier_queue (
    id integer NOT NULL,
    queue_number integer NOT NULL,
    start_time time without time zone NOT NULL,
    finish_time time without time zone NOT NULL,
    date date NOT NULL
);


ALTER TABLE public.cashier_queue OWNER TO postgres;

--
-- Name: cashier_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cashier_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cashier_queue_id_seq OWNER TO postgres;

--
-- Name: cashier_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cashier_queue_id_seq OWNED BY public.cashier_queue.id;


--
-- Name: doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor (
    id integer NOT NULL,
    name character varying NOT NULL,
    profile text NOT NULL,
    rating double precision DEFAULT '0'::double precision NOT NULL,
    total_rating integer DEFAULT 0 NOT NULL,
    consule_price integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    staff_id integer,
    specialization_id integer
);


ALTER TABLE public.doctor OWNER TO postgres;

--
-- Name: doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_id_seq OWNER TO postgres;

--
-- Name: doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_id_seq OWNED BY public.doctor.id;


--
-- Name: doctor_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_queue (
    id integer NOT NULL,
    queue_number integer NOT NULL,
    start_time time without time zone NOT NULL,
    finish_time time without time zone,
    date date NOT NULL,
    doctor_id integer
);


ALTER TABLE public.doctor_queue OWNER TO postgres;

--
-- Name: doctor_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_queue_id_seq OWNER TO postgres;

--
-- Name: doctor_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_queue_id_seq OWNED BY public.doctor_queue.id;


--
-- Name: fixed_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixed_schedule (
    id integer NOT NULL,
    day public.fixed_schedule_day_enum NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    capacity integer NOT NULL,
    sync_date timestamp with time zone DEFAULT now() NOT NULL,
    doctor_id integer,
    room_id integer
);


ALTER TABLE public.fixed_schedule OWNER TO postgres;

--
-- Name: fixed_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fixed_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fixed_schedule_id_seq OWNER TO postgres;

--
-- Name: fixed_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fixed_schedule_id_seq OWNED BY public.fixed_schedule.id;


--
-- Name: health; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health (
    id integer NOT NULL,
    type character varying NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.health OWNER TO postgres;

--
-- Name: health_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_id_seq OWNER TO postgres;

--
-- Name: health_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_id_seq OWNED BY public.health.id;


--
-- Name: medical_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_record (
    id integer NOT NULL,
    height integer NOT NULL,
    weight integer NOT NULL,
    systolic integer NOT NULL,
    diastolic integer NOT NULL,
    temperature integer NOT NULL,
    illness character varying(100),
    diagnosis_doctor character varying(150),
    prescription character varying,
    notes character varying(150),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    patient_id integer
);


ALTER TABLE public.medical_record OWNER TO postgres;

--
-- Name: medical_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_record_id_seq OWNER TO postgres;

--
-- Name: medical_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_record_id_seq OWNED BY public.medical_record.id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying,
    date_of_birth date NOT NULL,
    gender public.patient_gender_enum NOT NULL,
    id_type public.patient_id_type_enum NOT NULL,
    id_number character varying NOT NULL,
    id_photo character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_id_seq OWNER TO postgres;

--
-- Name: patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_id_seq OWNED BY public.patient.id;


--
-- Name: pharmacy_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_queue (
    id integer NOT NULL,
    queue_number integer NOT NULL,
    start_time time without time zone NOT NULL,
    finish_time time without time zone NOT NULL,
    date date NOT NULL
);


ALTER TABLE public.pharmacy_queue OWNER TO postgres;

--
-- Name: pharmacy_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_queue_id_seq OWNER TO postgres;

--
-- Name: pharmacy_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_queue_id_seq OWNED BY public.pharmacy_queue.id;


--
-- Name: room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room (
    id integer NOT NULL,
    name character varying NOT NULL,
    detail character varying
);


ALTER TABLE public.room OWNER TO postgres;

--
-- Name: room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_id_seq OWNER TO postgres;

--
-- Name: room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_id_seq OWNED BY public.room.id;


--
-- Name: schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule (
    id integer NOT NULL,
    date date NOT NULL,
    capacity integer NOT NULL,
    status public.schedule_status_enum NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    type public.schedule_type_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    moved_to_id integer,
    room_id integer,
    doctor_id integer,
    fixed_schedule_id integer
);


ALTER TABLE public.schedule OWNER TO postgres;

--
-- Name: schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedule_id_seq OWNER TO postgres;

--
-- Name: schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedule_id_seq OWNED BY public.schedule.id;


--
-- Name: schedule_temp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_temp (
    id integer NOT NULL,
    date date NOT NULL,
    capacity integer NOT NULL,
    status public.schedule_temp_status_enum NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    notes character varying NOT NULL,
    notes_admin character varying,
    room_id integer,
    doctor_id integer,
    old_schedule_id integer
);


ALTER TABLE public.schedule_temp OWNER TO postgres;

--
-- Name: schedule_temp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedule_temp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedule_temp_id_seq OWNER TO postgres;

--
-- Name: schedule_temp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedule_temp_id_seq OWNED BY public.schedule_temp.id;


--
-- Name: specialization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialization (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.specialization OWNER TO postgres;

--
-- Name: specialization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specialization_id_seq OWNER TO postgres;

--
-- Name: specialization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specialization_id_seq OWNED BY public.specialization.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    username character varying NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.staff_role_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    doctor_id integer,
    specialization_id integer
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_id_seq OWNER TO postgres;

--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test (
    id integer NOT NULL,
    message character varying NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.test OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_id_seq OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: appointment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment ALTER COLUMN id SET DEFAULT nextval('public.appointment_id_seq'::regclass);


--
-- Name: auth id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth ALTER COLUMN id SET DEFAULT nextval('public.auth_id_seq'::regclass);


--
-- Name: cashier_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_queue ALTER COLUMN id SET DEFAULT nextval('public.cashier_queue_id_seq'::regclass);


--
-- Name: doctor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor ALTER COLUMN id SET DEFAULT nextval('public.doctor_id_seq'::regclass);


--
-- Name: doctor_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_queue ALTER COLUMN id SET DEFAULT nextval('public.doctor_queue_id_seq'::regclass);


--
-- Name: fixed_schedule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_schedule ALTER COLUMN id SET DEFAULT nextval('public.fixed_schedule_id_seq'::regclass);


--
-- Name: health id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health ALTER COLUMN id SET DEFAULT nextval('public.health_id_seq'::regclass);


--
-- Name: medical_record id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record ALTER COLUMN id SET DEFAULT nextval('public.medical_record_id_seq'::regclass);


--
-- Name: patient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient ALTER COLUMN id SET DEFAULT nextval('public.patient_id_seq'::regclass);


--
-- Name: pharmacy_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_queue ALTER COLUMN id SET DEFAULT nextval('public.pharmacy_queue_id_seq'::regclass);


--
-- Name: room id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room ALTER COLUMN id SET DEFAULT nextval('public.room_id_seq'::regclass);


--
-- Name: schedule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule ALTER COLUMN id SET DEFAULT nextval('public.schedule_id_seq'::regclass);


--
-- Name: schedule_temp id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_temp ALTER COLUMN id SET DEFAULT nextval('public.schedule_temp_id_seq'::regclass);


--
-- Name: specialization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialization ALTER COLUMN id SET DEFAULT nextval('public.specialization_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (id, booking_code, booking_qr, appointment_status, is_check_in, check_in_time, finish_time, consultation_fee, pharmacy_fee, notes, rating, created_at, updated_at, global_queue, medical_record_id, doctor_queue_id, pharmacy_queue_id, cashier_queue_id, schedule_id, patient_id) FROM stdin;
\.


--
-- Data for Name: auth; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth (id, email, phone_number, password, created_at, updated_at, patient_id) FROM stdin;
\.


--
-- Data for Name: cashier_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashier_queue (id, queue_number, start_time, finish_time, date) FROM stdin;
\.


--
-- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor (id, name, profile, rating, total_rating, consule_price, created_at, updated_at, staff_id, specialization_id) FROM stdin;
1	Dokter 1	dokter 1	0	0	123	2024-11-06 10:59:13.541562	2024-11-06 10:59:13.541562	\N	1
2	Dokter 2	dokter 2	0	0	123	2024-11-06 10:59:28.349889	2024-11-06 10:59:28.349889	\N	1
\.


--
-- Data for Name: doctor_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor_queue (id, queue_number, start_time, finish_time, date, doctor_id) FROM stdin;
\.


--
-- Data for Name: fixed_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fixed_schedule (id, day, start_time, end_time, capacity, sync_date, doctor_id, room_id) FROM stdin;
\.


--
-- Data for Name: health; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health (id, type, created_date) FROM stdin;
\.


--
-- Data for Name: medical_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_record (id, height, weight, systolic, diastolic, temperature, illness, diagnosis_doctor, prescription, notes, created_at, updated_at, patient_id) FROM stdin;
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (id, name, address, date_of_birth, gender, id_type, id_number, id_photo, is_active, created_at, updated_at) FROM stdin;
1	Pasien 1	test	2024-11-07	MALE	NATIONAL_ID	1	\N	t	2024-11-06 11:00:02.995071	2024-11-06 11:00:02.995071
2	Pasien 2	test	2024-11-07	MALE	NATIONAL_ID	2	\N	t	2024-11-06 11:00:24.89704	2024-11-06 11:00:24.89704
3	Pasien 3	test	2024-11-07	MALE	NATIONAL_ID	3	\N	t	2024-11-06 11:00:34.927053	2024-11-06 11:00:34.927053
4	Pasien 4	test	2024-11-07	MALE	NATIONAL_ID	4	\N	t	2024-11-06 11:00:48.976811	2024-11-06 11:00:48.976811
5	Pasien 5	test	2024-11-06	MALE	NATIONAL_ID	5	\N	t	2024-11-06 11:00:59.738427	2024-11-06 11:00:59.738427
\.


--
-- Data for Name: pharmacy_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_queue (id, queue_number, start_time, finish_time, date) FROM stdin;
\.


--
-- Data for Name: room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room (id, name, detail) FROM stdin;
1	Ruangan 1	Ruangan 1
2	Ruangan 2	Ruangan 2
\.


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule (id, date, capacity, status, start_time, end_time, type, created_at, updated_at, moved_to_id, room_id, doctor_id, fixed_schedule_id) FROM stdin;
\.


--
-- Data for Name: schedule_temp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_temp (id, date, capacity, status, start_time, end_time, created_at, updated_at, notes, notes_admin, room_id, doctor_id, old_schedule_id) FROM stdin;
\.


--
-- Data for Name: specialization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specialization (id, name, description, is_active) FROM stdin;
1	Spesialisasi 1	Spesialisasi 1	t
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, username, name, email, password, role, created_at, updated_at, doctor_id, specialization_id) FROM stdin;
1	admin	admin	admin@admin.admin	$2b$10$B8/seLQ9UmHZMVL3SoHwp.JmENpvZzQXAIwYnOjbYZLBezDNdFNp6	MANAGEMENT	2024-11-06 10:53:15.384977	2024-11-06 10:53:15.384977	\N	\N
2	dokter1	Dokter 1	dokter1@gmail.com	$2b$10$4cZxh1LHmphKMuh.cNNrgOIEyDHGg/e.WtD.zLhgziWVkFMFKmv3m	DOCTOR	2024-11-06 10:59:13.517952	2024-11-06 10:59:13.58075	1	\N
3	dokter2	Dokter 2	dokter2@gmail.com	$2b$10$/hxtfvxta77gRnXd4o2O9OlqBaFRDWlS2OgauSAz0Asorwv50J3CK	DOCTOR	2024-11-06 10:59:28.319447	2024-11-06 10:59:28.382354	2	\N
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test (id, message, created_date) FROM stdin;
\.


--
-- Name: appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_id_seq', 1, false);


--
-- Name: auth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_id_seq', 1, false);


--
-- Name: cashier_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cashier_queue_id_seq', 1, false);


--
-- Name: doctor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_id_seq', 2, true);


--
-- Name: doctor_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_queue_id_seq', 1, false);


--
-- Name: fixed_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fixed_schedule_id_seq', 1, false);


--
-- Name: health_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_id_seq', 1, false);


--
-- Name: medical_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_record_id_seq', 1, false);


--
-- Name: patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_id_seq', 5, true);


--
-- Name: pharmacy_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_queue_id_seq', 1, false);


--
-- Name: room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_id_seq', 2, true);


--
-- Name: schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedule_id_seq', 1, false);


--
-- Name: schedule_temp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedule_temp_id_seq', 1, false);


--
-- Name: specialization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.specialization_id_seq', 1, true);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_id_seq', 3, true);


--
-- Name: test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_id_seq', 1, false);


--
-- Name: pharmacy_queue PK_18e3ac014ca7a59a8139685a317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_queue
    ADD CONSTRAINT "PK_18e3ac014ca7a59a8139685a317" PRIMARY KEY (id);


--
-- Name: schedule PK_1c05e42aec7371641193e180046; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY (id);


--
-- Name: cashier_queue PK_290f8d4a0b1cbd3b43777e08d44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_queue
    ADD CONSTRAINT "PK_290f8d4a0b1cbd3b43777e08d44" PRIMARY KEY (id);


--
-- Name: test PK_5417af0062cf987495b611b59c7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT "PK_5417af0062cf987495b611b59c7" PRIMARY KEY (id);


--
-- Name: schedule_temp PK_6c75dab03ffc84a90ab65fd7429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_temp
    ADD CONSTRAINT "PK_6c75dab03ffc84a90ab65fd7429" PRIMARY KEY (id);


--
-- Name: auth PK_7e416cf6172bc5aec04244f6459; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY (id);


--
-- Name: health PK_8a1d6d8c0c85c1791b359854e83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health
    ADD CONSTRAINT "PK_8a1d6d8c0c85c1791b359854e83" PRIMARY KEY (id);


--
-- Name: patient PK_8dfa510bb29ad31ab2139fbfb99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT "PK_8dfa510bb29ad31ab2139fbfb99" PRIMARY KEY (id);


--
-- Name: specialization PK_904dfcbdb57f56f5b57b9c09cc5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialization
    ADD CONSTRAINT "PK_904dfcbdb57f56f5b57b9c09cc5" PRIMARY KEY (id);


--
-- Name: fixed_schedule PK_981842f3e5ded6b189d04a15ce6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_schedule
    ADD CONSTRAINT "PK_981842f3e5ded6b189d04a15ce6" PRIMARY KEY (id);


--
-- Name: doctor_queue PK_c4deca53bba27dcc1d6f9e974b3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_queue
    ADD CONSTRAINT "PK_c4deca53bba27dcc1d6f9e974b3" PRIMARY KEY (id);


--
-- Name: room PK_c6d46db005d623e691b2fbcba23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY (id);


--
-- Name: medical_record PK_d96ede886356ac47ddcbb0bf3a4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT "PK_d96ede886356ac47ddcbb0bf3a4" PRIMARY KEY (id);


--
-- Name: staff PK_e4ee98bb552756c180aec1e854a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);


--
-- Name: appointment PK_e8be1a53027415e709ce8a2db74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY (id);


--
-- Name: doctor PK_ee6bf6c8de78803212c548fcb94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "PK_ee6bf6c8de78803212c548fcb94" PRIMARY KEY (id);


--
-- Name: auth REL_14ca3246b05287cacda9b85258; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT "REL_14ca3246b05287cacda9b85258" UNIQUE (patient_id);


--
-- Name: appointment REL_25cd2856652d8076f8dbfc3cda; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "REL_25cd2856652d8076f8dbfc3cda" UNIQUE (medical_record_id);


--
-- Name: doctor REL_30c6c35db96d7de4993f2f0c61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "REL_30c6c35db96d7de4993f2f0c61" UNIQUE (staff_id);


--
-- Name: appointment REL_43432c76c4776e928079a22bef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "REL_43432c76c4776e928079a22bef" UNIQUE (cashier_queue_id);


--
-- Name: appointment REL_4da4344fee5e10d301c1fff240; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "REL_4da4344fee5e10d301c1fff240" UNIQUE (pharmacy_queue_id);


--
-- Name: staff REL_b6805951ae7f5aed3314327d2b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "REL_b6805951ae7f5aed3314327d2b" UNIQUE (doctor_id);


--
-- Name: appointment REL_c61f597cafacdc55cf57a7eb1a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "REL_c61f597cafacdc55cf57a7eb1a" UNIQUE (doctor_queue_id);


--
-- Name: schedule REL_fb973e7b71f87501f1a13ea415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "REL_fb973e7b71f87501f1a13ea415" UNIQUE (moved_to_id);


--
-- Name: IDX_2c904b694a7abf9b12640257e5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_2c904b694a7abf9b12640257e5" ON public.fixed_schedule USING btree (day, start_time, end_time, room_id);


--
-- Name: IDX_9b56fc87deeba107fdcb529414; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_9b56fc87deeba107fdcb529414" ON public.schedule USING btree (date, start_time, end_time, room_id);


--
-- Name: schedule FK_017c44638c80d285dd42221f460; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "FK_017c44638c80d285dd42221f460" FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: schedule FK_08621558a8ae2d494eaa5f8056d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "FK_08621558a8ae2d494eaa5f8056d" FOREIGN KEY (fixed_schedule_id) REFERENCES public.fixed_schedule(id);


--
-- Name: auth FK_14ca3246b05287cacda9b85258c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT "FK_14ca3246b05287cacda9b85258c" FOREIGN KEY (patient_id) REFERENCES public.patient(id);


--
-- Name: appointment FK_1dd29956529ee1c9cf4a055312f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "FK_1dd29956529ee1c9cf4a055312f" FOREIGN KEY (schedule_id) REFERENCES public.schedule(id);


--
-- Name: appointment FK_25cd2856652d8076f8dbfc3cda3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "FK_25cd2856652d8076f8dbfc3cda3" FOREIGN KEY (medical_record_id) REFERENCES public.medical_record(id);


--
-- Name: schedule_temp FK_25e0a55b2ce2fa3c2e3a9e34b83; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_temp
    ADD CONSTRAINT "FK_25e0a55b2ce2fa3c2e3a9e34b83" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: doctor FK_30c6c35db96d7de4993f2f0c614; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "FK_30c6c35db96d7de4993f2f0c614" FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: appointment FK_43432c76c4776e928079a22bef5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "FK_43432c76c4776e928079a22bef5" FOREIGN KEY (cashier_queue_id) REFERENCES public.cashier_queue(id);


--
-- Name: appointment FK_4da4344fee5e10d301c1fff240d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "FK_4da4344fee5e10d301c1fff240d" FOREIGN KEY (pharmacy_queue_id) REFERENCES public.pharmacy_queue(id);


--
-- Name: fixed_schedule FK_52f0379f3e43701631239ed93b5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_schedule
    ADD CONSTRAINT "FK_52f0379f3e43701631239ed93b5" FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: doctor_queue FK_730493913b24a0027c8798263ba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_queue
    ADD CONSTRAINT "FK_730493913b24a0027c8798263ba" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: doctor FK_770f8e79222b0b3f46fad126b32; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "FK_770f8e79222b0b3f46fad126b32" FOREIGN KEY (specialization_id) REFERENCES public.specialization(id);


--
-- Name: schedule_temp FK_82c4415ac852c04bd24444d4af4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_temp
    ADD CONSTRAINT "FK_82c4415ac852c04bd24444d4af4" FOREIGN KEY (old_schedule_id) REFERENCES public.schedule(id);


--
-- Name: appointment FK_86b3e35a97e289071b4785a1402; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "FK_86b3e35a97e289071b4785a1402" FOREIGN KEY (patient_id) REFERENCES public.patient(id);


--
-- Name: fixed_schedule FK_96783f23745c9a6393cca555a55; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_schedule
    ADD CONSTRAINT "FK_96783f23745c9a6393cca555a55" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: staff FK_a02ce2f21bd4d8ccae5f52a73fd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_a02ce2f21bd4d8ccae5f52a73fd" FOREIGN KEY (specialization_id) REFERENCES public.specialization(id);


--
-- Name: schedule_temp FK_afa384f901e26e6cb0e2dfd30f6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_temp
    ADD CONSTRAINT "FK_afa384f901e26e6cb0e2dfd30f6" FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: staff FK_b6805951ae7f5aed3314327d2b7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_b6805951ae7f5aed3314327d2b7" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: schedule FK_bab091ad4033b47e7aaa59bbc6f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "FK_bab091ad4033b47e7aaa59bbc6f" FOREIGN KEY (doctor_id) REFERENCES public.doctor(id);


--
-- Name: appointment FK_c61f597cafacdc55cf57a7eb1a5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "FK_c61f597cafacdc55cf57a7eb1a5" FOREIGN KEY (doctor_queue_id) REFERENCES public.doctor_queue(id);


--
-- Name: medical_record FK_dddd1dc79ff4c20ae61b62f9add; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_record
    ADD CONSTRAINT "FK_dddd1dc79ff4c20ae61b62f9add" FOREIGN KEY (patient_id) REFERENCES public.patient(id);


--
-- Name: schedule FK_fb973e7b71f87501f1a13ea4150; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT "FK_fb973e7b71f87501f1a13ea4150" FOREIGN KEY (moved_to_id) REFERENCES public.schedule(id);


--
-- PostgreSQL database dump complete
--

