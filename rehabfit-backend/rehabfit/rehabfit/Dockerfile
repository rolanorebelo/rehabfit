FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy all necessary files including the .mvn directory and mvnw
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies first to cache better
RUN ./mvnw dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/rehabfit-0.0.1-SNAPSHOT.jar"]
