START TRANSACTION;
ALTER TABLE users ADD photo_url character varying(256) NOT NULL DEFAULT '';

INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
VALUES ('20250923122404_Add_PhotoUrl_Column_To_Users_Table', '9.0.9');

COMMIT;

