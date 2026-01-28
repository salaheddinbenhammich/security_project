package com.it_incidents_backend.repository;


import com.it_incidents_backend.model.Incident;
import com.it_incidents_backend.model.IncidentStatus;
import com.it_incidents_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByCreatedBy(User user);
    List<Incident> findByAssignedTo(User user);
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findAllByOrderByCreatedAtDesc();
}