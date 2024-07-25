import React, { useRef, useEffect } from 'react';
import Quagga from 'quagga'; // Example library, replace with your specific library

const BarcodeScanner = () => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: 'environment'
          },
        },
        decoder: {
          readers: ['code_128_reader'] // Use the appropriate reader for your barcode type
        },
      }, (err) => {
        if (err) {
          console.log(err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((data) => {
        console.log('Barcode detected and processed : [' + data.codeResult.code + ']', data);
      });

      return () => {
        Quagga.stop();
      };
    }
  }, []);

  return <div ref={scannerRef} style={{ width: '100%', height: '100%' }} />;
};

export default BarcodeScanner;
