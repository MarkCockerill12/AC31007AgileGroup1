DELIMITER $$

CREATE PROCEDURE getBalance(IN inPAN BIGINT)
BEGIN
	Select Balance, Surname, Forename
    from userAccount
    where HolderID = (select HolderID from cardDetails where PAN = inPAN)
    ;
END$$

DELIMITER ;
