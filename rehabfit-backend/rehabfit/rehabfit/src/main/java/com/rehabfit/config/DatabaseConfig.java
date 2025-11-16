package com.rehabfit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${DB_USERNAME:#{null}}")
    private String dbUsername;

    @Value("${DB_PASSWORD:#{null}}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("Original DATABASE_URL: {}", databaseUrl);
        if (databaseUrl != null && databaseUrl.startsWith("postgres://")) {
            // Convert postgres:// URL to jdbc:postgresql://
            String jdbcUrl = databaseUrl.replace("postgres://", "jdbc:postgresql://");
            logger.info("Converted JDBC URL: {}", jdbcUrl);
            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(dbUsername)
                    .password(dbPassword)
                    .build();
        }

        // Throw an error if DATABASE_URL is not set
        throw new IllegalStateException("DATABASE_URL environment variable is not set or invalid. Please configure it correctly.");
    }
}