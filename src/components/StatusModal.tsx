import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export type StatusType = 'error' | 'success' | 'info' | 'warning';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: StatusType;
  buttonText?: string;
}

const StatusModal: React.FC<StatusModalProps> = ({ 
  isOpen, onClose, title, description, type = 'info', buttonText = "Entendido" 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error': return <XCircle className="text-rose-500" size={24} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={24} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'error': return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'success': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 text-black';
      default: return 'bg-white text-black hover:bg-white/90';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-app-surface/90 border-app-border text-app-text-primary rounded-[2.5rem] sm:max-w-md backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="pt-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter italic leading-none">
            {getIcon()}
            {title}
          </DialogTitle>
          <div className="h-px w-full bg-gradient-to-r from-app-text-secondary/20 to-transparent mt-4 mb-2" />
          <DialogDescription className="text-app-text-secondary font-mono text-[11px] uppercase tracking-[0.15em] mt-3 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-8">
          <Button 
            onClick={onClose}
            className={`w-full py-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg ${getButtonClass()}`}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusModal;
