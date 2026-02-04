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
    public void run(String... args) throws Exception {
        System.out.println("🔄 VÉRIFICATION ET ENRICHISSEMENT DE LA BASE DE DONNÉES...");

        // 1. Admin
        if (!userRepository.existsByUsername("admin")) seedAdmin();

        // 2. Jean (User standard)
        if (!userRepository.existsByUsername("user")) seedJean();

        // 3. Alice (Tickets En Cours & Réseau)
        if (!userRepository.existsByUsername("alice")) seedAlice();

        // 4. Bob (Tickets Critiques & Matériel)
        if (!userRepository.existsByUsername("bob")) seedBob();

        // 5. Charlie (Nouveau ! Stagiaire avec des problèmes divers)
        if (!userRepository.existsByUsername("charlie")) seedCharlie();
        
        System.out.println("✅ DATABASE PRÊTE AVEC DES DONNÉES RICHES !");
    }

    // --- CRÉATION DES UTILISATEURS ET TICKETS ---

    private void seedAdmin() {
        createUser("admin", "admin@incidents.com", "Super", "Admin", Role.ADMIN);
    }

    private void seedJean() {
        User jean = createUser("user", "jean@univ.fr", "Jean", "Dupont", Role.USER);
        
        // Jean a des problèmes classiques
        createTicket(jean, "INC-JEAN-01", "Wifi instable Bâtiment B", 
                "Ça coupe toutes les 10 minutes pendant les cours.", 
                TicketStatus.PENDING, Priority.HIGH, Category.NETWORK, 1);
                
        createTicket(jean, "INC-JEAN-02", "Besoin licence IntelliJ", 
                "Pour le projet Java.", 
                TicketStatus.RESOLVED, Priority.MEDIUM, Category.SOFTWARE, 10);
    }

    private void seedAlice() {
        User alice = createUser("alice", "alice@univ.fr", "Alice", "Martin", Role.USER);

        // --- ALICE A BEAUCOUP DE "EN COURS" ---
        
        // Ticket 1 : En cours (Haute priorité)
        createTicket(alice, "INC-ALI-01", "PC ne démarre plus (Salle 104)", 
                "L'écran reste noir, le voyant clignote orange.", 
                TicketStatus.IN_PROGRESS, Priority.HIGH, Category.HARDWARE, 2);

        // Ticket 2 : En cours (Moyenne priorité)
        createTicket(alice, "INC-ALI-02", "Mise à jour Adobe échouée", 
                "Je ne peux plus ouvrir les PDF.", 
                TicketStatus.IN_PROGRESS, Priority.MEDIUM, Category.SOFTWARE, 5);
    }

    private void seedBob() {
        User bob = createUser("bob", "bob@univ.fr", "Bob", "Léponge", Role.USER);

        // --- BOB A DES TICKETS CRITIQUES ---

        // Ticket Critique (A traiter d'urgence)
        createTicket(bob, "INC-BOB-01", "SERVEUR MAIL EN PANNE", 
                "Urgent : Plus personne ne reçoit de mails dans le département Info !", 
                TicketStatus.PENDING, Priority.CRITICAL, Category.NETWORK, 0);

        // Ticket En cours (Vieux ticket)
        createTicket(bob, "INC-BOB-02", "Imprimante bourrage papier", 
                "L'imprimante du couloir fait un bruit étrange.", 
                TicketStatus.IN_PROGRESS, Priority.LOW, Category.HARDWARE, 20);
    }

    private void seedCharlie() {
        User charlie = createUser("charlie", "charlie@univ.fr", "Charlie", "Winston", Role.USER);

        // Charlie est le stagiaire, il pose des questions bizarres
        createTicket(charlie, "INC-CHA-01", "Où est la machine à café ?", 
                "Je ne trouve pas la salle de pause au 3ème étage.", 
                TicketStatus.PENDING, Priority.LOW, Category.OTHER, 3);
        
        createTicket(charlie, "INC-CHA-02", "Mot de passe oublié (Encore)", 
                "Désolé, j'ai perdu mon post-it...", 
                TicketStatus.PENDING, Priority.MEDIUM, Category.ACCESS, 1);
    }

    // --- MÉTHODES UTILITAIRES (POUR ÉVITER DE RÉPÉTER LE CODE) ---

    private User createUser(String username, String email, String prenom, String nom, Role role) {
        System.out.println("👤 Création user: " + username);
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(username.equals("admin") ? "admin123" : "user123"))
                .firstName(prenom)
                .lastName(nom)
                .role(role)
                .enabled(true).accountNonLocked(true).credentialsNonExpired(true)
                .build();
        return userRepository.save(user);
    }

    private void createTicket(User author, String ref, String title, String desc, 
                              TicketStatus status, Priority priority, Category category, int daysAgo) {
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