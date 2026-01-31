package com.it_incidents_backend.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmResolutionRequest {

    @NotNull(message = "Confirmation is required")
    private Boolean confirmed; // true = close ticket, false = reopen

    private String comment; // Optional: user can add a comment when confirming/rejecting
}