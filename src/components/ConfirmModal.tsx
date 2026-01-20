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
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'default' | 'destructive';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, description, confirmText = "Confirmar", variant = 'default' 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-slate-200 rounded-3xl sm:max-w-md backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter italic">
            <AlertCircle className={variant === 'destructive' ? "text-rose-500" : "text-emerald-500"} size={20} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-white/40 font-mono text-[10px] uppercase tracking-widest mt-2 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-8 gap-2">
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 text-[10px] font-bold uppercase">
            Cancelar
          </Button>
          <Button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`text-[10px] font-bold uppercase ${variant === 'destructive' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white text-black hover:bg-white/90'}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
