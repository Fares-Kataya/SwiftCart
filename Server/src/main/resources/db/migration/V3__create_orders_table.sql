CREATE TABLE orders (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        order_date TIMESTAMP NOT NULL DEFAULT now(),
                        total_price NUMERIC(10,2) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);
