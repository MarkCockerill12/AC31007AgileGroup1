DELIMITER $$

CREATE PROCEDURE GetCardStatusByPAN(IN inPAN BIGINT)
BEGIN
SELECT Blocked
FROM cardDetails
WHERE PAN = inPAN;
END$$

DELIMITER ;

