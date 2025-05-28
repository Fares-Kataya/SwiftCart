CREATE TABLE order_items (
                             id BIGSERIAL PRIMARY KEY,
                             order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                             product_id BIGINT NOT NULL REFERENCES products(id),
                             quantity   INTEGER NOT NULL DEFAULT 1,
                             unit_price NUMERIC(10,2) NOT NULL
);
