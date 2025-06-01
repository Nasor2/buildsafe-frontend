import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStreamController } from '../../hooks/features/useStream';
import { useCamarasContext } from '../../context/CamarasContext';
import { ArrowLeft, Camera, Wifi, WifiOff } from 'lucide-react';

const MonitoreoPage: React.FC = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  const { streams, isLoading, error, start, getStreamUrl, stop } = useStreamController();
  const { camaras } = useCamarasContext();
  const [streamErrors, setStreamErrors] = useState<{ [id: number]: boolean }>({});
  const [streamLoading, setStreamLoading] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    if (areaId) start(Number(areaId));
    return () => stop();
  }, [areaId]);

  const getNombreCamara = (id_camara: number) => {
    const cam = camaras.find(c => c.id_camara === id_camara);
    return cam ? cam.nombre : `Cámara #${id_camara}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-1 sm:px-2 lg:px-4">
        {/* Header Navigation */}
        <div className="mb-5 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-600 transition-all hover:bg-white hover:text-gray-900 hover:shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Volver al área</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20" />
          
          <div className="relative px-8 py-10">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">
                  Monitoreo de Cámaras
                </h1>
                <p className="text-gray-600">
                  Visualización en tiempo real de todas las cámaras activas en el área
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando cámaras...</p>
              <p className="text-sm text-gray-500">Por favor espera un momento</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
              <p className="font-medium">Error al cargar las cámaras</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cámaras activas</h3>
              <p className="text-gray-600">No se encontraron cámaras disponibles para monitorear en esta área.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {streams.map(cam => {
                const camaraInfo = camaras.find(c => c.id_camara === cam.id_camara);
                const hasError = streamErrors[cam.id_camara];
                const isLoading = streamLoading[cam.id_camara];

                return (
                  <div key={cam.id_camara}
                    className="group bg-white rounded-xl shadow-sm ring-1 ring-gray-200/50 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative bg-black flex items-center justify-center" style={{ height: '400px' }}>
                      {!hasError && !isLoading ? (
                        <img
                          src={getStreamUrl(cam.id_camara)}
                          alt={`Stream ${getNombreCamara(cam.id_camara)}`}
                          className="w-full h-full object-contain"
                          onLoad={() =>
                            setStreamLoading(prev => {
                              const copy = { ...prev };
                              delete copy[cam.id_camara];
                              return copy;
                            })
                          }
                          onError={() => {
                            setStreamErrors(prev => ({ ...prev, [cam.id_camara]: true }));
                            setStreamLoading(prev => {
                              const copy = { ...prev };
                              delete copy[cam.id_camara];
                              return copy;
                            });
                          }}
                        />
                      ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center w-full h-full text-center">
                          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                          <span className="text-blue-600 font-semibold">Conectando a la cámara...</span>
                          <span className="text-xs text-gray-400 mt-1">{camaraInfo?.ip_stream || 'Sin URL'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-center">
                          <WifiOff className="w-10 h-10 text-red-400 mb-2" />
                          <span className="text-red-600 font-semibold">No se pudo conectar a la cámara</span>
                          <span className="text-xs text-gray-400 mt-1">{camaraInfo?.ip_stream || 'Sin URL'}</span>
                          <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            onClick={() => {
                              setStreamErrors(prev => {
                                const copy = { ...prev };
                                delete copy[cam.id_camara];
                                return copy;
                              });
                              setStreamLoading(prev => ({ ...prev, [cam.id_camara]: true }));
                            }}
                          >
                            Reintentar
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {getNombreCamara(cam.id_camara)}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                          ${hasError ? 'bg-red-50 text-red-700' : isLoading ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {hasError ? (
                            <>
                              <WifiOff className="w-4 h-4" />
                              <span>Sin conexión</span>
                            </>
                          ) : isLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                              <span>Conectando…</span>
                            </>
                          ) : (
                            <>
                              <Wifi className="w-4 h-4" />
                              <span>Activa</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">
                        {camaraInfo?.ip_stream || 'Sin URL'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoreoPage;