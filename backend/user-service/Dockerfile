FROM maven:3.9.14-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY gateway/pom.xml gateway/
COPY auth-service/pom.xml auth-service/
COPY user-service/pom.xml user-service/
COPY interaction-service/pom.xml interaction-service/
RUN mvn dependency:go-offline -pl user-service -am -q
COPY user-service/src user-service/src
RUN mvn -pl user-service package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]