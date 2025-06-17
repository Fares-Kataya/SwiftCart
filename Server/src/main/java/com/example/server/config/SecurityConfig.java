package com.example.server.config;

import com.example.server.security.JwtAuthenticationFilter;
import com.example.server.security.JwtTokenProvider;
import com.example.server.security.JwtUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {
        private final JwtTokenProvider jwtTokenProvider;
        private final JwtUserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);

                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(withDefaults())
                                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // public auth endpoints
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // allow ANYONE to read products (GET)
                                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                                // allow ANYONE to read categories
                                                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                                                // only admins may create/update/delete products
                                                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                                                // swagger / open‑api
                                                .requestMatchers(
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui/index.html",
                                                                "/swagger-ui/swagger-initializer.js",
                                                                "/webjars/**")
                                                .permitAll()

                                                // any other endpoint needs a valid token
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
