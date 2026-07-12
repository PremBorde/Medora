package com.medora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class MedoraApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(MedoraApplication.class, args);  
        System.out.println("Sucessfully launched...!");
    }

    private static void loadDotEnv() {
        // Try current directory, parent directory, or absolute workspace root path
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (!envFile.exists()) {
            envFile = new File("d:/Medora AI/.env");
        }

        if (envFile.exists()) {
            System.out.println("Loading environment variables from: " + envFile.getAbsolutePath());
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String val = line.substring(eqIdx + 1).trim();
                        // Unquote values if they are wrapped in quotes
                        if (val.startsWith("\"") && val.endsWith("\"")) {
                            val = val.substring(1, val.length() - 1);
                        } else if (val.startsWith("'") && val.endsWith("'")) {
                            val = val.substring(1, val.length() - 1);
                        }
                        
                        // Set system property so Spring Boot can resolve placeholders in application.yml
                        if (System.getProperty(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                }
            } catch (IOException e) {
                System.err.println("Error reading .env file: " + e.getMessage());
            }
        } else {
            System.err.println("Warning: .env file not found at current dir, parent dir, or workspace root!");
        }
    }
}
