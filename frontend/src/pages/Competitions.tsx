import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter, { Notification } from '../components/NotificationCenter';
import { useDataSync } from '../utils/dataSync';
import ImageUploader from '../components/ImageUploader';

interface Competition {
  _id: string;
  title: string;
  description: string;
  status: string;
  coverImage: string;
  images: string[];
  organizer: string;
  startDate: string;
  endDate: string;
  tags: { _id: string; name: string }[];
  content: string;
}

const mockCompetitions: Competition[] = [
  {
    _id: '1',
    title: '全国大学生数学建模竞赛',
    description: '面向全国大学生的数学建模竞赛，旨在培养学生的创新能力和团队协作精神。',
    status: '报名中',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    images: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800'
    ],
    organizer: '教育部高等教育司',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    tags: [{ _id: '1', name: '数学建模' }, { _id: '2', name: '团队' }],
    content: '<p>全国大学生数学建模竞赛是由教育部高等教育司主办的全国性大学生学科竞赛活动。竞赛旨在激励学生学习数学的积极性，提高学生建立数学模型和运用计算机技术解决实际问题的综合能力，鼓励广大学生踊跃参加课外科技活动，开拓知识面，培养创造精神及合作意识。</p><p>参赛对象为全日制在校大学生，以队为单位参赛，每队3人。竞赛题目一般来源于工程技术和管理科学等方面经过适当简化加工的实际问题，不要求参赛者预先掌握深入的专门知识，只需要学过高等数学、线性代数、概率论与数理统计等基础知识。</p>'
  },
  {
    _id: '2',
    title: '中国大学生计算机设计大赛',
    description: '展示大学生计算机设计能力和创新思维的全国性赛事。',
    status: '进行中',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    images: [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800'
    ],
    organizer: '教育部高等教育司',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    tags: [{ _id: '3', name: '计算机' }, { _id: '4', name: '设计' }],
    content: '<p>中国大学生计算机设计大赛是面向全国大学生的科技竞赛活动，旨在激发学生学习计算机知识的兴趣，提高学生的综合设计能力和创新能力。</p>'
  },
  {
    _id: '3',
    title: '挑战杯全国大学生创业计划竞赛',
    description: '激发大学生创业热情，培养创业能力的国家级赛事。',
    status: '筹备中',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    images: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'],
    organizer: '共青团中央',
    startDate: '2024-10-01',
    endDate: '2025-03-31',
    tags: [{ _id: '5', name: '创业' }, { _id: '6', name: '创新' }],
    content: '<p>挑战杯全国大学生创业计划竞赛是由共青团中央、教育部、中国科协、全国学联主办的大学生课外学术科技活动。竞赛旨在引导和激励高校学生弘扬创新精神，培养创业意识，提高创业能力。</p>'
  },
  {
    _id: '4',
    title: 'ACM国际大学生程序设计竞赛',
    description: '全球最具影响力的大学生程序设计竞赛。',
    status: '报名中',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    images: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'],
    organizer: 'ACM协会',
    startDate: '2024-08-01',
    endDate: '2024-12-15',
    tags: [{ _id: '3', name: '计算机' }, { _id: '7', name: '算法' }],
    content: '<p>ACM国际大学生程序设计竞赛是由ACM协会主办的全球性大学生程序设计竞赛，旨在展示大学生的程序设计能力和团队协作精神。</p>'
  }
];

const Competitions = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const saved = localStorage.getItem('competitions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        return parsed;
      }
    }
    return mockCompetitions;
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    const allNotifications = saved ? JSON.parse(saved) : [];
    // 只加载属于当前用户的通知
    return allNotifications.filter((n: Notification) => n.userId === user.id);
  });
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    description: '',
    organizer: '',
    startDate: '',
    endDate: '',
    coverImage: '',
    content: ''
  });
  const navigate = useNavigate();
  const { syncData } = useDataSync();

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  const hotCompetitions = competitions.filter(c => c.status === '进行中' || c.status === '报名中');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hotCompetitions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [hotCompetitions.length]);

  const handleUpload = () => {
    if (!newCompetition.title || !newCompetition.description) {
      alert('请填写竞赛标题和描述');
      return;
    }
    
    const competition: Competition = {
      _id: Date.now().toString(),
      ...newCompetition,
      status: '报名中',
      images: [newCompetition.coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'],
      tags: []
    };
    
    // 先从localStorage获取最新数据（避免被其他操作覆盖）
    const savedLatest = localStorage.getItem('competitions');
    const existingCompetitions = savedLatest ? JSON.parse(savedLatest) : mockCompetitions;
    
    // 添加新竞赛到列表开头
    const updatedCompetitions = [competition, ...existingCompetitions];
    
    // 立即更新state和localStorage
    setCompetitions(updatedCompetitions);
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));
    
    // 验证保存是否成功
    const verify = localStorage.getItem('competitions');
    console.log('竞赛上传成功:', competition.title);
    console.log('当前竞赛总数:', updatedCompetitions.length);
    console.log('验证localStorage:', verify ? JSON.parse(verify).length : 0, '个竞赛');
    
    setShowUploadModal(false);
    setNewCompetition({
      title: '',
      description: '',
      organizer: '',
      startDate: '',
      endDate: '',
      coverImage: '',
      content: ''
    });
    
    alert('竞赛上传成功！');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">竞赛</h1>
          <div className="flex items-center gap-3">
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
{isAdmin && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                上传竞赛
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white mt-2">
        <div className="px-4 py-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3">热门竞赛</h2>
          {hotCompetitions.length > 0 ? (
            <div className="relative overflow-hidden rounded-xl">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {hotCompetitions.map((comp) => (
                  <div
                    key={comp._id}
                    className="w-full flex-shrink-0"
                    onClick={() => navigate(`/competitions/${comp._id}`)}
                  >
                    <div className="relative h-44 cursor-pointer">
                      <img src={comp.coverImage} alt={comp.title} className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                          comp.status === '进行中' ? 'bg-green-400 text-white' :
                          comp.status === '报名中' ? 'bg-blue-400 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {comp.status}
                        </span>
                        <h3 className="text-white font-semibold text-lg">{comp.title}</h3>
                        <p className="text-gray-200 text-xs mt-1">{comp.organizer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {hotCompetitions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
              暂无热门竞赛
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">最新竞赛</h2>
        <div className="space-y-3">
          {competitions.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/competitions/${comp._id}`)}
            >
              <div className="flex gap-3">
                <img src={comp.coverImage} alt={comp.title} className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{comp.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                      comp.status === '进行中' ? 'bg-green-100 text-green-700' :
                      comp.status === '报名中' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{comp.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{comp.organizer}</span>
                    <span className="text-xs text-gray-400">{new Date(comp.startDate).toLocaleDateString()} - {new Date(comp.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {comp.tags.map(tag => (
                  <span key={tag._id} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {/* 底部安全区域，防止内容被TabBar遮挡 */}
          <div className="h-20"></div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">上传竞赛资料</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">竞赛标题</label>
                <input
                  type="text"
                  value={newCompetition.title}
                  onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                  placeholder="请输入竞赛标题"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">竞赛简介</label>
                <textarea
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  placeholder="请输入竞赛简介"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">主办方</label>
                <input
                  type="text"
                  value={newCompetition.organizer}
                  onChange={(e) => setNewCompetition({ ...newCompetition, organizer: e.target.value })}
                  placeholder="请输入主办方"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">开始日期</label>
                  <input
                    type="date"
                    value={newCompetition.startDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">结束日期</label>
                  <input
                    type="date"
                    value={newCompetition.endDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <ImageUploader
                label="封面图片"
                value={newCompetition.coverImage}
                onChange={(url) => setNewCompetition({ ...newCompetition, coverImage: url })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">详细内容</label>
                <textarea
                  value={newCompetition.content}
                  onChange={(e) => setNewCompetition({ ...newCompetition, content: e.target.value })}
                  placeholder="请输入竞赛详细内容"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={handleUpload}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
              >
                上传竞赛
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
        />
      )}
    </div>
  );
};

export default Competitions;