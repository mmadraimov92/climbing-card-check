CREATE TABLE climbers (
  id NUMERIC(11) PRIMARY KEY,
  name VARCHAR (64) NOT NULL,
  email VARCHAR (255) UNIQUE NOT NULL,
  certificate VARCHAR (16) NOT NULL,
  exam_date TIMESTAMP,
  expiry_date TIMESTAMP,
  examiner VARCHAR(64),
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emails (
  id NUMERIC(11) PRIMARY KEY,
  email VARCHAR (255) UNIQUE NOT NULL,
  email_slug UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email_sent_at TIMESTAMP,
  email_status VARCHAR(64),
  status_updated_at TIMESTAMP
);
