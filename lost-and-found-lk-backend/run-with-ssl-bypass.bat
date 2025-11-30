@echo off
REM Run Spring Boot with SSL/TLS bypass for MongoDB Atlas connection issues

echo Starting Lost and Found Backend with SSL bypass...
echo.

.\mvnw.cmd spring-boot:run ^
  -Dspring-boot.run.jvmArguments="-Djdk.tls.client.protocols=TLSv1.2 -Djavax.net.ssl.trustStore=NONE -Djavax.net.ssl.trustStoreType=NONE"

pause
