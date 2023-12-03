CREATE UNIQUE INDEX userinfo_name_ci ON userinfo (UPPER(name));
CREATE UNIQUE INDEX userinfo_email_ci ON userinfo (UPPER(email));