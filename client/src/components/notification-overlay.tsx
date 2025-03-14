import { useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { X, Clock, CheckCircle, DollarSign } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationOverlay({ isOpen, onClose }: NotificationOverlayProps) {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    isLoading 
  } = useNotifications();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scroll on body when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'promo':
        return <Clock className="h-5 w-5 text-white" />;
      case 'purchase':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'cashback':
        return <DollarSign className="h-5 w-5 text-white" />;
      default:
        return <Clock className="h-5 w-5 text-white" />;
    }
  };

  const getBackgroundForType = (type: string) => {
    switch (type) {
      case 'promo':
        return 'bg-primary-light';
      case 'purchase':
        return 'bg-green-500';
      case 'cashback':
        return 'bg-secondary';
      case 'welcome':
        return 'bg-blue-500';
      default:
        return 'bg-primary-light';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-w-md mx-auto animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold">Notificações</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Você não possui notificações</p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto max-h-[70vh] p-4 space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-b border-neutral-200 pb-3">
                  <div className="flex items-start">
                    <div className={`rounded-full p-2 mr-3 ${getBackgroundForType(notification.type)}`}>
                      {getIconForType(notification.type)}
                    </div>
                    <div onClick={() => markAsRead(notification.id)} className="cursor-pointer flex-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-neutral-700">{notification.message}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-neutral-200">
              <button 
                onClick={() => markAllAsRead()} 
                className="text-primary font-medium w-full py-2"
              >
                Marcar todas como lidas
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationOverlay;
