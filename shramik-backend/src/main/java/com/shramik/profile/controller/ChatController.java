package com.shramik.profile.controller;

import com.shramik.profile.dto.ChatMessageDto;
import com.shramik.profile.dto.ChatRoomSummaryDto;
import com.shramik.profile.model.ChatMessage;
import com.shramik.profile.model.Role;
import com.shramik.profile.model.User;
import com.shramik.profile.repository.ChatMessageRepository;
import com.shramik.profile.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageDto messageDto) {
        log.info("Received WebSocket chat message from [{}] to room [{}]", messageDto.getSenderId(), messageDto.getChatId());
        
        // Save to DB
        ChatMessage message = ChatMessage.builder()
                .chatId(messageDto.getChatId())
                .senderId(messageDto.getSenderId())
                .senderRole(Role.valueOf(messageDto.getSenderRole()))
                .message(messageDto.getMessage())
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();
                
        chatMessageRepository.save(message);
        
        // Fill details for mapping response
        messageDto.setId(message.getId());
        messageDto.setTimestamp(message.getTimestamp().format(DateTimeFormatter.ISO_DATE_TIME));
        
        // Dispatch message to the dynamic topic of the chat room
        messagingTemplate.convertAndSend("/topic/chat/" + messageDto.getChatId(), messageDto);
    }

    @GetMapping("/api/chat/messages/{chatId}")
    public List<ChatMessage> getChatHistory(@PathVariable String chatId) {
        log.info("Fetching message history for room [{}]", chatId);
        return chatMessageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }

    @GetMapping("/api/chat/rooms")
    public List<ChatRoomSummaryDto> getChatRooms(Principal principal) {
        String email = principal.getName();
        Optional<User> currentUserOpt = userRepository.findByEmail(email);
        if (currentUserOpt.isEmpty()) {
            return List.of();
        }

        String currentUserId = currentUserOpt.get().getId();

        Map<String, List<ChatMessage>> grouped = chatMessageRepository.findAll().stream()
                .filter(message -> isParticipant(message.getChatId(), currentUserId))
                .collect(Collectors.groupingBy(ChatMessage::getChatId, LinkedHashMap::new, Collectors.toList()));

        List<ChatRoomSummaryDto> rooms = new ArrayList<>();
        for (Map.Entry<String, List<ChatMessage>> entry : grouped.entrySet()) {
            List<ChatMessage> messages = entry.getValue();
            messages.sort(Comparator.comparing(ChatMessage::getTimestamp));
            ChatMessage latest = messages.get(messages.size() - 1);
            String otherUserId = resolveOtherParticipant(entry.getKey(), currentUserId);
            String otherUserName = resolveUserName(otherUserId);

            rooms.add(ChatRoomSummaryDto.builder()
                    .id(entry.getKey())
                    .name(otherUserName)
                    .userId(otherUserId)
                    .lastMessage(latest.getMessage())
                    .timestamp(latest.getTimestamp().format(DateTimeFormatter.ISO_DATE_TIME))
                    .senderRole(latest.getSenderRole().name())
                    .build());
        }

        rooms.sort(Comparator.comparing(ChatRoomSummaryDto::getTimestamp).reversed());
        return rooms;
    }

    private boolean isParticipant(String chatId, String currentUserId) {
        if (chatId == null || currentUserId == null) {
            return false;
        }

        if (chatId.equals(currentUserId)) {
            return true;
        }

        String[] parts = chatId.split("_");
        for (String part : parts) {
            if (currentUserId.equals(part)) {
                return true;
            }
        }

        return false;
    }

    private String resolveOtherParticipant(String chatId, String currentUserId) {
        if (chatId == null || currentUserId == null) {
            return null;
        }

        String[] parts = chatId.split("_");
        for (String part : parts) {
            if (!currentUserId.equals(part) && !part.isBlank()) {
                return part;
            }
        }

        return chatId.equals(currentUserId) ? currentUserId : chatId;
    }

    private String resolveUserName(String userId) {
        if (userId == null || userId.isBlank()) {
            return "Customer";
        }

        return userRepository.findById(userId)
                .map(User::getName)
                .filter(name -> !name.isBlank())
                .orElse("Customer");
    }
}
