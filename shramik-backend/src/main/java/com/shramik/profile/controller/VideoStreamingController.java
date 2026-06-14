package com.shramik.profile.controller;

import com.shramik.profile.service.VideoStreamingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
public class VideoStreamingController {

    @Autowired
    private VideoStreamingService streamingService;

    @Autowired
    private com.shramik.profile.repository.UserRepository userRepository;

    @Autowired
    private com.shramik.profile.repository.TechnicianRepository technicianRepository;

    @GetMapping("/api/video/stream/{filename}")
    public ResponseEntity<ResourceRegion> streamVideo(
            @PathVariable String filename,
            @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {

        log.info("Requested video streaming range for file: {}. Range: {}", filename, rangeHeader);
        Resource video = streamingService.loadFileAsResource(filename);
        
        List<HttpRange> ranges = (rangeHeader != null) ? HttpRange.parseRanges(rangeHeader) : Collections.emptyList();
        HttpRange range = ranges.isEmpty() ? null : ranges.get(0);
        ResourceRegion region = streamingService.getVideoRegion(filename, range);

        MediaType mediaType = MediaTypeFactory.getMediaType(video).orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .contentType(mediaType)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(region);
    }
    
    @PostMapping("/api/technicians/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        
        String email = principal.getName();
        com.shramik.profile.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        com.shramik.profile.model.Technician tech = technicianRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Technician profile not found"));

        String filename = streamingService.storeFile(file, "doc_" + tech.getId());
        // Map access path
        tech.setIdDocumentUrl("/api/video/stream/" + filename);
        tech.setVerificationStatus(com.shramik.profile.model.VerificationStatus.PENDING);
        technicianRepository.save(tech);
        
        return ResponseEntity.ok(Map.of("message", "Document uploaded successfully", "url", tech.getIdDocumentUrl()));
    }

    @PostMapping("/api/technicians/upload-video")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        
        String email = principal.getName();
        com.shramik.profile.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        com.shramik.profile.model.Technician tech = technicianRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Technician profile not found"));

        String filename = streamingService.storeFile(file, "video_" + tech.getId());
        tech.setVideoIntroUrl("/api/video/stream/" + filename);
        technicianRepository.save(tech);
        
        return ResponseEntity.ok(Map.of("message", "Video uploaded successfully", "url", tech.getVideoIntroUrl()));
    }
}
