package com.it_incidents_backend.service;

import com.it_incidents_backend.dto.IncidentRequest;
import com.it_incidents_backend.dto.IncidentResponse;
import com.it_incidents_backend.dto.UserSummary;
import com.it_incidents_backend.model.*;
import com.it_incidents_backend.repository.IncidentRepository;
import com.it_incidents_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidentService {
    
    @Autowired
    private IncidentRepository incidentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public IncidentResponse createIncident(IncidentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setPriority(request.getPriority());
        incident.setCategory(request.getCategory());
        incident.setStatus(IncidentStatus.OPEN);
        incident.setCreatedBy(user);
        
        Incident savedIncident = incidentRepository.save(incident);
        return mapToResponse(savedIncident);
    }
    
    public List<IncidentResponse> getAllIncidentsPublic() {
        return incidentRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapToPublicResponse)
            .collect(Collectors.toList());
    }
    
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<IncidentResponse> getMyIncidents() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return incidentRepository.findByCreatedBy(user).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<IncidentResponse> getAssignedIncidents() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return incidentRepository.findByAssignedTo(user).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public IncidentResponse getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
        return mapToResponse(incident);
    }
    
    public IncidentResponse updateIncidentStatus(Long id, IncidentStatus status, String resolution) {
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        incident.setStatus(status);
        if (resolution != null) {
            incident.setResolution(resolution);
        }
        if (status == IncidentStatus.RESOLVED || status == IncidentStatus.CLOSED) {
            incident.setResolvedAt(LocalDateTime.now());
        }
        
        Incident updatedIncident = incidentRepository.save(incident);
        return mapToResponse(updatedIncident);
    }
    
    public IncidentResponse assignIncident(Long id, Long technicianId) {
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        User technician = userRepository.findById(technicianId)
            .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        incident.setAssignedTo(technician);
        if (incident.getStatus() == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.IN_PROGRESS);
        }
        
        Incident updatedIncident = incidentRepository.save(incident);
        return mapToResponse(updatedIncident);
    }
    
    public void deleteIncident(Long id) {
        incidentRepository.deleteById(id);
    }
    
    private IncidentResponse mapToResponse(Incident incident) {
        IncidentResponse response = new IncidentResponse();
        response.setId(incident.getId());
        response.setTitle(incident.getTitle());
        response.setDescription(incident.getDescription());
        response.setStatus(incident.getStatus());
        response.setPriority(incident.getPriority());
        response.setCategory(incident.getCategory());
        response.setResolution(incident.getResolution());
        response.setCreatedAt(incident.getCreatedAt());
        response.setUpdatedAt(incident.getUpdatedAt());
        response.setResolvedAt(incident.getResolvedAt());
        
        if (incident.getCreatedBy() != null) {
            response.setCreatedBy(new UserSummary(
                incident.getCreatedBy().getId(),
                incident.getCreatedBy().getFullName(),
                incident.getCreatedBy().getEmail()
            ));
        }
        
        if (incident.getAssignedTo() != null) {
            response.setAssignedTo(new UserSummary(
                incident.getAssignedTo().getId(),
                incident.getAssignedTo().getFullName(),
                incident.getAssignedTo().getEmail()
            ));
        }
        
        return response;
    }
    
    private IncidentResponse mapToPublicResponse(Incident incident) {
        IncidentResponse response = new IncidentResponse();
        response.setId(incident.getId());
        response.setTitle(incident.getTitle());
        response.setStatus(incident.getStatus());
        response.setPriority(incident.getPriority());
        response.setCategory(incident.getCategory());
        response.setCreatedAt(incident.getCreatedAt());
        return response;
    }
}
