import React, { useState } from 'react';

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-brand-border">
            <button
                className="flex justify-between items-center w-full py-5 text-left text-brand-text"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold">{title}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="pb-5 pr-4 pl-2 text-brand-text-secondary space-y-4 leading-relaxed">
                    {children}
                </div>
            )}
        </div>
    );
};

export const HelpView: React.FC = () => {
    const P = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
    const UL = ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-outside ml-5 space-y-2">{children}</ul>;
    const OL = ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-outside ml-5 space-y-2">{children}</ol>;
    const LI = ({ children }: { children: React.ReactNode }) => <li>{children}</li>;
    const B = ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-brand-text">{children}</strong>;
    const C = ({ children }: { children: React.ReactNode }) => <code className="bg-brand-bg text-yellow-300 font-mono text-sm px-1.5 py-1 rounded-md">{children}</code>;

    return (
        <div className="max-w-4xl mx-auto bg-brand-surface rounded-lg p-8 shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-brand-text mb-2">Centro de Ayuda</h2>
            <p className="text-brand-text-secondary mb-8">
                Encuentra respuestas a preguntas comunes y guías para usar la aplicación.
            </p>

            <div className="space-y-2">
                <AccordionItem title="1. Primeros Pasos" defaultOpen={true}>
                    <P>Para empezar a usar la aplicación, sigue estos pasos iniciales:</P>
                    <UL>
                        <LI><B>Configurar la API Key:</B> Asegúrate de que tu `API_KEY` de Gemini esté configurada en el entorno donde se ejecuta la aplicación. Si la despliegas en un servidor, deberás configurar esta variable de entorno.</LI>
                        <LI><B>Crear un Cliente:</B> Antes de analizar un creativo, debes tener al menos un cliente. Ve a la pestaña <C>Clientes</C> y haz clic en <B>"Añadir Cliente"</B>. Rellena el nombre, la moneda de su cuenta publicitaria y, opcionalmente, un logo.</LI>
                    </UL>
                </AccordionItem>

                <AccordionItem title="2. Cómo Analizar Creativos">
                    <P>El núcleo de la aplicación es el análisis de creativos mediante IA. El flujo de trabajo es el siguiente:</P>
                    <OL>
                        <LI><B>Subir Creativo:</B> En la vista principal (<C>Análisis de Creativos</C>), arrastra y suelta una imagen o video, o haz clic para seleccionarlo.</LI>
                        <LI><B>Asignar Cliente:</B> Se te pedirá que asignes el creativo a uno de tus clientes. Esto es crucial para mantener los análisis organizados y usar el historial del cliente como contexto para la IA.</LI>
                        <LI><B>Seleccionar Formato:</B> Una vez asignado, deberás elegir un grupo de formatos para el análisis: <C>Formatos Cuadrados/Rectangulares</C> (para Feeds, etc.) o <C>Formatos Verticales</C> (para Stories, Reels).</LI>
                        <LI><B>Interpretar el Análisis:</B> La IA generará un reporte completo que incluye:
                            <UL>
                                <LI><B>Puntuaciones:</B> Efectividad y Claridad para una evaluación rápida.</LI>
                                <LI><B>Zonas de Riesgo:</B> Una vista previa que muestra las áreas donde la interfaz de Meta podría tapar elementos clave de tu creativo.</LI>
                                <LI><B>Recomendaciones:</B> Consejos específicos para mejorar el rendimiento del anuncio.</LI>
                                <LI><B>Análisis Advantage+:</B> Sugerencias sobre qué mejoras automáticas de Meta activar.</LI>
                                <LI><B>Conclusión:</B> Un resumen accionable con los puntos más importantes.</LI>
                            </UL>
                        </LI>
                    </OL>
                </AccordionItem>

                <AccordionItem title="3. Gestión de Rendimiento (Importar XLSX)">
                    <P>Puedes cruzar los análisis cualitativos de la IA con datos cuantitativos de tus reportes de Meta Ads.</P>
                    <UL>
                        <LI><B>Importar Reporte:</B> En la pestaña <C>Importar</C>, sube los archivos XLSX que contienen el rendimiento de tus campañas (de Meta) y los datos de creativos (de Looker Studio).</LI>
                        <LI><B>Vinculación de Datos:</B> La aplicación vincula los datos de rendimiento con los creativos usando el nombre de la cuenta y el nombre del anuncio.</LI>
                        <LI><B>Ver Rendimiento:</B> En la pestaña <C>Rendimiento</C>, puedes ver un resumen por cliente. Al hacer clic en un cliente, verás una tabla o tarjetas con el rendimiento de cada anuncio. Los anuncios vinculados a un análisis de IA se marcarán para un análisis más profundo.</LI>
                        <LI><B>Conclusión de IA:</B> En la vista de detalle de un cliente, puedes solicitar una conclusión estratégica de la IA, que analizará los anuncios vinculados y te dará recomendaciones basadas en los que tuvieron mejor y peor rendimiento.</LI>
                    </UL>
                </AccordionItem>
                
                <AccordionItem title="4. Panel de Control y Logs">
                    <P>Estas secciones te dan más control sobre la aplicación:</P>
                    <UL>
                        <LI><B>Panel de Control:</B> Ofrece una vista de bajo nivel de la "base de datos" simulada en tu navegador. Puedes ver el estado de las "tablas" y realizar acciones de limpieza, como borrar todo el historial o resetear por completo los datos de la aplicación. <B>Usa esta sección con cuidado.</B></LI>
                         <LI><B>Logs:</B> Muestra un registro en tiempo real de las acciones importantes que ocurren en la aplicación, muy útil para depurar problemas.</LI>
                    </UL>
                </AccordionItem>
            </div>
        </div>
    );
};
