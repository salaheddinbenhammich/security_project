package com.it_incidents_backend.configuration;

import com.it_incidents_backend.entities.*;
import com.it_incidents_backend.repository.TicketRepository;
import com.it_incidents_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println("🔄 VÉRIFICATION ET ENRICHISSEMENT DE LA BASE DE DONNÉES...");

        if (!userRepository.existsByUsername("admin")) seedAdmin();
        if (!userRepository.existsByUsername("user")) seedJean();
        if (!userRepository.existsByUsername("alice")) seedAlice();
        if (!userRepository.existsByUsername("bob")) seedBob();
        if (!userRepository.existsByUsername("charlie")) seedCharlie();

        System.out.println("✅ DATABASE PRÊTE AVEC DES DONNÉES RICHES !");
    }

    // ---------- USERS ----------

    private void seedAdmin() {
        createUser("admin", "admin@incidents.com", "Super", "Admin", Role.ADMIN, "Admin123!");
    }

    private void seedJean() {
        User jean = createUser("user", "jean@univ.fr", "Jean", "Dupont", Role.USER, "User123!");

        createTicket(jean,"INC-JEAN-01","Wifi instable Bâtiment B",
                "Ça coupe toutes les 10 minutes pendant les cours.",
                TicketStatus.PENDING,Priority.HIGH,Category.NETWORK,1);

        createTicket(jean,"INC-JEAN-02","Besoin licence IntelliJ",
                "Pour le projet Java.",
                TicketStatus.RESOLVED,Priority.MEDIUM,Category.SOFTWARE,10);
    }

    private void seedAlice() {
        User alice = createUser("alice","alice@univ.fr","Alice","Martin",Role.USER,"Alice123!");

        createTicket(alice,"INC-ALI-01","PC ne démarre plus",
                "L'écran reste noir.",
                TicketStatus.IN_PROGRESS,Priority.HIGH,Category.HARDWARE,2);

        createTicket(alice,"INC-ALI-02","Mise à jour Adobe échouée",
                "Impossible d’ouvrir les PDF.",
                TicketStatus.IN_PROGRESS,Priority.MEDIUM,Category.SOFTWARE,5);
    }

    private void seedBob() {
        User bob = createUser("bob","bob@univ.fr","Bob","Léponge",Role.USER,"Bob123!");

        createTicket(bob,"INC-BOB-01","SERVEUR MAIL EN PANNE",
                "Urgent : Plus personne ne reçoit de mails.",
                TicketStatus.PENDING,Priority.CRITICAL,Category.NETWORK,0);

        createTicket(bob,"INC-BOB-02","Imprimante bourrage papier",
                "Fait un bruit étrange.",
                TicketStatus.IN_PROGRESS,Priority.LOW,Category.HARDWARE,20);
    }

    private void seedCharlie() {
        User charlie = createUser("charlie","charlie@univ.fr","Charlie","Winston",Role.USER,"Charlie123!");

        createTicket(charlie,"INC-CHA-01","Où est la machine à café ?",
                "Je ne trouve pas la salle de pause.",
                TicketStatus.PENDING,Priority.LOW,Category.OTHER,3);

        createTicket(charlie,"INC-CHA-02","Mot de passe oublié",
                "Encore...",
                TicketStatus.PENDING,Priority.MEDIUM,Category.ACCESS,1);
    }

    // ---------- HELPERS ----------

    private User createUser(String username,String email,String first,String last,Role role,String rawPassword) {

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .firstName(first)
                .lastName(last)
                .role(role)
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .deleted(false)
                .failedLoginAttempts(0)
                .passwordChangedAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    private void createTicket(User author,String ref,String title,String desc,
                              TicketStatus status,Priority priority,Category category,int daysAgo) {

        Ticket t = Ticket.builder()
                .ticketNumber(ref)
                .title(title)
                .description(desc)
                .status(status)
                .priority(priority)
                .category(category)
                .createdBy(author)
                .lastUpdatedBy(status == TicketStatus.IN_PROGRESS ? "admin" : author.getUsername())
                .createdAt(LocalDateTime.now().minusDays(daysAgo))
                .build();

        ticketRepository.save(t);
    }
}
