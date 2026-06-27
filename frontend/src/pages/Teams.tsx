import { useState, useEffect, useRef } from 'react';
import NotificationCenter, { Notification } from '../components/NotificationCenter';
import { useDataSync } from '../utils/dataSync';

interface Team {
  _id: string;
  name: string;
  competition: string;
  leader: string;
  members: { id: string; name: string; avatar: string; nickName?: string; role: 'leader' | 'member' }[];
  lastMessage: string;
  unreadCount: number;
  announcement: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'task';
  task?: { title: string; deadline: string; assignee: string; attachments?: { name: string; type: string; url: string }[] };
}

interface Task {
  id: string;
  title: string;
  deadline: string;
  assignee: string;
  status: 'pending' | 'completed';
  attachments?: { name: string; type: string; url: string }[];
}

const mockTeams: Team[] = [
  {
    _id: '1',
    name: '数模先锋队',
    competition: '全国大学生数学建模竞赛',
    leader: '张明',
    members: [
      { id: '1', name: '张明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang', nickName: '张明', role: 'leader' as const },
      { id: '2', name: '李华', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li', nickName: '李华', role: 'member' as const },
      { id: '3', name: '王芳', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', nickName: '王芳', role: 'member' as const }
    ],
    lastMessage: '大家好，我们明天开始讨论选题',
    unreadCount: 3,
    announcement: '请大家在周五前完成各自负责的部分'
  },
  {
    _id: '2',
    name: '创新设计组',
    competition: '中国大学生计算机设计大赛',
    leader: '陈强',
    members: [
      { id: '4', name: '陈强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen', nickName: '陈强', role: 'leader' as const },
      { id: '5', name: '刘洋', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu', nickName: '刘洋', role: 'member' as const },
      { id: '6', name: '赵敏', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao', nickName: '赵敏', role: 'member' as const },
      { id: '7', name: '孙伟', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun', nickName: '孙伟', role: 'member' as const }
    ],
    lastMessage: '新需求文档已更新，请查收',
    unreadCount: 0,
    announcement: '下周进行中期答辩，请准备演示材料'
  },
  {
    _id: '3',
    name: '算法王者',
    competition: 'ACM国际大学生程序设计竞赛',
    leader: '周杰',
    members: [
      { id: '8', name: '周杰', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhou', nickName: '周杰', role: 'leader' as const },
      { id: '9', name: '吴涛', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wu', nickName: '吴涛', role: 'member' as const }
    ],
    lastMessage: '周末一起刷题吧',
    unreadCount: 1,
    announcement: '每周六晚8点线上刷题'
  }
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', senderId: '1', senderName: '张明', content: '大家好，我们明天开始讨论选题', timestamp: '今天 14:30', type: 'text' },
    { id: '2', senderId: '2', senderName: '李华', content: '好的队长，我这边已经收集了一些往年题目', timestamp: '今天 14:32', type: 'text' },
    { id: '3', senderId: '3', senderName: '王芳', content: '我也整理了一些资料，明天可以一起看看', timestamp: '今天 14:35', type: 'text' },
    { id: '4', senderId: '1', senderName: '张明', content: '', timestamp: '今天 14:40', type: 'task', task: { title: '收集历年竞赛题目', deadline: '明天下午', assignee: '李华' } },
    { id: '5', senderId: '2', senderName: '李华', content: '收到，我会按时完成', timestamp: '今天 14:42', type: 'text' },
  ],
  '2': [
    { id: '1', senderId: '4', senderName: '陈强', content: '新需求文档已更新，请查收', timestamp: '昨天 16:00', type: 'text' },
    { id: '2', senderId: '5', senderName: '刘洋', content: '收到，正在查看', timestamp: '昨天 16:10', type: 'text' },
  ],
  '3': [
    { id: '1', senderId: '8', senderName: '周杰', content: '周末一起刷题吧', timestamp: '今天 10:00', type: 'text' },
    { id: '2', senderId: '9', senderName: '吴涛', content: '好的，周六上午可以', timestamp: '今天 10:05', type: 'text' },
  ]
};

const mockTasks: Record<string, Task[]> = {
  '1': [
    { id: '1', title: '收集历年竞赛题目', deadline: '明天下午', assignee: '李华', status: 'pending' },
    { id: '2', title: '整理建模方法文档', deadline: '后天', assignee: '王芳', status: 'pending' },
    { id: '3', title: '确定选题方向', deadline: '本周日', assignee: '张明', status: 'completed' },
  ],
  '2': [
    { id: '1', title: '完成UI设计稿', deadline: '明天', assignee: '赵敏', status: 'pending' },
    { id: '2', title: '前端页面开发', deadline: '本周六', assignee: '刘洋', status: 'pending' },
  ],
  '3': [
    { id: '1', title: '复习图论算法', deadline: '周六', assignee: '周杰', status: 'pending' },
    { id: '2', title: '整理DP题型', deadline: '周六', assignee: '吴涛', status: 'pending' },
  ]
};

const Teams = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('teams');
    if (saved) {
      const allTeams = JSON.parse(saved);
      // 只加载当前用户是成员的团队
      const userTeams = allTeams.filter((team: Team) => 
        team.members.some(member => member.id === user.id)
      );
      return userTeams;
    }
    return [];
  });
  
  // 监听localStorage变化，更新团队列表
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('teams');
      if (saved) {
        const allTeams = JSON.parse(saved);
        // 只加载当前用户是成员的团队
        const userTeams = allTeams.filter((team: Team) => 
          team.members.some(member => member.id === user.id)
        );
        setTeams(userTeams);
        console.log('团队列表已更新:', userTeams.length, '个团队');
      }
    };

    // 初始加载
    handleStorageChange();
    
    // 监听localStorage变化
    window.addEventListener('storage', handleStorageChange);
    
    // 每3秒检查一次localStorage（用于同一页面内的更新检测）
    const interval = setInterval(handleStorageChange, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user.id]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingNickName, setEditingNickName] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    const allNotifications = saved ? JSON.parse(saved) : [];
    // 只加载属于当前用户的通知
    return allNotifications.filter((n: Notification) => n.userId === user.id);
  });
  const [newTask, setNewTask] = useState({ title: '', deadline: '', assignee: '', attachments: [] as { name: string; type: string; url: string }[] });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { syncData } = useDataSync();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  const isLeader = selectedTeam?.leader === user.name;

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setMessages(mockMessages[team._id] || []);
    setTasks(mockTasks[team._id] || []);
    setTeams(teams.map(t => t._id === team._id ? { ...t, unreadCount: 0 } : t));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTeam) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id || '1',
      senderName: user.name || '管理员',
      content: newMessage,
      timestamp: '刚刚',
      type: 'text'
    };
    setMessages([...messages, message]);
    // 广播数据更新到其他页面
    syncData();
    setNewMessage('');
  };

  const handleSendTask = () => {
    if (!newTask.title || !selectedTeam) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id || '1',
      senderName: user.name || '管理员',
      content: '',
      timestamp: '刚刚',
      type: 'task',
      task: newTask
    };
    setMessages([...messages, message]);
    setTasks([...tasks, { ...newTask, id: Date.now().toString(), status: 'pending' as const }]);
    // 广播数据更新到其他页面
    syncData();
    setShowTaskModal(false);
    setNewTask({ title: '', deadline: '', assignee: '', attachments: [] });
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } as Task : t));
  };

  const handleUpdateAnnouncement = (announcement: string) => {
    if (!selectedTeam) return;
    setSelectedTeam({ ...selectedTeam, announcement });
    setShowAnnouncementModal(false);
  };

  const handleUpdateNickName = (memberId: string) => {
    if (!selectedTeam) return;
    const updatedMembers = selectedTeam.members.map(m => 
      m.id === memberId ? { ...m, nickName: editingNickName || m.name } : m
    );
    const updatedTeam = { ...selectedTeam, members: updatedMembers };
    setSelectedTeam(updatedTeam);
    
    // 更新localStorage中的teams数据
    const savedTeams = localStorage.getItem('teams');
    const teams = savedTeams ? JSON.parse(savedTeams) : [];
    const teamIndex = teams.findIndex((t: Team) => t._id === selectedTeam._id);
    if (teamIndex !== -1) {
      teams[teamIndex] = updatedTeam;
      localStorage.setItem('teams', JSON.stringify(teams));
    }
    
    setEditingMemberId(null);
    setEditingNickName('');
  };

  const startEditNickName = (memberId: string, currentNickName: string) => {
    setEditingMemberId(memberId);
    setEditingNickName(currentNickName);
  };

  if (selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSelectedTeam(null)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="font-semibold text-gray-800">{selectedTeam.name}</h1>
              <p className="text-xs text-gray-500">{selectedTeam.competition}</p>
            </div>
            <button
              onClick={() => setShowMemberList(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setShowTasks(false); }}
            className={`flex-1 py-3 text-sm font-medium transition-all ${!showTasks ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            群聊
          </button>
          <button
            onClick={() => { setShowTasks(true); }}
            className={`flex-1 py-3 text-sm font-medium transition-all ${showTasks ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            任务
          </button>
        </div>

        <div className="h-[calc(100vh-140px)]">
          {!showTasks ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isSelf = msg.senderName === (user.name || '管理员');
                  return (
                    <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                      {!isSelf && (
                        <img src={selectedTeam.members.find(m => m.name === msg.senderName)?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt={msg.senderName} className="w-8 h-8 rounded-full mr-2 flex-shrink-0" />
                      )}
                      <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
                        {!isSelf && <span className="text-xs text-gray-500 mb-1">{msg.senderName}</span>}
                        {msg.type === 'task' && msg.task ? (
                          <div className="bg-gray-100 rounded-2xl p-3 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-800">📋 新任务</span>
                              <span className="text-xs text-gray-400">{msg.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{msg.task.title}</p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>截止：{msg.task.deadline}</span>
                              <span>负责人：{msg.task.assignee}</span>
                            </div>
                          </div>
                        ) : (
                          <div className={`px-4 py-2 rounded-2xl text-sm ${isSelf ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                            {msg.content}
                          </div>
                        )}
                        <span className="text-xs text-gray-400 mt-1">{msg.timestamp}</span>
                      </div>
                      {isSelf && (
                        <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'} alt={user.name} className="w-8 h-8 rounded-full ml-2 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  {isLeader && (
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </button>
                  )}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入消息..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full px-4 py-4 overflow-y-auto space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => handleCompleteTask(task.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 ml-6">
                        <span>截止：{task.deadline}</span>
                        <span>负责人：{task.assignee}</span>
                      </div>
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mt-2 ml-6 flex flex-wrap gap-2">
                          {task.attachments.map((att, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {att.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {task.status === 'completed' ? '已完成' : '进行中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">群设置</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">群名称</h4>
                  <p className="text-gray-600">{selectedTeam.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">群公告</h4>
                  <p className="text-gray-600 text-sm mb-2">{selectedTeam.announcement}</p>
                  <button
                    onClick={() => setShowAnnouncementModal(true)}
                    className="text-blue-600 text-sm"
                  >
                    编辑公告
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">群成员</h4>
                  <div className="space-y-2">
                    {selectedTeam.members.map((member, idx) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500">{idx === 0 ? '群主' : '成员'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {isLeader && (
                  <div className="pt-4 border-t border-gray-100">
                    <button className="w-full py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium">
                      解散群聊
                    </button>
                  </div>
                )}
                {!isLeader && (
                  <div className="pt-4 border-t border-gray-100">
                    <button className="w-full py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium">
                      申请退出
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showMemberList && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">群成员列表</h3>
                <button onClick={() => setShowMemberList(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{member.nickName || member.name}</p>
                          {member.role === 'leader' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">组长</span>
                          )}
                          {member.role === 'member' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">组员</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">ID: {member.id}</p>
                      </div>
                    </div>
                    {member.id === user.id && (
                      <button
                        onClick={() => startEditNickName(member.id, member.nickName || member.name)}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        修改昵称
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {editingMemberId && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-3">修改我的群昵称</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingNickName}
                      onChange={(e) => setEditingNickName(e.target.value)}
                      placeholder="输入群昵称"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleUpdateNickName(editingMemberId)}
                      className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => { setEditingMemberId(null); setEditingNickName(''); }}
                      className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">发布任务</h3>
                <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">任务标题</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="请输入任务标题"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">截止时间</label>
                  <input
                    type="text"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    placeholder="如：明天下午"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">负责人</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择负责人</option>
                    {selectedTeam.members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">上传附件</label>
                  <div
                    onClick={() => document.getElementById('task-attachment')?.click()}
                    className="w-full px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-500 text-sm">点击上传文件（支持图片、文档等）</p>
                  </div>
                  <input
                    id="task-attachment"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        Array.from(files).forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewTask(prev => ({
                              ...prev,
                              attachments: [...prev.attachments, {
                                name: file.name,
                                type: file.type,
                                url: event.target?.result as string
                              }]
                            }));
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                  />
                  {newTask.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newTask.attachments.map((att, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {att.name}
                          <button onClick={() => setNewTask({ ...newTask, attachments: newTask.attachments.filter((_, i) => i !== idx) })} className="ml-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendTask}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
                >
                  发布任务
                </button>
              </div>
            </div>
          </div>
        )}

        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">编辑群公告</h3>
                <button onClick={() => setShowAnnouncementModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <textarea
                defaultValue={selectedTeam.announcement}
                onBlur={(e) => handleUpdateAnnouncement(e.target.value)}
                placeholder="请输入群公告"
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">队伍</h1>
            <p className="text-sm text-gray-500 mt-1">您加入的队伍</p>
          </div>
          <button
            onClick={() => setShowNotificationCenter(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {teams.map((team) => (
          <div
            key={team._id}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSelectTeam(team)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{team.name}</h3>
              {team.unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {team.unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{team.lastMessage}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xs text-gray-400">队长：{team.leader}</span>
                <span className="text-xs text-gray-300 mx-2">·</span>
                <span className="text-xs text-gray-400">{team.members.length}人</span>
                <span className="text-xs text-gray-300 mx-2">·</span>
                <span className="text-xs text-gray-400">{team.competition}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* 底部安全区域，防止内容被TabBar遮挡 */}
        <div className="h-20"></div>
      </div>

      {showNotificationCenter && (
        <NotificationCenter
          onClose={() => setShowNotificationCenter(false)}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </div>
  );
};

export default Teams;