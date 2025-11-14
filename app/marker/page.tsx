'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarkerPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-6">
            ← Voltar
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Marcador para Impressão</h1>
          <p className="text-slate-600 mb-6">
            Imprima este marcador em tamanho A4 para usar com a aplicação AR
          </p>

          {/* Marker */}
          <div className="border-4 border-slate-300 bg-white p-8 my-8 flex items-center justify-center" id="marker-container">
            <div className="w-full aspect-square bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-lg flex items-center justify-center shadow-xl">
              <div className="text-center">
                <p className="text-white text-6xl font-bold mb-2">AR</p>
                <p className="text-blue-100 text-lg">TARGET</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Instruções:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Imprima este marcador em tamanho grande (A4 ou maior)</li>
              <li>• Coloque em uma superfície bem iluminada</li>
              <li>• Aponte a câmera do seu smartphone para o marcador</li>
              <li>• O objeto 3D aparecerá sobre o marcador</li>
            </ul>
          </div>

          <button
            onClick={handlePrint}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Imprimir Marcador
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          button {
            display: none;
          }
          a {
            display: none;
          }
          .max-w-2xl {
            max-width: 100%;
          }
          #marker-container {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
