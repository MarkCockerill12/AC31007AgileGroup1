DELIMITER $$

CREATE PROCEDURE CheckIfAccountBlocked(IN inPAN BIGINT)
BEGIN
-- Select and return the Blocked status directly
SELECT CASE
WHEN Blocked IS NULL THEN FALSE -- If no HolderID found, return FALSE
ELSE Blocked
END AS IsBlocked
FROM userAccount
WHERE HolderID = (SELECT HolderID FROM cardDetails WHERE PAN = inPAN LIMIT 1);
END$$

DELIMITER ;