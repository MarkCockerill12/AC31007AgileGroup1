DELIMITER $$

CREATE PROCEDURE update_Balance(IN inPAN BIGINT, IN updatedBalance BIGINT)
BEGIN
    update userAccount
    set Balance = updatedBalance
    where HolderID = (select HolderID from cardDetails where PAN = inPAN)
    ;
END$$

DELIMITER ;
