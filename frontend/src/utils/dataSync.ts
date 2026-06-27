// 数据同步管理模块
// 使用BroadcastChannel API实现同源页面间的数据同步

const CHANNEL_NAME = 'campus-competition-sync';

export interface SyncData {
  competitions: any[];
  recruitments: any[];
  teams: any[];
  messages: { [teamId: string]: any[] };
  notifications: any[];
  timestamp: number;
}

class DataSyncManager {
  private channel: BroadcastChannel;
  private listeners: Set<(data: SyncData) => void> = new Set();

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = (event) => {
      const data = event.data as SyncData;
      // 更新localStorage
      this.updateLocalStorage(data);
      // 通知所有监听器
      this.notifyListeners(data);
    };
  }

  private updateLocalStorage(data: SyncData) {
    if (data.competitions) {
      localStorage.setItem('competitions', JSON.stringify(data.competitions));
    }
    if (data.recruitments) {
      localStorage.setItem('recruitments', JSON.stringify(data.recruitments));
    }
    if (data.teams) {
      localStorage.setItem('teams', JSON.stringify(data.teams));
    }
    if (data.messages) {
      localStorage.setItem('teamMessages', JSON.stringify(data.messages));
    }
    if (data.notifications) {
      localStorage.setItem('notifications', JSON.stringify(data.notifications));
    }
  }

  private notifyListeners(data: SyncData) {
    this.listeners.forEach(listener => listener(data));
  }

  // 广播数据更新（只广播传入的数据，不覆盖未传入的数据）
  broadcast(data: Partial<SyncData>) {
    const currentData = this.getLatestData();
    const syncData: SyncData = {
      competitions: data.competitions !== undefined ? data.competitions : currentData.competitions,
      recruitments: data.recruitments !== undefined ? data.recruitments : currentData.recruitments,
      teams: data.teams !== undefined ? data.teams : currentData.teams,
      messages: data.messages !== undefined ? data.messages : currentData.messages,
      notifications: data.notifications !== undefined ? data.notifications : currentData.notifications,
      timestamp: Date.now()
    };
    this.channel.postMessage(syncData);
  }

  // 监听数据更新
  subscribe(listener: (data: SyncData) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 获取最新数据
  getLatestData(): SyncData {
    return {
      competitions: JSON.parse(localStorage.getItem('competitions') || '[]'),
      recruitments: JSON.parse(localStorage.getItem('recruitments') || '[]'),
      teams: JSON.parse(localStorage.getItem('teams') || '[]'),
      messages: JSON.parse(localStorage.getItem('teamMessages') || '{}'),
      notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
      timestamp: Date.now()
    };
  }

  // 关闭通道
  close() {
    this.channel.close();
  }
}

// 创建单例
export const dataSyncManager = new DataSyncManager();

// React Hook用于在组件中使用数据同步
export const useDataSync = () => {
  const syncData = () => {
    const data = dataSyncManager.getLatestData();
    dataSyncManager.broadcast(data);
  };

  // 清理非管理员用户数据（保留管理员数据）
  const clearUserData = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      // 保留管理员的用户信息，但清空其他数据
      localStorage.removeItem('recruitments');
      localStorage.removeItem('teams');
      localStorage.removeItem('notifications');
      localStorage.removeItem('applications');
      console.log('已清理非管理员用户数据');
    }
  };

  return { syncData, subscribe: dataSyncManager.subscribe, clearUserData };
};

export default dataSyncManager;
