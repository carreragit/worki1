FROM maven:3.9.14-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY gateway/pom.xml gateway/
COPY auth-service/pom.xml auth-service/
COPY user-service/pom.xml user-service/
COPY interaction-service/pom.xml interaction-service/
RUN mvn dependency:go-offline -pl interaction-service -am -q
COPY interaction-service/src interaction-service/src
RUN mvn -pl interaction-service package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/interaction-service/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]