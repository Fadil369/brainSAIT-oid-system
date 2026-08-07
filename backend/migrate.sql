CREATE SEQUENCE IF NOT EXISTS oid_suffix_seq START WITH 1004;

SELECT setval(
    'oid_suffix_seq',
    GREATEST(
        (SELECT last_value FROM oid_suffix_seq),
        COALESCE(
            (SELECT MAX(oid::BIGINT) FROM oids WHERE oid ~ '^[0-9]+$'),
            1003
        ),
        1003
    )
);
