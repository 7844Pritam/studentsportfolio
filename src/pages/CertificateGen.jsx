import React, { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Import any image assets (company logo)
import companyLogo from '../assets/company/difmo.svg'; // Ensure you have the logo image in your project

const Certificates = () => {
  const [name, setName] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const certificate = document.getElementById("certificate");

    html2canvas(certificate).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 10, 10, 180, 160);
      doc.save(`${name}-certificate.pdf`);
    });
  };

  const generateImage = () => {
    const certificate = document.getElementById("certificate");
    html2canvas(certificate).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${name}-certificate.png`;
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h1 className="text-3xl font-semibold text-center mb-6 text-indigo-600">Certificate Generator</h1>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={handleNameChange}
          className="w-full p-3 border border-gray-300 rounded-md mb-4 text-lg"
        />
        <button
          onClick={() => setShowCertificate(true)}
          className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 transition"
        >
          Generate Certificate
        </button>

        {showCertificate && name && (
          <div id="certificate" className="mt-8 p-10 border-8 border-gray-700 rounded-lg text-center bg-white shadow-lg relative">
            {/* Company Logo */}
            <div className="absolute top-0 left-0 right-0 text-center py-4">
              <img src={companyLogo} alt="Company Logo" className="mx-auto w-24" />
            </div>

            <h2 className="text-3xl font-bold text-green-600 mt-16 mb-4">Certificate of Completion</h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{name}</h3>
            <p className="text-lg text-gray-600 mb-8">Has successfully completed the internship program and has gained the necessary skills and knowledge required.</p>

            {/* Date and Signature Section */}
            <div className="flex justify-between mt-12 px-20">
              <div className="flex flex-col items-center">
                <p className="text-lg font-medium text-gray-700">Date</p>
                <p className="text-lg text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-lg font-medium text-gray-700">Signature</p>
                <div className="border-t-2 w-40 mt-2"></div>
                <p className="text-lg text-gray-600">John Doe</p> {/* Replace with a signature */}
              </div>
            </div>

            {/* Certificate Border */}
            <div className="absolute inset-0 border-8 border-gray-700 rounded-lg pointer-events-none"></div>
          </div>
        )}

        {showCertificate && name && (
          <div className="mt-6 space-x-4">
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Download as PDF
            </button>
            <button
              onClick={generateImage}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
            >
              Download as Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
