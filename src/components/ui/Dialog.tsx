import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
          {children}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>{cancelText}</Button>
          {onConfirm && (
            <Button 
                variant={variant === 'danger' ? 'danger' : 'primary'} 
                onClick={() => { onConfirm(); onClose(); }}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
