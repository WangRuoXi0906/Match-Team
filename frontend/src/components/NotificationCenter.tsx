import { useState } from 'react';

export interface Notification {
  id: string;
  type: 'application' | 'approval' | 'system';
  title: string;
  message: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'read';
  teamId?: string;
  applicantId?: string;
  applicantName?: string;
  applicantGrade?: string;
  applicantSkills?: string[];
  userId?: string;
}

interface NotificationCenterProps {
  onClose: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onApprove?: (notification: Notification) => void;
  onReject?: (notification: Notification) => void;
}

const NotificationCenter = ({ onClose, notifications, setNotifications, onApprove, onReject }: NotificationCenterProps) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleApprove = (notification: Notification) => {
    if (onApprove) {
      onApprove(notification);
    } else {
      const updatedNotifications = notifications.map(n => {
        if (n.id === notification.id) {
          return { ...n, status: 'approved' as const };
        }
        return n;
      });
      setNotifications(updatedNotifications);
    }
    setSelectedNotification(null);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'approval',
      title: '申请通过',
      message: `您加入队伍的申请已通过！`,
      time: new Date().toLocaleString(),
      status: 'read'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleReject = (notification: Notification) => {
    if (onReject) {
      onReject(notification);
    } else {
      const updatedNotifications = notifications.map(n => {
        if (n.id === notification.id) {
          return { ...n, status: 'rejected' as const };
        }
        return n;
      });
      setNotifications(updatedNotifications);
    }
    setSelectedNotification(null);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'approval',
      title: '申请被拒绝',
      message: `您加入队伍的申请未通过。`,
      time: new Date().toLocaleString(),
      status: 'read'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notification: Notification) => {
    const updatedNotifications = notifications.map(n => {
      if (n.id === notification.id) {
        return { ...n, status: n.status === 'pending' ? 'read' : n.status };
      }
      return n;
    });
    setNotifications(updatedNotifications);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application':
        return '👤';
      case 'approval':
        return '✅';
      default:
        return '📢';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return '已读';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full rounded-t-3xl max-h-[80vh] overflow-hidden animate-slideUp">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">通知中心</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {selectedNotification ? (
          <div className="p-4">
            <button 
              onClick={() => setSelectedNotification(null)}
              className="flex items-center gap-2 text-blue-600 text-sm mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getTypeIcon(selectedNotification.type)}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedNotification.title}</h4>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedNotification.status)}`}>
                    {getStatusText(selectedNotification.status)}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{selectedNotification.message}</p>
              <p className="text-xs text-gray-400">{selectedNotification.time}</p>
              
              {selectedNotification.type === 'application' && selectedNotification.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleReject(selectedNotification)}
                    className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium"
                  >
                    拒绝
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedNotification)}
                    className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium"
                  >
                    通过
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[65vh]">
            {notifications.length > 0 ? (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      markAsRead(notification);
                      setSelectedNotification(notification);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      notification.status === 'pending' 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">{notification.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(notification.status)}`}>
                            {getStatusText(notification.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>暂无通知</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;