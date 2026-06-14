package com.shramik.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String id;
    private String chatId;
    private String senderId;
    private String senderRole;
    private String message;
    private String timestamp;
    private boolean read;
}
