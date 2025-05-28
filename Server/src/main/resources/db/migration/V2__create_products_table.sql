CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          title       VARCHAR(150) NOT NULL,
                          description TEXT,
                          price       NUMERIC(10,2) NOT NULL,
                          image_url   VARCHAR(255),
                          stock       INTEGER       NOT NULL DEFAULT 0,
                          created_at  TIMESTAMP NOT NULL DEFAULT now(),
                          updated_at  TIMESTAMP NOT NULL DEFAULT now()
);