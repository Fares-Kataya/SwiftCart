CREATE TABLE categories (
                            id         BIGSERIAL   PRIMARY KEY,
                            name       VARCHAR(50) NOT NULL UNIQUE,
                            image_url  VARCHAR(255)
);