import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import axios from "../config/axios";
import { Scan as ScanIcon, X, CheckCircle, AlertCircle, ChevronLeft, RotateCcw, Mail } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/toast.context";


const Scan = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [found, setFound] = useState(false);
    const isProcessingRef = useRef(false);
    const [scanResult, setScanResult] = useState(null);
    const [recentEntries, setRecentEntries] = useState([]);
    const { addToast } = useToast();

    // Camera State
    const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment"
    const [showDebug, setShowDebug] = useState(false);
    const [lastScannedImage, setLastScannedImage] = useState(null);

    const [validationKeywords, setValidationKeywords] = useState([]);
    const [rollNoLength, setRollNoLength] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [hideArrivals, setHideArrivals] = useState(false);
    const [debugText, setDebugText] = useState("");
    const [sendingReminders, setSendingReminders] = useState(false);
    const [validRollNumbers, setValidRollNumbers] = useState([]);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [orgName, setOrgName] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const scanMemoryRef = useRef({
        keyword: { value: false, timestamp: 0 },
        rollNo: { value: null, timestamp: 0 },
        name: { value: false, timestamp: 0 }
    });

    const isRecent = (timestamp) => {
        return Date.now() - timestamp < 5000; // 5 seconds window
    };

    const resetMemory = () => {
        scanMemoryRef.current = {
            keyword: { value: false, timestamp: 0 },
            rollNo: { value: null, timestamp: 0 },
            name: { value: false, timestamp: 0 }
        };
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };


    const navigate = useNavigate();


    // Check Session & Fetch Data
    useEffect(() => {
        // Scroll to top when page loads
        window.scrollTo(0, 0);

        const sessionId = localStorage.getItem("portal-session-id");
        const orgId = localStorage.getItem("current-org-id");
        if (!sessionId || !orgId) {
            navigate("/");
            return;
        }
        fetchRecentEntries();
        fetchOrgDetails(orgId);
        fetchValidRollNumbers();
        // Do NOT auto-start camera
    }, [navigate]);

    const fetchOrgDetails = async (orgId) => {
        try {
            const res = await axios.get(`/api/organizations/${orgId}`);
            setValidationKeywords(res.data.validationKeywords || []);
            setRollNoLength(res.data.rollNoLength || 5);
            setOrgName(res.data.name || "");
        } catch (err) {
            console.error("Failed to fetch organization details", err);
            addToast("Failed to load settings", "error");
        }
    };

    const fetchValidRollNumbers = async () => {
        try {
            const res = await axios.get('/api/students/roll-numbers');
            setValidRollNumbers(res.data);
            console.log(`Loaded ${res.data.length} students with roll numbers and names`);
        } catch (err) {
            console.error("Failed to fetch roll numbers", err);
            addToast("Failed to load student list", "error");
        }
    };

    const fetchRecentEntries = async () => {
        try {
            setLoadingEntries(true);
            const res = await axios.get('/api/entries?date=today&limit=100');
            setRecentEntries(res.data);
        } catch (err) {
            console.error("Failed to fetch recent entries", err);
        } finally {
            setLoadingEntries(false);
        }
    };

    // Real-time polling for new entries
    useEffect(() => {
        // Poll every 5 seconds when page is visible
        const pollInterval = setInterval(() => {
            // Only poll if page is visible
            if (document.visibilityState === 'visible') {
                fetchRecentEntries();
            }
        }, 5000); // 5 seconds

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, []);

    const handleSendReminders = async () => {
        const unreturnedCount = recentEntries.filter(e => e.status === 'Out').length;

        if (unreturnedCount === 0) {
            addToast('No unreturned students found for today.', 'info');
            return;
        }

        if (!confirm(`Send reminder emails to ${unreturnedCount} student(s) who haven't returned yet today?`)) {
            return;
        }

        setSendingReminders(true);
        try {
            const res = await axios.post('/api/entries/send-reminders');
            addToast(`${res.data.message}`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to send reminders', 'error');
        } finally {
            setSendingReminders(false);
        }
    };

    // OCR Logic
    const workerRef = useRef(null);
    const [isWorkerReady, setIsWorkerReady] = useState(false);

    useEffect(() => {
        const initWorker = async () => {
            try {
                const worker = await Tesseract.createWorker("eng");
                workerRef.current = worker;
                setIsWorkerReady(true);
            } catch (err) {
                console.error("Failed to initialize Tesseract worker:", err);
                addToast("OCR Initialization Failed", "error");
            }
        };
        initWorker();

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    // Helper function to generate 4-character substrings from a name
    const generate4CharSubstrings = (name) => {
        const substrings = [];
        const cleanName = name.replace(/\s+/g, ''); // Remove spaces
        for (let i = 0; i <= cleanName.length - 4; i++) {
            substrings.push(cleanName.substring(i, i + 4).toLowerCase());
        }
        return substrings;
    };

    const captureAndScan = async () => {
        if (!webcamRef.current || isProcessingRef.current || found || !isCameraOn || !isWorkerReady || !workerRef.current) return;
        isProcessingRef.current = true;

        // 1. Get Video Element
        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) {
            isProcessingRef.current = false;
            return;
        }

        // 2. Setup Canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Match canvas size to video size temporarily
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 3. Draw Video to Canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 4. Image Pre-processing (Gentle Contrast Enhancement)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple grayscale with contrast boost - preserves detail at all distances
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Grayscale conversion (luminosity)
            let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Gentle contrast enhancement (preserves gradients, not binary)
            const contrast = 1.3; // Moderate contrast boost
            gray = contrast * (gray - 128) + 128;

            // Clamp to valid range [0, 255]
            gray = Math.max(0, Math.min(255, gray));

            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
        }
        ctx.putImageData(imageData, 0, 0);

        // 5. Get Processed Image as Data URL
        const processedImageSrc = canvas.toDataURL('image/jpeg', 0.8);

        // Update debug image if modal is open
        if (showDebug) {
            setLastScannedImage(processedImageSrc);
        }

        try {
            // --- STEP 1: TEXT SCAN (OCR) ---
            // Use the persistent worker on the PROCESSED image
            const tesseractRes = await workerRef.current.recognize(processedImageSrc);
            const ocrText = tesseractRes.data.text || "";
            const lowerText = ocrText.toLowerCase();

            // A. Check Keywords
            if (validationKeywords.length > 0) {
                let matchCount = 0;
                validationKeywords.forEach(keyword => {
                    if (lowerText.includes(keyword.toLowerCase())) matchCount++;
                });

                if (matchCount >= 1) {
                    scanMemoryRef.current.keyword = { value: true, timestamp: Date.now() };
                }
            } else {
                // If no keywords defined, treat as always found
                scanMemoryRef.current.keyword = { value: true, timestamp: Date.now() };
            }

            // B. Check Roll No and Name
            const regex = new RegExp(`\\b\\d{${rollNoLength}}\\b`);
            const rollMatch = ocrText.match(regex);

            if (rollMatch) {
                const extractedRollNo = rollMatch[0];

                // Frontend Validation: Check if roll number exists in the organization
                const student = validRollNumbers.find(s => s.rollNo === extractedRollNo);

                if (student) {
                    // Store roll number in memory
                    scanMemoryRef.current.rollNo = { value: extractedRollNo, timestamp: Date.now() };

                    // C. Check Name (4-character substrings)
                    const nameSubstrings = generate4CharSubstrings(student.name);
                    const nameFound = nameSubstrings.some(substring =>
                        lowerText.includes(substring)
                    );

                    if (nameFound) {
                        scanMemoryRef.current.name = { value: true, timestamp: Date.now() };
                    }
                }
                // If not in list, don't store it (keep scanning)
            }

            // --- STEP 2: VALIDATION (Mix & Match) ---
            const mem = scanMemoryRef.current;

            const hasKeyword = isRecent(mem.keyword?.timestamp);
            const hasRoll = isRecent(mem.rollNo?.timestamp);
            const hasName = isRecent(mem.name?.timestamp);

            let statusMsg = `--- RAW TEXT ---\n${ocrText.substring(0, 100)}...\n\n`;
            statusMsg += `--- STATUS ---\n`;
            statusMsg += `Keyword: ${hasKeyword ? 'MATCHED' : 'Seeking...'} \n`;
            statusMsg += `Roll No: ${hasRoll ? 'FOUND (' + mem.rollNo.value + ')' : 'Seeking...'}\n`;
            statusMsg += `Name: ${hasName ? 'VERIFIED' : 'Seeking...'}\n`;
            statusMsg += `Valid Students Loaded: ${validRollNumbers.length}`;

            setDebugText(statusMsg);

            if (hasKeyword && hasRoll && hasName) {
                handleScanSuccess(mem.rollNo.value);
            }

        } catch (err) {
            console.error("Scan Error:", err);
        } finally {
            isProcessingRef.current = false;
        }
    };

    const handleScanSuccess = async (rollNo) => {
        setFound(true);
        setIsCameraOn(false);
        setIsVerifying(true);

        try {
            const res = await axios.post('/api/entries/scan', { rollNo });
            setScanResult({
                status: 'success',
                message: res.data.message,
                student: res.data.student,
                type: res.data.type,
                entry: res.data.entry
            });
            fetchRecentEntries();
            addToast(`Scan Successful: ${res.data.student.name}`, 'success');

        } catch (err) {
            setScanResult({
                status: 'error',
                message: err.response?.data?.message || "Scan failed.",
            });
            addToast("Scan Failed", "error");
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        let interval;
        if (isCameraOn && !found) {
            interval = setInterval(captureAndScan, 200); // Slightly slower interval for HD processing
        }
        return () => clearInterval(interval);
    }, [isCameraOn, found, captureAndScan, showDebug]); // Added showDebug to update loop

    const resetScan = () => {
        setFound(false);
        setScanResult(null);
        resetMemory(); // Clear Stateful Memory
        setIsCameraOn(true);
        setDebugText("");
        setLastScannedImage(null);
    };

    // Filter Logic
    const filteredEntries = recentEntries.filter(entry => {
        if (hideArrivals && entry.status === 'In') return false;

        const search = searchTerm.toLowerCase();
        return (
            entry.student.name.toLowerCase().includes(search) ||
            entry.student.roll_no.includes(search) ||
            entry.student.hostel_name?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="pt-32 pb-12 px-4 sm:px-6 font-sans max-w-7xl mx-auto">
            <div className="space-y-6">

                {/* Back Link */}
                <Link to="/portal" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
                </Link>

                {/* Top Section */}
                <div className="glass-panel p-6 md:p-8 text-center min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
                    {orgName && (
                        <div className="mb-4 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">{orgName}</span>
                            </div>
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 relative z-10">SCAN YOUR ID CARD</h1>
                    <p className="text-gray-400 mb-8 text-base md:text-lg relative z-10">Click "Start Scanning" to capture and verify</p>

                    {!isCameraOn && !found && (
                        <button
                            onClick={() => { setIsCameraOn(true); setScanResult(null); setDebugText(""); }}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-10 md:px-12 py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl flex items-center gap-3 relative z-10 transition-all shadow-md hover:shadow-lg border border-blue-500/30 animate-float"
                        >
                            <ScanIcon size={24} className="md:w-7 md:h-7" /> Start Scanning
                        </button>
                    )}

                    {isCameraOn && (
                        <div className="flex flex-col items-center gap-4 w-full relative z-10">
                            <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden border-2 border-indigo-500/50 shadow-2xl neon-glow group">
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                        facingMode: facingMode,
                                        width: 1280,
                                        height: 720
                                    }}
                                    className="w-full h-full object-cover opacity-80"
                                />
                                {/* Hidden Canvas for Processing */}
                                <canvas ref={canvasRef} className="hidden" />

                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-[scan_2s_ease-in-out_infinite]"></div>
                                    <div className="w-8 h-8 border-t-2 border-l-2 border-blue-400 absolute top-4 left-4 rounded-tl-lg" />
                                    <div className="w-8 h-8 border-t-2 border-r-2 border-blue-400 absolute top-4 right-4 rounded-tr-lg" />
                                    <div className="w-8 h-8 border-b-2 border-l-2 border-blue-400 absolute bottom-4 left-4 rounded-bl-lg" />
                                    <div className="w-8 h-8 border-b-2 border-r-2 border-blue-400 absolute bottom-4 right-4 rounded-br-lg" />
                                </div>
                                {/* Switch Camera Button */}
                                <button
                                    onClick={toggleCamera}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md border border-white/20 transition-all z-20 pointer-events-auto"
                                    title="Switch Camera"
                                >
                                    <RotateCcw size={20} />
                                </button>

                                {/* Debug Toggle Button */}
                                <button
                                    onClick={() => setShowDebug(!showDebug)}
                                    className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md border border-white/20 transition-all z-20 pointer-events-auto"
                                    title="Debug Info"
                                >
                                    <AlertCircle size={20} className={showDebug ? "text-yellow-400" : "text-gray-400"} />
                                </button>
                            </div>

                            <div className="w-full max-w-lg">
                                <button
                                    onClick={() => setIsCameraOn(false)}
                                    className="w-full bg-red-600/80 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition backdrop-blur"
                                >
                                    STOP SCANNING
                                </button>
                            </div>

                            {/* Debug Modal / Panel */}
                            {showDebug && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowDebug(false)}>
                                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-white">Scanner Debug</h3>
                                            <button onClick={() => setShowDebug(false)}><X className="text-gray-400" /></button>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-400 uppercase">Input Frame (What OCR sees)</p>
                                            {lastScannedImage ? (
                                                <img src={lastScannedImage} alt="Debug Scan" className="w-full rounded border border-white/10" />
                                            ) : (
                                                <div className="w-full h-32 bg-black/50 rounded flex items-center justify-center text-gray-500">No Frame Captured</div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-400 uppercase">OCR Output Log</p>
                                            <div className="bg-black/50 p-3 rounded font-mono text-xs text-green-400 h-32 overflow-y-auto whitespace-pre-wrap border border-white/10">
                                                {debugText || "Waiting for data..."}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            <p>Camera: {facingMode}</p>
                                            <p>Worker Status: {isWorkerReady ? "Ready" : "Initializing..."}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Verifying State */}
                    {found && isVerifying && !scanResult && (
                        <div className="mt-8 glass-panel bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full animate-in fade-in zoom-in duration-300 relative z-20 backdrop-blur-xl mx-auto">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                                    <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Securely Verifying...</h2>
                                <p className="text-gray-400">Please wait while we process your entry</p>
                            </div>
                        </div>
                    )}

                    {/* Result Overlay / Panel */}
                    {found && scanResult && (
                        <div className="mt-8 glass-panel bg-white/5 p-6 rounded-2xl border border-white/10 max-w-md w-full animate-in fade-in zoom-in duration-300 relative z-20 backdrop-blur-xl mx-auto">
                            {scanResult.status === 'success' ? (
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{scanResult.message}</h2>
                                    <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/5">
                                        <p className="text-xl font-semibold text-indigo-400">{scanResult.student.name}</p>
                                        <p className="text-gray-400">{scanResult.student.roll_no}</p>
                                    </div>
                                    <button onClick={resetScan} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold transition shadow-lg shadow-indigo-500/20 cursor-pointer">
                                        Scan Next
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-red-400 mb-2">Scan Failed</h2>
                                    <p className="text-gray-400 mb-4">{scanResult.message}</p>
                                    <button onClick={resetScan} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold transition cursor-pointer">
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Table Section */}
                <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                        {/* Mobile Layout */}
                        <div className="flex flex-col gap-4 lg:hidden">
                            <div className="w-full">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Search Records</label>
                                <input
                                    type="text"
                                    placeholder="Name, Roll No, or Hostel..."
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 justify-between">
                                <div className="glass-panel px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">Hide Arrivals</span>
                                    <button
                                        onClick={() => setHideArrivals(!hideArrivals)}
                                        className={`w-11 h-5 sm:w-12 sm:h-6 rounded-full transition-all relative shadow-inner ${hideArrivals ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform shadow-md ${hideArrivals ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendReminders}
                                    disabled={sendingReminders}
                                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-orange-800 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 border border-orange-500/20 text-xs sm:text-sm flex-shrink-0"
                                >
                                    <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span className="hidden xs:inline">{sendingReminders ? 'Sending...' : 'Send Reminders'}</span>
                                    <span className="xs:hidden">{sendingReminders ? 'Sending...' : 'Reminders'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:flex items-center gap-6 justify-between">
                            <div className="flex-1 max-w-sm">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Search Records</label>
                                <input
                                    type="text"
                                    placeholder="Name, Roll No, or Hostel..."
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {orgName && (
                                <div className="flex-shrink-0">
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                        <span className="text-blue-400 font-bold text-base uppercase tracking-wider">{orgName}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="glass-panel px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">Hide Arrivals</span>
                                    <button
                                        onClick={() => setHideArrivals(!hideArrivals)}
                                        className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${hideArrivals ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform shadow-md ${hideArrivals ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendReminders}
                                    disabled={sendingReminders}
                                    className="px-5 py-2.5 bg-orange-800 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-orange-500/20 text-sm"
                                >
                                    <Mail size={18} />
                                    {sendingReminders ? 'Sending...' : 'Send Reminders'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/40 text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">S.no.</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Roll No.</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Hostel</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider hidden md:table-cell">Room</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Mobile</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Leaving</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Arrival</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-center text-sm text-gray-300">
                                {filteredEntries.map((entry, index) => {
                                    const leaveDate = new Date(entry.leavingTime);
                                    const arrivalDate = entry.arrivalTime ? new Date(entry.arrivalTime) : null;

                                    return (
                                        <tr key={entry._id} className={`hover:bg-white/10 transition-colors ${index % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
                                            <td className="px-4 py-3 font-medium text-gray-500">{recentEntries.length - index}</td>
                                            <td className="px-4 py-3 font-bold text-white">{entry.student.roll_no}</td>
                                            <td className="px-4 py-3">{entry.student.name}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell">{entry.student.hostel_name}</td>
                                            <td className="px-4 py-3 hidden md:table-cell">{entry.student.Room_no}</td>
                                            <td className="px-4 py-3 hidden lg:table-cell">{entry.student.mobile_no}</td>
                                            <td className="px-4 py-3 text-gray-300">
                                                <div className="font-medium text-white">
                                                    {leaveDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    {leaveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {arrivalDate ? (
                                                    <>
                                                        <div className="font-medium text-white">
                                                            {arrivalDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div className="text-gray-500 text-xs">
                                                            {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${entry.status === 'In' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {entry.status === 'In' ? 'Entered' : 'Exited'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {loadingEntries && filteredEntries.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <span className="text-gray-400 animate-pulse">Loading entries...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!loadingEntries && filteredEntries.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                            No entries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Scan;
