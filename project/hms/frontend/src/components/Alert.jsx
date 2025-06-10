import { 
  X,
  CheckCircle,
  AlertCircle,
  
} from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  const alertTypes = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700'
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: AlertCircle
  };

  const Icon = icons[type];

  return (
    <div className={`border-l-4 p-4 mb-4 ${alertTypes[type]} fade-in`}>
      <div className="flex">
        <Icon className="h-5 w-5 mr-2" />
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};