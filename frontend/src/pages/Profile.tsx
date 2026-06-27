import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter, { Notification } from '../components/NotificationCenter';
import ImageUploader from '../components/ImageUploader';

interface Certificate {
  id: string;
  name: string;
  imageUrl: string;
  date: string;
  userId: string;
}

const mockCertificates: Certificate[] = [
  { id: '1', name: '全国大学生数学建模竞赛一等奖', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', date: '2023年9月' },
  { id: '2', name: '计算机二级证书', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', date: '2023年3月' },
  { id: '3', name: '英语六级证书', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', date: '2022年12月' },
];

const skillOptions = [
  '前端开发', '后端开发', '算法设计', 'UI设计', '数学建模', 
  '论文写作', '商业分析', '项目管理', '数据分析', '人工智能'
];

const Profile = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : {
      id: '1',
      name: '管理员',
      studentId: '2021001',
      school: '清华大学',
      grade: '2021级',
      major: '计算机科学与技术',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      skills: ['前端开发', '算法设计', '项目管理']
    };
  });
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('certificates');
    const allCerts = saved ? JSON.parse(saved) : mockCertificates;
    // 只加载属于当前用户的证书
    return allCerts.filter((c: Certificate) => c.userId === user.id);
  });
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCertPreview, setShowCertPreview] = useState<Certificate | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [newCertificate, setNewCertificate] = useState({ name: '', imageUrl: '', date: '' });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    const allNotifications = saved ? JSON.parse(saved) : [];
    // 只加载属于当前用户的通知
    return allNotifications.filter((n: Notification) => n.userId === user.id);
  });
  const navigate = useNavigate();

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveSkills = () => {
    // 确保技能数组存在
    const updatedUser = { 
      ...user, 
      skills: user.skills || [] 
    };
    
    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('技能保存成功:', updatedUser.skills);
    
    // 同时更新用户列表中的数据
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    
    setShowSkillModal(false);
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = user.skills || [];
    setUser({
      ...user,
      skills: currentSkills.includes(skill)
        ? currentSkills.filter((s: string) => s !== skill)
        : [...currentSkills, skill]
    });
  };

  const addCustomSkill = () => {
    const currentSkills = user.skills || [];
    if (customSkill.trim() && !currentSkills.includes(customSkill.trim())) {
      setUser({
        ...user,
        skills: [...currentSkills, customSkill.trim()]
      });
      setCustomSkill('');
    }
  };

  const handleUploadCertificate = () => {
    const cert: Certificate = {
      id: Date.now().toString(),
      ...newCertificate,
      imageUrl: newCertificate.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      userId: user.id
    };
    // 获取所有用户的证书，添加新证书
    const savedCerts = localStorage.getItem('certificates');
    const allCerts = savedCerts ? JSON.parse(savedCerts) : [];
    const updatedAllCerts = [cert, ...allCerts];
    localStorage.setItem('certificates', JSON.stringify(updatedAllCerts));
    // 只更新当前用户可见的证书列表
    setCertificates([cert, ...certificates]);
    setShowUploadModal(false);
    setNewCertificate({ name: '', imageUrl: '', date: '' });
  };

  const handleDeleteCertificate = (certId: string) => {
    // 从所有证书中删除
    const savedCerts = localStorage.getItem('certificates');
    const allCerts = savedCerts ? JSON.parse(savedCerts) : [];
    const updatedAllCerts = allCerts.filter((c: Certificate) => c.id !== certId);
    localStorage.setItem('certificates', JSON.stringify(updatedAllCerts));
    // 只更新当前用户可见的证书列表
    setCertificates(certificates.filter(c => c.id !== certId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white/30" />
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-blue-100 text-sm mt-1">{user.studentId} · {user.grade}</p>
              <p className="text-blue-100 text-sm">{user.school} · {user.major}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">个人信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">姓名</label>
              <p className="font-medium text-gray-800">{user.name}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">学号</label>
              <p className="font-medium text-gray-800">{user.studentId}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">学校</label>
              <p className="font-medium text-gray-800">{user.school}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">专业</label>
              <p className="font-medium text-gray-800">{user.major}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">年级</label>
              <p className="font-medium text-gray-800">{user.grade}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">身份</label>
              <p className={`font-medium ${user.role === 'admin' ? 'text-blue-600' : 'text-green-600'}`}>
                {user.role === 'admin' ? '管理员' : '学生'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">技能特长</h3>
            <button
              onClick={() => setShowSkillModal(true)}
              className="text-blue-600 text-sm font-medium"
            >
              编辑
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills && user.skills.length > 0 ? (
              user.skills.map((skill: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">暂无技能特长</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">竞赛证书</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-blue-600 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              上传
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setShowCertPreview(cert)}
              >
                <img src={cert.imageUrl} alt={cert.name} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs text-center px-1">{cert.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCertificate(cert.id);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {certificates.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>暂无证书</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="font-semibold text-gray-800">通知中心</h3>
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {notifications.length}
              </span>
            </div>
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{notif.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{notif.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
        >
          退出登录
        </button>
      </div>

      {showSkillModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto">
            {/* 调试信息 */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>调试信息：</strong>
                <br />当前技能：{JSON.stringify(user.skills || [])}
              </p>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">编辑技能特长</h3>
              <button onClick={() => setShowSkillModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    (user.skills || []).includes(skill)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">添加自定义技能</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                  placeholder="输入技能名称"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addCustomSkill}
                  className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                >
                  添加
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveSkills}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
            >
              保存技能
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">上传证书</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">证书名称</label>
                <input
                  type="text"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                  placeholder="如：全国大学生数学建模竞赛一等奖"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">获得日期</label>
                <input
                  type="text"
                  value={newCertificate.date}
                  onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                  placeholder="如：2023年9月"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <ImageUploader
                label="证书图片"
                value={newCertificate.imageUrl}
                onChange={(url) => setNewCertificate({ ...newCertificate, imageUrl: url })}
              />
              <button
                onClick={handleUploadCertificate}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
              >
                上传证书
              </button>
            </div>
          </div>
        </div>
      )}

      {showCertPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="relative">
              <img src={showCertPreview.imageUrl} alt={showCertPreview.name} className="w-full" />
              <button
                onClick={() => setShowCertPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800">{showCertPreview.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{showCertPreview.date}</p>
            </div>
          </div>
        </div>
      )}

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

export default Profile;