import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Competition { _id: string; title: string; description: string; status: string; coverImage: string; }
interface Recruitment { _id: string; title: string; team: any; numberOfMembers: number; deadline: string; status: string; }
interface Team { _id: string; name: string; leader: any; members: any[]; competition: any; }

const Home = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compRes, recruitRes, teamRes] = await Promise.all([
        axios.get('/api/competitions'),
        axios.get('/api/recruitments'),
        axios.get('/api/teams')
      ]);
      setCompetitions(compRes.data.slice(0, 3));
      setRecruitments(recruitRes.data.slice(0, 3));
      setTeams(teamRes.data.slice(0, 3));
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">加载中...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-12 text-white">
        <h1 className="text-4xl font-bold mb-4">校园组队竞赛平台</h1>
        <p className="text-xl mb-6">找到队友，一起参加精彩竞赛</p>
        <div className="flex space-x-4">
          <Link to="/competitions" className="px-6 py-3 bg-white text-indigo-600 rounded-md font-medium">
            浏览竞赛
          </Link>
          <Link to="/recruitments" className="px-6 py-3 border border-white text-white rounded-md font-medium">
            查看招募
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">热门竞赛</h2>
          <Link to="/competitions" className="text-indigo-600">查看全部</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitions.map(c => (
            <div key={c._id} className="bg-white rounded-lg shadow overflow-hidden">
              <img src={c.coverImage} alt={c.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === '进行中' ? 'bg-green-100 text-green-800' :
                    c.status === '已结束' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>{c.status}</span>
                </div>
                <p className="text-gray-600 line-clamp-2">{c.description}</p>
                <Link to={`/competitions/${c._id}`} className="block w-full py-2 mt-4 bg-indigo-600 text-white rounded-md text-center">
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新招募</h2>
          <Link to="/recruitments" className="text-indigo-600">查看全部</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recruitments.map(r => (
            <div key={r._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">{r.title}</h3>
              <p className="text-gray-600 mb-4">队伍：{r.team?.name || '未知'}</p>
              <div className="flex text-gray-500 text-sm mb-4">
                <span className="mr-4">招募：{r.numberOfMembers}人</span>
                <span>{new Date(r.deadline).toLocaleDateString()}</span>
              </div>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-md">申请加入</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">推荐队伍</h2>
          <Link to="/teams" className="text-indigo-600">查看全部</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map(t => (
            <div key={t._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">{t.name}</h3>
              <div className="flex text-gray-500 text-sm mb-4">
                <span className="mr-4">队长：{t.leader?.name || '未知'}</span>
                <span>成员：{t.members?.length || 0}人</span>
              </div>
              <p className="text-gray-500 text-sm mb-4">竞赛：{t.competition?.title || '未知'}</p>
              <Link to={`/teams/${t._id}`} className="block w-full py-2 bg-indigo-600 text-white rounded-md text-center">
                查看详情
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;