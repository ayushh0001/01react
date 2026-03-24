--
-- PostgreSQL database dump
--

\restrict Ofz0cr6sgIBOAhGcNTtwAyEqHRk5EuaZkwLSFX79jz7hQa2NBkA6S5VVh97boo4

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    product_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    price_at_add numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    parent_id uuid,
    description text,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20),
    discount_value numeric(10,2) NOT NULL,
    min_order_amount numeric(10,2),
    max_discount_amount numeric(10,2),
    valid_from timestamp without time zone NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[])))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: customer_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    dob date,
    gender character varying(20),
    profile_image text,
    account_type character varying(20) DEFAULT 'standard'::character varying,
    preferences jsonb DEFAULT '{"theme": "light", "language": "en", "notifications": true}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_profiles_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.customer_profiles OWNER TO postgres;

--
-- Name: delivery_issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_issues (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    partner_id uuid,
    issue_type character varying(100) NOT NULL,
    description text NOT NULL,
    images jsonb,
    status character varying(50) DEFAULT 'reported'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_issues_status_check CHECK (((status)::text = ANY ((ARRAY['reported'::character varying, 'in_progress'::character varying, 'resolved'::character varying])::text[])))
);


ALTER TABLE public.delivery_issues OWNER TO postgres;

--
-- Name: delivery_partner_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_partner_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    vehicle_type character varying(50) NOT NULL,
    vehicle_number character varying(20) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.delivery_partner_details OWNER TO postgres;

--
-- Name: delivery_partner_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_partner_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    document_type character varying(50) NOT NULL,
    document_number character varying(50),
    document_image text NOT NULL,
    expiry_date date,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_partner_documents_document_type_check CHECK (((document_type)::text = ANY ((ARRAY['driving_license'::character varying, 'aadhar'::character varying, 'pan'::character varying, 'vehicle_rc'::character varying, 'insurance'::character varying])::text[])))
);


ALTER TABLE public.delivery_partner_documents OWNER TO postgres;

--
-- Name: delivery_partner_earnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_partner_earnings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    partner_id uuid,
    order_id uuid,
    delivery_fee numeric(10,2) NOT NULL,
    tips numeric(10,2) DEFAULT 0,
    incentives numeric(10,2) DEFAULT 0,
    total_earning numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_partner_earnings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processed'::character varying, 'paid'::character varying])::text[])))
);


ALTER TABLE public.delivery_partner_earnings OWNER TO postgres;

--
-- Name: delivery_partner_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_partner_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    dob date,
    gender character varying(20),
    personal_address text,
    aadhar_number character varying(12),
    driving_license character varying(20),
    emergency_contact jsonb,
    bank_account_number character varying(20),
    ifsc_code character varying(11),
    profile_image text,
    preferences jsonb DEFAULT '{"theme": "light", "language": "en", "notifications": true}'::jsonb,
    is_online boolean DEFAULT false,
    current_location public.geography(Point,4326),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_partner_profiles_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.delivery_partner_profiles OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    product_id uuid,
    product_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    status character varying(50) NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid,
    seller_id uuid,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    shipping_amount numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    final_amount numeric(10,2) NOT NULL,
    shipping_address jsonb NOT NULL,
    payment_method character varying(50),
    payment_id character varying(255),
    delivery_boy_id uuid,
    delivery_status character varying(50),
    delivery_fee numeric(10,2),
    partner_earning numeric(10,2),
    distance numeric(10,2),
    estimated_time integer,
    otp character varying(6),
    estimated_delivery timestamp without time zone,
    tracking_number character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_delivery_status_check CHECK (((delivery_status)::text = ANY ((ARRAY['assigned'::character varying, 'accepted'::character varying, 'picked_up'::character varying, 'in_transit'::character varying, 'delivered'::character varying])::text[]))),
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['razorpay'::character varying, 'cod'::character varying, 'wallet'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying, 'returned'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: otp_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otp_verifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mobile character varying(10) NOT NULL,
    email character varying(255),
    otp character varying(6) NOT NULL,
    otp_type character varying(20) NOT NULL,
    is_verified boolean DEFAULT false,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT otp_verifications_otp_type_check CHECK (((otp_type)::text = ANY ((ARRAY['signup'::character varying, 'login'::character varying, 'password_reset'::character varying])::text[])))
);


ALTER TABLE public.otp_verifications OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    reset_token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    user_id uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'INR'::character varying,
    payment_method character varying(50) NOT NULL,
    gateway_payment_id character varying(255),
    gateway_order_id character varying(255),
    gateway_signature character varying(255),
    status character varying(50) DEFAULT 'created'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['created'::character varying, 'pending'::character varying, 'success'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    user_id uuid,
    rating integer NOT NULL,
    comment text,
    images jsonb,
    is_verified_purchase boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.product_reviews OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    product_name character varying(255) NOT NULL,
    description text,
    category_id uuid,
    deepest_category_name character varying(255),
    category_path jsonb,
    price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    in_stock boolean DEFAULT true,
    is_approved boolean DEFAULT false,
    approval_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refunds (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    payment_id uuid,
    amount numeric(10,2) NOT NULL,
    reason text,
    gateway_refund_id character varying(255),
    status character varying(50) DEFAULT 'processing'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT refunds_status_check CHECK (((status)::text = ANY ((ARRAY['processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.refunds OWNER TO postgres;

--
-- Name: return_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    user_id uuid,
    order_item_ids jsonb NOT NULL,
    reason text NOT NULL,
    description text,
    images jsonb,
    status character varying(50) DEFAULT 'requested'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT return_requests_status_check CHECK (((status)::text = ANY ((ARRAY['requested'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.return_requests OWNER TO postgres;

--
-- Name: seller_bank_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_bank_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    bank_name character varying(255) NOT NULL,
    account_no character varying(20) NOT NULL,
    account_holder_name character varying(255) NOT NULL,
    account_type character varying(20),
    ifsc_code character varying(11) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT seller_bank_details_account_type_check CHECK (((account_type)::text = ANY ((ARRAY['savings'::character varying, 'current'::character varying])::text[])))
);


ALTER TABLE public.seller_bank_details OWNER TO postgres;

--
-- Name: seller_business_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_business_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    business_name character varying(255) NOT NULL,
    business_description text,
    business_type character varying(100),
    gst_no character varying(15),
    pan_no character varying(10),
    address text NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    pincode character varying(6) NOT NULL,
    coordinates public.geography(Point,4326),
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.seller_business_details OWNER TO postgres;

--
-- Name: seller_earnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_earnings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    seller_id uuid,
    order_id uuid,
    order_number character varying(50) NOT NULL,
    gross_amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) NOT NULL,
    payment_gateway_fee numeric(10,2) NOT NULL,
    gst_amount numeric(10,2) NOT NULL,
    net_amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payout_date timestamp without time zone,
    payout_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT seller_earnings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processed'::character varying, 'paid'::character varying])::text[])))
);


ALTER TABLE public.seller_earnings OWNER TO postgres;

--
-- Name: seller_payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_payouts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    seller_id uuid,
    amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    bank_account_id uuid,
    transaction_id character varying(255),
    earnings_count integer DEFAULT 0,
    payout_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT seller_payouts_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.seller_payouts OWNER TO postgres;

--
-- Name: seller_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    dob date,
    gender character varying(20),
    personal_address text,
    personal_pan_no character varying(10),
    emergency_contact jsonb,
    profile_image text,
    preferences jsonb DEFAULT '{"theme": "light", "language": "en", "notifications": true}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT seller_profiles_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.seller_profiles OWNER TO postgres;

--
-- Name: shipping_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_addresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name character varying(255) NOT NULL,
    phone character varying(10) NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    pincode character varying(6) NOT NULL,
    country character varying(100) DEFAULT 'India'::character varying,
    landmark text,
    label character varying(50),
    coordinates public.geography(Point,4326),
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shipping_addresses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_name character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    mobile character varying(10),
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    user_role character varying(20) NOT NULL,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    google_id character varying(255),
    CONSTRAINT users_user_role_check CHECK (((user_role)::text = ANY ((ARRAY['customer'::character varying, 'seller'::character varying, 'delivery_partner'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    product_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, user_id, product_id, quantity, price_at_add, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, parent_id, description, image_url, is_active, created_at, updated_at) FROM stdin;
a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d	Electronics	\N	Electronic devices and accessories	\N	t	2026-03-09 14:03:48.627381	2026-03-09 14:03:48.627381
b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e	Fashion	\N	Clothing and accessories	\N	t	2026-03-09 14:03:48.627381	2026-03-09 14:03:48.627381
e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b	Smartphones	a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d	Mobile phones	\N	t	2026-03-09 14:03:48.629278	2026-03-09 14:03:48.629278
f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c	Laptops	a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d	Laptop computers	\N	t	2026-03-09 14:03:48.629278	2026-03-09 14:03:48.629278
a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d	Headphones	a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d	Audio devices	\N	t	2026-03-09 14:03:48.629278	2026-03-09 14:03:48.629278
b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e	Men	b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e	Men's clothing	\N	t	2026-03-09 14:03:48.631151	2026-03-09 14:03:48.631151
c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f	Women	b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e	Women's clothing	\N	t	2026-03-09 14:03:48.631151	2026-03-09 14:03:48.631151
d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a	Kids	b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e	Kids clothing	\N	t	2026-03-09 14:03:48.631151	2026-03-09 14:03:48.631151
e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b	Shirts	b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e	Men's shirts	\N	t	2026-03-09 14:03:48.631786	2026-03-09 14:03:48.631786
f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c	T-Shirts	b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e	Men's t-shirts	\N	t	2026-03-09 14:03:48.631786	2026-03-09 14:03:48.631786
a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d	Jeans	b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e	Men's jeans	\N	t	2026-03-09 14:03:48.631786	2026-03-09 14:03:48.631786
47edc220-656f-4605-8ccb-b256206f1845	Books	\N	\N	\N	t	2026-03-10 02:21:44.463252	2026-03-10 02:21:44.463252
0a43215f-8cc5-4ba9-b685-535037f59286	Home & Kitchen	\N	\N	\N	t	2026-03-10 02:21:44.467392	2026-03-10 02:21:44.467392
8f82c5c8-a071-409b-ad8b-898b6c8ffd08	Sports	\N	\N	\N	t	2026-03-10 02:21:44.468809	2026-03-10 02:21:44.468809
5ad7dced-3dab-4f4b-9765-3984bf428184	Beauty & Personal Care	\N	\N	\N	t	2026-03-10 03:44:28.300944	2026-03-10 03:44:28.300944
1ab78ac7-76f3-4b46-a06f-2dbb28e8b0cb	Toys & Games	\N	\N	\N	t	2026-03-10 03:44:28.3082	2026-03-10 03:44:28.3082
9873eca3-99c8-4e56-93d9-0515a8e76aaf	Baby Products	\N	\N	\N	t	2026-03-10 03:44:28.309204	2026-03-10 03:44:28.309204
cbc4f862-aac2-45aa-b714-b3152536d004	Automotive	\N	\N	\N	t	2026-03-10 03:44:28.310087	2026-03-10 03:44:28.310087
64dc3eaf-f6ca-4c04-85ab-fe280906f96d	Grocery & Gourmet Foods	\N	\N	\N	t	2026-03-10 03:44:28.311102	2026-03-10 03:44:28.311102
0b8362c1-a8f4-43a0-8260-4d5a106789c7	Health & Wellness	\N	\N	\N	t	2026-03-10 03:44:28.311764	2026-03-10 03:44:28.311764
a5b61a94-9f10-4528-9230-b43f64fb45fb	Pet Supplies	\N	\N	\N	t	2026-03-10 03:44:28.312428	2026-03-10 03:44:28.312428
262a95f3-1506-42e8-a1ff-7cf401ea7823	Office Products	\N	\N	\N	t	2026-03-10 03:44:28.313863	2026-03-10 03:44:28.313863
d67bf882-c2dc-4fd3-87d5-c8ff8a0ffc3f	Garden & Outdoor	\N	\N	\N	t	2026-03-10 03:44:28.314908	2026-03-10 03:44:28.314908
ee3238c0-58dc-4419-8829-cd5ed3feb02f	Tools & Hardware	\N	\N	\N	t	2026-03-10 03:44:28.315719	2026-03-10 03:44:28.315719
7759c810-988b-4f0b-99dd-853d1a05e25f	Music & Instruments	\N	\N	\N	t	2026-03-10 03:44:28.316307	2026-03-10 03:44:28.316307
43412cdb-8e0c-4756-8824-e5c2206bdccf	Movies & Entertainment	\N	\N	\N	t	2026-03-10 03:44:28.316786	2026-03-10 03:44:28.316786
36fc8c55-da18-45ad-a3f7-edbf7c06a4f0	Video Games	\N	\N	\N	t	2026-03-10 03:44:28.317257	2026-03-10 03:44:28.317257
e45be2e6-ec77-4d04-b816-c02cf2a028f0	Jewelry & Accessories	\N	\N	\N	t	2026-03-10 03:44:28.317823	2026-03-10 03:44:28.317823
7b5e7565-0542-44cf-825f-1968901b58da	Bags & Luggage	\N	\N	\N	t	2026-03-10 03:44:28.318296	2026-03-10 03:44:28.318296
53a33421-0b2f-459c-9f22-a1cafdd324cd	Watches	\N	\N	\N	t	2026-03-10 03:44:28.31901	2026-03-10 03:44:28.31901
c2ed7e68-0579-4758-bf7a-1aaf9e5ef8d3	Shoes	\N	\N	\N	t	2026-03-10 03:44:28.319662	2026-03-10 03:44:28.319662
80795517-dfd2-44ee-96f0-92bfdc488b0d	Furniture	\N	\N	\N	t	2026-03-10 03:44:28.320611	2026-03-10 03:44:28.320611
ca080487-c7e2-41fd-a0d3-e8587a198c10	Art & Crafts	\N	\N	\N	t	2026-03-10 03:44:28.321357	2026-03-10 03:44:28.321357
8a79198a-390f-4b25-9a3b-9475a1b11826	Industrial & Scientific	\N	\N	\N	t	2026-03-10 03:44:28.322041	2026-03-10 03:44:28.322041
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, usage_limit, usage_count, is_active, created_at, updated_at) FROM stdin;
1dca5e62-78c8-43ce-a957-a1b89dc19072	WELCOME10	Welcome discount for new users	percentage	10.00	500.00	200.00	2025-01-01 00:00:00	2025-12-31 00:00:00	1000	0	t	2026-03-09 14:03:48.678057	2026-03-09 14:03:48.678057
\.


--
-- Data for Name: customer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_profiles (id, user_id, dob, gender, profile_image, account_type, preferences, created_at, updated_at) FROM stdin;
a968bc17-6164-4349-9e38-59ffb1869b30	11111111-1111-1111-1111-111111111111	1990-05-15	male	https://cloudinary.com/sample_profile.jpg	standard	{"theme": "light", "language": "en", "notifications": true}	2026-03-09 14:03:48.63655	2026-03-09 14:03:48.63655
13eded88-f390-4d96-8423-259b29513632	d1096d64-9303-4f08-8c36-bbd8500e410f	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocKoV_RaLreDcmCkLOR6g2vJHtv8ym41MgkpOAZOCtJcW-WnPbLo=s96-c	standard	{"theme": "light", "language": "en", "notifications": true}	2026-03-09 16:01:35.444033	2026-03-09 16:01:35.444033
\.


--
-- Data for Name: delivery_issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_issues (id, order_id, partner_id, issue_type, description, images, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_partner_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_partner_details (id, user_id, vehicle_type, vehicle_number, is_verified, created_at, updated_at) FROM stdin;
741eee7e-1294-40d4-b1a8-95b241f7861c	33333333-3333-3333-3333-333333333333	Motorcycle	MH02AB1234	t	2026-03-09 14:03:48.657015	2026-03-09 14:03:48.657015
\.


--
-- Data for Name: delivery_partner_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_partner_documents (id, user_id, document_type, document_number, document_image, expiry_date, is_verified, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_partner_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_partner_earnings (id, partner_id, order_id, delivery_fee, tips, incentives, total_earning, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_partner_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_partner_profiles (id, user_id, dob, gender, personal_address, aadhar_number, driving_license, emergency_contact, bank_account_number, ifsc_code, profile_image, preferences, is_online, current_location, created_at, updated_at) FROM stdin;
be5e97ba-4f74-4005-84ca-4742c921ebd5	33333333-3333-3333-3333-333333333333	1992-03-10	male	456 Park Road, Mumbai	123456789012	MH0120190012345	\N	98765432109876	ICIC0001234	\N	{"theme": "light", "language": "en", "notifications": true}	t	0101000020E6100000C0EC9E3C2C385240FA7E6ABC74133340	2026-03-09 14:03:48.65406	2026-03-09 14:03:48.65406
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, data, is_read, created_at) FROM stdin;
e7faf8c0-5254-4402-8d16-565e5a09ee76	11111111-1111-1111-1111-111111111111	Order Confirmed	Your order #ORD-2025-001234 has been confirmed	order	\N	f	2026-03-09 14:03:48.696537
9e4f8380-9983-451d-8e9b-541b05d94538	22222222-2222-2222-2222-222222222222	New Order	You have received a new order #ORD-2025-001234	order	\N	f	2026-03-09 14:03:48.696537
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, price, image, created_at) FROM stdin;
5a905e26-239d-497e-ab4f-de2a41f77b0c	57aa87fe-f0d0-4354-9c87-2aef4a31b46e	\N	Product 1	1	433.00	https://via.placeholder.com/150	2026-03-10 01:17:02.356996
5c3af80e-0479-4b81-b528-0edb479cdb56	57aa87fe-f0d0-4354-9c87-2aef4a31b46e	\N	Product 2	1	433.00	https://via.placeholder.com/150	2026-03-10 01:17:02.360448
73657b7b-b668-4bbd-b928-93fca9ca20f0	57aa87fe-f0d0-4354-9c87-2aef4a31b46e	\N	Product 3	1	433.00	https://via.placeholder.com/150	2026-03-10 01:17:02.361876
577a833a-28b4-475b-8f8d-e523c0e50586	240fb148-943e-4f4e-b493-c1795b01d72b	\N	Product 1	1	833.00	https://via.placeholder.com/150	2026-03-10 01:17:02.370033
263cffeb-6ea3-4d77-9064-c260940dc8f5	240fb148-943e-4f4e-b493-c1795b01d72b	\N	Product 2	1	833.00	https://via.placeholder.com/150	2026-03-10 01:17:02.371843
4e17dfac-3e9a-447d-8c1f-47484813429d	240fb148-943e-4f4e-b493-c1795b01d72b	\N	Product 3	1	833.00	https://via.placeholder.com/150	2026-03-10 01:17:02.373046
9e973973-988e-4c47-8e82-b7095b3cf7cd	83b196b7-8d29-4594-bdb8-09b2af441727	\N	Product 1	1	449.50	https://via.placeholder.com/150	2026-03-10 01:17:02.377645
989d904f-a949-4988-8c3b-0009c9062649	83b196b7-8d29-4594-bdb8-09b2af441727	\N	Product 2	1	449.50	https://via.placeholder.com/150	2026-03-10 01:17:02.378933
0b96c99c-3e93-4176-a307-f9652a9b4aa8	82659e4b-398c-42fb-aaa0-1e16f8c9beb9	\N	Product 1	1	799.50	https://via.placeholder.com/150	2026-03-10 01:17:02.382449
d934d1f4-1913-4352-896d-40c94cf70ee6	82659e4b-398c-42fb-aaa0-1e16f8c9beb9	\N	Product 2	1	799.50	https://via.placeholder.com/150	2026-03-10 01:17:02.383864
2b393b1d-d67f-4547-b492-517ce59053fe	d726e8c5-5782-47ab-aab2-e4a867eb5368	\N	Product 1	1	1099.67	https://via.placeholder.com/150	2026-03-10 01:17:02.388041
22803d47-c1ca-4a60-9d43-116548c36c44	d726e8c5-5782-47ab-aab2-e4a867eb5368	\N	Product 2	1	1099.67	https://via.placeholder.com/150	2026-03-10 01:17:02.38913
69da08d3-26bc-4fa3-8011-67fa740719cc	d726e8c5-5782-47ab-aab2-e4a867eb5368	\N	Product 3	1	1099.67	https://via.placeholder.com/150	2026-03-10 01:17:02.39028
716c41b2-3be1-4fa6-b0d4-fbd4e60f3bfc	a1aada95-0d6e-4386-8ab6-7ef599f62e40	\N	Product 1	1	399.50	https://via.placeholder.com/150	2026-03-10 01:17:02.395097
9a660e0e-8668-4f2e-b01c-6da54a977359	a1aada95-0d6e-4386-8ab6-7ef599f62e40	\N	Product 2	1	399.50	https://via.placeholder.com/150	2026-03-10 01:17:02.396119
4cc51016-9873-467c-b55d-b292c9fe997a	a1741718-648e-4bc7-880f-fe52a6fa7a1e	\N	Product 1	1	949.50	https://via.placeholder.com/150	2026-03-10 01:17:02.400801
e332fbed-9d9b-4bf2-97e9-d036305210e8	a1741718-648e-4bc7-880f-fe52a6fa7a1e	\N	Product 2	1	949.50	https://via.placeholder.com/150	2026-03-10 01:17:02.40201
c4a55310-cb5e-498d-90cb-c58c2a1d536e	71e6f063-1fdb-49c1-aea9-53ef01660829	\N	Product 1	1	2299.50	https://via.placeholder.com/150	2026-03-10 01:17:02.406557
8ed08346-45bc-4728-89f3-04436f4537ee	71e6f063-1fdb-49c1-aea9-53ef01660829	\N	Product 2	1	2299.50	https://via.placeholder.com/150	2026-03-10 01:17:02.407619
6222de13-c1b9-4632-8868-3f4d29d858c6	a141594b-b419-4406-866e-87a731f749d8	\N	Samsung Galaxy Buds	1	1249.50	https://via.placeholder.com/150	2026-03-10 01:22:07.740059
a519c108-83bc-4edf-a9d1-2342b3149660	a141594b-b419-4406-866e-87a731f749d8	\N	Phone Case	1	1249.50	https://via.placeholder.com/150	2026-03-10 01:22:07.743308
47f46d5d-36e6-4570-8d71-3d3f838968a0	1ab5a653-3aae-4764-8ca5-f41401aa62cc	\N	Wireless Mouse	1	649.50	https://via.placeholder.com/150	2026-03-10 01:22:07.748328
cb61f790-2c3e-42fb-a39d-3322c46ba1ab	1ab5a653-3aae-4764-8ca5-f41401aa62cc	\N	Keyboard	1	649.50	https://via.placeholder.com/150	2026-03-10 01:22:07.749516
4db5457b-fb33-4f71-883d-cc2edf117c63	4bd16dac-f713-490d-84ff-be6aa598428d	\N	Smart Watch	1	1999.50	https://via.placeholder.com/150	2026-03-10 01:22:07.753576
e97e0716-4a8a-431b-be3a-13e68a07f869	4bd16dac-f713-490d-84ff-be6aa598428d	\N	Fitness Band	1	1999.50	https://via.placeholder.com/150	2026-03-10 01:22:07.754741
d63cc52a-6313-42d0-ab1b-09cbd8382d49	ad713a4a-f8b4-48ef-b1af-d3c2675801a6	\N	T-Shirt	1	449.50	https://via.placeholder.com/150	2026-03-10 01:22:07.758147
33339b34-c71c-41eb-b06e-18736cf87125	ad713a4a-f8b4-48ef-b1af-d3c2675801a6	\N	Jeans	1	449.50	https://via.placeholder.com/150	2026-03-10 01:22:07.759052
01be95f5-e2ac-4741-9881-2ffb7b169980	c98fe2e5-0ea0-4829-ae9d-0c9089e584ad	\N	Laptop Bag	1	1833.00	https://via.placeholder.com/150	2026-03-10 01:22:07.763827
3ff0c9cb-1413-45b9-b57e-e2bf20ca6667	c98fe2e5-0ea0-4829-ae9d-0c9089e584ad	\N	USB Hub	1	1833.00	https://via.placeholder.com/150	2026-03-10 01:22:07.764803
e5a2220c-8460-4934-a865-01d4bd7e69ac	c98fe2e5-0ea0-4829-ae9d-0c9089e584ad	\N	Mouse Pad	1	1833.00	https://via.placeholder.com/150	2026-03-10 01:22:07.765661
351aaff4-182f-4cbf-88d4-967884ca6df4	62dba496-cbc0-4c44-b267-d46b1488eba5	\N	Headphones	1	899.50	https://via.placeholder.com/150	2026-03-10 01:22:07.770124
6713fbcf-14f9-491c-ae83-f535cdf08397	62dba496-cbc0-4c44-b267-d46b1488eba5	\N	Cable	1	899.50	https://via.placeholder.com/150	2026-03-10 01:22:07.771172
1ad2d51c-8f3e-408b-9aaf-39c5187c2e5f	37bfe67c-04a8-4497-8db7-0556e3e0f412	\N	Water Bottle	1	499.50	https://via.placeholder.com/150	2026-03-10 01:22:07.774793
527d8541-f903-49d3-8ab9-f4e201c2c06d	37bfe67c-04a8-4497-8db7-0556e3e0f412	\N	Gym Bag	1	499.50	https://via.placeholder.com/150	2026-03-10 01:22:07.775947
e075944b-5896-4b88-9b32-57880eaf46a6	296c0f0c-40cc-48f7-88ca-fd22c71bbffe	\N	Bluetooth Speaker	1	2149.50	https://via.placeholder.com/150	2026-03-10 01:22:07.779734
c5638590-6430-42fe-a185-9be2a8616178	296c0f0c-40cc-48f7-88ca-fd22c71bbffe	\N	Power Bank	1	2149.50	https://via.placeholder.com/150	2026-03-10 01:22:07.780986
f304ca2e-0034-4423-9bc4-f3fa397b056f	6367fe40-8da6-4e6d-9efd-f453dc820fab	\N	Shoes	1	799.50	https://via.placeholder.com/150	2026-03-10 01:22:07.784297
f0daeda9-f833-4f01-9cf1-0483c84c0df8	6367fe40-8da6-4e6d-9efd-f453dc820fab	\N	Socks	1	799.50	https://via.placeholder.com/150	2026-03-10 01:22:07.785131
8d70c063-d335-4b65-9dbc-2ada78856f9e	28cc48ac-ffe7-458d-9dcd-1d7b7ea2aeb1	\N	Tablet Stand	1	1499.50	https://via.placeholder.com/150	2026-03-10 01:22:07.788717
1637b23a-8b87-4fa7-b051-357816e28379	28cc48ac-ffe7-458d-9dcd-1d7b7ea2aeb1	\N	Stylus Pen	1	1499.50	https://via.placeholder.com/150	2026-03-10 01:22:07.789629
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_history (id, order_id, status, note, created_at) FROM stdin;
314249f3-6145-468c-9ab1-30790633898c	57aa87fe-f0d0-4354-9c87-2aef4a31b46e	delivered	Order delivered	2026-02-23 01:17:02.334
295a6bf8-e547-4672-a948-611a7945e5d7	240fb148-943e-4f4e-b493-c1795b01d72b	shipped	Order shipped	2026-03-07 01:17:02.366
88173cb0-2950-4bc3-9679-90513e57ae69	83b196b7-8d29-4594-bdb8-09b2af441727	processing	Order processing	2026-03-09 01:17:02.374
d4ad6da4-dbf2-47db-ae3d-e346be9d7fad	82659e4b-398c-42fb-aaa0-1e16f8c9beb9	pending	Order pending	2026-03-10 01:17:02.38
eb37d517-abcb-4855-86e0-0507bcb69a3a	d726e8c5-5782-47ab-aab2-e4a867eb5368	delivered	Order delivered	2026-02-13 01:17:02.385
b971ebc8-5322-4387-958e-0468d38d2e30	a1aada95-0d6e-4386-8ab6-7ef599f62e40	cancelled	Order cancelled	2026-02-28 01:17:02.392
a6cdd7b0-2704-41df-b8e3-cd85830eae93	a1741718-648e-4bc7-880f-fe52a6fa7a1e	delivered	Order delivered	2026-02-18 01:17:02.398
5acf8fd2-affb-43cd-a8cd-91011df74501	71e6f063-1fdb-49c1-aea9-53ef01660829	confirmed	Order confirmed	2026-03-08 01:17:02.403
40b8092e-586e-4a91-a148-5455303b6497	a141594b-b419-4406-866e-87a731f749d8	delivered	Order delivered	2026-02-18 01:22:07.731
d490ef29-5fbd-4eea-adfe-429c87e00307	1ab5a653-3aae-4764-8ca5-f41401aa62cc	shipped	Order shipped	2026-03-08 01:22:07.745
9bd051ba-aa6c-4235-aefa-5eb9b0d9841c	4bd16dac-f713-490d-84ff-be6aa598428d	processing	Order processing	2026-03-09 01:22:07.75
854f442f-ebfb-4a50-86f0-5fbec1cd6c42	ad713a4a-f8b4-48ef-b1af-d3c2675801a6	pending	Order pending	2026-03-10 01:22:07.755
479c850d-1664-4693-81ee-a0cc3e664e6b	c98fe2e5-0ea0-4829-ae9d-0c9089e584ad	delivered	Order delivered	2026-02-23 01:22:07.76
0b564c64-5d4e-4d68-a026-719e6895b3a3	62dba496-cbc0-4c44-b267-d46b1488eba5	confirmed	Order confirmed	2026-03-09 01:22:07.767
3cfd4472-2f72-4eb2-b197-b434dbfe86e9	37bfe67c-04a8-4497-8db7-0556e3e0f412	delivered	Order delivered	2026-02-13 01:22:07.772
3ba7333f-80bf-457e-bb7e-c24ea0f3c4a3	296c0f0c-40cc-48f7-88ca-fd22c71bbffe	shipped	Order shipped	2026-03-07 01:22:07.777
181c6b8e-b215-4067-ba58-5d1422e60850	6367fe40-8da6-4e6d-9efd-f453dc820fab	delivered	Order delivered	2026-02-28 01:22:07.782
ead145ac-693d-499b-9958-526fccfbf072	28cc48ac-ffe7-458d-9dcd-1d7b7ea2aeb1	processing	Order processing	2026-03-10 01:22:07.785
2d2ba8d7-cdc7-4c65-8eca-5331290b5d76	ad713a4a-f8b4-48ef-b1af-d3c2675801a6	confirmed	\N	2026-03-10 16:55:24.400259
e372328d-ec89-4e85-ae41-a50f4b006ec6	ad713a4a-f8b4-48ef-b1af-d3c2675801a6	processing	\N	2026-03-10 16:55:27.595057
90c14361-3210-440f-828e-db221ea64300	62dba496-cbc0-4c44-b267-d46b1488eba5	processing	\N	2026-03-11 00:35:02.589835
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, user_id, seller_id, status, payment_status, total_amount, shipping_amount, tax_amount, final_amount, shipping_address, payment_method, payment_id, delivery_boy_id, delivery_status, delivery_fee, partner_earning, distance, estimated_time, otp, estimated_delivery, tracking_number, notes, created_at, updated_at) FROM stdin;
57aa87fe-f0d0-4354-9c87-2aef4a31b46e	ORD17730856223340	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	delivered	paid	1299.00	50.00	233.82	1582.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	razorpay	pay_17730856223340	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-23 01:17:02.334	2026-02-23 01:17:02.334
240fb148-943e-4f4e-b493-c1795b01d72b	ORD17730856223661	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	shipped	paid	2499.00	0.00	449.82	2948.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	razorpay	pay_17730856223661	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 01:17:02.366	2026-03-07 01:17:02.366
83b196b7-8d29-4594-bdb8-09b2af441727	ORD17730856223742	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	processing	paid	899.00	50.00	161.82	1110.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	cod	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-09 01:17:02.374	2026-03-09 01:17:02.374
82659e4b-398c-42fb-aaa0-1e16f8c9beb9	ORD17730856223803	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	pending	pending	1599.00	50.00	287.82	1936.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	cod	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-10 01:17:02.38	2026-03-10 01:17:02.38
d726e8c5-5782-47ab-aab2-e4a867eb5368	ORD17730856223854	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	delivered	paid	3299.00	0.00	593.82	3892.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	razorpay	pay_17730856223854	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-13 01:17:02.385	2026-02-13 01:17:02.385
a1aada95-0d6e-4386-8ab6-7ef599f62e40	ORD17730856223925	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	cancelled	refunded	799.00	50.00	143.82	992.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	razorpay	pay_17730856223925	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-28 01:17:02.392	2026-02-28 01:17:02.392
a1741718-648e-4bc7-880f-fe52a6fa7a1e	ORD17730856223986	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	delivered	paid	1899.00	50.00	341.82	2290.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	cod	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-18 01:17:02.398	2026-02-18 01:17:02.398
71e6f063-1fdb-49c1-aea9-53ef01660829	ORD17730856224037	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	confirmed	paid	4599.00	0.00	827.82	5426.82	{"city": "Mumbai", "name": "John Doe", "state": "Maharashtra", "mobile": "9876543210", "country": "India", "pincode": "400001", "address_line1": "123 Main Street", "address_line2": "Apartment 4B"}	razorpay	pay_17730856224037	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-08 01:17:02.403	2026-03-08 01:17:02.403
a141594b-b419-4406-866e-87a731f749d8	ORD17730859277310	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	delivered	paid	2499.00	0.00	449.82	2948.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277320	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-18 01:22:07.731	2026-02-18 01:22:07.731
1ab5a653-3aae-4764-8ca5-f41401aa62cc	ORD17730859277451	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	shipped	paid	1299.00	50.00	233.82	1582.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277451	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-08 01:22:07.745	2026-03-08 01:22:07.745
4bd16dac-f713-490d-84ff-be6aa598428d	ORD17730859277502	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	processing	paid	3999.00	0.00	719.82	4718.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277502	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-09 01:22:07.75	2026-03-09 01:22:07.75
c98fe2e5-0ea0-4829-ae9d-0c9089e584ad	ORD17730859277604	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	delivered	paid	5499.00	0.00	989.82	6488.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277604	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-23 01:22:07.76	2026-02-23 01:22:07.76
37bfe67c-04a8-4497-8db7-0556e3e0f412	ORD17730859277726	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	delivered	paid	999.00	50.00	179.82	1228.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	cod	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-13 01:22:07.772	2026-02-13 01:22:07.772
296c0f0c-40cc-48f7-88ca-fd22c71bbffe	ORD17730859277777	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	shipped	paid	4299.00	0.00	773.82	5072.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277777	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 01:22:07.777	2026-03-07 01:22:07.777
6367fe40-8da6-4e6d-9efd-f453dc820fab	ORD17730859277828	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	delivered	paid	1599.00	50.00	287.82	1936.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277828	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-28 01:22:07.782	2026-02-28 01:22:07.782
28cc48ac-ffe7-458d-9dcd-1d7b7ea2aeb1	ORD17730859277859	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	processing	paid	2999.00	0.00	539.82	3538.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277859	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-10 01:22:07.785	2026-03-10 01:22:07.785
ad713a4a-f8b4-48ef-b1af-d3c2675801a6	ORD17730859277553	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	processing	pending	899.00	50.00	161.82	1110.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	cod	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-10 01:22:07.755	2026-03-10 16:55:27.593987
62dba496-cbc0-4c44-b267-d46b1488eba5	ORD17730859277675	11111111-1111-1111-1111-111111111111	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	processing	paid	1799.00	50.00	323.82	2172.82	{"city": "Bangalore", "name": "John Doe", "state": "Karnataka", "mobile": "9876543210", "country": "India", "pincode": "560001", "address_line1": "123 MG Road", "address_line2": "Near Metro Station"}	razorpay	pay_17730859277675	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-09 01:22:07.767	2026-03-11 00:35:02.548329
\.


--
-- Data for Name: otp_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otp_verifications (id, mobile, email, otp, otp_type, is_verified, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, reset_token, expires_at, is_used, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, user_id, amount, currency, payment_method, gateway_payment_id, gateway_order_id, gateway_signature, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, image_url, display_order, created_at) FROM stdin;
561ffc05-c004-4245-aad0-07fb5c6ee997	4019d762-52f8-4f08-be8f-fa4cc4ad7f7a	http://localhost:9000/zpin-ecommerce/products/4019d762-52f8-4f08-be8f-fa4cc4ad7f7a/1773161781722-0-1773090954019-0-Zpin-logo.jpg	0	2026-03-10 22:26:21.72984
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (id, product_id, user_id, rating, comment, images, is_verified_purchase, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, user_id, product_name, description, category_id, deepest_category_name, category_path, price, quantity, in_stock, is_approved, approval_notes, created_at, updated_at) FROM stdin;
4019d762-52f8-4f08-be8f-fa4cc4ad7f7a	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	iphone 154	i phone 15 ,256GB , white color	e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b	Smartphones	[{"id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", "name": "Electronics"}, {"id": "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b", "name": "Smartphones"}]	50000.00	50	t	f	\N	2026-03-10 04:23:24.425447	2026-03-10 22:56:37.610585
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refunds (id, payment_id, amount, reason, gateway_refund_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: return_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_requests (id, order_id, user_id, order_item_ids, reason, description, images, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: seller_bank_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_bank_details (id, user_id, bank_name, account_no, account_holder_name, account_type, ifsc_code, is_verified, created_at, updated_at) FROM stdin;
166814eb-8bfe-421b-9806-cd12f8701378	22222222-2222-2222-2222-222222222222	HDFC Bank	12345678901234	Rahul Sharma	current	HDFC0001234	t	2026-03-09 14:03:48.651141	2026-03-09 14:03:48.651141
85514322-01ec-4803-ba01-7323feed7db3	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	State Bank of India	1234567890123456	Ayush Kumar Singh	savings	SBIN0001234	t	2026-03-10 16:15:07.301445	2026-03-11 12:22:31.796652
\.


--
-- Data for Name: seller_business_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_business_details (id, user_id, business_name, business_description, business_type, gst_no, pan_no, address, city, state, pincode, coordinates, is_verified, created_at, updated_at) FROM stdin;
79c1cdc0-0f33-4a25-ae1d-d66296302bbf	22222222-2222-2222-2222-222222222222	Sharma Electronics	Quality electronics at best prices	Retail	27ABCDE1234F1Z5	ABCDE1234F	Shop 15, Linking Road, Bandra West	Mumbai	Maharashtra	400050	0101000020E61000005BD3BCE31435524004E78C28ED0D3340	t	2026-03-09 14:03:48.644277	2026-03-09 14:03:48.644277
c6f90094-26b3-4d03-a492-7760b7e2b7f9	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	panwadi jwellers	A trusted destination	Retail	GST123456789	ABCDE1254F	Shop No. 123, Main Market, Sector 1	Delhi	Delhi	110001	\N	f	2026-03-09 16:50:42.086237	2026-03-10 16:24:48.802487
\.


--
-- Data for Name: seller_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_earnings (id, seller_id, order_id, order_number, gross_amount, platform_fee, payment_gateway_fee, gst_amount, net_amount, status, payout_date, payout_id, created_at, updated_at) FROM stdin;
0b8c8144-eab1-495d-b78e-7253eb6e40d8	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	a141594b-b419-4406-866e-87a731f749d8	ORD17730859277310	2948.82	147.44	58.98	37.16	2705.25	pending	\N	\N	2026-03-10 16:35:28.401877	2026-03-10 16:35:28.401877
370e5843-901e-4c37-8946-242d94b4f498	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	1ab5a653-3aae-4764-8ca5-f41401aa62cc	ORD17730859277451	1582.82	79.14	31.66	19.94	1452.08	pending	\N	\N	2026-03-10 16:35:28.413359	2026-03-10 16:35:28.413359
6099921d-b41b-40db-86b8-14f767ada29f	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	4bd16dac-f713-490d-84ff-be6aa598428d	ORD17730859277502	4718.82	235.94	94.38	59.46	4329.05	processed	\N	\N	2026-03-10 16:35:28.41709	2026-03-10 16:35:28.41709
2c17f6b6-c205-4f60-9a1b-5d01280e8df4	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	ad713a4a-f8b4-48ef-b1af-d3c2675801a6	ORD17730859277553	1110.82	55.54	22.22	14.00	1019.07	processed	\N	\N	2026-03-10 16:35:28.420459	2026-03-10 16:35:28.420459
11bbb6bc-055d-499b-a04d-68c1a8622692	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	c98fe2e5-0ea0-4829-ae9d-0c9089e584ad	ORD17730859277604	6488.82	324.44	129.78	81.76	5952.84	processed	\N	\N	2026-03-10 16:35:28.423382	2026-03-10 16:35:28.423382
84d7df3a-d73b-44e6-b257-4525ccc58024	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	62dba496-cbc0-4c44-b267-d46b1488eba5	ORD17730859277675	2172.82	108.64	43.46	27.38	1993.35	processed	\N	\N	2026-03-10 16:35:28.425741	2026-03-10 16:35:28.425741
b17a41a0-8856-4435-b497-f13a998ec338	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	37bfe67c-04a8-4497-8db7-0556e3e0f412	ORD17730859277726	1228.82	61.44	24.58	15.48	1127.32	pending	\N	\N	2026-03-10 16:35:28.428163	2026-03-10 16:35:28.428163
d5bb25d5-d850-49d3-989c-de140a04897c	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	296c0f0c-40cc-48f7-88ca-fd22c71bbffe	ORD17730859277777	5072.82	253.64	101.46	63.92	4653.81	pending	\N	\N	2026-03-10 16:35:28.431061	2026-03-10 16:35:28.431061
29d22f58-4aa7-427f-b3ea-b7e219eaac40	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	6367fe40-8da6-4e6d-9efd-f453dc820fab	ORD17730859277828	1936.82	96.84	38.74	24.40	1776.84	processed	\N	\N	2026-03-10 16:35:28.432839	2026-03-10 16:35:28.432839
965f7e76-4e46-4c82-948b-c444fd2da473	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	28cc48ac-ffe7-458d-9dcd-1d7b7ea2aeb1	ORD17730859277859	3538.82	176.94	70.78	44.59	3246.51	processed	\N	\N	2026-03-10 16:35:28.435206	2026-03-10 16:35:28.435206
\.


--
-- Data for Name: seller_payouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_payouts (id, seller_id, amount, status, bank_account_id, transaction_id, earnings_count, payout_date, created_at, updated_at) FROM stdin;
c32af28c-d100-4d83-80dd-c65a20ad86e6	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	9938.46	pending	85514322-01ec-4803-ba01-7323feed7db3	\N	0	\N	2026-03-10 16:39:47.761517	2026-03-10 16:39:47.761517
657e349f-b851-43f6-b516-69ba42d29ccc	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	9938.46	pending	85514322-01ec-4803-ba01-7323feed7db3	\N	0	\N	2026-03-10 16:41:48.263236	2026-03-10 16:41:48.263236
b7b49a51-3c95-4a85-a383-633398c6340c	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	9938.46	pending	85514322-01ec-4803-ba01-7323feed7db3	\N	0	\N	2026-03-10 16:41:53.240852	2026-03-10 16:41:53.240852
fc39fe4c-d3f1-4251-95bc-b3c6e7d8568a	87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	9938.46	pending	85514322-01ec-4803-ba01-7323feed7db3	\N	0	\N	2026-03-10 17:58:30.369579	2026-03-10 17:58:30.369579
\.


--
-- Data for Name: seller_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_profiles (id, user_id, dob, gender, personal_address, personal_pan_no, emergency_contact, profile_image, preferences, created_at, updated_at) FROM stdin;
9b145bf3-9880-496a-86a5-64a089930730	22222222-2222-2222-2222-222222222222	1985-08-20	male	123 Main Street, Mumbai	ABCDE1234F	\N	\N	{"theme": "light", "language": "en", "notifications": true}	2026-03-09 14:03:48.64138	2026-03-09 14:03:48.64138
\.


--
-- Data for Name: shipping_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_addresses (id, user_id, name, phone, address_line1, address_line2, city, state, pincode, country, landmark, label, coordinates, is_default, created_at, updated_at) FROM stdin;
14759080-f476-4959-9b68-0b5cfadf1bc6	11111111-1111-1111-1111-111111111111	John Doe	9876543210	Flat 101, Building A	Andheri East	Mumbai	Maharashtra	400069	India	Near Metro Station	Home	0101000020E61000003255302AA93752405BD3BCE3141D3340	t	2026-03-09 14:03:48.659413	2026-03-09 14:03:48.659413
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, user_name, name, mobile, email, password_hash, user_role, is_verified, is_active, created_at, updated_at, google_id) FROM stdin;
11111111-1111-1111-1111-111111111111	john_doe	John Doe	9876543210	john@example.com	$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX	customer	t	t	2026-03-09 14:03:48.632303	2026-03-09 14:03:48.632303	\N
22222222-2222-2222-2222-222222222222	seller_shop	Rahul Sharma	9876543211	rahul@example.com	$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX	seller	t	t	2026-03-09 14:03:48.635679	2026-03-09 14:03:48.635679	\N
33333333-3333-3333-3333-333333333333	delivery_raj	Raj Kumar	9876543212	raj@example.com	$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX	delivery_partner	t	t	2026-03-09 14:03:48.636173	2026-03-09 14:03:48.636173	\N
d1096d64-9303-4f08-8c36-bbd8500e410f	ayushkumarsingh8596_1773052295432	Ayush Kumar singh		ayushkumarsingh8596@gmail.com	\N	customer	t	t	2026-03-09 16:01:35.433762	2026-03-09 16:01:35.433762	108865197769471768804
6886fe3d-574b-4b5c-846a-f933dc193088	sarah_williams	Sarah Williams	9876543213	sarah.williams@example.com	$2b$10$JSGI6Usw.M9Y1E0Od3lyz.WmPoyHoD/9VQ3zCeqXorP5JVXUTqJem	customer	t	t	2026-03-10 15:26:02.200489	2026-03-10 15:26:02.200489	\N
8a08e8f3-4a17-49a4-9bd6-3e2332752e76	david_brown	David Brown	9876543214	david.brown@example.com	$2b$10$p9CZ136UmR7GbsL8AMk9AOIecbiXaPaZukt2fqbT5kXSqap9pE0Ry	customer	t	t	2026-03-10 15:26:02.279527	2026-03-10 15:26:02.279527	\N
87bc0bd7-9dd3-4eb8-b6a3-2655d7930938	ayush0001	ayush 	9350408533	ayushkumarsingh8595@gmail.com	$2b$10$8LkAs1Pt2eR5p9knclj2aeIdxJzTLAek2qYzPkXLG8CGbjYxgAA4e	seller	t	t	2026-03-09 16:45:52.339194	2026-03-10 15:36:36.534856	116057458621050229493
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customer_profiles customer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_pkey PRIMARY KEY (id);


--
-- Name: customer_profiles customer_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_user_id_key UNIQUE (user_id);


--
-- Name: delivery_issues delivery_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_issues
    ADD CONSTRAINT delivery_issues_pkey PRIMARY KEY (id);


--
-- Name: delivery_partner_details delivery_partner_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_details
    ADD CONSTRAINT delivery_partner_details_pkey PRIMARY KEY (id);


--
-- Name: delivery_partner_details delivery_partner_details_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_details
    ADD CONSTRAINT delivery_partner_details_user_id_key UNIQUE (user_id);


--
-- Name: delivery_partner_documents delivery_partner_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_documents
    ADD CONSTRAINT delivery_partner_documents_pkey PRIMARY KEY (id);


--
-- Name: delivery_partner_earnings delivery_partner_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_earnings
    ADD CONSTRAINT delivery_partner_earnings_pkey PRIMARY KEY (id);


--
-- Name: delivery_partner_profiles delivery_partner_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_profiles
    ADD CONSTRAINT delivery_partner_profiles_pkey PRIMARY KEY (id);


--
-- Name: delivery_partner_profiles delivery_partner_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_profiles
    ADD CONSTRAINT delivery_partner_profiles_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: otp_verifications otp_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: return_requests return_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_pkey PRIMARY KEY (id);


--
-- Name: seller_bank_details seller_bank_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_bank_details
    ADD CONSTRAINT seller_bank_details_pkey PRIMARY KEY (id);


--
-- Name: seller_bank_details seller_bank_details_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_bank_details
    ADD CONSTRAINT seller_bank_details_user_id_key UNIQUE (user_id);


--
-- Name: seller_business_details seller_business_details_gst_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_business_details
    ADD CONSTRAINT seller_business_details_gst_no_key UNIQUE (gst_no);


--
-- Name: seller_business_details seller_business_details_pan_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_business_details
    ADD CONSTRAINT seller_business_details_pan_no_key UNIQUE (pan_no);


--
-- Name: seller_business_details seller_business_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_business_details
    ADD CONSTRAINT seller_business_details_pkey PRIMARY KEY (id);


--
-- Name: seller_business_details seller_business_details_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_business_details
    ADD CONSTRAINT seller_business_details_user_id_key UNIQUE (user_id);


--
-- Name: seller_earnings seller_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_earnings
    ADD CONSTRAINT seller_earnings_pkey PRIMARY KEY (id);


--
-- Name: seller_payouts seller_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_payouts
    ADD CONSTRAINT seller_payouts_pkey PRIMARY KEY (id);


--
-- Name: seller_profiles seller_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_pkey PRIMARY KEY (id);


--
-- Name: seller_profiles seller_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_user_id_key UNIQUE (user_id);


--
-- Name: shipping_addresses shipping_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_mobile_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_mobile_key UNIQUE (mobile);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_name_key UNIQUE (user_name);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: idx_cart_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_delivery_earnings_partner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_earnings_partner_id ON public.delivery_partner_earnings USING btree (partner_id);


--
-- Name: idx_delivery_partner_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_partner_location ON public.delivery_partner_profiles USING gist (current_location);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_delivery_boy_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_delivery_boy_id ON public.orders USING btree (delivery_boy_id);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_seller_id ON public.orders USING btree (seller_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_otp_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_otp_expires_at ON public.otp_verifications USING btree (expires_at);


--
-- Name: idx_otp_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_otp_mobile ON public.otp_verifications USING btree (mobile);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at);


--
-- Name: idx_products_in_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_in_stock ON public.products USING btree (in_stock);


--
-- Name: idx_products_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_user_id ON public.products USING btree (user_id);


--
-- Name: idx_reviews_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_product_id ON public.product_reviews USING btree (product_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user_id ON public.product_reviews USING btree (user_id);


--
-- Name: idx_seller_business_coordinates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seller_business_coordinates ON public.seller_business_details USING gist (coordinates);


--
-- Name: idx_seller_earnings_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seller_earnings_seller_id ON public.seller_earnings USING btree (seller_id);


--
-- Name: idx_seller_earnings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seller_earnings_status ON public.seller_earnings USING btree (status);


--
-- Name: idx_shipping_address_coordinates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipping_address_coordinates ON public.shipping_addresses USING gist (coordinates);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: idx_users_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_mobile ON public.users USING btree (mobile);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (user_role);


--
-- Name: idx_wishlist_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlist_user_id ON public.wishlists USING btree (user_id);


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customer_profiles update_customer_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: delivery_partner_details update_delivery_partner_details_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_delivery_partner_details_updated_at BEFORE UPDATE ON public.delivery_partner_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: delivery_partner_earnings update_delivery_partner_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_delivery_partner_earnings_updated_at BEFORE UPDATE ON public.delivery_partner_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: delivery_partner_profiles update_delivery_partner_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_delivery_partner_profiles_updated_at BEFORE UPDATE ON public.delivery_partner_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seller_bank_details update_seller_bank_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_seller_bank_updated_at BEFORE UPDATE ON public.seller_bank_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seller_business_details update_seller_business_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_seller_business_updated_at BEFORE UPDATE ON public.seller_business_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seller_earnings update_seller_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_seller_earnings_updated_at BEFORE UPDATE ON public.seller_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seller_payouts update_seller_payouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_seller_payouts_updated_at BEFORE UPDATE ON public.seller_payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seller_profiles update_seller_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON public.seller_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shipping_addresses update_shipping_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON public.shipping_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: customer_profiles customer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: delivery_issues delivery_issues_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_issues
    ADD CONSTRAINT delivery_issues_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: delivery_issues delivery_issues_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_issues
    ADD CONSTRAINT delivery_issues_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: delivery_partner_details delivery_partner_details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_details
    ADD CONSTRAINT delivery_partner_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: delivery_partner_documents delivery_partner_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_documents
    ADD CONSTRAINT delivery_partner_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: delivery_partner_earnings delivery_partner_earnings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_earnings
    ADD CONSTRAINT delivery_partner_earnings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: delivery_partner_earnings delivery_partner_earnings_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_earnings
    ADD CONSTRAINT delivery_partner_earnings_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: delivery_partner_profiles delivery_partner_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_partner_profiles
    ADD CONSTRAINT delivery_partner_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_delivery_boy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_boy_id_fkey FOREIGN KEY (delivery_boy_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: return_requests return_requests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: return_requests return_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_bank_details seller_bank_details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_bank_details
    ADD CONSTRAINT seller_bank_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_business_details seller_business_details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_business_details
    ADD CONSTRAINT seller_business_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_earnings seller_earnings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_earnings
    ADD CONSTRAINT seller_earnings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: seller_earnings seller_earnings_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_earnings
    ADD CONSTRAINT seller_earnings_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_payouts seller_payouts_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_payouts
    ADD CONSTRAINT seller_payouts_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.seller_bank_details(id);


--
-- Name: seller_payouts seller_payouts_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_payouts
    ADD CONSTRAINT seller_payouts_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_profiles seller_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_profiles
    ADD CONSTRAINT seller_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shipping_addresses shipping_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_addresses
    ADD CONSTRAINT shipping_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Ofz0cr6sgIBOAhGcNTtwAyEqHRk5EuaZkwLSFX79jz7hQa2NBkA6S5VVh97boo4

