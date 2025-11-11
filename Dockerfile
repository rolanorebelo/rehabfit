# Multi-stage build for Spring Boot backend
FROM eclipse-temurin:21-jdk as build

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY rehabfit-backend/rehabfit/rehabfit/.mvn .mvn
COPY rehabfit-backend/rehabfit/rehabfit/mvnw .
COPY rehabfit-backend/rehabfit/rehabfit/pom.xml .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline

# Copy source code
COPY rehabfit-backend/rehabfit/rehabfit/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/rehabfit-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
