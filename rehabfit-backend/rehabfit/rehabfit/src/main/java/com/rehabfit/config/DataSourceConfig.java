package com.rehabfit.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();
        
        // Check if DATABASE_URL is set (Render deployment)
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Convert postgres:// to jdbc:postgresql:// if needed
            if (databaseUrl.startsWith("postgres://")) {
                databaseUrl = databaseUrl.replace("postgres://", "jdbc:postgresql://");
            }
            // DATABASE_URL from Render should already be in jdbc:postgresql:// format
            properties.setUrl(databaseUrl);
            
            // Set username and password from environment
            String username = System.getenv("DB_USERNAME");
            String password = System.getenv("DB_PASSWORD");
            if (username != null) properties.setUsername(username);
            if (password != null) properties.setPassword(password);
        }
        
        return properties;
    }

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
