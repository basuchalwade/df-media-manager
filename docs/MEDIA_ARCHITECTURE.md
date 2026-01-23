
# Enterprise Media Processing Pipeline Architecture

This document outlines the scalable media ingestion, processing, and delivery pipeline for ContentCaster.

## 🏗️ High-Level Architecture

The system uses an event-driven architecture to decouple upload ingestion from heavy processing tasks (transcoding, AI analysis).

```mermaid
graph TD
    Client[Web Client]
    API[API Gateway]
    Auth[Auth Service]
    S3_Raw[Object Storage (Raw Bucket)]
    S3_Processed[Object Storage (Public Bucket)]
    Queue[Message Queue (Redis/BullMQ)]
    Worker[Media Processing Worker]
    DB[(PostgreSQL)]
    CDN[CloudFront / CDN]

    %% Upload Flow
    Client -- 1. Request Signed URL --> API
    API -- 2. Authenticate --> Auth
    API -- 3. Return Upload URL --> Client
    Client -- 4. Upload File (PUT) --> S3_Raw
    S3_Raw -- 5. S3 Event Notification --> Queue

    %% Processing Flow
    Queue -- 6. Consume Job --> Worker
    Worker -- 7. Fetch File --> S3_Raw
    Worker -- 8a. Generate Thumbnail --> Worker
    Worker -- 8b. Transcode (FFmpeg) --> Worker
    Worker -- 8c. AI Safety Scan --> Worker
    Worker -- 9. Upload Optimized Assets --> S3_Processed
    Worker -- 10. Update Status --> DB

    %% Delivery Flow
    Client -- 11. Request Asset --> CDN
    CDN -- 12. Fetch Optimized Asset --> S3_Processed
```

---

## 🔄 Lifecycle Stages

| Stage | Status | Description |
| :--- | :--- | :--- |
| **1. Ingestion** | `uploading` | Client uploads directly to S3 via pre-signed URL. Low latency. |
| **2. Queued** | `queued` | S3 event trigger pushes job to Redis queue. |
| **3. Processing** | `processing` | Worker performs CPU-intensive tasks (FFmpeg transcoding, resizing). |
| **4. Analysis** | `analyzing` | (Optional) AI checks for safety, copyright, and metadata extraction. |
| **5. Ready** | `ready` | Optimized assets are moved to public bucket/CDN. DB updated. |
| **Error** | `failed` | Processing failed (corrupt file, virus detected). |

---

## ⚙️ Processing Logic (Worker)

### Image Processor
- **Library**: `sharp` or `imagemagick`
- **Outputs**:
  - `thumbnail`: 300x300 (WebP, Quality 80)
  - `preview`: 1080p max width (JPEG/WebP)
  - `original`: Preserved in Cold Storage (Glacier) if needed.
- **Metadata**: Extract EXIF, Color Palette, Dimensions.

### Video Processor
- **Library**: `ffmpeg`
- **Outputs**:
  - `thumbnail`: Frame at 1s or 50% duration.
  - `preview`: 720p, CRF 28 (Low bitrate for fast UI loading).
  - `stream`: H.264/AAC, `moov atom` at start (Fast Start) for streaming.
- **Validation**: Check duration limits, audio track presence.

---

## ☁️ Storage & CDN Strategy

### Bucket Structure
```text
/
├── raw/
│   └── {org_id}/{upload_id}.{ext}  (Private, Retention Policy: 7 days)
└── public/
    └── {org_id}/
        ├── {asset_id}_thumb.webp
        ├── {asset_id}_preview.mp4
        └── {asset_id}_master.mp4
```

### CDN Configuration (CloudFront/Cloudflare)
- **Caching**:
  - Images: 1 Year (`Cache-Control: public, max-age=31536000`)
  - Video: 1 Year
- **Streaming Support**:
  - Must support `Range` requests (HTTP 206) for video scrubbing.
- **CORS**:
  - `Access-Control-Allow-Origin`: https://app.contentcaster.com

---

## 🔐 Security & Governance

1.  **Signed URLs**: Uploads are restricted to specific paths and time windows (e.g., 15 mins).
2.  **MIME Validation**: Magic number checks on the worker side to prevent extension spoofing.
3.  **Virus Scanning**: ClamAV integration in the pipeline before processing.
4.  **Quotas**: Check Organization storage limits before generating Signed URL.
