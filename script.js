/**
 * SignVision Main Application Logic
 * Real-time camera processing, AR overlays, audio feedback, and dashcam recording
 */

// Global application state
const App = {
    // Video elements
    video: null,
    overlay: null,
    capture: null,
    
    // State management
    isRunning: false,
    isPaused: false,
    isRecording: false,
    
    // Configuration
    // Auto-detects API endpoint based on environment
    // In production (same domain): uses relative URL '/analyze'
    // In development (localhost or custom): uses configured endpoint
    config: {
        apiEndpoint: (() => {
            // If running on localhost, use localhost:8000
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'http://localhost:8000/analyze';
            }
            // Otherwise, use relative URL (same server in production)
            return '/analyze';
        })(),
        processingInterval: 1000, // ms between frame captures
        enableVoice: true,
        detectionSensitivity: 5,
        maxFPS: 15,
        recordDuration: 30000 // 30 seconds in ms
    },
    
    // Timing and performance
    lastProcessTime: 0,
    frameCount: 0,
    mediaStream: null,
    mediaRecorder: null,
    recordedChunks: [],
    
    // Speech and audio
    speechSynth: null,
    
    // Detection history
    lastDetections: [],
    deviceMotionData: null,
    
    // Service references
    storage: null,
    
    init() {
        console.log('SignVision initializing...');
        
        // Get DOM elements
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.capture = document.getElementById('capture');
        
        // Initialize Speech Synthesis API
        if ('speechSynthesis' in window) {
            this.speechSynth = window.speechSynthesis;
            console.log('Speech synthesis initialized');
        }
        
        // Initialize IndexedDB for dashcam storage
        this.initStorage();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Request camera permission on load
        this.requestCameraPermission();
        
        console.log('SignVision initialized');
    },
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startDetection());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('record-btn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        
        // Settings controls
        document.getElementById('voice-toggle').addEventListener('change', (e) => {
            this.config.enableVoice = e.target.checked;
        });
        
        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.config.detectionSensitivity = e.target.value;
            document.getElementById('sensitivity-value').textContent = e.target.value;
        });
        
        document.getElementById('processing-interval').addEventListener('change', (e) => {
            this.config.processingInterval = parseInt(e.target.value);
        });
        
        document.getElementById('api-endpoint').addEventListener('change', (e) => {
            this.config.apiEndpoint = e.target.value;
        });
        
        // Device motion for fall detection
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                this.handleDeviceMotion(e);
            });
        }
    },
    
    /**
     * Request camera access - specifically rear camera for iPhone
     */
    async requestCameraPermission() {
        try {
            // Request access to rear camera (environment facing)
            const constraints = {
                video: {
                    facingMode: 'environment', // Rear camera
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.mediaStream = stream;
            
            // Assign stream to video element
            this.video.srcObject = stream;
            
            // Set canvas dimensions
            this.overlay.width = window.innerWidth;
            this.overlay.height = window.innerHeight;
            this.capture.width = window.innerWidth;
            this.capture.height = window.innerHeight;
            
            this.updateCameraStatus(true);
            console.log('Camera access granted');
            
            // Set up initial video metadata
            this.video.addEventListener('loadedmetadata', () => {
                console.log(`Video resolution: ${this.video.videoWidth}x${this.video.videoHeight}`);
            });
            
        } catch (error) {
            console.error('Camera access denied:', error);
            this.showError('Camera access denied. Please allow camera permissions.');
            this.updateCameraStatus(false);
        }
    },
    
    /**
     * Start the real-time detection loop
     */
    async startDetection() {
        if (!this.video.srcObject) {
            await this.requestCameraPermission();
        }
        
        if (!this.video.srcObject) {
            this.showError('Camera not available');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        
        // Update UI
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('loading').classList.add('visible');
        
        // Start detection loop
        this.detectionLoop();
        
        console.log('Detection started');
    },
    
    /**
     * Main detection loop - captures frames and processes them
     */
    async detectionLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        const now = Date.now();
        const elapsed = now - this.lastProcessTime;
        
        // Throttle to respect maxFPS and interval
        if (elapsed < this.config.processingInterval) {
            requestAnimationFrame(() => this.detectionLoop());
            return;
        }
        
        this.lastProcessTime = now;
        this.frameCount++;
        
        // Capture frame
        this.captureFrame()
            .then(blob => {
                if (blob) {
                    this.processFrame(blob);
                }
            })
            .catch(err => {
                console.error('Frame capture error:', err);
            });
        
        // Continue loop
        requestAnimationFrame(() => this.detectionLoop());
    },
    
    /**
     * Capture current video frame to canvas and compress
     */
    captureFrame() {
        return new Promise((resolve) => {
            const ctx = this.capture.getContext('2d');
            
            // Draw current video frame to canvas
            ctx.drawImage(
                this.video,
                0, 0,
                this.capture.width,
                this.capture.height
            );
            
            // Convert to blob with compression
            this.capture.toBlob((blob) => {
                resolve(blob);
            }, 'image/webp', 0.6); // 60% quality for faster upload
        });
    },
    
    /**
     * Send frame to backend API for AI analysis
     */
    async processFrame(blob) {
        const formData = new FormData();
        formData.append('file', blob, 'frame.webp');
        
        try {
            this.updateConnectionStatus(false);
            
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.updateConnectionStatus(true);
            
            // Process detections
            if (data.detections && data.detections.length > 0) {
                this.handleDetections(data.detections);
            } else {
                this.clearOverlay();
            }
            
            // Log processing time
            if (data.processing_time_ms) {
                console.log(`Frame processed in ${data.processing_time_ms.toFixed(0)}ms`);
            }
            
        } catch (error) {
            console.error('API request failed:', error);
            this.updateConnectionStatus(false);
            this.showError('Connection error');
            
            // Retry with exponential backoff
            setTimeout(() => {
                if (this.isRunning) {
                    this.detectionLoop();
                }
            }, 2000);
        }
    },
    
    /**
     * Handle detection results - draw overlays and provide audio feedback
     */
    handleDetections(detections) {
        this.lastDetections = detections;
        
        // Clear previous overlay
        this.clearOverlay();
        
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        // Draw each detection
        detections.forEach(detection => {
            this.drawDetection(ctx, detection);
        });
        
        // Generate audio feedback for important detections
        if (this.config.enableVoice && detections.length > 0) {
            this.generateAudioFeedback(detections);
        }
        
        // Update detection panel
        this.updateDetectionPanel(detections);
    },
    
    /**
     * Draw a detection bounding box on the overlay canvas
     */
    drawDetection(ctx, detection) {
        const [x, y, w, h] = detection.bbox;
        
        // Map normalized coordinates to canvas dimensions
        const xCoord = x * this.overlay.width;
        const yCoord = y * this.overlay.height;
        const width = w * this.overlay.width;
        const height = h * this.overlay.height;
        
        // Draw bounding box
        const color = this.getColorForLabel(detection.color);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.strokeRect(xCoord, yCoord, width, height);
        
        // Draw label background
        ctx.fillStyle = color;
        ctx.fillRect(xCoord, yCoord - 25, width, 25);
        
        // Draw label text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(detection.label, xCoord + 5, yCoord - 8);
    },
    
    /**
     * Get color for detection type
     */
    getColorForLabel(colorName) {
        const colors = {
            'red': '#f44336',
            'yellow': '#ffeb3b',
            'green': '#4caf50',
            'blue': '#2196f3',
            'orange': '#ff9800'
        };
        return colors[colorName] || colors['yellow'];
    },
    
    /**
     * Clear the overlay canvas
     */
    clearOverlay() {
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    },
    
    /**
     * Generate audio feedback using Web Speech API
     */
    generateAudioFeedback(detections) {
        if (!this.speechSynth) return;
        
        // Only speak for important/high priority detections
        const importantDetections = detections.filter(d => {
            const label = d.label.toLowerCase();
            return label.includes('stop') || label.includes('no_walk') || 
                   label.includes('hazard') || label.includes('danger');
        });
        
        if (importantDetections.length > 0) {
            const detection = importantDetections[0]; // Priority detection
            const message = this.getFeedbackMessage(detection.label);
            
            // Cancel any ongoing speech
            this.speechSynth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            this.speechSynth.speak(utterance);
            
            // Update audio status
            this.showAudioStatus(message);
        }
    },
    
    /**
     * Convert detection label to human-friendly feedback message
     */
    getFeedbackMessage(label) {
        const messages = {
            'stop_sign': 'Stop sign detected ahead. Stop.',
            'no_walk': 'Do not walk signal. Stay on curb.',
            'crosswalk': 'Crosswalk detected. Proceed with caution.',
            'walk': 'Walk signal. Safe to cross.',
            'hazard': 'Hazard detected. Caution advised.',
            'traffic_light_red': 'Red light. Stop.',
            'speed_limit': 'Speed limit sign detected.',
        };
        
        const lowerLabel = label.toLowerCase();
        for (const key in messages) {
            if (lowerLabel.includes(key) || lowerLabel.includes(key.replace('_', ' '))) {
                return messages[key];
            }
        }
        
        return `${label.replace(/_/g, ' ')} detected.`;
    },
    
    /**
     * Update the detection results panel
     */
    updateDetectionPanel(detections) {
        const panel = document.getElementById('detection-panel');
        const list = document.getElementById('detection-list');
        
        if (!detections || detections.length === 0) {
            panel.classList.remove('visible');
            return;
        }
        
        panel.classList.add('visible');
        list.innerHTML = '';
        
        detections.forEach(detection => {
            const item = document.createElement('div');
            item.className = 'detection-item';
            item.innerHTML = `
                <span class="label">${detection.label}</span>
                <span class="confidence">${(detection.confidence * 100).toFixed(0)}%</span>
            `;
            list.appendChild(item);
        });
    },
    
    /**
     * Show audio status message
     */
    showAudioStatus(message) {
        const status = document.getElementById('audio-status');
        const text = document.getElementById('audio-status-text');
        text.textContent = `🔊 ${message}`;
        status.classList.add('visible');
        
        setTimeout(() => {
            status.classList.remove('visible');
        }, 3000);
    },
    
    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        const btn = document.getElementById('pause-btn');
        const icon = btn.querySelector('.icon');
        const text = btn.querySelector('span:last-child');
        
        if (this.isPaused) {
            icon.textContent = '▶';
            text.textContent = 'Resume';
            document.getElementById('loading').classList.remove('visible');
        } else {
            icon.textContent = '⏸';
            text.textContent = 'Pause';
            document.getElementById('loading').classList.add('visible');
        }
    },
    
    /**
     * Toggle recording (dashcam)
     */
    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    },
    
    /**
     * Start dashcam recording using MediaRecorder API
     */
    async startRecording() {
        if (!this.mediaStream) {
            this.showError('No camera stream available');
            return;
        }
        
        try {
            const options = {
                mimeType: 'video/webm',
                videoBitsPerSecond: 2500000
            };
            
            this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            document.getElementById('record-text').textContent = 'Stop';
            document.getElementById('record-btn').classList.add('recording');
            
            console.log('Recording started');
            
            // Auto-stop after duration limit
            setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            }, this.config.recordDuration);
            
        } catch (error) {
            console.error('Recording failed:', error);
            this.showError('Recording not supported');
        }
    },
    
    /**
     * Stop recording and save
     */
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update UI
            document.getElementById('record-text').textContent = 'Record';
            document.getElementById('record-btn').classList.remove('recording');
        }
    },
    
    /**
     * Save recording to IndexedDB
     */
    async saveRecording() {
        if (this.recordedChunks.length === 0) return;
        
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const timestamp = new Date().toISOString();
        const filename = `signvision_${timestamp}.webm`;
        
        // Save to IndexedDB
        if (this.storage) {
            try {
                const transaction = this.storage.transaction(['recordings'], 'readwrite');
                const store = transaction.objectStore('recordings');
                await store.add({ blob, filename, timestamp });
                console.log('Recording saved to IndexedDB:', filename);
            } catch (error) {
                console.error('Failed to save recording:', error);
            }
        }
        
        // Also offer download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        // Don't auto-download, just log
        console.log('Recording ready for download:', url);
        
        this.recordedChunks = [];
    },
    
    /**
     * Handle device motion for fall detection
     */
    handleDeviceMotion(event) {
        const acceleration = event.acceleration;
        if (!acceleration) return;
        
        // Calculate magnitude of acceleration
        const magnitude = Math.sqrt(
            acceleration.x ** 2 + 
            acceleration.y ** 2 + 
            acceleration.z ** 2
        );
        
        // Detect sudden changes (possible fall)
        if (magnitude > 15) {
            console.warn('Possible fall detected! Magnitude:', magnitude);
            
            // Pause detection
            if (this.isRunning && !this.isPaused) {
                this.togglePause();
                this.showError('Fall detected! Paused for safety.');
            }
            
            // Start emergency recording if recording is enabled
            if (!this.isRecording) {
                this.startRecording();
            }
        }
        
        this.deviceMotionData = { magnitude, timestamp: Date.now() };
    },
    
    /**
     * Initialize IndexedDB storage for dashcam recordings
     */
    initStorage() {
        if (!('indexedDB' in window)) {
            console.warn('IndexedDB not supported');
            return;
        }
        
        const request = indexedDB.open('SignVisionDB', 1);
        
        request.onerror = (event) => {
            console.error('IndexedDB error:', event);
        };
        
        request.onsuccess = (event) => {
            this.storage = event.target.result;
            console.log('IndexedDB initialized');
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('recordings')) {
                db.createObjectStore('recordings', { keyPath: 'timestamp' });
            }
        };
    },
    
    /**
     * Update connection status indicator
     */
    updateConnectionStatus(connected) {
        const status = document.getElementById('connection-status');
        status.classList.toggle('connected', connected);
        status.classList.toggle('disconnected', !connected);
    },
    
    /**
     * Update camera status indicator
     */
    updateCameraStatus(active) {
        const status = document.getElementById('camera-status');
        status.textContent = active ? '📷' : '📷❌';
    },
    
    /**
     * Show error message
     */
    showError(message) {
        const toast = document.getElementById('error-toast');
        const errorMessage = document.getElementById('error-message');
        
        errorMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },
    
    /**
     * Open settings modal
     */
    openSettings() {
        document.getElementById('settings-modal').classList.add('visible');
    },
    
    /**
     * Close settings modal
     */
    closeSettings() {
        document.getElementById('settings-modal').classList.remove('visible');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && App.isRunning) {
        // Pause when app goes to background
        App.togglePause();
    }
});

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('Connection restored');
    App.updateConnectionStatus(true);
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    App.updateConnectionStatus(false);
});

