CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       first_name VARCHAR(10)   NOT NULL,
                       last_name  VARCHAR(10)   NOT NULL,
                       username VARCHAR(50) NOT NULL,
                       email    VARCHAR(100) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       gender   VARCHAR(10),
                       image_url VARCHAR(255),
                       role     VARCHAR(20) NOT NULL DEFAULT 'USER',
                       created_at TIMESTAMP NOT NULL DEFAULT now()
);