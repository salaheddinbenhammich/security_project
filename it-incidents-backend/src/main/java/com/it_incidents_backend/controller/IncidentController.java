package com.it_incidents_backend.controller;


import com.it_incidents_backend.dto.IncidentRequest;
import com.it_incidents_backend.dto.IncidentResponse;
import com.it_incidents_backend.model.IncidentStatus;
import com.it_incidents_backend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentController {
    
    @Autowired
    private IncidentService incidentService;
    
    @GetMapping("/public")
    public ResponseEntity<List<IncidentResponse>> getAllIncidentsPublic() {
        return ResponseEntity.ok(incidentService.getAllIncidentsPublic());
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<IncidentResponse> createIncident(@Valid @RequestBody IncidentRequest request) {
        return ResponseEntity.ok(incidentService.createIncident(request));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<IncidentResponse>> getMyIncidents() {
        return ResponseEntity.ok(incidentService.getMyIncidents());
    }
    
    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<IncidentResponse>> getAssignedIncidents() {
        return ResponseEntity.ok(incidentService.getAssignedIncidents());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<IncidentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam IncidentStatus status,
            @RequestParam(required = false) String resolution) {
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, status, resolution));
    }
    
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<IncidentResponse> assignIncident(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(incidentService.assignIncident(id, technicianId));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}
