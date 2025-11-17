package com.rehabfit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RehabfitApplication {

	public static void main(String[] args) {
		SpringApplication.run(RehabfitApplication.class, args);
	}

}
