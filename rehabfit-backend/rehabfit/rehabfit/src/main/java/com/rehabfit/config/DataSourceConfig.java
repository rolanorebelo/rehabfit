package com.rehabfit.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        // Get DATABASE_URL from environment
        String databaseUrl = System.getenv("DATABASE_URL");
        String username = System.getenv("DB_USERNAME");
        String password = System.getenv("DB_PASSWORD");
        
        // If DATABASE_URL exists, use it (Render deployment)
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Convert postgres:// to jdbc:postgresql:// if needed
            if (databaseUrl.startsWith("postgres://")) {
                databaseUrl = databaseUrl.replace("postgres://", "jdbc:postgresql://");
            }
            
            // Ensure it starts with jdbc:
            if (!databaseUrl.startsWith("jdbc:")) {
                throw new IllegalStateException("DATABASE_URL must start with 'jdbc:' but was: " + databaseUrl);
            }
            
            // Build DataSource directly with Hikari
            HikariDataSource dataSource = new HikariDataSource();
            dataSource.setJdbcUrl(databaseUrl);
            dataSource.setUsername(username != null ? username : "postgres");
            dataSource.setPassword(password != null ? password : "");
            dataSource.setDriverClassName("org.postgresql.Driver");
            dataSource.setMaximumPoolSize(5);
            dataSource.setMinimumIdle(2);
            
            return dataSource;
        }
        
        // For local development, use Spring Boot's defaults from application.properties
        return DataSourceBuilder.create().build();
    }
}
