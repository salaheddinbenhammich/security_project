package com.it_incidents_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@SpringBootApplication
public class ItIncidentsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItIncidentsBackendApplication.class, args);
	}

}
