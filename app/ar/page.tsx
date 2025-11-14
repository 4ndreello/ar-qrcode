"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ARPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsLoadedRef = useRef(false);
  const detectionRunningRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDetected, setQrDetected] = useState(false);
  const [aframeReady, setAframeReady] = useState(false);
  const [qrPosition, setQrPosition] = useState({ x: 0, y: 0 }); // Posição normalizada do QR Code (0-1)
  const [boxSize, setBoxSize] = useState(1); // Tamanho do cubo (scale)
  const [boxColor, setBoxColor] = useState("#f59e0b"); // Cor do cubo
  const [showControls, setShowControls] = useState(false); // Mostrar/esconder controles

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (scriptsLoadedRef.current) {
      return;
    }

    const initAR = async () => {
      try {
        // Verificar se jsQR já está carregado
        if (typeof window !== "undefined" && (window as any).jsQR) {
          loadAFrame();
          return;
        }

        // Verificar se o script já foi adicionado
        const existingJsQR = document.querySelector('script[src*="jsqr"]');
        if (existingJsQR) {
          existingJsQR.addEventListener("load", () => loadAFrame());
          if ((window as any).jsQR) {
            loadAFrame();
          }
          return;
        }

        const jsQRScript = document.createElement("script");
        jsQRScript.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
        jsQRScript.async = true;
        jsQRScript.id = "jsqr-script";
        document.head.appendChild(jsQRScript);

        jsQRScript.onload = () => {
          loadAFrame();
        };

        jsQRScript.onerror = () => {
          setError("Erro ao carregar biblioteca QR");
          setIsLoading(false);
        };
      } catch (err) {
        console.error("Erro ao inicializar AR:", err);
        setError("Erro ao inicializar AR");
        setIsLoading(false);
      }
    };

    const loadAFrame = () => {
      // Verificar se A-Frame já está carregado
      if (typeof window !== "undefined" && (window as any).AFRAME) {
        setAframeReady(true);
        setIsLoading(false);
        initCamera();
        return;
      }

      // Verificar se o script já foi adicionado
      const existingAFrame = document.querySelector('script[src*="aframe"]');
      if (existingAFrame) {
        existingAFrame.addEventListener("load", () => {
          setAframeReady(true);
          setIsLoading(false);
          initCamera();
        });
        if ((window as any).AFRAME) {
          setAframeReady(true);
          setIsLoading(false);
          initCamera();
        }
        return;
      }

      const aFrameScript = document.createElement("script");
      aFrameScript.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
      aFrameScript.async = true;
      aFrameScript.id = "aframe-script";
      document.head.appendChild(aFrameScript);

      aFrameScript.onload = () => {
        scriptsLoadedRef.current = true;
        setAframeReady(true);
        setIsLoading(false);
        initCamera();
      };

      aFrameScript.onerror = () => {
        setError("Erro ao carregar A-Frame");
        setIsLoading(false);
      };
    };

    const initCamera = async () => {
      try {
        // Verificar se já temos uma stream
        if (videoRef.current?.srcObject) {
          return;
        }

        // Detectar se é dispositivo móvel
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        // Verificar permissões da câmera - melhor verificação
        let mediaDevicesAvailable = false;

        if (typeof navigator !== "undefined") {
          // Tentar acessar navigator.mediaDevices de forma segura
          try {
            mediaDevicesAvailable = !!(
              navigator.mediaDevices && navigator.mediaDevices.getUserMedia
            );

            // Log de debug para mobile
            if (isMobile) {
              console.log("Verificação de câmera (mobile):", {
                mediaDevicesAvailable,
                hasMediaDevices: !!navigator.mediaDevices,
                hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
                protocol: location.protocol,
                hostname: location.hostname,
              });
            }
          } catch (e) {
            console.error("Erro ao verificar mediaDevices:", e);
            // Fallback para métodos antigos (não ideal, mas pode funcionar)
            mediaDevicesAvailable = !!(
              (navigator as any).getUserMedia ||
              (navigator as any).webkitGetUserMedia ||
              (navigator as any).mozGetUserMedia
            );
          }
        }

        if (!mediaDevicesAvailable) {
          setError(
            "Seu navegador não suporta acesso à câmera. Use Chrome ou Safari atualizados."
          );
          setIsLoading(false);
          return;
        }

        // Verificar se getUserMedia está disponível
        let getUserMediaFn: (
          constraints: MediaStreamConstraints
        ) => Promise<MediaStream>;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          getUserMediaFn = navigator.mediaDevices.getUserMedia.bind(
            navigator.mediaDevices
          );
        } else {
          // Fallback para versões antigas (raramente necessário hoje)
          getUserMediaFn = (constraints: MediaStreamConstraints) => {
            const getUserMedia =
              (navigator as any).getUserMedia ||
              (navigator as any).webkitGetUserMedia ||
              (navigator as any).mozGetUserMedia;

            return new Promise((resolve, reject) => {
              if (!getUserMedia) {
                reject(new Error("getUserMedia não disponível"));
                return;
              }
              getUserMedia.call(navigator, constraints, resolve, reject);
            });
          };
        }

        let stream;
        try {
          // Em mobile, tentar câmera traseira primeiro com configurações específicas
          if (isMobile) {
            stream = await getUserMediaFn({
              video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            });
          } else {
            // Em desktop, tentar câmera traseira primeiro
            stream = await getUserMediaFn({
              video: { facingMode: "environment" },
            });
          }
        } catch (envError: any) {
          console.log(
            "Erro com câmera traseira, tentando qualquer câmera:",
            envError
          );
          // Se falhar, tentar qualquer câmera disponível
          try {
            if (isMobile) {
              stream = await getUserMediaFn({
                video: {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
              });
            } else {
              stream = await getUserMediaFn({
                video: true,
              });
            }
          } catch (anyError) {
            throw anyError;
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Configurações específicas para mobile
          if (isMobile) {
            // Garantir que o vídeo use a tela inteira no mobile
            videoRef.current.setAttribute("playsinline", "true");
            videoRef.current.setAttribute("webkit-playsinline", "true");
            videoRef.current.muted = true; // Necessário para autoplay no mobile
          }

          // Aguardar o vídeo estar pronto
          const handleVideoReady = () => {
            if (!videoRef.current) return;

            // Verificar se o vídeo tem dimensões válidas
            if (
              videoRef.current.videoWidth === 0 ||
              videoRef.current.videoHeight === 0
            ) {
              // Tentar novamente após um pequeno delay
              setTimeout(handleVideoReady, 100);
              return;
            }

            videoRef.current
              .play()
              .then(() => {
                // Aguardar um pouco para garantir que o vídeo está reproduzindo
                // Mais tempo no mobile devido à inicialização mais lenta
                setTimeout(
                  () => {
                    if (!detectionRunningRef.current && videoRef.current) {
                      // Verificar novamente as dimensões antes de iniciar detecção
                      if (
                        videoRef.current.videoWidth > 0 &&
                        videoRef.current.videoHeight > 0
                      ) {
                        startQRDetection();
                      } else {
                        setError(
                          "Erro ao inicializar vídeo: dimensões inválidas."
                        );
                        setIsLoading(false);
                      }
                    }
                  },
                  isMobile ? 500 : 300
                );
              })
              .catch((err) => {
                console.error("Erro ao reproduzir vídeo:", err);
                // Em mobile, alguns navegadores exigem interação do usuário
                if (isMobile) {
                  setError(
                    "Não foi possível iniciar a câmera automaticamente. Toque na tela para iniciar."
                  );
                } else {
                  setError("Erro ao iniciar câmera");
                }
                setIsLoading(false);
              });
          };

          // Usar múltiplos eventos para garantir que o vídeo está pronto
          videoRef.current.onloadedmetadata = handleVideoReady;
          videoRef.current.onloadeddata = handleVideoReady;

          // Fallback caso os eventos não sejam disparados
          setTimeout(() => {
            if (videoRef.current && !detectionRunningRef.current) {
              if (videoRef.current.readyState >= 2) {
                handleVideoReady();
              }
            }
          }, 1000);
        }
      } catch (err: any) {
        console.error("Erro ao acessar câmera:", err);
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        let errorMessage = "Não foi possível acessar a câmera.";

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          if (isMobile) {
            errorMessage =
              "Permissão de câmera negada. Toque no ícone de câmera na barra de endereço e permita o acesso.";
          } else {
            errorMessage =
              "Permissão de câmera negada. Clique no ícone de câmera na barra de endereço e permita o acesso.";
          }
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMessage =
            "Nenhuma câmera encontrada. Verifique se há uma câmera disponível no dispositivo.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          errorMessage =
            "A câmera está sendo usada por outro aplicativo. Feche outros apps que estão usando a câmera.";
        } else if (
          err.name === "OverconstrainedError" ||
          err.name === "ConstraintNotSatisfiedError"
        ) {
          errorMessage =
            "A câmera não suporta os requisitos necessários. Tente outro navegador ou dispositivo.";
        } else if (err.message && err.message.includes("not available")) {
          errorMessage =
            "Câmera não disponível. Verifique se o dispositivo tem uma câmera e se o navegador suporta acesso à câmera.";
        } else {
          // Mensagem genérica com informações úteis
          errorMessage = `Erro ao acessar câmera${
            isMobile ? " no dispositivo móvel" : ""
          }. Verifique as permissões do navegador e se você está usando HTTPS.`;
        }

        setError(errorMessage);
        setIsLoading(false);
      }
    };

    const startQRDetection = () => {
      if (detectionRunningRef.current) {
        return;
      }

      detectionRunningRef.current = true;
      let detectionTimeout = 0;

      const detect = () => {
        if (
          videoRef.current &&
          canvasRef.current &&
          videoRef.current.readyState >= 2 &&
          videoRef.current.videoWidth > 0 &&
          videoRef.current.videoHeight > 0 &&
          typeof window !== "undefined" &&
          (window as any).jsQR
        ) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const code = (window as any).jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code && code.location) {
              detectionTimeout = 0;

              // Calcular posição central do QR Code
              const corners = code.location;
              const centerX =
                (corners.topLeftCorner.x +
                  corners.topRightCorner.x +
                  corners.bottomLeftCorner.x +
                  corners.bottomRightCorner.x) /
                4;
              const centerY =
                (corners.topLeftCorner.y +
                  corners.topRightCorner.y +
                  corners.bottomLeftCorner.y +
                  corners.bottomRightCorner.y) /
                4;

              // Normalizar para 0-1 (centro = 0.5)
              const normalizedX = centerX / canvas.width;
              const normalizedY = centerY / canvas.height;

              setQrPosition({ x: normalizedX, y: normalizedY });

              setQrDetected((prev) => {
                if (!prev) return true;
                return prev;
              });
            } else if (detectionTimeout++ > 10) {
              setQrDetected((prev) => {
                if (prev) return false;
                return prev;
              });
              detectionTimeout = 0;
            }
          }
        }
        requestAnimationFrame(detect);
      };
      detect();
    };

    // Inicializar AR
    initAR();

    // Cleanup function
    return () => {
      detectionRunningRef.current = false;
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []); // Executar apenas uma vez na montagem

  // Atualizar posições dos objetos 3D quando o QR Code se mover
  useEffect(() => {
    if (!qrDetected || !aframeReady) return;

    const screenTo3D = (normalized: number, isX: boolean) => {
      const range = isX ? 4 : 3;
      return (normalized - 0.5) * 2 * range;
    };

    const x3D = screenTo3D(qrPosition.x, true);
    const y3D = screenTo3D(1 - qrPosition.y, false);

    // Atualizar posições via A-Frame API
    const updatePositions = () => {
      // Box
      const boxEl = document.querySelector("#ar-box") as any;
      if (boxEl) {
        boxEl.setAttribute("position", `${x3D} ${y3D} -3`);
        boxEl.setAttribute("scale", `${boxSize} ${boxSize} ${boxSize}`);
        boxEl.setAttribute("color", boxColor);
      }

      // Texto
      const textEl = document.querySelector("#ar-text") as any;
      if (textEl) {
        textEl.setAttribute("position", `${x3D} ${y3D - 1.5} -3`);
      }
    };

    // Usar requestAnimationFrame para garantir que o A-Frame está pronto
    requestAnimationFrame(() => {
      updatePositions();
    });
  }, [qrPosition, qrDetected, aframeReady, boxSize, boxColor]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando experiência AR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Video and Canvas for QR detection */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={
          {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            WebkitPlaysinline: "true",
            playsInline: true,
          } as any
        }
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* A-Frame scene - só renderiza quando A-Frame estiver pronto */}
      {aframeReady && (
        <a-scene
          embedded
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          className="absolute inset-0"
          renderer="antialias: true; alpha: true; log: false"
        >
          <a-camera
            position="0 0 0"
            look-controls="enabled: false"
            wasd-controls="enabled: false"
          />

          {/* 3D Objects that appear when QR is detected */}
          {qrDetected &&
            (() => {
              // Mapear posição do QR Code (0-1) para coordenadas 3D
              // Converter de espaço de tela (0,0 no topo esquerdo) para espaço 3D (0,0 no centro)
              // Inverter Y porque na tela Y aumenta para baixo, mas no 3D aumenta para cima
              const screenTo3D = (normalized: number, isX: boolean) => {
                // Converter 0-1 para -range até +range
                const range = isX ? 4 : 3; // Range maior no X, menor no Y
                return (normalized - 0.5) * 2 * range;
              };

              const x3D = screenTo3D(qrPosition.x, true);
              const y3D = screenTo3D(1 - qrPosition.y, false); // Inverter Y

              return (
                <>
                  <a-box
                    id="ar-box"
                    position={`${x3D} ${y3D} -3`}
                    rotation="0 0 0"
                    scale={`${boxSize} ${boxSize} ${boxSize}`}
                    color={boxColor}
                    animation="property: rotation; to: 360 360 0; loop: true; dur: 4000"
                  />
                  <a-text
                    id="ar-text"
                    value="QR DETECTADO!"
                    position={`${x3D} ${y3D - 1.5} -3`}
                    align="center"
                    color="#10b981"
                    scale="0.8 0.8 0.8"
                    font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
                  />
                </>
              );
            })()}
        </a-scene>
      )}

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center">
        <Link href="/">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            ← Voltar
          </Button>
        </Link>
        <div
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            qrDetected ? "bg-green-500/80 text-white" : "bg-white/20 text-white"
          }`}
        >
          {qrDetected ? "✓ QR Detectado" : "Procurando QR..."}
        </div>
      </div>

      {/* Controls Panel */}
      {qrDetected && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Controles do Objeto</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="text-white hover:bg-white/20"
            >
              {showControls ? "▼" : "▲"}
            </Button>
          </div>

          {showControls && (
            <div className="space-y-4">
              {/* Tamanho */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>Tamanho</span>
                  <span className="text-xs opacity-70">
                    {boxSize.toFixed(2)}x
                  </span>
                </label>
                <Slider
                  value={[boxSize]}
                  onValueChange={([value]) => setBoxSize(value)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Cor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={boxColor}
                    onChange={(e) => setBoxColor(e.target.value)}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={boxColor}
                    onChange={(e) => setBoxColor(e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBoxSize(1);
                  setBoxColor("#f59e0b");
                }}
                className="w-full text-white border-white/20 hover:bg-white/10"
              >
                Resetar Padrões
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!qrDetected && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-center">
          <p className="text-sm font-medium">
            Aponte para o QR Code para ver a experiência AR
          </p>
          <p className="text-xs opacity-80 mt-1">
            Certifique-se de ter boa iluminação
          </p>
        </div>
      )}
    </div>
  );
}
