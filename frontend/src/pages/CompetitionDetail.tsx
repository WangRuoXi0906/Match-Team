import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
    content: '<p>全国大学生数学建模竞赛是由教育部高等教育司主办的全国性大学生学科竞赛活动。竞赛旨在激励学生学习数学的积极性，提高学生建立数学模型和运用计算机技术解决实际问题的综合能力，鼓励广大学生踊跃参加课外科技活动，开拓知识面，培养创造精神及合作意识。</p><p>参赛对象为全日制在校大学生，以队为单位参赛，每队3人。竞赛题目一般来源于工程技术和管理科学等方面经过适当简化加工的实际问题，不要求参赛者预先掌握深入的专门知识，只需要学过高等数学、线性代数、概率论与数理统计等基础知识。</p><p>竞赛分为本科组和专科组，采用全国统一命题、分赛区竞赛的方式进行。各赛区负责本赛区的竞赛组织、评审和推荐优秀论文工作。全国组委会负责全国范围的组织协调、论文复审和颁奖工作。</p>'
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
    content: '<p>中国大学生计算机设计大赛是面向全国大学生的科技竞赛活动，旨在激发学生学习计算机知识的兴趣，提高学生的综合设计能力和创新能力。</p><p>大赛涵盖了软件应用与开发类、微课与教学辅助类、数字媒体设计类等多个类别，为学生提供了展示才华的平台。</p>'
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

const CompetitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 先从localStorage获取用户上传的竞赛
    const savedCompetitions = localStorage.getItem('competitions');
    const userCompetitions = savedCompetitions ? JSON.parse(savedCompetitions) : [];
    
    // 合并mock数据（管理员示例）和用户数据
    const allCompetitions = [...mockCompetitions, ...userCompetitions];
    const found = allCompetitions.find(c => c._id === id);
    setCompetition(found || allCompetitions[0] || null);
  }, [id]);

  // 监听localStorage变化以更新数据
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'competitions') {
        const savedCompetitions = e.newValue ? JSON.parse(e.newValue) : [];
        const allCompetitions = [...mockCompetitions, ...savedCompetitions];
        const found = allCompetitions.find(c => c._id === id);
        setCompetition(found || allCompetitions[0] || null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id]);

  if (!competition) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/competitions')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-800">竞赛详情</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="relative">
        <div className="flex overflow-hidden">
          {competition.images.map((img, idx) => (
            <div
              key={idx}
              className={`w-full flex-shrink-0 transition-transform duration-500 ${
                idx === currentImageIndex ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <img src={img} alt={competition.title} className="w-full h-56 object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {competition.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
            competition.status === '进行中' ? 'bg-green-400 text-white' :
            competition.status === '报名中' ? 'bg-blue-400 text-white' : 'bg-gray-400 text-white'
          }`}>
            {competition.status}
          </span>
          <h2 className="text-xl font-bold text-white">{competition.title}</h2>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600">主办方：{competition.organizer}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-600">报名时间：{new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">竞赛简介</h3>
          <p className="text-gray-600">{competition.description}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">竞赛分类</h3>
          <div className="flex flex-wrap gap-2">
            {competition.tags.map(tag => (
              <span key={tag._id} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">详细信息</h3>
          <div className="text-gray-600 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: competition.content }} />
        </div>

        <button 
          onClick={() => navigate('/recruitments')}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
        >
          立即报名 → 发起招募组队
        </button>
      </div>
    </div>
  );
};

export default CompetitionDetail;