'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { generateReceiptPDF } from '../Receipt';
import AxiosInstance from '@/app/components/AxiosInstance';


export default function VoucherPage() {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      AxiosInstance.get(`add-income/${id}/`)
        .then((res) => {
          console.log(res.data);
          setReceiptData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching Data:", err);
          setError('Failed to load voucher data');
          setLoading(false);
        });
    }
  }, [id]);

  const handleDownload = async () => {
    if (receiptData) {
      try {
        await generateReceiptPDF(receiptData);
      } catch (error) {
        console.error('Download failed:', error);
        setError('Failed to download PDF');
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voucher #{id}...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load voucher</h2>
          <p className="text-gray-600 mb-4">{error || 'No data found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="bg-white p-6 border-b">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content - Exact match to your design */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Company Header */}
        <div className="text-center border-b-1 border-black py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Heaven Autos</h1>
          <p className="text-lg text-gray-700 mb-1">Genuine Motorcycle Parts Importer & Wholesaler</p>
          <p className="text-sm text-gray-600">77 R.N. Road, Noldanga Road (Heaven Building), Jashore-7400</p>
          <p className="text-sm text-gray-600">Phone: 0421-66095, Mob: 01924-331354, 01711-355328, 01778-117515</p>
          <p className="text-sm text-gray-600">E-mail: heavenautos77jsr@yahoo.com / heavenautojessore@gmail.com</p>
        </div>

        {/* Receipt Title */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-900">Pay Receipt</h2>
        </div>

        {/* Date and Receipt No */}
        <div className="flex justify-between items-center px-8 py-4">
          <div className="text-sm">
            <span className="font-semibold">Date : </span>
            {receiptData.date ? new Date(receiptData.date).toLocaleDateString('en-GB') : 'N/A'}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Receipt No : </span>
            {receiptData.receiptNo || 'HA49281'}
          </div>
        </div>

        {/* Table */}
        <div className="px-8 py-4">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Voucher No</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Account Title</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Transaction Type</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Amount</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2">{receiptData.voucherNo || 'SA00041122'}</td>
                <td className="border border-gray-300 px-3 py-2">{receiptData.accountTitle || 'GOODS RETURN'}</td>
                <td className="border border-gray-300 px-3 py-2">{receiptData.description || 'GOODS RETURN'}</td>
                <td className="border border-gray-300 px-3 py-2 uppercase">{receiptData.transactionType || 'CASH'}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{parseFloat(receiptData.amount || 2622.12).toFixed(2)}</td>
                <td className="border border-gray-300 px-3 py-2">{receiptData.remarks || 'BF'}</td>
              </tr>
              {/* Total Row */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2" colSpan="4"></td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                  Total: {parseFloat(receiptData.amount || 2622.12).toFixed(2)}
                </td>
                <td className="border border-gray-300 px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* In Words Section */}
        <div className="px-8 py-4 border-t border-gray-300">
          <p className="text-sm">
            <span className="font-semibold">In Words: </span>
            {receiptData.inWords || 'TAKA TWO THOUSAND SIX HUNDRED TWENTY TWO AND TWELVE PAISE ONLY'}
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-300 bg-gray-50">
          <p className="text-sm text-gray-600 text-right">
            Print : Admin , {new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })} {new Date().toLocaleTimeString('en-GB', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }).toUpperCase()}
          </p>
        </div>
      </div>

    </div>
  );
}