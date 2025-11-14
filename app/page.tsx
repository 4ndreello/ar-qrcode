'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  const [qrValue] = useState('https://v0.app')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AR</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AR com QR Code</h1>
              <p className="text-slate-600 text-sm">Realidade Aumentada Simples e Funcional</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 text-balance">
              Realidade Aumentada com QR Code
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              Demonstração prática de RA: aponte sua câmera para o QR Code e veja objetos 3D animados aparecerem em tempo real.
            </p>
            <ul className="space-y-3 mb-8 text-slate-700">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Detecção de QR Code em tempo real
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Objetos 3D interativos e animados
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Funciona em qualquer smartphone moderno
              </li>
            </ul>
            <Link href="/ar">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Iniciar Experiência AR
              </Button>
            </Link>
          </div>

          {/* Right: QR Code */}
          <div className="space-y-4">
            <Card className="p-8 bg-white border-slate-200 flex flex-col items-center justify-center">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">Aponte para este QR Code:</h3>
              <div className="bg-white p-4 border-4 border-slate-900">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://v0.app/ar" 
                  alt="QR Code para experiência AR"
                  width={200}
                  height={200}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-slate-600 mt-6 text-center font-medium">
                Imprima este QR Code ou exiba na tela do seu computador. Depois aponte o smartphone para iniciar a experiência AR!
              </p>
            </Card>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 pt-12 border-t border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Como usar em 3 passos:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-2xl">
                1️⃣
              </div>
              <p className="font-semibold text-slate-900 mb-2">Clique no botão</p>
              <p className="text-sm text-slate-600">"Iniciar Experiência AR" acima</p>
            </Card>
            <Card className="p-6 bg-white">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-2xl">
                2️⃣
              </div>
              <p className="font-semibold text-slate-900 mb-2">Permita acesso à câmera</p>
              <p className="text-sm text-slate-600">Seu navegador solicitará permissão</p>
            </Card>
            <Card className="p-6 bg-white">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-2xl">
                3️⃣
              </div>
              <p className="font-semibold text-slate-900 mb-2">Aponte para o QR</p>
              <p className="text-sm text-slate-600">Veja os objetos 3D aparecerem!</p>
            </Card>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tecnologias Utilizadas</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-semibold text-slate-900">A-Frame</p>
              <p className="text-slate-600">Framework WebXR para 3D interativo</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">jsQR</p>
              <p className="text-slate-600">Biblioteca para detecção de QR Code</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">WebGL</p>
              <p className="text-slate-600">Renderização 3D acelerada por GPU</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-600">
          Demonstração de RA com QR Code | Projeto Acadêmico
        </div>
      </footer>
    </div>
  )
}
