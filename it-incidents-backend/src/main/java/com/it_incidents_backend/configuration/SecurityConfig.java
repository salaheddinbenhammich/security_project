package com.it_incidents_backend.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    /**
     * BCrypt password encoder with strength 12
     * - Strength 12 provides good balance between security and performance
     * - Higher values = more secure but slower
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // CSRF Token Handler - uses cookies for better security
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName("_csrf");

        http
                // ========== CSRF PROTECTION ==========
                // For stateless JWT auth, we disable CSRF for API endpoints
                // In production with session-based auth, enable CSRF protection
                .csrf(AbstractHttpConfigurer::disable)
                // Alternative: Enable CSRF for state-changing operations
                // .csrf(csrf -> csrf
                //         .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                //         .csrfTokenRequestHandler(requestHandler)
                //         .ignoringRequestMatchers("/api/auth/**") // Skip CSRF for login/register
                // )
                
                // ========== CORS CONFIGURATION ==========
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // ========== SESSION MANAGEMENT ==========
                // Stateless sessions - JWT tokens handle authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // ========== AUTHORIZATION RULES ==========
                .authorizeHttpRequests(auth -> auth
                        // Swagger/OpenAPI documentation - PUBLIC
                        .requestMatchers(
                                "/api-docs/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/configuration/**",
                                "/webjars/**"
                        ).permitAll()

                        // Authentication endpoints - PUBLIC
                        .requestMatchers("/api/auth/**").permitAll()
                        
                        // Health check - PUBLIC
                        .requestMatchers("/api/health").permitAll()

                        // Actuator endpoints - PUBLIC (for Docker healthcheck)
                        .requestMatchers("/actuator/**").permitAll()
                        
                        // Read-only ticket list - PUBLIC (guest users can view)
                        .requestMatchers(HttpMethod.GET, "/api/tickets").permitAll()
                        
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                
                // ========== SECURITY HEADERS ==========
                .headers(headers -> headers
                        // Prevent clickjacking attacks
                        .frameOptions(frame -> frame.deny())
                        // Prevent MIME type sniffing
                        .contentTypeOptions(contentType -> {})
                        // Enable XSS protection
                        .xssProtection(xss -> {})
                        // Enforce HTTPS
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                        )
                )
                
                // ========== JWT AUTHENTICATION FILTER ==========
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS Configuration
     * - Allows frontend to communicate with backend
     * - Restricts allowed origins to prevent unauthorized access
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allowed origins from application.properties
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        
        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allowed headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Expose Authorization header to frontend
        configuration.setExposedHeaders(List.of("Authorization"));
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}