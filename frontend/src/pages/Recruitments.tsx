import { useState, useEffect } from 'react';
import NotificationCenter, { Notification } from '../components/NotificationCenter';
import { useDataSync } from '../utils/dataSync';

interface Recruitment {
  _id: string;
  title: string;
  description: string;
  competitionName: string;
  teamName: string;
  leaderName: string;
  leaderId: string;
  currentMembers: number;
  targetMembers: number;
  deadline: string;
  positions: string[];
  status: string;
}

const mockRecruitments: Recruitment[] = [
  {
    _id: '1',
    title: '全国大学生数学建模竞赛招募队友',
    description: '寻找热爱数学建模的小伙伴一起参加比赛，要求有一定数学基础和编程能力。',
    competitionName: '全国大学生数学建模竞赛',
    teamName: '数模先锋队',
    leaderName: '张明',
    leaderId: '1',
    currentMembers: 2,
    targetMembers: 3,
    deadline: '2024-10-31',
    positions: ['数学建模', '编程实现', '论文写作'],
    status: '招募中'
  },
  {
    _id: '2',
    title: '计算机设计大赛前端开发招募',
    description: '团队参加中国大学生计算机设计大赛，现招募前端开发人员。',
    competitionName: '中国大学生计算机设计大赛',
    teamName: '创新设计组',
    leaderName: '李华',
    leaderId: '2',
    currentMembers: 3,
    targetMembers: 5,
    deadline: '2024-12-15',
    positions: ['前端开发', 'UI设计', '产品经理'],
    status: '招募中'
  },
  {
    _id: '3',
    title: '挑战杯创业竞赛团队招募',
    description: '有创业想法的同学快来加入，一起打造优秀的创业项目。',
    competitionName: '挑战杯全国大学生创业计划竞赛',
    teamName: '未来之星',
    leaderName: '王芳',
    leaderId: '3',
    currentMembers: 4,
    targetMembers: 6,
    deadline: '2024-11-20',
    positions: ['商业策划', '市场营销', '技术开发', '财务分析'],
    status: '招募中'
  },
  {
    _id: '4',
    title: 'ACM程序设计竞赛组队',
    description: '寻找算法大佬一起组队参加ACM竞赛，要求熟悉至少一门编程语言。',
    competitionName: 'ACM国际大学生程序设计竞赛',
    teamName: '算法王者',
    leaderName: '陈强',
    leaderId: '4',
    currentMembers: 2,
    targetMembers: 3,
    deadline: '2024-11-30',
    positions: ['算法设计', '代码实现', '调试优化'],
    status: '招募中'
  }
];

const categories = ['全部', '数学建模', '计算机设计', '创新创业', '程序设计'];

interface Competition {
  _id: string;
  title: string;
}

const Recruitments = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const saved = localStorage.getItem('competitions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [recruitments, setRecruitments] = useState<Recruitment[]>(() => {
    // 初始化时先从localStorage获取
    const saved = localStorage.getItem('recruitments');
    if (saved) {
      return JSON.parse(saved);
    }
    return isAdmin ? mockRecruitments : [];
  });
  
  // 从后端API获取招募列表并同步
  useEffect(() => {
    const fetchRecruitments = async () => {
      try {
        const response = await fetch('/api/recruitments');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            // 转换数据格式，确保有leaderId字段
            const formattedData = data.map((r: any) => ({
              _id: r._id,
              title: r.title || '',
              description: r.description || '',
              competitionName: r.competitionName || '',
              teamName: r.teamName || '',
              leaderName: r.leaderName || '',
              leaderId: r.leaderId || r.creatorId || '',
              currentMembers: r.currentMembers || 1,
              targetMembers: r.targetMembers || 3,
              deadline: r.deadline || '',
              positions: r.positions || [],
              status: r.status || '招募中'
            }));
            setRecruitments(formattedData);
            // 同步保存到localStorage
            localStorage.setItem('recruitments', JSON.stringify(formattedData));
          } else {
            // 后端没有数据，使用localStorage数据
            const saved = localStorage.getItem('recruitments');
            if (saved) {
              setRecruitments(JSON.parse(saved));
            } else if (isAdmin) {
              setRecruitments(mockRecruitments);
            }
          }
        } else {
          // 如果API失败，使用localStorage数据或mock数据
          const saved = localStorage.getItem('recruitments');
          if (saved) {
            setRecruitments(JSON.parse(saved));
          } else if (isAdmin) {
            setRecruitments(mockRecruitments);
          }
        }
      } catch (error) {
        console.error('获取招募列表失败:', error);
        // 如果API失败，使用localStorage数据或mock数据
        const saved = localStorage.getItem('recruitments');
        if (saved) {
          setRecruitments(JSON.parse(saved));
        } else if (isAdmin) {
          setRecruitments(mockRecruitments);
        }
      }
    };
    fetchRecruitments();
  }, [isAdmin]);
  
  // 监听localStorage变化，同步招募数据
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('recruitments');
      if (saved) {
        const newRecruitments = JSON.parse(saved);
        setRecruitments(newRecruitments);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 每5秒检查一次localStorage（用于同一页面内的更新检测）
    const interval = setInterval(() => {
      const saved = localStorage.getItem('recruitments');
      if (saved) {
        const newRecruitments = JSON.parse(saved);
        if (JSON.stringify(newRecruitments) !== JSON.stringify(recruitments)) {
          setRecruitments(newRecruitments);
        }
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [recruitments]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // 当申请表单显示时，自动填充用户基本信息（只填充姓名、年级、技能，保留其他字段）
  useEffect(() => {
    if (showApplyModal && !applyForm.name) {
      // 只在表单为空时自动填充基本信息
      setApplyForm({
        name: user.name || user.username || '',
        grade: user.grade || '',
        skills: user.skills || [],
        experience: applyForm.experience || '',
        awards: applyForm.awards || ''
      });
    }
  }, [showApplyModal]);
  
  // 从后端API获取申请通知（队长视角）
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 获取用户发起的招募
        const recruitmentsRes = await fetch('/api/recruitments');
        if (recruitmentsRes.ok) {
          const allRecruitments = await recruitmentsRes.json();
          // 筛选当前用户作为队长的招募
          const myRecruitments = allRecruitments.filter((r: any) => r.leaderId === user.id);
          
          // 获取这些招募的申请
          const notificationsList: Notification[] = [];
          for (const recruitment of myRecruitments) {
            const appsRes = await fetch(`/api/recruitments/${recruitment._id}/applications`);
            if (appsRes.ok) {
              const applications = await appsRes.json();
              applications.forEach((app: any) => {
                // 从app.user获取用户名，或者使用app.userName
                const userName = app.userName || app.user?.name || app.user?.username || '用户';
                notificationsList.push({
                  id: app._id,
                  type: 'application',
                  title: '新成员申请',
                  message: `${userName}申请加入${recruitment.teamName}`,
                  time: new Date(app.createdAt).toLocaleString(),
                  status: app.status === '待审核' ? 'pending' : app.status === '已通过' ? 'approved' : 'rejected',
                  teamId: recruitment._id,
                  applicantId: app.user?._id || app.user,
                  applicantName: userName,
                  applicantGrade: app.userGrade || '',
                  applicantSkills: app.userSkills || [],
                  userId: user.id
                });
              });
            }
          }
          setNotifications(notificationsList);
        }
      } catch (error) {
        console.error('获取通知失败:', error);
        // 如果API失败，使用localStorage数据
        const saved = localStorage.getItem('notifications');
        if (saved) {
          const allNotifications = JSON.parse(saved);
          setNotifications(allNotifications.filter((n: Notification) => n.userId === user.id));
        }
      }
    };
    fetchNotifications();
  }, [user.id]);
  const [selectedRecruitment, setSelectedRecruitment] = useState<Recruitment | null>(null);
  const [newRecruitment, setNewRecruitment] = useState({
    title: '',
    description: '',
    competitionName: '',
    teamName: '',
    targetMembers: 3,
    positions: [] as string[]
  });
  const [applyForm, setApplyForm] = useState({
    name: '',
    grade: '',
    skills: [] as string[],
    experience: '',
    awards: ''
  });
  const { syncData } = useDataSync();
  
  // 删除招募相关状态
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 管理员删除招募
  const handleDeleteRecruitment = async (recruitmentId: string) => {
    console.log('开始删除招募，ID:', recruitmentId);
    
    // 先从本地删除（确保前端立即响应）
    const updatedRecruitments = recruitments.filter(r => r._id !== recruitmentId);
    setRecruitments(updatedRecruitments);
    localStorage.setItem('recruitments', JSON.stringify(updatedRecruitments));
    
    // 同时删除对应的团队
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      const teams = JSON.parse(savedTeams);
      const updatedTeams = teams.filter((t: any) => t._id !== recruitmentId);
      localStorage.setItem('teams', JSON.stringify(updatedTeams));
      console.log('已删除对应的团队');
    }
    
    // 尝试调用后端API删除
    try {
      const response = await fetch(`/api/recruitments/${recruitmentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('后端删除成功');
      } else {
        const errorData = await response.json();
        console.error('后端删除失败:', errorData);
      }
    } catch (error) {
      console.error('删除招募失败:', error);
    }
    
    // 广播数据更新
    syncData();
    setDeleteConfirm(null);
    alert('招募信息已删除');
  };

  // 处理同意申请 - 将成员添加到队伍
  const handleApproveApplication = async (notification: Notification) => {
    if (!notification.teamId || !notification.applicantId) return;

    // 调用后端API更新申请状态
    try {
      const response = await fetch(`/api/recruitments/applications/${notification.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: '已通过' })
      });
      
      if (response.ok) {
        // 更新本地通知列表
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, status: 'approved' } : n
        ));
        
        // 将成员添加到队伍（localStorage）
        const savedTeams = localStorage.getItem('teams');
        const teams = savedTeams ? JSON.parse(savedTeams) : [];
        const teamIndex = teams.findIndex((t: any) => t._id === notification.teamId);
        if (teamIndex !== -1) {
          const newMember = {
            id: notification.applicantId,
            name: notification.applicantName || '新成员',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.applicantId}`,
            nickName: notification.applicantName || '新成员',
            role: 'member' as const
          };
          teams[teamIndex].members.push(newMember);
          localStorage.setItem('teams', JSON.stringify(teams));
        }
        
        syncData();
      }
    } catch (error) {
      console.error('处理申请失败:', error);
    }
  };

  // 处理拒绝申请
  const handleRejectApplication = async (notification: Notification) => {
    // 调用后端API更新申请状态
    try {
      const response = await fetch(`/api/recruitments/applications/${notification.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: '已拒绝' })
      });
      
      if (response.ok) {
        // 更新本地通知列表
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, status: 'rejected' } : n
        ));
      }
    } catch (error) {
      console.error('处理申请失败:', error);
    }
  };

  // 监听localStorage变化以更新竞赛选项
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'competitions') {
        try {
          const saved = e.newValue || '[]';
          setCompetitions(JSON.parse(saved));
        } catch {
          setCompetitions([]);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  const filteredRecruitments = recruitments.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.positions.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || 
                          r.competitionName.includes(selectedCategory) ||
                          r.positions.some(p => p.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const handleAddRecruitment = async () => {
    // 确保用户ID存在
    const userId = user.id || Date.now().toString();
    const leaderName = user.name || user.username || '用户';
    
    const recruitment: Recruitment = {
      _id: Date.now().toString(),
      ...newRecruitment,
      leaderName: leaderName,
      leaderId: userId,
      currentMembers: 1,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: '招募中'
    };
    
    // 保存到后端API
    try {
      const response = await fetch('/api/recruitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recruitment)
      });
      if (response.ok) {
        const data = await response.json();
        // 使用后端返回的ID
        recruitment._id = data.recruitment._id;
      }
    } catch (error) {
      console.error('保存招募失败:', error);
    }
    
    // 更新本地列表
    const updatedRecruitments = [recruitment, ...recruitments];
    setRecruitments(updatedRecruitments);
    localStorage.setItem('recruitments', JSON.stringify(updatedRecruitments));
    
    // 自动创建对应的聊天群聊（只保存在localStorage，只有组长能看到）
    const newTeam = {
      _id: recruitment._id,
      name: newRecruitment.teamName || '新队伍',
      competition: newRecruitment.competitionName,
      leader: leaderName,
      members: [{ 
        id: userId, 
        name: leaderName, 
        avatar: user.avatar || '',
        nickName: leaderName,
        role: 'leader' as const
      }],
      lastMessage: '团队已创建，欢迎加入！',
      unreadCount: 0,
      announcement: ''
    };
    
    // 确保localStorage中的teams存在并正确更新
    const savedTeams = localStorage.getItem('teams');
    const teams = savedTeams ? JSON.parse(savedTeams) : [];
    
    // 检查是否已存在相同ID的团队
    const existingTeamIndex = teams.findIndex((t: Team) => t._id === recruitment._id);
    if (existingTeamIndex !== -1) {
      teams[existingTeamIndex] = newTeam;
    } else {
      teams.unshift(newTeam);
    }
    
    localStorage.setItem('teams', JSON.stringify(teams));
    console.log('群聊创建成功:', newTeam);
    
    // 广播数据更新到其他页面
    syncData();
    setShowAddModal(false);
    setNewRecruitment({
      title: '',
      description: '',
      competitionName: '',
      teamName: '',
      targetMembers: 3,
      positions: []
    });
  };

  const handleApply = async () => {
    setShowApplyModal(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 确保用户信息存在
    const userId = currentUser.id || Date.now().toString();
    const userName = applyForm.name || currentUser.name || currentUser.username || '用户';
    
    console.log('申请加入招募:', {
      recruitmentId: selectedRecruitment?._id,
      userId: userId,
      userName: userName,
      leaderId: selectedRecruitment?.leaderId
    });
    
    // 确保leaderId存在
    if (!selectedRecruitment?.leaderId) {
      console.error('招募信息缺少leaderId');
      // 即使leaderId不存在，也保存到localStorage
      const leaderId = selectedRecruitment?.leaderId || 'unknown';
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'application',
        title: '新成员申请',
        message: `${userName}申请加入${selectedRecruitment?.teamName || '团队'}`,
        time: new Date().toLocaleString(),
        status: 'pending',
        teamId: selectedRecruitment?._id || '',
        applicantId: userId,
        applicantName: userName,
        applicantGrade: applyForm.grade || '',
        applicantSkills: applyForm.skills || [],
        userId: leaderId
      };
      
      const savedAllNotifications = localStorage.getItem('notifications');
      const allNotifications = savedAllNotifications ? JSON.parse(savedAllNotifications) : [];
      localStorage.setItem('notifications', JSON.stringify([newNotification, ...allNotifications]));
      console.log('通知已保存到localStorage:', newNotification);
      alert('申请已提交！组长将收到通知并进行审核。');
      return;
    }
    
    // 调用后端API保存申请
    try {
      const response = await fetch(`/api/recruitments/${selectedRecruitment._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          userName: userName,
          userGrade: applyForm.grade,
          userSkills: applyForm.skills,
          message: applyForm.experience || ''
        })
      });
      
      if (response.ok) {
        console.log('后端申请成功');
        // 同时保存到localStorage，确保组长能看到
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'application',
          title: '新成员申请',
          message: `${userName}申请加入${selectedRecruitment?.teamName}`,
          time: new Date().toLocaleString(),
          status: 'pending',
          teamId: selectedRecruitment._id,
          applicantId: userId,
          applicantName: userName,
          applicantGrade: applyForm.grade,
          applicantSkills: applyForm.skills,
          userId: selectedRecruitment.leaderId
        };
        
        const savedAllNotifications = localStorage.getItem('notifications');
        const allNotifications = savedAllNotifications ? JSON.parse(savedAllNotifications) : [];
        localStorage.setItem('notifications', JSON.stringify([newNotification, ...allNotifications]));
        console.log('通知已同步保存到localStorage');
        alert('申请已提交！组长将收到通知并进行审核。');
      } else {
        const data = await response.json();
        console.error('后端申请失败:', data);
        // 如果API失败，保存到localStorage
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'application',
          title: '新成员申请',
          message: `${userName}申请加入${selectedRecruitment?.teamName}`,
          time: new Date().toLocaleString(),
          status: 'pending',
          teamId: selectedRecruitment._id,
          applicantId: userId,
          applicantName: userName,
          applicantGrade: applyForm.grade,
          applicantSkills: applyForm.skills,
          userId: selectedRecruitment.leaderId
        };
        
        const savedAllNotifications = localStorage.getItem('notifications');
        const allNotifications = savedAllNotifications ? JSON.parse(savedAllNotifications) : [];
        localStorage.setItem('notifications', JSON.stringify([newNotification, ...allNotifications]));
        console.log('通知已保存到localStorage:', newNotification);
        alert('申请已提交！组长将收到通知并进行审核。');
      }
    } catch (error) {
      console.error('申请失败:', error);
      // 如果API失败，保存到localStorage
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'application',
        title: '新成员申请',
        message: `${userName}申请加入${selectedRecruitment?.teamName}`,
        time: new Date().toLocaleString(),
        status: 'pending',
        teamId: selectedRecruitment._id,
        applicantId: userId,
        applicantName: userName,
        applicantGrade: applyForm.grade,
        applicantSkills: applyForm.skills,
        userId: selectedRecruitment.leaderId
      };
      
      const savedAllNotifications = localStorage.getItem('notifications');
      const allNotifications = savedAllNotifications ? JSON.parse(savedAllNotifications) : [];
      localStorage.setItem('notifications', JSON.stringify([newNotification, ...allNotifications]));
      console.log('通知已保存到localStorage:', newNotification);
      alert('申请已提交！组长将收到通知并进行审核。');
    }
    
    setApplyForm({ name: '', grade: '', skills: [], experience: '', awards: '' });
  };

  const skillOptions = ['前端开发', '后端开发', '算法设计', 'UI设计', '数学建模', '论文写作', '商业分析', '项目管理'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800">招募</h1>
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
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索招募信息"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filteredRecruitments.length > 0 ? (
          filteredRecruitments.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedRecruitment(rec);
                setShowDetailModal(true);
              }}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex-1">{rec.title}</h3>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(rec._id);
                    }}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除招募"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">{rec.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>{rec.competitionName}</span>
                <span>{rec.currentMembers}/{rec.targetMembers}人</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {rec.positions.map((pos, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                    {pos}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">队长：{rec.leaderName}</span>
                <span className={`text-xs font-medium ${
                  rec.status === '招募中' ? 'text-green-600' : 'text-gray-400'
                }`}>{rec.status}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>暂无匹配的招募信息</p>
          </div>
        )}
        
        {/* 底部安全区域，防止内容被TabBar遮挡 */}
        <div className="h-20"></div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center z-40"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showDetailModal && selectedRecruitment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center overflow-hidden">
          <div className="bg-white w-full rounded-t-3xl animate-slideUp max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">队伍详情</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">{selectedRecruitment.title}</h4>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">竞赛名称</span>
                  <span className="font-medium">{selectedRecruitment.competitionName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">队名</span>
                  <span className="font-medium">{selectedRecruitment.teamName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">队长</span>
                  <span className="font-medium">{selectedRecruitment.leaderName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">当前人数 / 目标人数</span>
                  <span className="font-medium">{selectedRecruitment.currentMembers} / {selectedRecruitment.targetMembers}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">招募截止</span>
                  <span className="font-medium">{selectedRecruitment.deadline}</span>
                </div>
                <div className="py-2">
                  <span className="text-gray-500 block mb-2">详细分工</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecruitment.positions.map((pos, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{selectedRecruitment.description}</p>
            </div>
            <div className="p-6 pt-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowApplyModal(true);
                }}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
              >
                申请加入
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center overflow-hidden">
          <div className="bg-white w-full rounded-t-3xl animate-slideUp max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">申请加入</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
                  <input
                    type="text"
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    placeholder="请输入姓名"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">年级</label>
                  <input
                    type="text"
                    value={applyForm.grade}
                    onChange={(e) => setApplyForm({ ...applyForm, grade: e.target.value })}
                    placeholder="如：2021级"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">技能（可多选）</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => setApplyForm({
                          ...applyForm,
                          skills: applyForm.skills.includes(skill)
                            ? applyForm.skills.filter(s => s !== skill)
                            : [...applyForm.skills, skill]
                        })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          applyForm.skills.includes(skill)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">竞赛经历</label>
                  <textarea
                    value={applyForm.experience}
                    onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })}
                    placeholder="请描述您参加过的竞赛情况"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">获奖情况</label>
                  <textarea
                    value={applyForm.awards}
                    onChange={(e) => setApplyForm({ ...applyForm, awards: e.target.value })}
                    placeholder="请描述您的获奖情况"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 pt-4">
              <button
                onClick={handleApply}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">发起招募</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">招募标题</label>
                <input
                  type="text"
                  value={newRecruitment.title}
                  onChange={(e) => setNewRecruitment({ ...newRecruitment, title: e.target.value })}
                  placeholder="如：XX竞赛招募队友"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">所属竞赛</label>
                <select
                  value={newRecruitment.competitionName}
                  onChange={(e) => setNewRecruitment({ ...newRecruitment, competitionName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择竞赛</option>
                  {competitions.map((competition) => (
                    <option key={competition._id} value={competition.title}>
                      {competition.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">队伍名称</label>
                <input
                  type="text"
                  value={newRecruitment.teamName}
                  onChange={(e) => setNewRecruitment({ ...newRecruitment, teamName: e.target.value })}
                  placeholder="请输入队伍名称"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">招募人数</label>
                <input
                  type="number"
                  value={newRecruitment.targetMembers}
                  onChange={(e) => setNewRecruitment({ ...newRecruitment, targetMembers: parseInt(e.target.value) || 3 })}
                  min="2"
                  max="10"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">所需岗位</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setNewRecruitment({
                        ...newRecruitment,
                        positions: newRecruitment.positions.includes(skill)
                          ? newRecruitment.positions.filter(s => s !== skill)
                          : [...newRecruitment.positions, skill]
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        newRecruitment.positions.includes(skill)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">招募描述</label>
                <textarea
                  value={newRecruitment.description}
                  onChange={(e) => setNewRecruitment({ ...newRecruitment, description: e.target.value })}
                  placeholder="请描述招募要求和团队情况"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={handleAddRecruitment}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
              >
                发布招募
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-slideUp">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
              <p className="text-sm text-gray-500">
                确定要删除这条招募信息吗？此操作无法撤销，相关的群聊也会被删除。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteRecruitment(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showNotificationCenter && (
        <NotificationCenter
          onClose={() => setShowNotificationCenter(false)}
          notifications={notifications}
          setNotifications={setNotifications}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
        />
      )}
    </div>
  );
};

export default Recruitments;