package com.shramik.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomSummaryDto {
    private String id;
    private String name;
    private String userId;
    private String lastMessage;
    private String timestamp;
    private String senderRole;
}