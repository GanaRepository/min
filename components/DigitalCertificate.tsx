// components/DigitalCertificate.tsx
'use client';

import React from 'react';
import { Trophy, Medal, Star, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CertificateProps {
  winnerData: {
    childName: string;
    position: number;
    title: string;
    score: number;
    month: string;
    year: number;
  };
  onDownload?: () => void;
}

export default function DigitalCertificate({
  winnerData,
  onDownload,
}: CertificateProps) {
  const certificateRef = React.useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 800,
        height: 600,
      });

      const link = document.createElement('a');
      link.download = `certificate-${winnerData.childName}-${winnerData.month}-${winnerData.year}.png`;
      link.href = canvas.toDataURL();
      link.click();

      onDownload?.();
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const getPositionIcon = () => {
    switch (winnerData.position) {
      case 1:
        return <Trophy className="w-16 h-16 text-yellow-500" />;
      case 2:
        return <Medal className="w-16 h-16 text-gray-400" />;
      case 3:
        return <Medal className="w-16 h-16 text-amber-600" />;
      default:
        return <Star className="w-16 h-16 text-purple-500" />;
    }
  };

  const getPositionText = () => {
    switch (winnerData.position) {
      case 1:
        return 'First Place Winner';
      case 2:
        return 'Second Place Winner';
      case 3:
        return 'Third Place Winner';
      default:
        return 'Competition Winner';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={certificateRef}
        className="w-[800px] h-[600px] bg-gradient-to-br from-blue-50 to-purple-50 border-8 border-yellow-400 relative overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-4xl  text-gray-800 mb-2">
            CERTIFICATE OF ACHIEVEMENT
          </h1>
          <div className="w-32 h-1 bg-yellow-400 mx-auto"></div>
        </div>

        {/* Icon */}
        <div className="flex justify-center my-6">{getPositionIcon()}</div>

        {/* Main Content */}
        <div className="text-center px-12">
          <p className="text-xl text-gray-600 mb-4">This is to certify that</p>

          <h2
            className="text-5xl  text-gray-800 mb-6"
            style={{ fontFamily: 'serif' }}
          >
            {winnerData.childName}
          </h2>

          <p className="text-xl text-gray-600 mb-2">has been awarded</p>

          <h3 className="text-3xl  text-purple-600 mb-4">
            {getPositionText()}
          </h3>

          <p className="text-lg text-gray-600 mb-2">
            in the {winnerData.month} {winnerData.year} Writing Competition
          </p>

          <p className="text-lg text-gray-600 mb-2">
            for the story &quot;
            <span className=" text-gray-800">{winnerData.title}</span>&quot;
          </p>

          <p className="text-lg text-gray-600">
            with a score of{' '}
            <span className=" text-green-600">{winnerData.score}%</span>
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center">
          <div className="text-center">
            <div className="w-32 h-px bg-gray-400 mb-1"></div>
            <p className="text-sm text-gray-500">Date Awarded</p>
            <p className="text-sm ">{new Date().toLocaleDateString()}</p>
          </div>

          <div className="text-center">
            <div className="w-32 h-px bg-gray-400 mb-1"></div>
            <p className="text-sm text-gray-500">Mintoons Platform</p>
            <p className="text-sm ">Writing Competition</p>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-yellow-400"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-yellow-400"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-yellow-400"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-yellow-400"></div>
      </div>

      <button
        onClick={downloadCertificate}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg  transition-colors"
      >
        <Download size={20} />
        Download Certificate
      </button>
    </div>
  );
}
