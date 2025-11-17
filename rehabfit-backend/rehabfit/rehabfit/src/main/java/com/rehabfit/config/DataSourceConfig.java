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
        // Try JDBC_DATABASE_URL first (correct format), then DATABASE_URL (needs conversion)
        String databaseUrl = System.getenv("JDBC_DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            databaseUrl = System.getenv("DATABASE_URL");
        }
        
        String username = System.getenv("DB_USERNAME");
        String password = System.getenv("DB_PASSWORD");
        
        // If DATABASE_URL exists, use it (Render deployment)
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Convert postgres:// or postgresql:// to jdbc:postgresql://
            if (databaseUrl.startsWith("postgres://")) {
                databaseUrl = databaseUrl.replace("postgres://", "jdbc:postgresql://");
            } else if (databaseUrl.startsWith("postgresql://")) {
                databaseUrl = "jdbc:" + databaseUrl;
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
