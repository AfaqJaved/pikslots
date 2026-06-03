BEGIN;

  -- Delete the business and its owner by business ID.
  -- Replace :business_id with the actual business UUID.

  DO $$
  DECLARE
    v_owner_id TEXT;
  BEGIN

    -- Capture the owner before deletion
    SELECT owner_id INTO v_owner_id
    FROM businesses
    WHERE id = :business_id;

    IF v_owner_id IS NULL THEN
      RAISE EXCEPTION 'Business not found: %', :business_id;
    END IF;

    -- Break the circular reference (users.business_id → businesses.id)
    UPDATE users
    SET business_id = NULL
    WHERE business_id = :business_id;

    -- Delete the business
    DELETE FROM businesses
    WHERE id = :business_id;

    -- Delete the owner
    DELETE FROM users
    WHERE id = v_owner_id;

  END $$;

  COMMIT;
