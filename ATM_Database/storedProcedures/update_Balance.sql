DELIMITER $$

CREATE PROCEDURE update_Balance(IN inPAN BIGINT, IN updatedBalance DECIMAL(10, 2))
BEGIN
    update userAccount
    set Balance = updatedBalance
    where HolderID = (select HolderID from cardDetails where PAN = inPAN)
    ;
END$$

DELIMITER ;
