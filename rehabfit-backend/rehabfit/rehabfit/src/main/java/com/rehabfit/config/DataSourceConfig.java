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
            // Parse and convert Render's postgres:// or postgresql:// URL format
            if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                // Extract components: postgresql://user:pass@host/db or postgresql://user:pass@host:port/db
                String urlWithoutScheme = databaseUrl.replaceFirst("^postgres(ql)?://", "");
                
                // Split into credentials@host/db
                String[] parts = urlWithoutScheme.split("@", 2);
                if (parts.length == 2) {
                    String credentials = parts[0];
                    String hostAndDb = parts[1];
                    
                    // Parse credentials
                    String[] credParts = credentials.split(":", 2);
                    if (credParts.length == 2) {
                        username = credParts[0];
                        password = credParts[1];
                    }
                    
                    // Parse host:port/db or host/db (default port 5432)
                    String host;
                    String port = "5432";
                    String database;
                    
                    String[] hostDbParts = hostAndDb.split("/", 2);
                    if (hostDbParts.length == 2) {
                        database = hostDbParts[1];
                        String[] hostPortParts = hostDbParts[0].split(":", 2);
                        host = hostPortParts[0];
                        if (hostPortParts.length == 2) {
                            port = hostPortParts[1];
                        }
                        
                        // Render's internal database URLs need .render.com suffix added if not present
                        if (!host.contains(".") && host.startsWith("dpg-")) {
                            host = host + ".oregon-postgres.render.com";
                        }
                        
                        // Rebuild as proper JDBC URL
                        databaseUrl = String.format("jdbc:postgresql://%s:%s/%s", host, port, database);
                    }
                }
            } else if (!databaseUrl.startsWith("jdbc:")) {
                // If it doesn't start with jdbc: and isn't postgres://, prepend it
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
