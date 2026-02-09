package com.it_incidents_backend.configuration;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.it_incidents_backend.entities.Category;
import com.it_incidents_backend.entities.Priority;
import com.it_incidents_backend.entities.Role;
import com.it_incidents_backend.entities.Ticket;
import com.it_incidents_backend.entities.TicketComment;
import com.it_incidents_backend.entities.TicketStatus;
import com.it_incidents_backend.entities.User;
import com.it_incidents_backend.repository.TicketCommentRepository;
import com.it_incidents_backend.repository.TicketRepository;
import com.it_incidents_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println("🔄 VÉRIFICATION ET ENRICHISSEMENT DE LA BASE DE DONNÉES...");

        // Create users
        if (!userRepository.existsByUsername("admin")) seedAdmin();
        if (!userRepository.existsByUsername("jean")) seedJean();
        if (!userRepository.existsByUsername("alice")) seedAlice();
        if (!userRepository.existsByUsername("bob")) seedBob();
        if (!userRepository.existsByUsername("charlie")) seedCharlie();
        if (!userRepository.existsByUsername("pending_user")) seedPendingUser();
        if (!userRepository.existsByUsername("expired_pass")) seedExpiredPasswordUser();
        if (!userRepository.existsByUsername("deleted_user")) seedDeletedUser();

        // Print summary of all users and credentials
        printUserSummary();

        System.out.println("✅ DATABASE PRÊTE AVEC DES DONNÉES RICHES !");
    }

    /**
     * Print a summary table of all users and their credentials
     */
    private void printUserSummary() {
        System.out.println("\n" + "=".repeat(100));
        System.out.println("📋 USER CREDENTIALS SUMMARY");
        System.out.println("=".repeat(100));
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "USERNAME", "PASSWORD", "EMAIL", "ROLE", "STATUS"));
        System.out.println("-".repeat(100));
        
        // Admin
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "admin", "Admin@2024Secure!", "admin@incidents.com", "ADMIN", "✅ Active"));
        
        // Regular users
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "jean", "Jean@2024Pass!", "jean@univ.fr", "USER", "✅ Active"));
        
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "alice", "Alice@2024Pass!", "alice@univ.fr", "USER", "✅ Active"));
        
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "bob", "Bob@2024Pass!", "bob@univ.fr", "USER", "✅ Active"));
        
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "charlie", "Charlie@2024Pass!", "charlie@univ.fr", "USER", "✅ Active"));
        
        // Special status users
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "pending_user", "Pending@2024Pass!", "pending@univ.fr", "USER", "⏳ Pending"));
        
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "expired_pass", "Expired@2024Pass!", "expired@univ.fr", "USER", "⚠️ Expired"));
        
        System.out.println(String.format("%-15s | %-25s | %-30s | %-10s | %s",
            "deleted_user", "Deleted@2024Pass!", "deleted@univ.fr", "USER", "🗑️ Deleted"));
        
        System.out.println("=".repeat(100));
        System.out.println("📊 TOTAL: 8 users | 25 tickets (4 PENDING, 5 IN_PROGRESS, 5 RESOLVED, 5 CLOSED, 4 CANCELLED)");
        System.out.println("=".repeat(100) + "\n");
    }

    // ---------- USERS ----------

    /**
     * Admin user with strong password
     * Username: admin
     * Password: Admin@2024Secure!
     */
    private void seedAdmin() {
        System.out.println("👤 Creating ADMIN user...");
        createUser(
            "admin",
            "admin@incidents.com",
            "Super",
            "Administrator",
            "+33 1 23 45 67 89",
            Role.ADMIN,
            "Admin@2024Secure!",
            true,  // approved
            LocalDateTime.now()  // password changed now
        );
    }

    /**
     * Regular approved user - Jean Dupont
     * Username: jean
     * Password: Jean@2024Pass!
     */
    private void seedJean() {
        System.out.println("👤 Creating user JEAN (approved)...");
        User jean = createUser(
            "jean",
            "jean@univ.fr",
            "Jean",
            "Dupont",
            "+33 6 12 34 56 78",
            Role.USER,
            "Jean@2024Pass!",
            true,  // approved
            LocalDateTime.now()
        );

        // Jean's tickets
        createTicket(jean, "INC-2025-0001", "Connexion WiFi instable Bâtiment B",
            "Le WiFi se déconnecte toutes les 10 minutes dans les salles B201-B205. " +
            "Cela perturbe les cours en ligne et les examens.",
            TicketStatus.PENDING, Priority.HIGH, Category.NETWORK, 2);

        createTicket(jean, "INC-2025-0002", "Demande de licence IntelliJ IDEA Ultimate",
            "J'ai besoin d'une licence étudiante pour le projet de développement Java avancé.",
            TicketStatus.RESOLVED, Priority.MEDIUM, Category.SOFTWARE, 15);

        createTicket(jean, "INC-2025-0003", "Problème d'accès au serveur de fichiers",
            "Impossible d'accéder au dossier partagé 'Projets_2025' depuis ce matin.",
            TicketStatus.CLOSED, Priority.MEDIUM, Category.ACCESS, 30);
    }

    /**
     * Regular approved user - Alice Martin
     * Username: alice
     * Password: Alice@2024Pass!
     */
    private void seedAlice() {
        System.out.println("👤 Creating user ALICE (approved)...");
        User alice = createUser(
            "alice",
            "alice@univ.fr",
            "Alice",
            "Martin",
            "+33 6 98 76 54 32",
            Role.USER,
            "Alice@2024Pass!",
            true,  // approved
            LocalDateTime.now()
        );

        // Alice's tickets
        createTicket(alice, "INC-2025-0004", "PC de bureau ne démarre plus",
            "L'écran reste noir au démarrage. Le voyant d'alimentation est allumé mais rien ne s'affiche.",
            TicketStatus.IN_PROGRESS, Priority.HIGH, Category.HARDWARE, 3);

        createTicket(alice, "INC-2025-0005", "Mise à jour Adobe Acrobat échouée",
            "L'installation de la dernière version d'Adobe Acrobat se bloque à 67%. " +
            "Impossible d'ouvrir les PDF annotés.",
            TicketStatus.IN_PROGRESS, Priority.MEDIUM, Category.SOFTWARE, 5);

        createTicket(alice, "INC-2025-0006", "Demande d'installation Python 3.12",
            "Besoin de Python 3.12 avec les bibliothèques NumPy, Pandas et Matplotlib pour le cours de data science.",
            TicketStatus.RESOLVED, Priority.LOW, Category.INSTALLATION, 20);

        createTicket(alice, "INC-2025-0007", "Email de confirmation non reçu",
            "Je n'ai pas reçu l'email de confirmation pour mon inscription au séminaire.",
            TicketStatus.CLOSED, Priority.LOW, Category.EMAIL, 25);
    }

    /**
     * Regular approved user - Bob Léponge
     * Username: bob
     * Password: Bob@2024Pass!
     */
    private void seedBob() {
        System.out.println("👤 Creating user BOB (approved)...");
        User bob = createUser(
            "bob",
            "bob@univ.fr",
            "Bob",
            "Léponge",
            "+33 7 11 22 33 44",
            Role.USER,
            "Bob@2024Pass!",
            true,  // approved
            LocalDateTime.now()
        );

        // Bob's tickets
        createTicket(bob, "INC-2025-0008", "SERVEUR MAIL PRINCIPAL EN PANNE",
            "URGENT : Le serveur mail principal ne répond plus depuis 14h30. " +
            "Plus personne ne peut envoyer ni recevoir d'emails. Impact sur toute l'université.",
            TicketStatus.IN_PROGRESS, Priority.CRITICAL, Category.EMAIL, 1);

        createTicket(bob, "INC-2025-0009", "Imprimante A3 bourrage papier récurrent",
            "L'imprimante fait un bruit étrange et se bloque systématiquement au bout de 3 pages. " +
            "Le tiroir papier semble déformé.",
            TicketStatus.PENDING, Priority.LOW, Category.HARDWARE, 4);

        createTicket(bob, "INC-2025-0010", "Compte bloqué après 3 tentatives",
            "Mon compte s'est bloqué après avoir oublié mon mot de passe. " +
            "J'ai essayé 3 fois et maintenant je ne peux plus me connecter.",
            TicketStatus.RESOLVED, Priority.HIGH, Category.ACCOUNT, 7);

        createTicket(bob, "INC-2025-0011", "VPN ne fonctionne pas depuis la maison",
            "Impossible de me connecter au VPN universitaire depuis mon domicile. " +
            "Message d'erreur: 'Connection timeout'.",
            TicketStatus.PENDING, Priority.MEDIUM, Category.NETWORK, 2);

        createTicket(bob, "INC-2025-0024", "Demande annulée - problème résolu",
            "Finalement j'ai trouvé la solution moi-même, plus besoin d'aide.",
            TicketStatus.CANCELLED, Priority.LOW, Category.OTHER, 6);
    }

    /**
     * Regular approved user - Charlie Winston
     * Username: charlie
     * Password: Charlie@2024Pass!
     */
    private void seedCharlie() {
        System.out.println("👤 Creating user CHARLIE (approved)...");
        User charlie = createUser(
            "charlie",
            "charlie@univ.fr",
            "Charlie",
            "Winston",
            "+33 6 55 44 33 22",
            Role.USER,
            "Charlie@2024Pass!",
            true,  // approved
            LocalDateTime.now()
        );

        // Charlie's tickets
        createTicket(charlie, "INC-2025-0012", "Besoin d'aide : Où est la salle informatique ?",
            "C'est ma première semaine et je ne trouve pas la salle informatique C304. " +
            "Quelqu'un peut m'aider ?",
            TicketStatus.CLOSED, Priority.LOW, Category.OTHER, 10);

        createTicket(charlie, "INC-2025-0013", "Mot de passe oublié (encore...)",
            "J'ai encore oublié mon mot de passe... C'est la 3ème fois ce mois-ci.",
            TicketStatus.RESOLVED, Priority.MEDIUM, Category.ACCOUNT, 8);

        createTicket(charlie, "INC-2025-0014", "Récupération données disque dur défaillant",
            "Mon disque dur externe a cessé de fonctionner. Il contient mon mémoire de Master (6 mois de travail). " +
            "Est-il possible de récupérer les données ?",
            TicketStatus.IN_PROGRESS, Priority.CRITICAL, Category.DATA_RECOVERY, 1);

        createTicket(charlie, "INC-2025-0015", "Antivirus bloque application pédagogique",
            "L'antivirus bloque le logiciel 'ChemLab 2024' nécessaire pour les TP de chimie.",
            TicketStatus.PENDING, Priority.MEDIUM, Category.SECURITY, 3);

        createTicket(charlie, "INC-2025-0025", "Demande formation annulée",
            "Je ne peux plus participer à la formation, merci d'annuler mon inscription.",
            TicketStatus.CANCELLED, Priority.LOW, Category.OTHER, 12);
    }

    /**
     * User pending approval
     * Username: pending_user
     * Password: Pending@2024Pass!
     */
    private void seedPendingUser() {
        System.out.println("👤 Creating PENDING user (not approved)...");
        User pendingUser = createUser(
            "pending_user",
            "pending@univ.fr",
            "Marie",
            "Nouveau",
            "+33 6 00 11 22 33",
            Role.USER,
            "Pending@2024Pass!",
            false,  // NOT approved - waiting for admin approval
            LocalDateTime.now()
        );

        // Pending user has no tickets (cannot create tickets until approved)
        System.out.println("⏳ User 'pending_user' is awaiting admin approval and cannot create tickets yet.");
    }

    /**
     * User with expired password (90+ days old)
     * Password last changed in September 2024 (more than 90 days ago)
     * Username: expired_pass
     * Password: Expired@2024Pass!
     */
    private void seedExpiredPasswordUser() {
        System.out.println("👤 Creating user with EXPIRED password...");
        User expiredUser = createUser(
            "expired_pass",
            "expired@univ.fr",
            "Thomas",
            "Ancien",
            "+33 6 77 88 99 00",
            Role.USER,
            "Expired@2024Pass!",
            true,  // approved
            LocalDateTime.of(2024, 9, 1, 10, 0)  // Password changed on Sept 1, 2024 (expired!)
        );

        // User with expired password has some old tickets
        createTicket(expiredUser, "INC-2025-0016", "Problème résolu il y a longtemps",
            "Ancien ticket créé avant l'expiration du mot de passe.",
            TicketStatus.CLOSED, Priority.LOW, Category.OTHER, 120);

        createTicket(expiredUser, "INC-2025-0017", "Ancien problème de connexion",
            "VPN qui ne marchait pas, maintenant résolu.",
            TicketStatus.RESOLVED, Priority.MEDIUM, Category.NETWORK, 95);

        System.out.println("⚠️ User 'expired_pass' has an EXPIRED password (changed on 2024-09-01, 90+ days ago)");
        System.out.println("   This user will be forced to change password on next login.");
    }

    /**
     * Deleted user (soft deleted)
     * Username: deleted_user
     * Password: Deleted@2024Pass!
     * This user was deleted by admin but their tickets remain for audit purposes
     */
    private void seedDeletedUser() {
        System.out.println("👤 Creating DELETED user (soft deleted)...");
        User deletedUser = createUser(
            "deleted_user",
            "deleted@univ.fr",
            "Sophie",
            "Supprimée",
            "+33 6 44 55 66 77",
            Role.USER,
            "Deleted@2024Pass!",
            true,  // was approved before deletion
            LocalDateTime.now().minusDays(60)
        );

        // Create tickets before deleting the user
        createTicket(deletedUser, "INC-2025-0021", "Demande avant départ",
            "J'ai besoin d'exporter mes données avant de quitter l'université.",
            TicketStatus.CLOSED, Priority.MEDIUM, Category.ACCOUNT, 35);

        createTicket(deletedUser, "INC-2025-0022", "Problème imprimante salle F103",
            "L'imprimante ne fonctionne pas correctement.",
            TicketStatus.CANCELLED, Priority.LOW, Category.HARDWARE, 40);

        createTicket(deletedUser, "INC-2025-0023", "Accès base de données",
            "Besoin d'accès à la base de données pour mon projet.",
            TicketStatus.CANCELLED, Priority.MEDIUM, Category.ACCESS, 38);

        // Soft delete the user
        deletedUser.softDelete("admin");
        userRepository.save(deletedUser);

        System.out.println("🗑️ User 'deleted_user' has been SOFT DELETED by admin");
        System.out.println("   User cannot login but their tickets remain visible for audit trail");
    }

    // ---------- ADDITIONAL REALISTIC TICKETS ----------

    /**
     * Create additional tickets to reach 20 total tickets with various scenarios
     */
    private void createAdditionalTickets() {
        User admin = userRepository.findByUsername("admin").orElseThrow();
        User jean = userRepository.findByUsername("jean").orElseThrow();
        User alice = userRepository.findByUsername("alice").orElseThrow();

        // Critical security incident
        createTicket(alice, "INC-2025-0018", "Tentative d'intrusion détectée sur mon compte",
            "J'ai reçu une notification de connexion depuis une adresse IP en Russie. " +
            "Je n'ai jamais voyagé là-bas. Mon compte a-t-il été compromis ?",
            TicketStatus.IN_PROGRESS, Priority.CRITICAL, Category.SECURITY, 0);

        // Hardware installation request
        createTicket(jean, "INC-2025-0019", "Demande installation écran supplémentaire",
            "Pour améliorer ma productivité, j'aimerais avoir un second écran sur mon poste de travail.",
            TicketStatus.PENDING, Priority.LOW, Category.INSTALLATION, 5);

        // Network issue
        createTicket(jean, "INC-2025-0020", "Débit internet très lent en salle D102",
            "La connexion est extrêmement lente (< 1 Mbps) alors que le WiFi affiche 4 barres. " +
            "Impossible de suivre les cours en visio.",
            TicketStatus.PENDING, Priority.HIGH, Category.NETWORK, 1);

        System.out.println("✅ 20 tickets créés avec différents statuts et scénarios");
    }

    // ---------- HELPER METHODS ----------

    /**
     * Create a user with specified parameters
     */
    private User createUser(
        String username,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Role role,
        String rawPassword,
        boolean isApproved,
        LocalDateTime passwordChangedAt
    ) {
        User user = User.builder()
            .username(username)
            .email(email)
            .password(passwordEncoder.encode(rawPassword))
            .firstName(firstName)
            .lastName(lastName)
            .phoneNumber(phoneNumber)
            .role(role)
            .enabled(true)
            .accountNonLocked(true)
            .isApproved(isApproved)
            .deleted(false)
            .failedLoginAttempts(0)
            .passwordChangedAt(passwordChangedAt)
            .lastLogin(LocalDateTime.now())
            .build();

        User savedUser = userRepository.save(user);
        
        System.out.println(String.format(
            "   ✓ User '%s' created | Role: %s | Approved: %s | Password expires: %s",
            username,
            role,
            isApproved ? "YES" : "NO",
            passwordChangedAt.plusDays(90).toLocalDate()
        ));

        return savedUser;
    }

    /**
     * Create a ticket with specified parameters
     */
    private void createTicket(
        User author,
        String ticketNumber,
        String title,
        String description,
        TicketStatus status,
        Priority priority,
        Category category,
        int daysAgo
    ) {
        LocalDateTime createdAt = LocalDateTime.now().minusDays(daysAgo);
        
        Ticket ticket = Ticket.builder()
            .ticketNumber(ticketNumber)
            .title(title)
            .description(description)
            .status(status)
            .priority(priority)
            .category(category)
            .createdBy(author)
            .lastUpdatedBy(status == TicketStatus.IN_PROGRESS ? "admin" : author.getUsername())
            .createdAt(createdAt)
            .build();

        // Set additional fields based on status
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(createdAt.plusDays(daysAgo / 2));
            ticket.setResolution("Problème résolu par l'équipe technique.");
        } else if (status == TicketStatus.CLOSED) {
            ticket.setResolvedAt(createdAt.plusDays(daysAgo / 2));
            ticket.setClosedAt(createdAt.plusDays(daysAgo / 2 + 1));
            ticket.setResolution("Problème résolu et confirmé par l'utilisateur.");
        } else if (status == TicketStatus.CANCELLED) {
            ticket.setClosedAt(createdAt.plusDays(daysAgo / 2));
            ticket.setLastUpdatedBy(author.getUsername());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Add comments to some tickets for realism
        if (status == TicketStatus.IN_PROGRESS || status == TicketStatus.RESOLVED) {
            addCommentToTicket(savedTicket, author, "Merci de votre retour. J'attends la résolution.", false, daysAgo - 1);
            
            User admin = userRepository.findByUsername("admin").orElse(null);
            if (admin != null) {
                addCommentToTicket(savedTicket, admin, "Pris en charge. Investigation en cours.", false, daysAgo - 1);
                addCommentToTicket(savedTicket, admin, "Note interne: Vérifier la configuration réseau.", true, daysAgo - 1);
            }
        }

        System.out.println(String.format(
            "   ✓ Ticket %s created | Status: %s | Priority: %s | Category: %s",
            ticketNumber, status, priority, category
        ));
    }

    /**
     * Add a comment to a ticket
     */
    private void addCommentToTicket(
        Ticket ticket,
        User author,
        String content,
        boolean isInternal,
        int daysAgo
    ) {
        TicketComment comment = TicketComment.builder()
            .ticket(ticket)
            .author(author)
            .content(content)
            .isInternal(isInternal)
            .createdAt(LocalDateTime.now().minusDays(daysAgo))
            .edited(false)
            .build();

        commentRepository.save(comment);
    }
}