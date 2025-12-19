
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { Toolbar } from './components/toolbar/Toolbar';
import { Canvas } from './components/canvas/Canvas';
import { PropertyPanel } from './components/properties/PropertyPanel';
import { CopilotPanel } from './components/ai/CopilotPanel';
import { CircuitProvider, useCircuit } from './context/CircuitContext';
import { AgentProvider, useAgent } from './context/AgentContext';
import { QuickAddCommand } from './components/ui/QuickAddCommand';
import { SimulationDebugPanel } from './simulation/debug/SimulationDebugPanel';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { CheckIssuesPanel } from './components/ui/CheckIssuesPanel';

const CircuitApp: React.FC = () => {
  const { isDarkMode, isQuickAddOpen, setIsQuickAddOpen } = useCircuit();
  const { isOpen: isAIOpen } = useAgent();
  
  // Sidebar default closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI Panel Width State
  const [aiPanelWidth, setAiPanelWidth] = useState(400);
  const [isResizingAI, setIsResizingAI] = useState(false);

  // Handle Global Shortcuts (Shift + A)
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
          
          if (e.shiftKey && e.key.toLowerCase() === 'a') {
              e.preventDefault();
              setIsQuickAddOpen(true);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsQuickAddOpen]);

  // Handle AI Resizer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingAI) {
        const newWidth = window.innerWidth - e.clientX;
        setAiPanelWidth(Math.max(300, Math.min(newWidth, 800)));
      }
    };

    const handleMouseUp = () => {
      setIsResizingAI(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizingAI) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingAI]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full w-full`}>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Toolbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="flex-1 relative flex overflow-hidden">
            {/* Canvas Container */}
            <div className="flex-1 relative overflow-hidden h-full flex flex-col">
                <div className="flex-1 relative">
                    <Canvas />
                    
                    {/* Floating Auto-Check Elements */}
                    <NotificationContainer />
                    <CheckIssuesPanel />

                    {/* Floating Instructions/Status */}
                    <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 p-2 rounded shadow-sm text-xs text-gray-500 dark:text-gray-400 pointer-events-none select-none z-10 transition-colors">
                        <p>Shortcuts: <b>Shift+A</b> (Add) • <b>W</b> (Wire) • <b>M</b> (Move) • <b>X</b> (Delete)</p>
                    </div>
                </div>
            </div>
            
            {/* Property Panel - Appears when component is selected */}
            <PropertyPanel />

            {/* AI Panel Split View */}
            {isAIOpen && (
                <>
                    {/* Resizer Handle */}
                    <div 
                        className="w-1 bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize transition-colors z-30 flex items-center justify-center"
                        onMouseDown={() => setIsResizingAI(true)}
                    >
                         <div className="h-8 w-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
                    </div>
                    
                    {/* AI Panel */}
                    <div style={{ width: aiPanelWidth }} className="h-full flex-shrink-0 relative z-20">
                        <CopilotPanel />
                    </div>
                </>
            )}

          </div>
        </div>
        
        {/* Global Modal Overlay for Quick Add */}
        <QuickAddCommand isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
        
        {/* Lab / Simulation Debug Overlay */}
        <SimulationDebugPanel />
        
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <CircuitProvider>
      <AgentProvider>
        <CircuitApp />
      </AgentProvider>
    </CircuitProvider>
  );
};

export default App;
