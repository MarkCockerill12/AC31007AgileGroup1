DELIMITER $$

CREATE PROCEDURE getBalance(IN inPAN BIGINT)
BEGIN
	Select Balance, Surname, Forename
    from useraccount
    where HolderID = (select HolderID from cardDetails where PAN = inPAN)
    ;
END$$

DELIMITER ;
