
# Real-Time Chat Application

A full-stack real-time chat application with a React frontend, Spring Boot backend, and MySQL database.

## Frontend

This React frontend provides a user interface for connecting to the Spring Boot backend.

### Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Backend (Spring Boot)

Follow these steps to set up your Spring Boot backend:

### Prerequisites

- JDK 17 or later
- Maven
- MySQL

### Project Setup

1. Create a new Spring Boot project using [Spring Initializr](https://start.spring.io/) with the following dependencies:
   - Spring Web
   - Spring Data JPA
   - MySQL Driver
   - Spring Security
   - Spring Boot DevTools
   - WebSocket
   - Lombok

2. Configure `application.properties`:

```properties
# Server port
server.port=8081

# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/chat_application
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# JWT configuration
jwt.secret=YOUR_SECRET_KEY_HERE
jwt.expiration=86400000
```

### Project Structure

```
src/main/java/com/example/chatapp/
├── config/
│   ├── WebSecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   └── WebSocketConfig.java
├── controller/
│   ├── AuthController.java
│   ├── ChatRoomController.java
│   ├── MessageController.java
│   └── UserController.java
├── model/
│   ├── User.java
│   ├── ChatRoom.java
│   └── Message.java
├── repository/
│   ├── UserRepository.java
│   ├── ChatRoomRepository.java
│   └── MessageRepository.java
├── service/
│   ├── UserService.java
│   ├── ChatRoomService.java
│   ├── MessageService.java
│   └── JwtService.java
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── MessageRequest.java
│   │   └── ChatRoomRequest.java
│   └── response/
│       ├── JwtResponse.java
│       ├── MessageResponse.java
│       └── ChatRoomResponse.java
└── ChatApplication.java
```

### Key Java Classes

#### 1. User Model

```java
package com.example.chatapp.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(name = "profile_picture")
    private String profilePicture;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
    
    @Column(name = "is_online")
    private boolean isOnline;
    
    @ManyToMany
    @JoinTable(
        name = "user_room",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    private Set<ChatRoom> rooms = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.lastSeen = LocalDateTime.now();
    }
}
```

#### 2. ChatRoom Model

```java
package com.example.chatapp.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_rooms")
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToMany(mappedBy = "rooms")
    private Set<User> users = new HashSet<>();
    
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private Set<Message> messages = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

#### 3. Message Model

```java
package com.example.chatapp.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String content;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }
}
```

#### 4. JWT Service

```java
package com.example.chatapp.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }
    
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }
    
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
```

#### 5. Authentication Controller

```java
package com.example.chatapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.example.chatapp.dto.request.LoginRequest;
import com.example.chatapp.dto.request.RegisterRequest;
import com.example.chatapp.dto.response.JwtResponse;
import com.example.chatapp.model.User;
import com.example.chatapp.service.JwtService;
import com.example.chatapp.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtService.generateToken(userDetails);
        User user = userService.findByUsername(loginRequest.getUsername());
        
        return ResponseEntity.ok(new JwtResponse(
            jwt, 
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName()
        ));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        User user = userService.registerUser(
            registerRequest.getUsername(),
            registerRequest.getPassword(),
            registerRequest.getEmail(),
            registerRequest.getFullName()
        );
        
        return ResponseEntity.ok("User registered successfully!");
    }
}
```

#### 6. Chat Room Controller

```java
package com.example.chatapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.example.chatapp.dto.request.ChatRoomRequest;
import com.example.chatapp.dto.response.ChatRoomResponse;
import com.example.chatapp.model.ChatRoom;
import com.example.chatapp.model.User;
import com.example.chatapp.service.ChatRoomService;
import com.example.chatapp.service.UserService;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin
public class ChatRoomController {
    @Autowired
    private ChatRoomService chatRoomService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getAllRooms() {
        List<ChatRoomResponse> rooms = chatRoomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ChatRoomResponse> getRoomById(@PathVariable Long id) {
        ChatRoomResponse room = chatRoomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }
    
    @PostMapping
    public ResponseEntity<ChatRoomResponse> createRoom(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody ChatRoomRequest roomRequest
    ) {
        User user = userService.findByUsername(userDetails.getUsername());
        ChatRoom room = chatRoomService.createRoom(roomRequest.getName(), roomRequest.getDescription(), user);
        return ResponseEntity.ok(chatRoomService.convertToResponse(room));
    }
    
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinRoom(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        User user = userService.findByUsername(userDetails.getUsername());
        chatRoomService.joinRoom(id, user);
        return ResponseEntity.ok("Joined room successfully");
    }
    
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveRoom(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        User user = userService.findByUsername(userDetails.getUsername());
        chatRoomService.leaveRoom(id, user);
        return ResponseEntity.ok("Left room successfully");
    }
}
```

#### 7. Message Controller

```java
package com.example.chatapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.example.chatapp.dto.request.MessageRequest;
import com.example.chatapp.dto.response.MessageResponse;
import com.example.chatapp.model.Message;
import com.example.chatapp.model.User;
import com.example.chatapp.service.MessageService;
import com.example.chatapp.service.UserService;

@RestController
@CrossOrigin
public class MessageController {
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/api/rooms/{roomId}/messages")
    public ResponseEntity<List<MessageResponse>> getRoomMessages(@PathVariable Long roomId) {
        List<MessageResponse> messages = messageService.getMessagesByRoomId(roomId);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/api/messages")
    public ResponseEntity<MessageResponse> sendMessage(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody MessageRequest messageRequest
    ) {
        User user = userService.findByUsername(userDetails.getUsername());
        Message message = messageService.saveMessage(
            messageRequest.getContent(),
            user,
            messageRequest.getRoomId()
        );
        
        MessageResponse response = messageService.convertToResponse(message);
        
        // Send message to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/room/" + messageRequest.getRoomId(), response);
        
        return ResponseEntity.ok(response);
    }
}
```

#### 8. WebSocket Configuration

```java
package com.example.chatapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
```

### Running the Application

1. Start MySQL and run the SQL script (provided in the frontend page)
2. Build and run the Spring Boot application:

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

### Testing with Postman

1. Test the health endpoint: `GET http://localhost:8081/api/health`
2. Register a user:
   ```
   POST http://localhost:8081/api/auth/register
   Content-Type: application/json
   
   {
     "username": "testuser",
     "password": "password123",
     "email": "test@example.com",
     "fullName": "Test User"
   }
   ```

3. Login:
   ```
   POST http://localhost:8081/api/auth/login
   Content-Type: application/json
   
   {
     "username": "testuser",
     "password": "password123"
   }
   ```

4. Create a chat room (use the JWT token from login):
   ```
   POST http://localhost:8081/api/rooms
   Content-Type: application/json
   Authorization: Bearer YOUR_JWT_TOKEN
   
   {
     "name": "General",
     "description": "General discussion room"
   }
   ```

5. Send a message:
   ```
   POST http://localhost:8081/api/messages
   Content-Type: application/json
   Authorization: Bearer YOUR_JWT_TOKEN
   
   {
     "content": "Hello, world!",
     "roomId": 1
   }
   ```

6. Get messages from a room:
   ```
   GET http://localhost:8081/api/rooms/1/messages
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## MySQL Database

The database schema is provided in the frontend page. Run this schema in MySQL Workbench to set up your database.

