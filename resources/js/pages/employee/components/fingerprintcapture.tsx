import { Button } from '@/components/ui/button';
import { Camera, Check, Fingerprint } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface FingerprintCaptureProps {
    onFingerprintCaptured: (data: any) => void;
    employeeId?: string; // Add this prop
}

const FingerprintCapture: React.FC<FingerprintCaptureProps> = ({ onFingerprintCaptured, employeeId }) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [fingerprintData, setFingerprintData] = useState<any | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080');
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fingerprint_data') {
                    setFingerprintData(data);
                    onFingerprintCaptured(data); // Pass up to parent
                    setIsCapturing(false);
                }
            } catch (e) {
                // Ignore parse errors
            }
        };
        return () => {
            ws.current?.close();
        };
    }, [onFingerprintCaptured]);

    const handleCapture = () => {
        if (!employeeId || employeeId.trim() === '') {
            alert('Please enter Employee ID first before capturing fingerprint.');
            return;
        }
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(
                JSON.stringify({
                    type: 'start_registration',
                    employeeid: employeeId,
                })
            );
            setIsCapturing(true);
        }
        // Do not show any alert or error if WebSocket is not open; just do nothing.
    };

    // Check if employeeId is valid
    const isEmployeeIdValid = employeeId && employeeId.trim() !== '';

    return (
        <div className="space-y-4">
            <div
                className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isEmployeeIdValid ? 'border-green-300 bg-green-50 hover:bg-green-100' : 'cursor-not-allowed border-gray-300 bg-gray-50'
                }`}
                onClick={isEmployeeIdValid ? handleCapture : undefined}
            >
                <div className="text-center">
                    {fingerprintData ? (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Fingerprint Captured</p>
                                <img
                                    src={`data:image/png;base64,${fingerprintData.fingerprint_image}`}
                                    alt="Fingerprint"
                                    className="mx-auto my-2 h-32 w-32 border object-contain"
                                />
                                <p className="text-xs text-green-600">
                                    Captured at: {new Date(fingerprintData.fingerprint_captured_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ) : isCapturing ? (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-green-100">
                                <Fingerprint className="animate-user-pulse h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Capturing Fingerprint...</p>
                                <p className="text-sm text-green-600">Please place finger on sensor</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Fingerprint className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">{isEmployeeIdValid ? 'No Fingerprint Captured' : 'Employee ID Required'}</p>
                                <p className="text-sm text-gray-500">
                                    {isEmployeeIdValid ? 'Click to capture fingerprint' : 'Please enter Employee ID first'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-center">
                <Button
                    onClick={handleCapture}
                    disabled={isCapturing || !isEmployeeIdValid}
                    className={`transition duration-200 ease-in ${
                        isEmployeeIdValid ? 'bg-main text-black hover:bg-green-300' : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`}
                >
                    <Camera className="mr-2 h-4 w-4" />
                    {isCapturing ? 'Capturing...' : 'Capture Fingerprint'}
                </Button>
            </div>
        </div>
    );
};

export default FingerprintCapture;
