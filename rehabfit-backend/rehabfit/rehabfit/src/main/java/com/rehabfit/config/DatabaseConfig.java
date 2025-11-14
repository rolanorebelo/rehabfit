package com.rehabfit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${DB_USERNAME:#{null}}")
    private String dbUsername;

    @Value("${DB_PASSWORD:#{null}}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (databaseUrl != null && databaseUrl.startsWith("postgres://")) {
            // Convert postgres:// URL to jdbc:postgresql://
            String jdbcUrl = databaseUrl.replace("postgres://", "jdbc:postgresql://");
            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(dbUsername)
                    .password(dbPassword)
                    .build();
        }

        // Fallback to default configuration
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5432/rolano")
                .username("postgres")
                .password("rolano123")
                .build();
    }
}