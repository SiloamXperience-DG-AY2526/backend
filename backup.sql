--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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
-- Name: ContactModeType; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."ContactModeType" AS ENUM (
    'email',
    'whatsapp',
    'telegram',
    'messenger',
    'phoneCall'
);


ALTER TYPE public."ContactModeType" OWNER TO lavanya;

--
-- Name: DonationFrequency; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."DonationFrequency" AS ENUM (
    'daily',
    'weekly',
    'biweekly',
    'monthly'
);


ALTER TYPE public."DonationFrequency" OWNER TO lavanya;

--
-- Name: DonationReceiptStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."DonationReceiptStatus" AS ENUM (
    'pending',
    'received',
    'cancelled'
);


ALTER TYPE public."DonationReceiptStatus" OWNER TO lavanya;

--
-- Name: DonationType; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."DonationType" AS ENUM (
    'individual',
    'fundraising',
    'corporate'
);


ALTER TYPE public."DonationType" OWNER TO lavanya;

--
-- Name: EmailCampaignStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."EmailCampaignStatus" AS ENUM (
    'draft',
    'scheduled',
    'cancelled'
);


ALTER TYPE public."EmailCampaignStatus" OWNER TO lavanya;

--
-- Name: EmailRecipientStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."EmailRecipientStatus" AS ENUM (
    'scheduled',
    'pending',
    'sent',
    'failed'
);


ALTER TYPE public."EmailRecipientStatus" OWNER TO lavanya;

--
-- Name: EmailRecipientType; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."EmailRecipientType" AS ENUM (
    'to',
    'cc',
    'bcc'
);


ALTER TYPE public."EmailRecipientType" OWNER TO lavanya;

--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'scheduled',
    'attempted',
    'cancelled'
);


ALTER TYPE public."EmailStatus" OWNER TO lavanya;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."Gender" AS ENUM (
    'male',
    'female',
    'others'
);


ALTER TYPE public."Gender" OWNER TO lavanya;

--
-- Name: InterestSlug; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."InterestSlug" AS ENUM (
    'fundraise',
    'planTrips',
    'missionTrips',
    'longTerm',
    'admin',
    'publicity',
    'teaching',
    'training',
    'agriculture',
    'building',
    'others'
);


ALTER TYPE public."InterestSlug" OWNER TO lavanya;

--
-- Name: PartnerFeedbackType; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."PartnerFeedbackType" AS ENUM (
    'supervisor',
    'peer',
    'self'
);


ALTER TYPE public."PartnerFeedbackType" OWNER TO lavanya;

--
-- Name: ProjectApprovalStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."ProjectApprovalStatus" AS ENUM (
    'pending',
    'reviewing',
    'approved',
    'rejected'
);


ALTER TYPE public."ProjectApprovalStatus" OWNER TO lavanya;

--
-- Name: ProjectFrequency; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."ProjectFrequency" AS ENUM (
    'once',
    'daily',
    'weekly',
    'monthly',
    'yearly'
);


ALTER TYPE public."ProjectFrequency" OWNER TO lavanya;

--
-- Name: ProjectOperationStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."ProjectOperationStatus" AS ENUM (
    'ongoing',
    'paused',
    'cancelled',
    'completed',
    'notStarted'
);


ALTER TYPE public."ProjectOperationStatus" OWNER TO lavanya;

--
-- Name: ProjectType; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."ProjectType" AS ENUM (
    'brick',
    'sponsor',
    'partnerLed'
);


ALTER TYPE public."ProjectType" OWNER TO lavanya;

--
-- Name: RecurringDonationStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."RecurringDonationStatus" AS ENUM (
    'active',
    'paused',
    'cancelled',
    'completed'
);


ALTER TYPE public."RecurringDonationStatus" OWNER TO lavanya;

--
-- Name: ReferrerType; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."ReferrerType" AS ENUM (
    'friend',
    'socialMedia',
    'church',
    'website',
    'event',
    'other'
);


ALTER TYPE public."ReferrerType" OWNER TO lavanya;

--
-- Name: SubmissionStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."SubmissionStatus" AS ENUM (
    'draft',
    'submitted',
    'withdrawn'
);


ALTER TYPE public."SubmissionStatus" OWNER TO lavanya;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."UserRole" AS ENUM (
    'superAdmin',
    'generalManager',
    'financeManager',
    'partner'
);


ALTER TYPE public."UserRole" OWNER TO lavanya;

--
-- Name: VolunteerProjectPositionStatus; Type: TYPE; Schema: public; Owner: lavanya
--

CREATE TYPE public."VolunteerProjectPositionStatus" AS ENUM (
    'reviewing',
    'approved',
    'rejected',
    'active',
    'inactive'
);


ALTER TYPE public."VolunteerProjectPositionStatus" OWNER TO lavanya;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO lavanya;

--
-- Name: contact_modes; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.contact_modes (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    mode public."ContactModeType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.contact_modes OWNER TO lavanya;

--
-- Name: don_project_objectives; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.don_project_objectives (
    id text NOT NULL,
    "projectId" text NOT NULL,
    objective text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.don_project_objectives OWNER TO lavanya;

--
-- Name: don_projects; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.don_projects (
    id text NOT NULL,
    "managedBy" text NOT NULL,
    title text NOT NULL,
    location text NOT NULL,
    about text NOT NULL,
    objectives text NOT NULL,
    beneficiaries text,
    "initiatorName" text,
    "organisingTeam" text,
    "targetFund" numeric(12,2),
    "brickSize" numeric(12,2),
    deadline timestamp(3) without time zone,
    type public."ProjectType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "submissionStatus" public."SubmissionStatus" DEFAULT 'draft'::public."SubmissionStatus" NOT NULL,
    "approvalStatus" public."ProjectApprovalStatus" DEFAULT 'pending'::public."ProjectApprovalStatus" NOT NULL,
    "approvalNotes" text,
    image text,
    attachments text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "operationStatus" public."ProjectOperationStatus" DEFAULT 'notStarted'::public."ProjectOperationStatus" NOT NULL
);


ALTER TABLE public.don_projects OWNER TO lavanya;

--
-- Name: donation_transactions; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.donation_transactions (
    id text NOT NULL,
    "donorId" text NOT NULL,
    "projectId" text NOT NULL,
    "recurringDonationId" text,
    type public."DonationType" NOT NULL,
    "countryOfResidence" text NOT NULL,
    "paymentMode" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount numeric(12,2) NOT NULL,
    receipt text,
    "isThankYouSent" boolean DEFAULT false NOT NULL,
    "isAdminNotified" boolean DEFAULT false NOT NULL,
    "submissionStatus" public."SubmissionStatus" NOT NULL,
    "receiptStatus" public."DonationReceiptStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.donation_transactions OWNER TO lavanya;

--
-- Name: email_audience_filters; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.email_audience_filters (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "projectId" text,
    "isActivePartner" boolean,
    gender public."Gender",
    nationality text,
    "minAge" integer,
    "maxAge" integer,
    "volunteerInterests" public."InterestSlug"[],
    "volunteerSkills" text[],
    languages text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_audience_filters OWNER TO lavanya;

--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.email_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    "senderAddress" text NOT NULL,
    subject text,
    "previewText" text,
    body text,
    status public."EmailCampaignStatus" DEFAULT 'draft'::public."EmailCampaignStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_campaigns OWNER TO lavanya;

--
-- Name: email_recipients; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.email_recipients (
    id text NOT NULL,
    "emailId" text NOT NULL,
    "recipientAddress" text NOT NULL,
    type public."EmailRecipientType" NOT NULL,
    status public."EmailRecipientStatus" NOT NULL
);


ALTER TABLE public.email_recipients OWNER TO lavanya;

--
-- Name: emails; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.emails (
    id text NOT NULL,
    "senderAddress" text NOT NULL,
    subject text NOT NULL,
    "previewText" text,
    body text NOT NULL,
    status public."EmailStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "campaignId" text,
    "isTest" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.emails OWNER TO lavanya;

--
-- Name: feedback_tags; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.feedback_tags (
    id text NOT NULL,
    "feedbackId" text NOT NULL,
    "tagId" text NOT NULL
);


ALTER TABLE public.feedback_tags OWNER TO lavanya;

--
-- Name: interests; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.interests (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "interestSlug" public."InterestSlug" NOT NULL
);


ALTER TABLE public.interests OWNER TO lavanya;

--
-- Name: languages; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.languages (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    language text NOT NULL
);


ALTER TABLE public.languages OWNER TO lavanya;

--
-- Name: partner_skills; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.partner_skills (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    skill text NOT NULL
);


ALTER TABLE public.partner_skills OWNER TO lavanya;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.partners (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tripFormId" text,
    dob timestamp(3) without time zone,
    "countryCode" text NOT NULL,
    "contactNumber" text NOT NULL,
    "emergencyCountryCode" text NOT NULL,
    "emergencyContactNumber" text NOT NULL,
    "identificationNumber" text NOT NULL,
    nationality text NOT NULL,
    occupation text NOT NULL,
    gender public."Gender" NOT NULL,
    "residentialAddress" text,
    "otherInterests" text,
    "otherReferrers" text,
    "otherContactModes" text,
    "hasVolunteerExperience" boolean DEFAULT false NOT NULL,
    "volunteerAvailability" text NOT NULL,
    "consentUpdatesCommunications" boolean NOT NULL,
    "subscribeNewsletterEvents" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partners OWNER TO lavanya;

--
-- Name: peer_feedback; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.peer_feedback (
    id text NOT NULL,
    "reviewerId" text NOT NULL,
    "revieweeId" text NOT NULL,
    "projectId" text NOT NULL,
    score integer NOT NULL,
    type public."PartnerFeedbackType" NOT NULL,
    strengths text NOT NULL,
    improvements text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.peer_feedback OWNER TO lavanya;

--
-- Name: project_positions; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.project_positions (
    id text NOT NULL,
    "projectId" text NOT NULL,
    role text NOT NULL,
    description text NOT NULL,
    "totalSlots" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.project_positions OWNER TO lavanya;

--
-- Name: project_skills; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.project_skills (
    id text NOT NULL,
    "projectPositionId" text NOT NULL,
    skill text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.project_skills OWNER TO lavanya;

--
-- Name: recurring_donations; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.recurring_donations (
    id text NOT NULL,
    "donorId" text NOT NULL,
    "projectId" text NOT NULL,
    type public."DonationType" NOT NULL,
    "paymentMode" text NOT NULL,
    "scheduledAmount" numeric(12,2) NOT NULL,
    frequency public."DonationFrequency" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "nextDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "isAutoDeducted" boolean DEFAULT false NOT NULL,
    status public."RecurringDonationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recurring_donations OWNER TO lavanya;

--
-- Name: referrers; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.referrers (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    referrer public."ReferrerType" NOT NULL
);


ALTER TABLE public.referrers OWNER TO lavanya;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "sessionDate" timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO lavanya;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tags OWNER TO lavanya;

--
-- Name: trip_forms; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.trip_forms (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "fullName" text NOT NULL,
    "passportNumber" text NOT NULL,
    "passportExpiry" timestamp(3) without time zone NOT NULL,
    "healthDeclaration" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.trip_forms OWNER TO lavanya;

--
-- Name: users; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.users (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    title text,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    role public."UserRole" DEFAULT 'partner'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.users OWNER TO lavanya;

--
-- Name: vol_project_feedback; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.vol_project_feedback (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "overallRating" integer NOT NULL,
    "managementRating" integer NOT NULL,
    "planningRating" integer NOT NULL,
    "resourcesRating" integer NOT NULL,
    "enjoyMost" text NOT NULL,
    improvements text NOT NULL,
    "otherComments" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vol_project_feedback OWNER TO lavanya;

--
-- Name: vol_project_objectives; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.vol_project_objectives (
    id text NOT NULL,
    "volunteerProjectId" text NOT NULL,
    objective text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vol_project_objectives OWNER TO lavanya;

--
-- Name: vol_projects; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.vol_projects (
    id text NOT NULL,
    "managedById" text NOT NULL,
    "approvedById" text,
    title text NOT NULL,
    location text NOT NULL,
    "aboutDesc" text NOT NULL,
    objectives text NOT NULL,
    beneficiaries text NOT NULL,
    "initiatorName" text,
    "organisingTeam" text,
    "proposedPlan" text,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    frequency public."ProjectFrequency" NOT NULL,
    "interval" integer,
    "dayOfWeek" text,
    "approvalStatus" public."ProjectApprovalStatus" DEFAULT 'pending'::public."ProjectApprovalStatus" NOT NULL,
    "operationStatus" public."ProjectOperationStatus" DEFAULT 'notStarted'::public."ProjectOperationStatus" NOT NULL,
    "approvalNotes" text,
    "approvalMessage" text,
    image text,
    attachments text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "submissionStatus" public."SubmissionStatus" DEFAULT 'draft'::public."SubmissionStatus" NOT NULL
);


ALTER TABLE public.vol_projects OWNER TO lavanya;

--
-- Name: volunteer_project_positions; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.volunteer_project_positions (
    id text NOT NULL,
    "volunteerId" text NOT NULL,
    "positionId" text NOT NULL,
    availability text,
    status public."VolunteerProjectPositionStatus" NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "approvalNotes" text,
    "approvalMessage" text,
    "hasConsented" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "volunteerProjectFeedbackId" text
);


ALTER TABLE public.volunteer_project_positions OWNER TO lavanya;

--
-- Name: volunteer_sessions; Type: TABLE; Schema: public; Owner: lavanya
--

CREATE TABLE public.volunteer_sessions (
    id text NOT NULL,
    "volunteerId" text NOT NULL,
    "sessionId" text NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    has_rsvp boolean,
    has_attended boolean,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.volunteer_sessions OWNER TO lavanya;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a4a7d456-4eee-4c70-b6ee-27a5c329e97f	84614ea65f340870ac15f914dacd9ec912a42425b1fa7ad6e73dbf053ba05088	2026-01-13 21:02:05.747896+08	20260103093835_init_new_v2	\N	\N	2026-01-13 21:02:05.647007+08	1
6782fed6-362d-493e-a398-707172d96b4b	8207505314302361be55f7ee425acab5a65f2e10d33b2ebc9fff3a3fd6da8cc7	2026-01-13 21:02:05.761944+08	20260104093833_use_single_role_users	\N	\N	2026-01-13 21:02:05.748437+08	1
baa26ab7-2613-4ab5-b3a1-010b371cc315	79e6489b5c50d3838dd75caf0150eb8cd9e9e0d243c941aa122052e2a5b2568c	2026-01-16 22:26:15.344791+08	20260113063557_add_email_campaign	\N	\N	2026-01-16 22:26:15.325326+08	1
fc869fe6-af12-4fdb-bc50-062e9ff25810	84d2a9db145a01ff4153b55cdbd03e48154bebf799ba05e731de9046e174ff47	2026-01-16 22:26:15.348498+08	20260115141307_move_is_active	\N	\N	2026-01-16 22:26:15.345421+08	1
96c4f716-b758-4e85-bfdc-35860bcd7570	f55fb3e7f05e819010312e97c51c40b789c6838fff96cbe021f262004c1bea13	2026-01-17 19:00:54.16532+08	20260117073630_add_project_status_enum	\N	\N	2026-01-17 19:00:54.146437+08	1
2e93c494-2ad1-4f02-b0ad-80cafb30f239	0f4faaba9ab40d892a83e4bfca2ee07a7520bb5b5aae0e9159a3a563bb890470	2026-01-17 19:00:54.205699+08	20260117073630_add_project_status_fields	\N	\N	2026-01-17 19:00:54.166027+08	1
421849a1-4879-47a3-b391-b6602557b202	5423e00e4ca55a16fb9f541e5dab76f3e84b59443a06cf1c5b642c9db952abad	2026-01-17 19:00:54.214564+08	20260117073631_add_project_status_columns	\N	\N	2026-01-17 19:00:54.206273+08	1
\.


--
-- Data for Name: contact_modes; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.contact_modes (id, "partnerId", mode, "createdAt") FROM stdin;
4e5951be-6163-4264-8d8c-cc5efede4c6e	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	email	2026-01-13 13:19:51.795
2b492c3c-b4a5-479e-8fc9-d03617bca523	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	whatsapp	2026-01-13 13:19:51.795
a985514b-6a74-498f-b3a2-7658a8dcade8	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	email	2026-01-17 08:26:09.742
3a035818-82e2-43bb-b72d-dc2886370516	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	whatsapp	2026-01-17 08:26:09.742
58054e56-80a6-4647-8bb4-0892d9ac5d95	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	email	2026-01-17 08:26:09.767
5578a6fa-4ead-46b1-8b1a-21b11a957fe6	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	telegram	2026-01-17 08:26:09.767
97317b6e-365b-4569-8b20-45636bb4ab32	e3740869-c827-4c1a-a02f-74885a17b4a7	phoneCall	2026-01-17 08:26:09.773
9eb7a14e-79fa-4527-8ebe-e5ebe0dc47de	e3740869-c827-4c1a-a02f-74885a17b4a7	messenger	2026-01-17 08:26:09.773
\.


--
-- Data for Name: don_project_objectives; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.don_project_objectives (id, "projectId", objective, "order", "createdAt", "updatedAt") FROM stdin;
dc53ef7f-a616-4f91-859c-0c22b1ab24a6	8826050a-ede3-4be0-ba92-7bb2f3fedfd2	Purchase diagnostic equipment	1	2026-01-17 08:26:09.921	2026-01-17 08:26:09.921
34b402c1-6053-4600-9555-339653faa488	8826050a-ede3-4be0-ba92-7bb2f3fedfd2	Upgrade screening supplies	2	2026-01-17 08:26:09.921	2026-01-17 08:26:09.921
c9425d0a-6cb7-4a9a-8b32-58e817fc2cd3	fcb14ae2-a486-4033-b4c5-3bf43afd63aa	Sponsor tuition fees	1	2026-01-17 08:26:09.977	2026-01-17 08:26:09.977
26fbc386-5bca-49de-bbf8-15fe80d41b47	fcb14ae2-a486-4033-b4c5-3bf43afd63aa	Provide mentorship support	2	2026-01-17 08:26:09.977	2026-01-17 08:26:09.977
\.


--
-- Data for Name: don_projects; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.don_projects (id, "managedBy", title, location, about, objectives, beneficiaries, "initiatorName", "organisingTeam", "targetFund", "brickSize", deadline, type, "startDate", "endDate", "submissionStatus", "approvalStatus", "approvalNotes", image, attachments, "createdAt", "updatedAt", "operationStatus") FROM stdin;
8826050a-ede3-4be0-ba92-7bb2f3fedfd2	c12ad9be-50a6-4beb-a2f2-e237e1d7981e	Clinic Equipment Fund	Bedok, Singapore	Fundraising for new screening equipment at the Siloam Clinic.	Raise funds for diagnostic devices and supplies.	Clinic patients	Siloam Clinic	Fundraising Team	50000.00	50.00	2026-03-18 08:26:06.064	brick	2026-01-07 08:26:06.064	2026-04-17 08:26:06.064	submitted	approved	Approved by finance manager.	https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1200&q=80	\N	2026-01-17 08:26:09.921	2026-01-17 08:26:09.921	notStarted
fcb14ae2-a486-4033-b4c5-3bf43afd63aa	c12ad9be-50a6-4beb-a2f2-e237e1d7981e	Youth Scholarship Fund	Singapore	Support scholarships for underprivileged youth.	Fund tuition and mentorship support.	Youth beneficiaries	Siloam Education	Scholarship Committee	75000.00	\N	\N	sponsor	2025-12-18 08:26:06.064	2026-05-17 08:26:06.064	submitted	reviewing	Under review.	https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80	\N	2026-01-17 08:26:09.977	2026-01-17 08:26:09.977	notStarted
\.


--
-- Data for Name: donation_transactions; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.donation_transactions (id, "donorId", "projectId", "recurringDonationId", type, "countryOfResidence", "paymentMode", date, amount, receipt, "isThankYouSent", "isAdminNotified", "submissionStatus", "receiptStatus", "createdAt", "updatedAt") FROM stdin;
2ae1570e-34db-4057-9b4d-fe6d5b71836f	876c5e6b-2fd4-4ccb-b323-c403bf995cf1	8826050a-ede3-4be0-ba92-7bb2f3fedfd2	740c2501-8c95-4d36-901b-6b93db7b8eb1	individual	Singapore	Credit Card	2026-01-17 08:26:09.986	120.00	DEMO-CLINIC-0001	t	t	submitted	received	2026-01-17 08:26:09.986	2026-01-17 08:26:09.986
6ede470f-3167-4915-a1c1-4ca4f2c09663	355fa179-90e1-479d-a35b-04ce26ed6c31	fcb14ae2-a486-4033-b4c5-3bf43afd63aa	\N	corporate	Singapore	Bank Transfer	2026-01-17 08:26:09.99	5000.00	DEMO-SCHOLAR-0001	f	t	submitted	pending	2026-01-17 08:26:09.99	2026-01-17 08:26:09.99
\.


--
-- Data for Name: email_audience_filters; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.email_audience_filters (id, "campaignId", "projectId", "isActivePartner", gender, nationality, "minAge", "maxAge", "volunteerInterests", "volunteerSkills", languages, "createdAt", "updatedAt") FROM stdin;
883b8111-7928-47d0-a65c-d1bac2981da3	93e23f3e-dc4e-4fa0-99ec-095b39f76ac9	b3276301-9b4d-4a17-af3d-87198eb8f478	t	female	\N	21	45	{teaching,training}	{Teaching,Facilitation}	{English}	2026-01-17 08:26:09.993	2026-01-17 08:26:09.993
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.email_campaigns (id, name, "senderAddress", subject, "previewText", body, status, "scheduledAt", "createdBy", "createdAt", "updatedAt") FROM stdin;
93e23f3e-dc4e-4fa0-99ec-095b39f76ac9	Volunteer Appreciation 2025	volunteer@siloam.org	Thank you for serving with Siloam!	We appreciate your impact.	Thank you for supporting our community outreach initiatives.	scheduled	2026-01-22 08:26:06.064	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	2026-01-17 08:26:09.993	2026-01-17 08:26:09.993
\.


--
-- Data for Name: email_recipients; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.email_recipients (id, "emailId", "recipientAddress", type, status) FROM stdin;
2208e172-31fc-49d5-80b8-14df7a7361ba	2b75417b-0267-4a97-a9e8-be38a60b8bcf	alicia.partner@siloam.org	to	scheduled
0e0e9ea8-f1ac-47e8-a408-379ffef087d2	2b75417b-0267-4a97-a9e8-be38a60b8bcf	aisha.partner@siloam.org	to	scheduled
ab81860f-736d-487f-98de-1416a0b1e16b	2b75417b-0267-4a97-a9e8-be38a60b8bcf	gm@siloam.org	cc	scheduled
\.


--
-- Data for Name: emails; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.emails (id, "senderAddress", subject, "previewText", body, status, "scheduledAt", "campaignId", "isTest") FROM stdin;
2b75417b-0267-4a97-a9e8-be38a60b8bcf	volunteer@siloam.org	Volunteer Appreciation Reminder	Your impact matters.	Thank you again for your dedication. See you at the next session!	scheduled	2026-01-22 08:26:06.064	93e23f3e-dc4e-4fa0-99ec-095b39f76ac9	f
\.


--
-- Data for Name: feedback_tags; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.feedback_tags (id, "feedbackId", "tagId") FROM stdin;
831b4339-aa41-41ea-9416-7eb3103ec348	a434c57f-7d02-48a7-ab1e-4870afdf31bc	b2388be4-fd0f-4d52-86d6-4aff15c36710
b8e63ec3-d780-4ed4-a750-8475156381a4	a434c57f-7d02-48a7-ab1e-4870afdf31bc	b3296d9c-530e-4c0d-a2c5-17dba9fa1da9
\.


--
-- Data for Name: interests; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.interests (id, "partnerId", "interestSlug") FROM stdin;
15def954-b16c-451f-a9f0-2ea7d56efaeb	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	missionTrips
57a74b20-15cb-4134-9bc4-88eeab554bf4	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	teaching
2b123ff6-eff4-4c1e-81df-09e6bad0ae5a	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	teaching
afafbe50-8ad3-49ca-b80c-28a9c0878bda	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	training
8de2a05a-eb90-4cce-99e0-d9b3543f49be	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	publicity
14febb22-0f0b-4377-8f52-1a83ba88f622	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	planTrips
48d5cc65-7d33-44af-980b-382fe5a99fcf	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	admin
3b11c541-0644-4c5a-b327-582ee3c83d71	e3740869-c827-4c1a-a02f-74885a17b4a7	fundraise
09a3f44a-1c20-438a-9a8b-9675ce15dd43	e3740869-c827-4c1a-a02f-74885a17b4a7	publicity
4ba8320d-2bba-48a7-9b1a-355bdc85d79a	e3740869-c827-4c1a-a02f-74885a17b4a7	others
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.languages (id, "partnerId", language) FROM stdin;
199600d3-bd98-45e2-ac93-8a5761c11f99	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	English
ad459c09-8485-4631-a801-54057cfb1eef	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	Spanish
b7620a10-7418-4a5d-942b-36868c7360e9	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	English
ba6422a3-b1ca-4286-a58e-779ed2404de8	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	Mandarin
e9854fb1-ba8f-48d9-9265-c4baca975c0f	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	English
104e3006-c790-4bc3-8e41-a0bc1925d5f5	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	Tamil
f2535506-fff3-42a1-be89-cf55b01906f5	e3740869-c827-4c1a-a02f-74885a17b4a7	English
3982375e-26c7-4fde-b75f-e9f4dc05a42d	e3740869-c827-4c1a-a02f-74885a17b4a7	Malay
\.


--
-- Data for Name: partner_skills; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.partner_skills (id, "partnerId", skill) FROM stdin;
ffd76b97-d1c0-4fe9-9ad2-0642bc148c2c	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	programming
ff2ccff6-5036-49a0-8f12-e796af8484ec	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	teaching
9a7d4de0-1e65-4cb3-884a-6bf0568cf4f0	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	Teaching
44ec288c-ad33-4f4a-b269-b564c482b6db	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	Facilitation
3912228e-51f5-4692-bbaa-a9ef5e9e3ab2	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	Program Planning
7e5b6620-83bd-46be-b30f-ea9a24aced0e	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	Mentoring
8c05269a-9bd1-4ee8-8173-fcddafff33ba	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	Logistics
53b77fca-1195-4d8e-8f45-eda6dad1fed8	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	Teamwork
2be17e81-a371-4834-bd45-706646873f4b	e3740869-c827-4c1a-a02f-74885a17b4a7	Coordination
d6836356-4894-4f9f-8607-fe4729faba70	e3740869-c827-4c1a-a02f-74885a17b4a7	Admin Support
8c629e56-35b5-46e8-b3ea-4b6595841ea1	e3740869-c827-4c1a-a02f-74885a17b4a7	Community Outreach
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.partners (id, "userId", "tripFormId", dob, "countryCode", "contactNumber", "emergencyCountryCode", "emergencyContactNumber", "identificationNumber", nationality, occupation, gender, "residentialAddress", "otherInterests", "otherReferrers", "otherContactModes", "hasVolunteerExperience", "volunteerAvailability", "consentUpdatesCommunications", "subscribeNewsletterEvents", "createdAt", "updatedAt") FROM stdin;
6b5c1aa5-317f-44ad-a971-5629cd0f5f46	64a31d45-ec80-4493-b26c-273776e54eca	352ea5c5-babf-4600-a735-3f70b26a6dff	1995-06-15 00:00:00	+1	98765432	+1	91234567	A1234567	American	Software Engineer	male	123 Main Street, New York	\N	\N	\N	t	Weekends	t	t	2026-01-13 13:19:51.795	2026-01-13 13:19:51.914
b4e752b9-788d-40b4-bdd5-9f49eb8eb220	19dd05d0-5868-48bb-857c-dec5c668ae8e	\N	1991-04-12 00:00:00	+65	81234567	+65	91234567	S9123456A	Singaporean	Teacher	female	123 Tampines Ave 1, Singapore 529123	\N	\N	\N	t	Weekends	t	t	2026-01-17 08:26:09.742	2026-01-17 08:26:09.742
2487d354-657c-45ff-b4ce-cdb91bdbe7e7	89aa0dfb-ec63-41a0-ba6a-c4ffb50284d5	\N	1988-11-02 00:00:00	+65	82345678	+65	92345678	S8812345B	Indian	Engineer	male	8 Jurong East St 21, Singapore 609602	\N	\N	\N	t	Weekday evenings	t	f	2026-01-17 08:26:09.767	2026-01-17 08:26:09.767
e3740869-c827-4c1a-a02f-74885a17b4a7	c505c207-3222-44a3-a3a8-b34b8471cd5c	\N	1995-07-08 00:00:00	+65	83456789	+65	93456789	S9512345C	Malaysian	Programme Executive	female	55 Bedok North St 3, Singapore 460055	Community photography	Volunteer fair	SMS	f	Flexible	t	t	2026-01-17 08:26:09.773	2026-01-17 08:26:09.773
\.


--
-- Data for Name: peer_feedback; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.peer_feedback (id, "reviewerId", "revieweeId", "projectId", score, type, strengths, improvements, "createdAt", "updatedAt") FROM stdin;
a434c57f-7d02-48a7-ab1e-4870afdf31bc	19dd05d0-5868-48bb-857c-dec5c668ae8e	89aa0dfb-ec63-41a0-ba6a-c4ffb50284d5	b3276301-9b4d-4a17-af3d-87198eb8f478	4	peer	Patient mentor with clear communication.	Could share more check-in resources.	2026-01-17 08:26:09.877	2026-01-17 08:26:09.877
\.


--
-- Data for Name: project_positions; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.project_positions (id, "projectId", role, description, "totalSlots", "createdAt", "updatedAt") FROM stdin;
6c300521-daba-4ddf-a8c4-8a00526a0417	31217d7a-8f9e-4de8-84bd-d72a3b20861a	head	ok	1	2026-01-17 06:35:09.23	2026-01-17 06:35:09.23
57ae4ff8-a6ff-4dfb-abab-0dd4f45639b9	7a4e0da7-446e-4660-b9d0-89842e711e47	Registration Support	Help register participants and guide them to stations.	6	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
b72d3826-1956-44f4-9694-b5a60c3b19c7	7a4e0da7-446e-4660-b9d0-89842e711e47	Logistics Assistant	Coordinate queues and distribute forms.	4	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
79d9beba-6cd0-4b54-a2bc-ab6b54d3253e	b3276301-9b4d-4a17-af3d-87198eb8f478	Youth Mentor	Guide students through activities and discussions.	8	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
1f8e46a3-9287-4e6b-b90b-d8ffe8149ce6	b3276301-9b4d-4a17-af3d-87198eb8f478	Session Facilitator	Facilitate group activities and ensure smooth flow.	2	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
0305d252-4f43-425e-b9c1-b0c8922c57dc	b5fc2e26-3e66-4544-8cb9-3722ab545760	Sorting Crew	Sort, label, and pack items.	10	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824
\.


--
-- Data for Name: project_skills; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.project_skills (id, "projectPositionId", skill, "order", "createdAt", "updatedAt") FROM stdin;
1e7572c0-0041-40f3-942d-1ec14e76efe0	6c300521-daba-4ddf-a8c4-8a00526a0417	ok	1	2026-01-17 06:35:09.239	2026-01-17 06:35:09.239
17e1bf1a-cbf8-4866-9d1d-eaf54247d2f1	6c300521-daba-4ddf-a8c4-8a00526a0417	ok	2	2026-01-17 06:35:09.239	2026-01-17 06:35:09.239
ed3c4e52-0147-40f5-b09d-aecb4e0bb9d3	57ae4ff8-a6ff-4dfb-abab-0dd4f45639b9	Communication	1	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
8dc25175-9b3d-4640-b12a-52923e919ad4	57ae4ff8-a6ff-4dfb-abab-0dd4f45639b9	Customer Service	2	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
069ac129-6648-4482-92c3-11635d345ef2	b72d3826-1956-44f4-9694-b5a60c3b19c7	Coordination	1	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
0e92ea45-9753-4ec1-903e-9f4f068a3376	b72d3826-1956-44f4-9694-b5a60c3b19c7	Problem Solving	2	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
c42cd1ae-7751-4eec-a731-03407e0a7af3	79d9beba-6cd0-4b54-a2bc-ab6b54d3253e	Mentoring	1	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
514c08c4-45ea-4f3d-980b-783373e2ad4f	79d9beba-6cd0-4b54-a2bc-ab6b54d3253e	Empathy	2	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
a4b35ddd-fd9e-472d-83a7-9f27be6efc9b	1f8e46a3-9287-4e6b-b90b-d8ffe8149ce6	Facilitation	1	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
f188864d-b56c-465f-ad24-308a5b7a0623	1f8e46a3-9287-4e6b-b90b-d8ffe8149ce6	Leadership	2	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
6d71b07d-cb32-463c-9050-1ea7666bcd2b	0305d252-4f43-425e-b9c1-b0c8922c57dc	Attention to Detail	1	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824
c96a3e33-893e-4887-a741-e2fcfe8b07d6	0305d252-4f43-425e-b9c1-b0c8922c57dc	Teamwork	2	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824
\.


--
-- Data for Name: recurring_donations; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.recurring_donations (id, "donorId", "projectId", type, "paymentMode", "scheduledAmount", frequency, "startDate", "nextDate", "isActive", "isAutoDeducted", status, "createdAt", "updatedAt") FROM stdin;
740c2501-8c95-4d36-901b-6b93db7b8eb1	876c5e6b-2fd4-4ccb-b323-c403bf995cf1	8826050a-ede3-4be0-ba92-7bb2f3fedfd2	individual	Credit Card	120.00	monthly	2025-12-18 08:26:06.064	2026-02-16 08:26:06.064	t	f	active	2026-01-17 08:26:09.982	2026-01-17 08:26:09.982
\.


--
-- Data for Name: referrers; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.referrers (id, "partnerId", referrer) FROM stdin;
50fa57c2-80ca-4a91-bf44-f38a449897b2	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	friend
31d7ca49-9914-41f5-a7f7-ccb933401314	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	friend
5e1f439c-2e3c-4e1c-9583-6b0d86d59ce2	2487d354-657c-45ff-b4ce-cdb91bdbe7e7	socialMedia
f2cf5a4f-9e6c-4b6a-b8b2-4595060b6948	e3740869-c827-4c1a-a02f-74885a17b4a7	event
492fddcd-2a4d-46e7-90c0-4b04533535aa	e3740869-c827-4c1a-a02f-74885a17b4a7	other
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.sessions (id, "projectId", "sessionDate", name, "startTime", "endTime", "createdAt", "updatedAt") FROM stdin;
86f5b924-da13-4e0f-a640-eb6db705d80e	7a4e0da7-446e-4660-b9d0-89842e711e47	2026-01-23 16:00:00	Morning Screening Session	2026-01-24 01:00:00	2026-01-24 03:00:00	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
6837c2e7-4ad4-4009-b15c-6e0fd2a78f99	7a4e0da7-446e-4660-b9d0-89842e711e47	2026-01-23 16:00:00	Late Morning Screening Session	2026-01-24 03:00:00	2026-01-24 05:00:00	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
82cedf5f-cf3e-4c6d-8fe5-177fe15cc76b	b3276301-9b4d-4a17-af3d-87198eb8f478	2026-02-06 16:00:00	Mentorship Kickoff	2026-02-07 09:30:00	2026-02-07 11:30:00	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
a7e9b123-e830-4bcd-8aef-d9c241ad4ceb	b3276301-9b4d-4a17-af3d-87198eb8f478	2026-02-13 16:00:00	Mentorship Follow-up	2026-02-14 09:30:00	2026-02-14 11:30:00	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
95ef256c-da5b-4f4c-9305-5684b5d70377	b5fc2e26-3e66-4544-8cb9-3722ab545760	2026-01-02 16:00:00	Sorting Shift	2026-01-03 00:30:00	2026-01-03 04:30:00	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.tags (id, name, slug, color, "isActive", "createdAt") FROM stdin;
101694c4-0361-40ea-a126-d6181eb45624	Reliable	reliable	#2E7D32	t	2026-01-17 08:26:09.785
b2388be4-fd0f-4d52-86d6-4aff15c36710	Team Player	team-player	#1565C0	t	2026-01-17 08:26:09.789
b3296d9c-530e-4c0d-a2c5-17dba9fa1da9	Communicator	communicator	#6A1B9A	t	2026-01-17 08:26:09.79
\.


--
-- Data for Name: trip_forms; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.trip_forms (id, "partnerId", "fullName", "passportNumber", "passportExpiry", "healthDeclaration", "createdAt", "updatedAt") FROM stdin;
352ea5c5-babf-4600-a735-3f70b26a6dff	6b5c1aa5-317f-44ad-a971-5629cd0f5f46	John Doe	P9876543	2030-12-31 00:00:00	No known medical conditions	2026-01-13 13:19:51.902	2026-01-13 13:19:51.902
8f7eba5d-a288-4a4a-8b5e-5eb563e3106b	b4e752b9-788d-40b4-bdd5-9f49eb8eb220	Alicia Lim	E12345678	2030-01-01 00:00:00	No known chronic conditions.	2026-01-17 08:26:09.78	2026-01-17 08:26:09.78
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.users (id, "firstName", "lastName", title, email, "passwordHash", "createdAt", "updatedAt", role, "isActive") FROM stdin;
64a31d45-ec80-4493-b26c-273776e54eca	John	Doe	\N	john.doe@example.com	$2b$12$Nflrf0K.gGBnY37zycPhDeYv1HPV/yS7Z/Yig0TCN/HPC44zWgjuy	2026-01-13 13:19:51.733	2026-01-13 13:19:51.733	partner	t
17fc116f-4a38-4ac4-9d54-471629a075fa	Admin	User	\N	admin@example.com	$2b$10$yourHashedPasswordHere	2026-01-15 22:31:31.643	2026-01-15 22:31:31.643	superAdmin	t
209fb966-894b-49f3-857b-251d14131a84	Admin	User	\N	admin2@example.com	$2b$10$ACbFdVXvFMT7JDRsJotJrueFykz4f1.PUtyeERMYBUCPmO8WF3ypS	2026-01-15 22:34:13.525	2026-01-15 22:34:13.525	superAdmin	t
5f7f2445-ab11-4956-8422-0ebebcba2a10	Asha	Kumar	\N	asha.kumar@example.org	$2b$12$AhD7PusbvJQ9lvOOSur40.ITweuWQeckJWSHmOWgAY7KMS4KfItE2	2026-01-15 14:36:17.115	2026-01-15 14:36:17.115	generalManager	t
e7a4c2b3-139e-4d0e-9a6e-c38aef4bd0b5	Siloam	Admin	System Administrator	superadmin@siloam.org	$2b$12$dq9NVzjibMMlUGMuZ9AD5u7YsaBLmB37kBZcn3tcSHHNitT5VTL3a	2026-01-17 08:26:06.628	2026-01-17 08:26:06.628	superAdmin	t
d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	Grace	Tan	General Manager	gm@siloam.org	$2b$12$RgcaqtHkW7oCFhl15VermewXpVpg6WJnbjNdrLvr9FYzWEuGhUysG	2026-01-17 08:26:07.076	2026-01-17 08:26:07.076	generalManager	t
c12ad9be-50a6-4beb-a2f2-e237e1d7981e	Felix	Ng	Finance Manager	finance@siloam.org	$2b$12$m4WiO5iY70AGMAVvBtzChulDcuvC7RIJzyhPe99ahrVZos9X0OcnO	2026-01-17 08:26:07.515	2026-01-17 08:26:07.515	financeManager	t
19dd05d0-5868-48bb-857c-dec5c668ae8e	Alicia	Lim	Community Partner	alicia.partner@siloam.org	$2b$12$N3zXA9azy0HXwFnjrWHTm.B0l6rUso0O0TLsZW7RzYH0E.SgCs3f.	2026-01-17 08:26:07.957	2026-01-17 08:26:07.957	partner	t
89aa0dfb-ec63-41a0-ba6a-c4ffb50284d5	Rahul	Singh	Volunteer Mentor	rahul.partner@siloam.org	$2b$12$szRVSf0U8pBoOi5uGX2X.O3FiIQJnw0reEIKrCHd5Me2FnLqTlra6	2026-01-17 08:26:08.394	2026-01-17 08:26:08.394	partner	t
c505c207-3222-44a3-a3a8-b34b8471cd5c	Nur	Aisha	Program Assistant	aisha.partner@siloam.org	$2b$12$ZOOMEelJc2/NRvvLrDmfDugsH1/8LlVOf74YB1cBiUfdauFlJnjJW	2026-01-17 08:26:08.856	2026-01-17 08:26:08.856	partner	t
876c5e6b-2fd4-4ccb-b323-c403bf995cf1	Daniel	Tan	Individual Donor	daniel.donor@siloam.org	$2b$12$vDQS4YvsFlmBItuwP0plbe909k7riSkilsQZrpxs4EOzuz/IHBvm.	2026-01-17 08:26:09.293	2026-01-17 08:26:09.293	partner	t
355fa179-90e1-479d-a35b-04ce26ed6c31	Mei	Chen	Corporate Donor	mei.donor@siloam.org	$2b$12$PynAZT54jiCgDX1.NAcEhuEeXTkTeAtwtJ8LGwkui3X43p48NeDrG	2026-01-17 08:26:09.733	2026-01-17 08:26:09.733	partner	t
b0b28714-7509-4b2b-bac8-3094a9d97b52	Asha	Kumar	Ms	asha2.kumar@example.org	$2b$12$0oaX72XGHV9JrYPUqLNKTOMx6qgQpjwrJwpu44wwPZzxq.omnyxLC	2026-01-17 11:07:57.796	2026-01-17 11:07:57.796	financeManager	t
\.


--
-- Data for Name: vol_project_feedback; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.vol_project_feedback (id, "projectId", "overallRating", "managementRating", "planningRating", "resourcesRating", "enjoyMost", improvements, "otherComments", "createdAt", "updatedAt") FROM stdin;
4d8e1d9e-5e40-4c49-bf55-a21c97a45c2e	b5fc2e26-3e66-4544-8cb9-3722ab545760	5	5	4	4	Working with the logistics team was smooth and energising.	More signage for sorting categories.	Would join again.	2026-01-17 08:26:09.85	2026-01-17 08:26:09.85
\.


--
-- Data for Name: vol_project_objectives; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.vol_project_objectives (id, "volunteerProjectId", objective, "order", "createdAt", "updatedAt") FROM stdin;
98e1d9b4-0b1b-488b-b05d-e34500abd089	7a4e0da7-446e-4660-b9d0-89842e711e47	Reduce waiting time for screenings	1	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
fb6c13ca-9988-4608-9242-b6d54abae559	7a4e0da7-446e-4660-b9d0-89842e711e47	Provide friendly guidance and support	2	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8
deb968fd-4832-4c52-97e8-a7c07222cfe5	b3276301-9b4d-4a17-af3d-87198eb8f478	Foster positive mentor relationships	1	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
fd80e2fe-a1a1-4c71-aadc-ab9183d9ffc8	b3276301-9b4d-4a17-af3d-87198eb8f478	Support academic goal setting	2	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817
7bd3c728-4a3a-4407-86f3-8bd088754436	b5fc2e26-3e66-4544-8cb9-3722ab545760	Sort and label all incoming donations	1	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824
f940d4a7-3ef7-4ec6-993f-211c50b55e5d	b5fc2e26-3e66-4544-8cb9-3722ab545760	Prepare 150 family packs	2	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824
\.


--
-- Data for Name: vol_projects; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.vol_projects (id, "managedById", "approvedById", title, location, "aboutDesc", objectives, beneficiaries, "initiatorName", "organisingTeam", "proposedPlan", "startTime", "endTime", "startDate", "endDate", frequency, "interval", "dayOfWeek", "approvalStatus", "operationStatus", "approvalNotes", "approvalMessage", image, attachments, "createdAt", "updatedAt", "submissionStatus") FROM stdin;
31217d7a-8f9e-4de8-84bd-d72a3b20861a	64a31d45-ec80-4493-b26c-273776e54eca	\N	sample1	ok	oh	- this is the objective\n- second objective	oh	person	\N	oh	2026-01-21 08:34:00	2026-01-21 14:40:00	2026-01-20 16:00:00	2026-03-04 16:00:00	once	\N	ok	pending	paused	\N	\N	https://nvpc.org.sg/wp-content/uploads/2025/04/two-women-gardening-1024x682.jpg	https://example.com/sample-proposal.pdf	2026-01-17 06:35:09.216	2026-01-17 06:35:09.216	draft
7a4e0da7-446e-4660-b9d0-89842e711e47	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	Community Health Screening	Tampines, Singapore	Support registration, crowd flow, and logistics for a community health screening event.	Smooth on-site experience for seniors and families.	Seniors and low-income families	Siloam Outreach	Volunteer Ops Team	Seeded demo plan for health screening outreach.	2026-01-24 01:00:00	2026-01-24 05:00:00	2026-01-23 16:00:00	2026-01-23 16:00:00	once	\N	\N	approved	ongoing	\N	Approved for demo.	https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80	\N	2026-01-17 08:26:09.8	2026-01-17 08:26:09.8	draft
b3276301-9b4d-4a17-af3d-87198eb8f478	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	After-School Mentorship	Jurong East, Singapore	Weekly mentorship sessions for secondary school students.	Provide guidance on study habits and growth mindset.	Secondary school students	Siloam Youth	Youth Outreach Team	Recurring weekly mentorship sessions.	2026-02-07 09:30:00	2026-02-07 11:30:00	2026-02-06 16:00:00	2026-03-06 16:00:00	weekly	1	Saturday	approved	ongoing	\N	Approved for pilot run.	https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80	\N	2026-01-17 08:26:09.817	2026-01-17 08:26:09.817	draft
b5fc2e26-3e66-4544-8cb9-3722ab545760	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	Warehouse Sorting Day	Bedok, Singapore	Sort and package donations for distribution.	Prepare donation packs efficiently.	Low-income households	Siloam Logistics	Operations Team	One-day sorting and packing drive.	2026-01-03 00:30:00	2026-01-03 04:30:00	2026-01-02 16:00:00	2026-01-02 16:00:00	once	\N	\N	approved	completed	\N	Completed successfully.	https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?auto=format&fit=crop&w=1200&q=80	\N	2026-01-17 08:26:09.824	2026-01-17 08:26:09.824	draft
\.


--
-- Data for Name: volunteer_project_positions; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.volunteer_project_positions (id, "volunteerId", "positionId", availability, status, "approvedAt", "approvedBy", "approvalNotes", "approvalMessage", "hasConsented", "createdAt", "updatedAt", "volunteerProjectFeedbackId") FROM stdin;
62a27fa8-9f15-4b06-80ec-c63b4437f592	19dd05d0-5868-48bb-857c-dec5c668ae8e	57ae4ff8-a6ff-4dfb-abab-0dd4f45639b9	\N	approved	2026-01-17 08:26:09.828	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	\N	Approved for demo assignment.	t	2026-01-17 08:26:09.829	2026-01-17 08:26:09.829	\N
277fe6b7-d78c-46eb-aa2f-eeddb6e12a01	89aa0dfb-ec63-41a0-ba6a-c4ffb50284d5	79d9beba-6cd0-4b54-a2bc-ab6b54d3253e	\N	reviewing	\N	\N	\N	\N	t	2026-01-17 08:26:09.835	2026-01-17 08:26:09.835	\N
dfd8580f-1861-4aae-9004-4680f1f858ed	64a31d45-ec80-4493-b26c-273776e54eca	57ae4ff8-a6ff-4dfb-abab-0dd4f45639b9	Everyday	reviewing	\N	\N	\N	\N	t	2026-01-17 08:30:12.689	2026-01-17 08:30:12.689	\N
0c4e0e5f-c722-4e34-a2a2-896465c61efe	c505c207-3222-44a3-a3a8-b34b8471cd5c	0305d252-4f43-425e-b9c1-b0c8922c57dc	\N	active	2025-12-28 08:26:06.064	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	\N	\N	t	2026-01-17 08:26:09.838	2026-01-17 08:38:28.173	4d8e1d9e-5e40-4c49-bf55-a21c97a45c2e
\.


--
-- Data for Name: volunteer_sessions; Type: TABLE DATA; Schema: public; Owner: lavanya
--

COPY public.volunteer_sessions (id, "volunteerId", "sessionId", "approvedAt", "approvedBy", has_rsvp, has_attended, "createdAt", "updatedAt") FROM stdin;
1166f00c-d12f-4422-9137-9a8226a83822	19dd05d0-5868-48bb-857c-dec5c668ae8e	86f5b924-da13-4e0f-a640-eb6db705d80e	2026-01-17 08:26:09.839	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	t	\N	2026-01-17 08:26:09.84	2026-01-17 08:26:09.84
41db95c9-6a35-44a4-8b57-83db2d77a793	89aa0dfb-ec63-41a0-ba6a-c4ffb50284d5	82cedf5f-cf3e-4c6d-8fe5-177fe15cc76b	2026-01-17 08:26:09.844	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	t	\N	2026-01-17 08:26:09.845	2026-01-17 08:26:09.845
e79d5f07-eceb-4615-bb11-5d343be36d3b	c505c207-3222-44a3-a3a8-b34b8471cd5c	95ef256c-da5b-4f4c-9305-5684b5d70377	2025-12-28 08:26:06.064	d1f8fa51-0c01-4ebc-b3c4-4a8ab827d654	t	t	2026-01-17 08:26:09.847	2026-01-17 08:26:09.847
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: contact_modes contact_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.contact_modes
    ADD CONSTRAINT contact_modes_pkey PRIMARY KEY (id);


--
-- Name: don_project_objectives don_project_objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.don_project_objectives
    ADD CONSTRAINT don_project_objectives_pkey PRIMARY KEY (id);


--
-- Name: don_projects don_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.don_projects
    ADD CONSTRAINT don_projects_pkey PRIMARY KEY (id);


--
-- Name: donation_transactions donation_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.donation_transactions
    ADD CONSTRAINT donation_transactions_pkey PRIMARY KEY (id);


--
-- Name: email_audience_filters email_audience_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.email_audience_filters
    ADD CONSTRAINT email_audience_filters_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_recipients email_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_pkey PRIMARY KEY (id);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- Name: feedback_tags feedback_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.feedback_tags
    ADD CONSTRAINT feedback_tags_pkey PRIMARY KEY (id);


--
-- Name: interests interests_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT interests_pkey PRIMARY KEY (id);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: partner_skills partner_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.partner_skills
    ADD CONSTRAINT partner_skills_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: peer_feedback peer_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT peer_feedback_pkey PRIMARY KEY (id);


--
-- Name: project_positions project_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.project_positions
    ADD CONSTRAINT project_positions_pkey PRIMARY KEY (id);


--
-- Name: project_skills project_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_pkey PRIMARY KEY (id);


--
-- Name: recurring_donations recurring_donations_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.recurring_donations
    ADD CONSTRAINT recurring_donations_pkey PRIMARY KEY (id);


--
-- Name: referrers referrers_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.referrers
    ADD CONSTRAINT referrers_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: trip_forms trip_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.trip_forms
    ADD CONSTRAINT trip_forms_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vol_project_feedback vol_project_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_project_feedback
    ADD CONSTRAINT vol_project_feedback_pkey PRIMARY KEY (id);


--
-- Name: vol_project_objectives vol_project_objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_project_objectives
    ADD CONSTRAINT vol_project_objectives_pkey PRIMARY KEY (id);


--
-- Name: vol_projects vol_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_projects
    ADD CONSTRAINT vol_projects_pkey PRIMARY KEY (id);


--
-- Name: volunteer_project_positions volunteer_project_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_project_positions
    ADD CONSTRAINT volunteer_project_positions_pkey PRIMARY KEY (id);


--
-- Name: volunteer_sessions volunteer_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_sessions
    ADD CONSTRAINT volunteer_sessions_pkey PRIMARY KEY (id);


--
-- Name: don_project_objectives_projectId_order_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "don_project_objectives_projectId_order_key" ON public.don_project_objectives USING btree ("projectId", "order");


--
-- Name: email_audience_filters_campaignId_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "email_audience_filters_campaignId_key" ON public.email_audience_filters USING btree ("campaignId");


--
-- Name: partners_userId_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "partners_userId_key" ON public.partners USING btree ("userId");


--
-- Name: peer_feedback_reviewerId_revieweeId_projectId_type_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "peer_feedback_reviewerId_revieweeId_projectId_type_key" ON public.peer_feedback USING btree ("reviewerId", "revieweeId", "projectId", type);


--
-- Name: project_skills_projectPositionId_order_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "project_skills_projectPositionId_order_key" ON public.project_skills USING btree ("projectPositionId", "order");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: trip_forms_partnerId_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "trip_forms_partnerId_key" ON public.trip_forms USING btree ("partnerId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: vol_project_objectives_volunteerProjectId_order_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "vol_project_objectives_volunteerProjectId_order_key" ON public.vol_project_objectives USING btree ("volunteerProjectId", "order");


--
-- Name: volunteer_project_positions_volunteerId_positionId_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "volunteer_project_positions_volunteerId_positionId_key" ON public.volunteer_project_positions USING btree ("volunteerId", "positionId");


--
-- Name: volunteer_sessions_volunteerId_sessionId_key; Type: INDEX; Schema: public; Owner: lavanya
--

CREATE UNIQUE INDEX "volunteer_sessions_volunteerId_sessionId_key" ON public.volunteer_sessions USING btree ("volunteerId", "sessionId");


--
-- Name: contact_modes contact_modes_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.contact_modes
    ADD CONSTRAINT "contact_modes_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: don_project_objectives don_project_objectives_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.don_project_objectives
    ADD CONSTRAINT "don_project_objectives_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.don_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: don_projects don_projects_managedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.don_projects
    ADD CONSTRAINT "don_projects_managedBy_fkey" FOREIGN KEY ("managedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donation_transactions donation_transactions_donorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.donation_transactions
    ADD CONSTRAINT "donation_transactions_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donation_transactions donation_transactions_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.donation_transactions
    ADD CONSTRAINT "donation_transactions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.don_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donation_transactions donation_transactions_recurringDonationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.donation_transactions
    ADD CONSTRAINT "donation_transactions_recurringDonationId_fkey" FOREIGN KEY ("recurringDonationId") REFERENCES public.recurring_donations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_audience_filters email_audience_filters_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.email_audience_filters
    ADD CONSTRAINT "email_audience_filters_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.email_campaigns(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: email_campaigns email_campaigns_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT "email_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: email_recipients email_recipients_emailId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT "email_recipients_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES public.emails(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: emails emails_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT "emails_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.email_campaigns(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: feedback_tags feedback_tags_feedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.feedback_tags
    ADD CONSTRAINT "feedback_tags_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES public.peer_feedback(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: feedback_tags feedback_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.feedback_tags
    ADD CONSTRAINT "feedback_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: interests interests_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.interests
    ADD CONSTRAINT "interests_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: languages languages_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT "languages_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partner_skills partner_skills_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.partner_skills
    ADD CONSTRAINT "partner_skills_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partners partners_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT "partners_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: peer_feedback peer_feedback_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT "peer_feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.vol_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: peer_feedback peer_feedback_revieweeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT "peer_feedback_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: peer_feedback peer_feedback_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT "peer_feedback_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_positions project_positions_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.project_positions
    ADD CONSTRAINT "project_positions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.vol_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_skills project_skills_projectPositionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT "project_skills_projectPositionId_fkey" FOREIGN KEY ("projectPositionId") REFERENCES public.project_positions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_donations recurring_donations_donorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.recurring_donations
    ADD CONSTRAINT "recurring_donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_donations recurring_donations_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.recurring_donations
    ADD CONSTRAINT "recurring_donations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.don_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: referrers referrers_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.referrers
    ADD CONSTRAINT "referrers_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sessions sessions_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.vol_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: trip_forms trip_forms_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.trip_forms
    ADD CONSTRAINT "trip_forms_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vol_project_feedback vol_project_feedback_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_project_feedback
    ADD CONSTRAINT "vol_project_feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.vol_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vol_project_objectives vol_project_objectives_volunteerProjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_project_objectives
    ADD CONSTRAINT "vol_project_objectives_volunteerProjectId_fkey" FOREIGN KEY ("volunteerProjectId") REFERENCES public.vol_projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vol_projects vol_projects_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_projects
    ADD CONSTRAINT "vol_projects_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vol_projects vol_projects_managedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.vol_projects
    ADD CONSTRAINT "vol_projects_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: volunteer_project_positions volunteer_project_positions_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_project_positions
    ADD CONSTRAINT "volunteer_project_positions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: volunteer_project_positions volunteer_project_positions_positionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_project_positions
    ADD CONSTRAINT "volunteer_project_positions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES public.project_positions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: volunteer_project_positions volunteer_project_positions_volunteerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_project_positions
    ADD CONSTRAINT "volunteer_project_positions_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: volunteer_project_positions volunteer_project_positions_volunteerProjectFeedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_project_positions
    ADD CONSTRAINT "volunteer_project_positions_volunteerProjectFeedbackId_fkey" FOREIGN KEY ("volunteerProjectFeedbackId") REFERENCES public.vol_project_feedback(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: volunteer_sessions volunteer_sessions_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_sessions
    ADD CONSTRAINT "volunteer_sessions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: volunteer_sessions volunteer_sessions_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_sessions
    ADD CONSTRAINT "volunteer_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.sessions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: volunteer_sessions volunteer_sessions_volunteerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lavanya
--

ALTER TABLE ONLY public.volunteer_sessions
    ADD CONSTRAINT "volunteer_sessions_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

