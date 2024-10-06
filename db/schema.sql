CREATE TABLE climbers (
  id NUMERIC(11) PRIMARY KEY,
  name VARCHAR (64) NOT NULL,
  email VARCHAR (255) UNIQUE NOT NULL,
  certificate VARCHAR (16) NOT NULL,
  exam_date TIMESTAMP,
  expiry_date TIMESTAMP,
  examiner VARCHAR(64),
  payment_received BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_orders (
  order_id UUID PRIMARY KEY,
  climber_id NUMERIC(11) NOT NULL,
  status VARCHAR(64) NOT NULL,
  amount numeric CHECK (amount > 0),
  payment_url VARCHAR (255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email_sent_at TIMESTAMP
);