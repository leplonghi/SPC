
import React, { useState, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Map as MapIcon, Navigation, Square } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AICommandChatProps {
    onCommand: (command: any) => void;
}

const AICommandChat: React.FC<AICommandChatProps> = ({ onCommand }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Olá! Sou o assistente do SPC. Posso ajudar você a navegar no mapa, criar rotas ou destacar áreas. O que deseja fazer?' }
    ]);
    const [input, setInput] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulate AI processing for now - in a real app, this would call an LLM
            // The prompt asks for a "handleAICommand" function, we'll implement the logic here
            // For demonstration, we'll use regex or simple parsing if the user types something specific
            // In a production environment, this would be a fetch to an endpoint

            setTimeout(() => {
                let responseContent = "Entendido. Processando seu comando...";
                let command = null;

                const lowerInput = input.toLowerCase();

                if (lowerInput.includes('rota') || lowerInput.includes('caminho')) {
                    // Mock route command
                    command = {
                        intent: 'route',
                        waypoints: [
                            [-2.5298, -44.3060],
                            [-2.5320, -44.3020]
                        ]
                    };
                    responseContent = "Criando uma rota entre os pontos históricos selecionados.";
                } else if (lowerInput.includes('área') || lowerInput.includes('polígono') || lowerInput.includes('destaque')) {
                    // Mock polygon command
                    command = {
                        intent: 'polygon',
                        coordinates: [
                            [-2.5290, -44.3080],
                            [-2.5280, -44.3060],
                            [-2.5300, -44.3050],
                            [-2.5310, -44.3070]
                        ],
                        color: '#CC343A'
                    };
                    responseContent = "Destacando a zona de proteção no mapa.";
                } else if (lowerInput.includes('marcador') || lowerInput.includes('pino') || lowerInput.includes('onde fica')) {
                    // Mock pin command
                    command = {
                        intent: 'pin',
                        coordinate: [-2.5307, -44.3068],
                        label: 'Ponto de Interesse'
                    };
                    responseContent = "Adicionando um marcador no local solicitado.";
                } else {
                    responseContent = "Desculpe, não entendi o comando. Tente pedir para 'criar uma rota', 'destacar uma área' ou 'marcar um ponto'.";
                }

                setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
                if (command) onCommand(command);
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.error("Erro ao processar comando AI:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Houve um erro ao processar sua solicitação.' }]);
            setIsLoading(false);
        }
    };

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 z-[2000] bg-brand-blue text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
            >
                <Bot size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-[2000] md:w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-brand-blue p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <h3 className="font-bold text-sm tracking-tight">Assistente do Mapa</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(true)} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <Minimize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-[13px] font-medium leading-relaxed ${m.role === 'user'
                            ? 'bg-brand-blue text-white rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Commands */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => { setInput("Criar rota histórica"); }}
                    className="flex-shrink-0 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-colors"
                >
                    <Navigation size={10} /> Rota
                </button>
                <button
                    onClick={() => { setInput("Destacar centro histórico"); }}
                    className="flex-shrink-0 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-colors"
                >
                    <Square size={10} /> Área
                </button>
                <button
                    onClick={() => { setInput("Marcar ponto de interesse"); }}
                    className="flex-shrink-0 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-colors"
                >
                    <MapIcon size={10} /> Ponto
                </button>
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Digite um comando..."
                        className="flex-grow px-4 py-2 bg-slate-100 border-none rounded-xl text-[13px] focus:ring-2 focus:ring-brand-blue/20 outline-none font-medium"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="bg-brand-blue text-white p-2 rounded-xl hover:bg-brand-blue-dark disabled:opacity-50 transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICommandChat;
